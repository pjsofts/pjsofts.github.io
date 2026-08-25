---
title: "Reading the real Claude Code: six files that teach you the REPL"
description: "Claude Code's REPL is 5,005 lines. You should not read it. Here are six small files — streaming, slash commands, abort trees, cancellation, and the cost meter — that carry the actual lessons, with the code inline and every line linked."
pubDate: 2026-08-25
tags: ["Claude Code", "TypeScript", "CLI", "Streaming", "Architecture"]
readingTime: 14
---

There is a reconstructed source tree of Claude Code on GitHub. It has **1,976 TypeScript files**. Somebody in every cohort opens it, scrolls for ten minutes, and closes it — which is the correct reaction to 1,976 files and also a wasted opportunity, because a handful of them are among the best teaching material I have found for building a terminal agent.

So this is a reading list. Six files, about four hundred lines total, each one small enough to read in a sitting. They cover the interface layer specifically: streaming, slash commands, interrupts, and cost accounting.

A note on the source before we start, because you should know what you're reading. The tree is [tanbiralam/claude-code](https://github.com/tanbiralam/claude-code) — a reconstruction of a build dated 2026-03-31, not an official Anthropic release. Anthropic's own repo is issues-only; the shipped CLI is a bundle. Treat what follows as *a* Claude Code, close enough to learn from and not authoritative. The comments are far too specific to be invented — you'll see what I mean — but I'd rather you knew than found out later. All line links below are pinned to commit `6f6f12b` so they don't drift.

## First, the file you should not open

```
src/screens/REPL.tsx        5,005 lines
```

That's the REPL. [Look at it](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/screens/REPL.tsx) if you like, but don't try to read it. We'll take two surgical windows out of it later and nothing else.

The number is worth sitting with for a second, though, because it's the lesson the rest of this article is arranged around. A terminal REPL for an LLM agent is maybe 150 lines. You can write one this afternoon: read a line, call the model, print the response, loop. It will work.

Five thousand lines is what happens when that same loop has to work for everyone, on every terminal, every time, forever.

Also skipping, for the same reason: `PromptInput.tsx` (2,338 lines), `commands.ts` (754), `messageQueueManager.ts` (547).

## 1. Streaming — `stream.ts`, 76 lines

**→ [`src/utils/stream.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/utils/stream.ts)**

Read this one in full. It's the smallest file on the list and the one you'll actually reuse.

The problem it solves: the API **pushes** at you. Server-sent events arrive whenever the server feels like sending them. But the code you want to write **pulls**:

```ts
for await (const event of stream) { ... }
```

Something has to sit between a source that pushes and a consumer that pulls. That something is this class:

```ts
export class Stream<T> implements AsyncIterator<T> {
  private readonly queue: T[] = []
  private readResolve?: (value: IteratorResult<T>) => void
  private isDone: boolean = false
  private started = false

  next(): Promise<IteratorResult<T, unknown>> {
    if (this.queue.length > 0) {
      return Promise.resolve({ done: false, value: this.queue.shift()! })
    }
    if (this.isDone) {
      return Promise.resolve({ done: true, value: undefined })
    }
    // nothing buffered, not finished — park until someone enqueues
    return new Promise<IteratorResult<T>>((resolve, reject) => {
      this.readResolve = resolve
      this.readReject = reject
    })
  }

  enqueue(value: T): void {
    if (this.readResolve) {
      const resolve = this.readResolve
      this.readResolve = undefined
      this.readReject = undefined
      resolve({ done: false, value })     // hand it straight to the waiter
    } else {
      this.queue.push(value)              // nobody waiting — buffer it
    }
  }
}
```

That's the whole trick, and it's two cases. **Consumer arrived first?** Park its `resolve` in `readResolve` and hand the next value directly to it. **Producer arrived first?** Push onto `queue` and let the consumer find it.

Two details worth stopping on.

**`enqueue` clears `readResolve` before calling it**, not after. It copies to a local, nulls the field, *then* resolves. If you resolved first, a synchronous consumer could re-enter `next()` inside that resolve and find a stale `readResolve` still sitting there — and now two consumers hold the same promise.

**Iterating twice throws:**

```ts
if (this.started) {
  throw new Error('Stream can only be iterated once')
}
```

Deliberate. A stream over a network response is consumed, not replayed. Making the second `for await` fail loudly beats having it hang forever waiting for events that already went to somebody else.

> **Try it:** write this class from memory before reading further. If you're building a streaming agent you will need exactly this shape, and it's short enough to hold in your head.

## 2. Slash commands — `command.ts`, 216 lines

**→ [`src/types/command.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/types/command.ts)**

Read the types, not the implementation. The lesson lands in about thirty seconds and then reorganizes how you think about the feature.

"Slash command" is **three unrelated things sharing a prefix**:

```ts
type LocalCommand = {
  type: 'local'
  supportsNonInteractive: boolean
  load: () => Promise<LocalCommandModule>
}

type LocalJSXCommand = {
  type: 'local-jsx'
  load: () => Promise<LocalJSXCommandModule>
}

export type PromptCommand = {
  type: 'prompt'
  progressMessage: string
  getPromptForCommand(args: string, ctx: ToolUseContext): Promise<ContentBlockParam[]>
}

export type Command = CommandBase & (PromptCommand | LocalCommand | LocalJSXCommand)
```

| Kind | What happens | Does the model see it? |
|---|---|---|
| `local` | runs a function, returns a string | **no** |
| `local-jsx` | mounts a React component that owns the screen | **no** |
| `prompt` | expands into content blocks that get sent | **yes** — this *is* the turn |

Once you see it, a lot of design questions answer themselves. `/cost` is `local`: compute a number, print it, done. `/model` is `local-jsx`: it needs a picker with arrow keys and a selection, so it must own the screen until the user is finished. And `prompt` commands aren't really commands at all — they're **Skills**. A `prompt` command is a named, parameterized chunk of text that becomes your next message.

Here is a complete, real, shipping slash command, in its entirety:

```ts
// src/commands/cost/cost.ts
import { formatTotalCost } from '../../cost-tracker.js'
import type { LocalCommandCall } from '../../types/command.js'
import { isClaudeAISubscriber } from '../../utils/auth.js'

export const call: LocalCommandCall = async () => {
  if (isClaudeAISubscriber()) {
    return { type: 'text', value: 'You are currently using your subscription...' }
  }
  return { type: 'text', value: formatTotalCost() }
}
```

Twenty-four lines including imports and a branch you don't need. That's the bar. If your command system makes a command longer than this, the system is wrong.

Two more things in `command.ts` worth noticing. `load: () => Promise<Module>` — commands are **lazy**. Ninety-odd commands, none of their dependencies loaded until invoked, because startup time is a feature. And on `PromptCommand`:

```ts
// Execution context: 'inline' (default) or 'fork' (run as sub-agent)
context?: 'inline' | 'fork'
```

A slash command that can run as a **sub-agent with its own context window**. Park that — it's the Week 12 problem showing up in a Week 4 type definition.

## 3. Interrupts, part one: the abort tree

**→ [`src/utils/abortController.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/utils/abortController.ts)** (99 lines) and **[`combinedAbortSignal.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/utils/combinedAbortSignal.ts)** (47 lines)

An agent turn is a tree. One turn spawns several tool calls; each of those might spawn HTTP requests. Cancel the turn and *everything underneath it* has to die — but a single tool timing out must not kill the turn.

So: a child controller that follows its parent down, but not the reverse.

```ts
export function createChildAbortController(parent: AbortController): AbortController {
  const child = createAbortController()

  if (parent.signal.aborted) {          // fast path
    child.abort(parent.signal.reason)
    return child
  }

  const weakChild = new WeakRef(child)
  const weakParent = new WeakRef(parent)
  const handler = propagateAbort.bind(weakParent, weakChild)

  parent.signal.addEventListener('abort', handler, { once: true })

  // remove the parent's listener once the child aborts from any source
  child.signal.addEventListener(
    'abort',
    removeAbortHandler.bind(weakParent, new WeakRef(handler)),
    { once: true },
  )

  return child
}
```

The obvious version is one line:

```ts
parent.signal.addEventListener('abort', () => child.abort())
```

and it leaks. That closure captures `child` strongly, and the parent's listener list holds the closure. Every child you create is now pinned to the parent's lifetime — including the thousands that completed normally and should have been collected. In a CLI process that runs for an afternoon, that is a slow, invisible climb in memory.

Hence `WeakRef` on both sides, plus a cleanup listener that unregisters the parent handler when the child aborts. Three concerns — propagation, collectability, listener hygiene — in about twenty lines.

And then, in the sibling file, my favourite comment in the tree:

```
Use `timeoutMs` instead of passing `AbortSignal.timeout(ms)` as a signal —
under Bun, `AbortSignal.timeout` timers are finalized lazily and accumulate
in native memory until they fire (measured ~2.4KB/call held for the full
timeout duration).
```

*Measured.* Somebody profiled a long-running session, found native memory climbing, traced it to a standard-library call that is correct on paper, and hand-rolled `setTimeout`/`clearTimeout` to get the memory back on cleanup.

You cannot reason your way to that. It's the difference between code that's right and code that's been *run*.

## 4. Interrupts, part two: what Ctrl-C actually does

**→ [`REPL.tsx`, lines 2106–2162](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/screens/REPL.tsx#L2106-L2162)**

Now the two windows into the big file. This is `onCancel` — fifty-seven lines, and the honest answer to "how hard can cancelling be."

```ts
function onCancel() {
  if (focusedInputDialog === 'elicitation') return   // dialog owns its own Escape

  proactiveModule?.pauseProactive()
  queryGuard.forceEnd()

  // Preserve partially-streamed text so the user can read what was
  // generated before pressing Esc.
  if (streamingText?.trim()) {
    setMessages(prev => [...prev, createAssistantMessage({ content: streamingText })])
  }
  resetLoadingState()
  snapshotOutputTokensForTurn(null)      // don't let the budget backstop fire on stale state

  if (focusedInputDialog === 'tool-permission') {
    toolUseConfirmQueue[0]?.onAbort()
    setToolUseConfirmQueue([])
  } else if (focusedInputDialog === 'prompt') {
    for (const item of promptQueue) item.reject(new Error('Prompt cancelled by user'))
    setPromptQueue([])
    abortController?.abort('user-cancel')
  } else if (activeRemote.isRemoteMode) {
    activeRemote.cancelRequest()
  } else {
    abortController?.abort('user-cancel')
  }

  // Clear the controller so subsequent Escape presses don't see a stale
  // aborted signal.
  setAbortController(null)

  void mrOnTurnComplete(messagesRef.current, true)
}
```

Count what's happening: an early return, a background mode paused, a guard ended, **partial output rescued**, loading state reset, a token budget cleared, a four-way branch on what's on screen, the controller nulled, and a lifecycle hook fired.

The line I'd put on a slide is the comment about partial text. Nobody writes that in v1. It's there because somebody watched a good paragraph stream in, hit Escape to stop a tool call, and lost the paragraph. Cancelling is not the same as discarding, and the difference is invisible until a user feels it.

Then the reason for `setAbortController(null)`. If you leave a spent controller in place, the next Ctrl-C sees a signal that exists but is already aborted, decides there's nothing to cancel, and the keybinding goes dead at the prompt. A bug you would find only by pressing Escape twice.

**→ [Lines 2996–3022](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/screens/REPL.tsx#L2996-L3022)** — the second window, and the one I'd end a class on.

The feature is small and lovely: interrupt before anything meaningful came back, and your prompt is restored to the input box, conversation rewound, as if you never sent it. Here's the guard:

```ts
if (
  abortController.signal.reason === 'user-cancel' &&
  !queryGuard.isActive &&
  inputValueRef.current === '' &&
  getCommandQueueLength() === 0 &&
  !store.getState().viewingAgentTaskId
) {
```

Five conditions. The comment above it explains all of them, and every one is a race that happened:

- `reason === 'user-cancel'` — programmatic aborts use other reasons and must not rewind. And note the aside: `abort()` with no argument sets reason to a `DOMException`, not `undefined`. That's why the abort earlier passed a *string*.
- `!queryGuard.isActive` — the user cancelled and immediately resubmitted; don't rewind the new query.
- `inputValue === ''` — they typed something while loading. Restoring would clobber it.
- no queued commands — they queued B while A ran, so they've moved on; restoring A is wrong, *and* the history pop would remove B's entry instead of A's.
- not viewing a teammate — `messagesRef` is the main thread, not what's on screen.

Five guards, five bugs, one small feature. That ratio is the honest shape of interface work.

## 5. The cost meter — `modelCost.ts`

**→ [`src/utils/modelCost.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/utils/modelCost.ts)** — read lines 26–90 and 131–202, skip the middle.

Everyone builds a token counter that multiplies two numbers. Here's the real one:

```ts
export type ModelCosts = {
  inputTokens: number
  outputTokens: number
  promptCacheWriteTokens: number
  promptCacheReadTokens: number
  webSearchRequests: number
}

// Standard pricing tier for Sonnet models: $3 input / $15 output per Mtok
export const COST_TIER_3_15 = {
  inputTokens: 3,
  outputTokens: 15,
  promptCacheWriteTokens: 3.75,
  promptCacheReadTokens: 0.3,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts
```

**Five meters, not one.** And the two cache numbers are the interesting ones: writing to cache costs **25% more** than plain input ($3.75 vs $3.00), reading from it costs **90% less** ($0.30).

The sum is refreshingly boring:

```ts
function tokensToUSDCost(modelCosts: ModelCosts, usage: Usage): number {
  return (
    (usage.input_tokens / 1_000_000) * modelCosts.inputTokens +
    (usage.output_tokens / 1_000_000) * modelCosts.outputTokens +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * modelCosts.promptCacheReadTokens +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * modelCosts.promptCacheWriteTokens +
    (usage.server_tool_use?.web_search_requests ?? 0) * modelCosts.webSearchRequests
  )
}
```

Note the last term has no division. Web search is billed **per request**, not per token. A cost meter that only knows about tokens silently under-reports every search the agent runs.

> **Work it out:** cache write $3.75/Mtok, cache read $0.30/Mtok, plain input $3.00/Mtok. How many turns must a cached prefix survive before writing it pays for itself?
>
> One write costs 0.75 more than sending it plain. Each subsequent read saves 2.70. So it pays back partway through the **second** turn. That's the whole economic argument for [prompt caching](/blog/prompt-caching-and-agent-cost) in one line of arithmetic — and the reason a stable system prompt matters more than a short one.

There's a nice defensive touch in `getModelCosts` too: an unknown model doesn't throw and doesn't silently price at zero. It logs the unknown name, sets a `hasUnknownModelCost` flag the UI can surface, and falls back to the default model's pricing. Wrong, but wrong *and visible*.

## Bonus: the file that explains the whole week

**→ [`src/components/Spinner/useStalledAnimation.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b37f529488b10e53928dd5508bb93535c7/src/components/Spinner/useStalledAnimation.ts)** (75 lines)

This one isn't required reading. It's just my favourite.

It tracks how long since the last token arrived and fades the spinner toward red after three seconds of silence:

```ts
// Start showing red after 3 seconds of no new tokens (only when no tools are active)
const isStalled = timeSinceLastToken > 3000 && !hasActiveTools
const intensity = isStalled
  ? Math.min((timeSinceLastToken - 3000) / 2000, 1)   // fade over 2 seconds
  : 0
```

Seventy-five lines whose entire job is to tell you the machine is being slow. Nothing is broken. No error has occurred. The agent is simply taking a while, and somebody decided that **the user is owed that information** — with a fade rather than a jump, because a colour snapping to red reads as an error and a colour drifting toward red reads as concern.

And the detail that makes it real:

```
// Driven by the parent's animation clock time instead of independent intervals,
// so it slows down when the terminal is blurred.
```

The spinner burns less CPU when you're not looking at it.

## What the six files add up to

| File | Lines | The lesson |
|---|---|---|
| `stream.ts` | 76 | push → pull, in one queue and one parked promise |
| `command.ts` | 216 | "slash command" is three unrelated things |
| `abortController.ts` | 99 | cancellation is a tree, and naive listeners leak |
| `REPL.tsx` §onCancel | 57 | cancelling ≠ discarding |
| `REPL.tsx` §auto-restore | 27 | five guards per small feature |
| `modelCost.ts` | ~90 | five meters, and one of them isn't tokens |

About four hundred lines. Every core idea in them is small — you can hold any one in your head after a single read.

Which is exactly the point I want to leave you with. Your REPL will be 150 lines. Theirs is 5,005. The gap is **not** cleverness, and it is not architecture astronautics. It's `AbortSignal.timeout` leaking 2.4KB under Bun. It's a paragraph of streamed text lost to an Escape key. It's a stale controller making the second Ctrl-C do nothing. It's a spinner that should fade rather than snap.

Specific, nameable, ordinary problems. Reading the real thing isn't supposed to make you feel behind — it's supposed to show you that the distance between your version and a production one is made of things you can now name. You just named six of them.

Go write the 150 lines. Come back for the other 4,850 when a user finds them for you.

---

*Building the streaming REPL — slash commands, safe interrupts and a live cost meter — is [Week 4](/curriculum/week-4-the-chat-interface) of the AI Engineering mentorship, where the capstone starts and every week after this adds one subsystem to the same agent.*
