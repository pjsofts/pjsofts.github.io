---
title: "Six tools and a lot of caution: reading Claude Code's tool layer"
description: "Your agent's six tools are 600 lines. Claude Code's are thousands — and the whole difference is edge cases somebody watched break. Fail-closed defaults, an A/B test they ran and reverted, curly quotes, why Bash(python:*) is an off switch, and the tool list that's sorted for the cache."
pubDate: 2026-09-05
tags: ["Claude Code", "Tool Design", "Agents", "Permissions", "TypeScript"]
readingTime: 15
---

A coding agent's tools are not complicated. Six of them will do: read a file, write a file, edit a file, run a shell command, find files by name, search their contents. Wrap them in a loop that keeps going until the model stops asking for things, put a permission gate in front of the dangerous ones, and you have an agent that fixes real bugs. About six hundred lines, in a language of your choice.

So the obvious question, once you've written those six hundred lines, is **how far is this from the real thing?**

I went and read the real thing. Not the interface layer — [we did that already](/blog/reading-the-claude-code-repl/) — but the tool layer specifically: what a tool *is* in Claude Code, what the six equivalents of your six actually do, and what stands between the model and your filesystem.

The short version: **the shape is identical, and the entire distance is edge cases.** Every one of them is a story about something that broke in front of a real user. That's what makes it worth reading. You're not looking at cleverness you couldn't have invented. You're looking at a list of things that go wrong, written down by people who watched them go wrong.

A note on the source, same as last time. The tree is [tanbiralam/claude-code](https://github.com/tanbiralam/claude-code) — a reconstruction of a build dated 2026-03-31, not an official Anthropic release. Anthropic's own repo is issues-only; the shipped CLI is a bundle. Treat it as *a* Claude Code: close enough to learn from, not authoritative. All links below are pinned to commit `6f6f12b`. Read the comments as carefully as the code — nearly every comment in these files is a bug that reached production once.

## A tool is not a function. It's an object with opinions.

In your version, a tool is a function plus a JSON schema. In Claude Code, [`src/Tool.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/Tool.ts) is 792 lines and a tool has to answer about twenty questions about itself. The ones that matter:

```ts
call(args, context, canUseTool, parentMessage, onProgress): Promise<ToolResult>
description(input, options): Promise<string>
readonly inputSchema: Input
isConcurrencySafe(input): boolean
isReadOnly(input): boolean
isDestructive?(input): boolean
validateInput?(input, context): Promise<ValidationResult>
checkPermissions(input, context): Promise<PermissionResult>
```

Three things jump out of that list.

**The description is a function, not a string.** It's computed per call, from the current context — which sandbox is active, which other tools exist, whether git instructions are enabled. The manual the model reads is assembled fresh for the situation it's in.

**"Can I run this?" is two questions with two audiences.** `validateInput` answers *is this call coherent*, and its failure is explained to the model. `checkPermissions` answers *is this call allowed*, and its failure is shown to the human. Conflating them is how you end up asking a person to approve a call that was malformed anyway.

**Read-only-ness belongs to the arguments, not the tool.** `isReadOnly(input)` takes the input. Bash is not a safe tool or a dangerous tool: `ls` is safe and `rm` is not, and something has to look at the actual command to say which one just arrived.

### The best fifteen lines in the file

Every tool is constructed through one helper, which fills in the answers a tool didn't bother to give ([`Tool.ts:757`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/Tool.ts#L757)):

```ts
const TOOL_DEFAULTS = {
  isEnabled: () => true,
  isConcurrencySafe: (_input?: unknown) => false,   // assume not safe
  isReadOnly: (_input?: unknown) => false,          // assume writes
  isDestructive: (_input?: unknown) => false,
  toAutoClassifierInput: (_input?: unknown) => '',  // skip classifier
  ...
}
```

The comment above it reads: **"Defaults (fail-closed where it matters)."**

Think about what that buys. Someone adds a tool six months from now and forgets `isReadOnly`. What happens? The system assumes it writes to disk. It never runs in parallel with anything. It always goes through the permission gate. The forgetful engineer's tool is *safe by default*, and the cost of the mistake is a little lost concurrency instead of a deleted repository.

That's the most transferable idea in the entire tool layer, and it's fifteen lines. **When information is missing, the default has to be the cautious answer, not the convenient one** — and it should live in exactly one place, so nobody has to remember it.

## Read: two caps, and an A/B test they ran and undid

[`FileReadTool/limits.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileReadTool/limits.ts) opens with a table:

| limit | default | checks | on overflow |
|---|---|---|---|
| `maxSizeBytes` | 256 KB | total file size | throws before reading |
| `maxTokens` | 25,000 | actual output tokens | throws after reading |

And then this, which is my favourite comment in the codebase:

> Tested truncating instead of throwing for explicit-limit reads that exceed the byte cap (#21841, Mar 2026). Reverted: tool error rate dropped but mean tokens rose — the throw path yields a ~100-byte error tool-result while truncation yields ~25K tokens of content at the cap.

Read it twice. It's a complete lesson in how to think about agents.

Somebody looked at the metrics, saw tools erroring out, and did the humane thing: instead of refusing to read a huge file, hand over as much of it as fits. The error rate went down. **And it was the wrong call**, so they reverted it.

Why? Because the error costs 100 bytes and the truncation costs 25,000 tokens. An error is a *cheap message that makes the model try something better* — read a slice, or grep instead. A truncation is an *expensive message that makes the model believe it has the whole file*. The metric that looked like quality — fewer errors — was measuring the wrong thing.

**A good error is cheaper than a bad success.** That sentence should be on a sticker.

Two smaller details from the same tool, both worth stealing outright.

**Empty files talk back.** Read a file that exists and is empty and you don't get an empty string, you get [this](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileReadTool/FileReadTool.ts#L706):

```
<system-reminder>Warning: the file exists but the contents are empty.</system-reminder>
```

An empty result makes models behave strangely — they tend to assume the tool is broken and call it again. Saying *nothing* and saying *"there is nothing"* are completely different messages.

**Re-reading an unchanged file is free.** If the model reads a file it already read and nothing has changed, it gets a [stub](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileReadTool/prompt.ts#L7) instead of the content:

> File unchanged since last read. The content from the earlier Read tool_result in this conversation is still current — refer to that instead of re-reading.

The file is already in the conversation. Sending it again costs tokens and, worse, puts two copies of the same file in context — an excellent way to confuse a model about which one is current. There's even a follow-up: code elsewhere that scans history for "what does this file contain" explicitly skips these stubs, because a stub isn't content and would otherwise overwrite the real entry.

## Edit: your guards, plus three you didn't think of

Every serious agent's edit tool is exact-string replacement behind a stack of guards, and Claude Code's is the same stack, in the same order, with numbered error codes. Condensed from [`FileEditTool.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileEditTool/FileEditTool.ts#L275):

```ts
// has the model read this file at all?
if (!readTimestamp || readTimestamp.isPartialView) {
  return { result: false, behavior: 'ask',
    message: 'File has not been read yet. Read it first before writing to it.',
    errorCode: 6 }
}

// has it changed since?
if (lastWriteTime > readTimestamp.timestamp) { ... errorCode: 7 }

// does the string exist?
if (!actualOldString) { ... errorCode: 8 }

// is it unique?
if (matches > 1 && !replace_all) {
  return { ... message: `Found ${matches} matches of the string to replace, ...
    please provide more context to uniquely identify the instance.`,
    errorCode: 9 }
}
```

If you've built an agent, you've written this. The differences are the interesting part.

**`isPartialView`.** Reading lines 1–50 of a 900-line file does *not* earn you the right to edit it. Most hand-rolled versions track "did we read this file". This one tracks "did we read *all* of it", because a model that has seen a fiftieth of a file has no idea what it's about to break.

**Curly quotes.** Models love to "fix" your typography. If the file contains `"hello"` with typographer's quotes and the model sends back plain ASCII quotes, the exact match fails — and the model can't see why, because the two strings look identical on screen. So there's [`findActualString`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileEditTool/utils.ts#L73), which retries with quotes normalised, and then `preserveQuoteStyle`, which puts the file's own quote style back into the replacement so the edit doesn't silently change the file's typography. Two helper functions for one class of invisible character. That's what production means.

**A content check behind the timestamp check.** On Windows, timestamps change without content changing — cloud sync, antivirus, a backup agent. So when the file *looks* stale but the model did a full read, [it compares the actual content](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileEditTool/FileEditTool.ts#L293) before refusing:

```ts
// Timestamp indicates modification, but on Windows timestamps can change
// without content changes (cloud sync, antivirus, etc.). For full reads,
// compare content as a fallback to avoid false positives.
```

A guard that fires when it shouldn't isn't "extra safety". It's a bug that makes your agent unusable on somebody's machine, and somebody had to go find out why.

**`replace_all`.** The obvious move on ambiguity is a hard error. The better move is to give the model a way to say "yes, all of them, that's the point" — which is what a rename is. A guard's job isn't to forbid the ambiguous case. It's to make the model *say which one it means*.

## Bash: a tool description longer than most shell tools

A hand-written `run_bash` is about sixty lines, and its description is a paragraph.

Claude Code's [`BashTool.tsx`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/BashTool/BashTool.tsx) is 1,143 lines. Its description *generator* is 369 more. And there are sixteen further files beside them: `bashSecurity.ts`, `bashPermissions.ts`, `pathValidation.ts`, `readOnlyValidation.ts`, `sedValidation.ts`, `commandSemantics.ts`, `shouldUseSandbox.ts`, and on.

The description isn't documentation. It's policy. Part of it is a table of what to use instead of the shell ([`prompt.ts:284`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/BashTool/prompt.ts#L284)):

```
File search: Use Glob (NOT find or ls)
Content search: Use Grep (NOT grep or rg)
Read files: Use Read (NOT cat/head/tail)
Edit files: Use Edit (NOT sed/awk)
Write files: Use Write (NOT echo >/cat <<EOF)
Communication: Output text directly (NOT echo/printf)
```

And when a sandbox is active, the sandbox's live configuration is serialised into the description — with the temp directory rewritten to `$TMPDIR` for a reason that'll make you laugh or wince depending on your week:

> Replace the per-UID temp dir literal (e.g. `/private/tmp/claude-1001/`) with `"$TMPDIR"` so the prompt is identical across users — avoids busting the cross-user global prompt cache.

Your prompt text is a cache key. Two users whose prompts differ by one directory name are two cache misses, forever. Somebody found 150–200 tokens per request by deduplicating a list inside a prompt.

### "Is this read-only?" is a parser, not a list

The thing I most expected to be a hardcoded array of safe command names, and most enjoyed being wrong about ([`BashTool.tsx:434`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/BashTool/BashTool.tsx#L434)):

```ts
isConcurrencySafe(input) {
  return this.isReadOnly?.(input) ?? false;
},
isReadOnly(input) {
  const compoundCommandHasCd = commandHasAnyCd(input.command);
  const result = checkReadOnlyConstraints(input, compoundCommandHasCd);
  return result.behavior === 'allow';
},
```

`checkReadOnlyConstraints` splits the command into sub-commands, parses each with a shell parser, and checks the program *and its flags* against per-program tables — `GIT_READ_ONLY_COMMANDS`, `GH_READ_ONLY_COMMANDS`, `DOCKER_READ_ONLY_COMMANDS`, `RIPGREP_READ_ONLY_COMMANDS` — plus flag validators, plus output-redirection extraction (because `ls > file` writes), plus a dedicated sed parser (because `sed -n p` reads and `sed -i` writes).

Why bother? Because "is this read-only" decides two separate things: whether the call can run in parallel with others, and whether it's safe to auto-allow. Both answers must be right about `git log` and wrong about `git push`, and a list of program names cannot tell those apart.

And when the parse fails:

```ts
} catch {
  // If isConcurrencySafe throws (e.g., due to shell-quote parse failure),
  // treat as not concurrency-safe to be conservative
  return false
}
```

Fail closed. It's everywhere once you start looking.

### The allowlist entry that is really an off switch

A subtle one, from [`dangerousPatterns.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/dangerousPatterns.ts). Suppose a user gets tired of approving Python scripts and adds a rule: `Bash(python:*)` — always allow python.

They have just switched off the permission system. `python -c "..."` runs arbitrary code, including code that deletes things, including code that runs other programs.

So there's a list of allow-rule prefixes that are *too powerful to allow*:

```ts
export const CROSS_PLATFORM_CODE_EXEC = [
  'python', 'python3', 'python2', 'node', 'deno', 'tsx', 'ruby', 'perl',
  'php', 'lua', 'npx', 'bunx', 'npm run', 'yarn run', 'pnpm run', 'bun run',
  'bash', 'sh', 'ssh',
]
```

When the agent enters a more autonomous mode, rules matching these are **stripped**. Not honoured, not warned about — removed.

The lesson generalises well past shells: any allowlist entry that can execute arbitrary things is not an allowlist entry, it's a bypass. `npm run` is on the list because a `package.json` script can be anything at all.

## Grep and Glob: caps are a budget, and silence is a lie

Grep [wraps ripgrep](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/GrepTool/GrepTool.ts) rather than walking the tree in JavaScript — fast, and it respects `.gitignore` for free. But the policy is what a hand-rolled version would land on anyway:

> `head_limit`: Limit output to first N lines/entries… **Defaults to 250** when unspecified. Pass 0 for unlimited (use sparingly — large result sets waste context).

Glob caps at 100 files, and then does the part people skip — it tells the model that it capped:

```ts
truncated: z.boolean().describe('Whether results were truncated (limited to 100 files)')
```

…plus a line in the output: *"(Results are truncated. Consider using a more specific path or pattern.)"*

Capping output is easy. Announcing the cap, so the model narrows its pattern instead of confidently concluding there are exactly 100 matching files, is what makes the cap safe. **A silent truncation is a lie you told your own model.**

## The permission system: a ladder, and the things it can't skip

A hand-written permission check is one function of about forty lines. Claude Code's is [`src/utils/permissions/`](https://github.com/tanbiralam/claude-code/tree/6f6f12b/src/utils/permissions): twenty-four files, roughly 9,400 lines.

And its core is those same forty lines. From [`hasPermissionsToUseToolInner()`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/permissions.ts#L1158), with the original step comments:

```
1a. Entire tool is denied by rule            → deny
1b. Entire tool has an ask rule              → ask
1c. Ask the tool implementation              → tool-specific check
1d. Tool implementation denied               → deny
1e. Tool requires user interaction           → ask, even in bypass mode
1f. Content-specific ask rules               → ask, even in bypass mode
1g. Safety checks (.git/, .claude/, ...)     → ask, even in bypass mode
2a. Is the whole thing bypassed?             → allow
2b. Entire tool allowed by rule              → allow
3.  Anything left over ("passthrough")       → ask
```

Deny before ask, ask before allow, and anything unmatched becomes ask. Note the direction: **deny rules are checked before the allowlist**, so "always allow sudo" can never talk the gate into `sudo rm -rf /`.

Four things here are genuinely different from what you'd build on day one, and all four are things you only learn by shipping to a lot of people.

**Rules are strings, and they persist.** `Bash(git *)`, `Edit(src/**)` — written to a settings file at session, project, or user scope. That's what "always allow" actually does. A `Set` that dies with the process is the training-wheels version.

**Some things ask even when you said don't ask.** There's a "skip all prompts" mode, and there's a list of paths where it still stops: `.git/`, `.claude/`, `.vscode/`, shell config files. Steps 1e, 1f and 1g all sit *before* the bypass check at 2a, so they can't be skipped. The reasoning is blast radius: a wrong edit to a source file is a `git checkout` away from fixed; a wrong edit to `.git/` or `~/.zshrc` is somebody's evening. If you build a yolo mode, build its exception list the same day.

**A model reads the shell commands.** In the internal build there's a classifier that decides whether a compound command matches a natural-language rule — *"anything that publishes a package"* — and flags command injection. The external build ships it as a [stub that always returns "no match"](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/bashClassifier.ts), which is a pleasingly honest piece of engineering: the feature is off, and its shape is still visible.

**The automation knows when to give up on itself.** [`denialTracking.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/denialTracking.ts) is 45 lines and counts two numbers:

```ts
export const DENIAL_LIMITS = { maxConsecutive: 3, maxTotal: 20 }

export function shouldFallbackToPrompting(state: DenialTrackingState): boolean {
  return state.consecutiveDenials >= DENIAL_LIMITS.maxConsecutive ||
         state.totalDenials >= DENIAL_LIMITS.maxTotal
}
```

When the automatic path gets denied three times running, or twenty times in total, it stops deciding and hands everything to a human. An automated decision system that measures how often it's wrong and demotes itself. Three in a row is a good signal that whatever it thinks it understands about this session, it doesn't.

## The loop: how it knows it's done, and what it does with your Ctrl-C

Two details from [`query.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/query.ts), both of which you hit within a day of building your own loop.

**How does it decide to stop?** Not from `stop_reason` ([line 554](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/query.ts#L554)):

```ts
// Note: stop_reason === 'tool_use' is unreliable -- it's not always set correctly.
// Set during streaming whenever a tool_use block arrives — the sole
// loop-exit signal. If false after streaming, we're done.
```

The signal is *did the model ask for tools*. Everyone arrives at that check eventually; here's the reason attached.

**What happens when you interrupt?** There's a generator called [`yieldMissingToolResultBlocks`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/query.ts#L123) whose entire job is to walk the assistant messages, find every `tool_use` block, and emit an error `tool_result` for each one.

This is the dangling tool call, and it is the nastiest beginner bug in agent building. If the model asks for three tools and you hit Ctrl-C after the first, your conversation now contains a request with no answer — and the API rejects it *on the next message*, with an error that mentions nothing about interrupts. Rule: **on interrupt, answer every unanswered call with a synthetic result.**

### The parallelism most people skip

[`toolOrchestration.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/services/tools/toolOrchestration.ts#L87) does something elegant with the calls the model asked for, before running any of them:

```
Partition tool calls into batches where each batch is either:
1. A single non-read-only tool, or
2. Multiple consecutive read-only tools
```

Consecutive read-only calls run concurrently, up to ten at a time. Anything that writes runs alone, in order.

The word doing the work is **consecutive**. Not "all the reads first" — reordering `read → write → read` into `read, read → write` would let the second read observe the wrong version of the file. The order the model asked for is preserved; only *adjacent* safe calls get merged. That one adjective is the difference between a speedup and a heisenbug.

## The detail that surprised me most: the tool list is sorted for the cache

In [`src/tools.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools.ts#L354), the code that assembles the final tool list carries this comment:

> Sort each partition for prompt-cache stability, keeping built-ins as a contiguous prefix. The server's cache policy places a global cache breakpoint after the last prefix-matched built-in tool; a flat sort would interleave MCP tools into built-ins and invalidate all downstream cache keys whenever an MCP tool sorts between existing built-ins.

And above the list of tools itself:

> NOTE: This MUST stay in sync with [a Statsig dynamic config], in order to cache the system prompt across users.

**The order of your tools array is load-bearing.** Not for correctness — for cost. Tool definitions sit at the front of every request, so they're the most cacheable thing you have; a cache matches on exact prefixes; and one MCP tool sorting into the middle of the built-ins invalidates everything after it, for everybody.

Nobody derives this from first principles. You learn it by staring at a bill.

## What to steal

In the order I'd apply it:

1. **Fail closed on every unknown.** Unknown tool, unparseable command, missing metadata: assume it writes, assume it's unsafe, ask the human. Put the default in one place so nobody has to remember it.
2. **Write tool errors as instructions.** "Found 3 matches… provide more context to uniquely identify the instance" is a prompt. "Edit failed" is not. Your error messages are the second-most-read text in your system after the system prompt.
3. **Cap output, and say that you capped it.** Silent truncation makes a model confidently wrong.
4. **Prefer a cheap error to an expensive success.** 100 bytes of "read a slice instead" beats 25,000 tokens nobody asked for.
5. **Read-only is a property of the arguments.** Bash isn't safe or unsafe; `ls` and `rm` are.
6. **Never let an allowlist entry execute arbitrary code.** `Bash(python:*)` isn't a permission, it's an off switch.
7. **Some paths ask even in yolo mode.** Decide that list on day one, not after the incident.
8. **Answer every tool call, always** — including on interrupt. A dangling call breaks the *next* request, and the error won't mention the interrupt.
9. **Keep the tool list stable and sorted.** Your cache bill depends on it.
10. **Guards catch the model; descriptions teach it.** Ninety percent of "the model uses my tool badly" is a vague description — [fix the prose first](/blog/designing-tools-for-ai-agents/).

What strikes me every time I read this layer is how little of it is about AI. There's essentially no machine learning in the tool layer of a coding agent. There's a shell parser, a permission ladder, a pile of caps, and several hundred small decisions about what to do when something is missing, ambiguous, or already changed underneath you.

Which is good news, because that skill transfers. If you can write a careful file-editing function with honest error messages, you can build this. The model is the easy part — it's somebody else's `POST` endpoint. The tools are yours.

## Read it yourself

If you want to look at the tool layer directly, this is the order I'd read it in. About four hundred lines of actual reading:

| File | Lines | Why |
|---|---|---|
| [`Tool.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/Tool.ts#L757) (the `TOOL_DEFAULTS` block) | ~40 | fail-closed defaults, in one place |
| [`FileReadTool/limits.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileReadTool/limits.ts) | 15 | the A/B test they reverted |
| [`FileEditTool.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/FileEditTool/FileEditTool.ts#L275) (validation) | ~90 | the guards, numbered |
| [`BashTool/prompt.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/tools/BashTool/prompt.ts) | 369 | a tool description as policy |
| [`dangerousPatterns.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/dangerousPatterns.ts) | 80 | why `Bash(python:*)` is a bypass |
| [`toolOrchestration.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/services/tools/toolOrchestration.ts) | ~115 | consecutive read-only batching |
| [`permissions.ts`](https://github.com/tanbiralam/claude-code/blob/6f6f12b/src/utils/permissions/permissions.ts#L1158) (steps 1a–3) | ~180 | the ladder |

Don't open `src/screens/REPL.tsx`. It's 5,005 lines and it will teach you nothing the seven files above won't.

---

*Building the six tools, the guards and the permission gate yourself — then reading the production version beside your own — is [Week 5](/curriculum/week-5-tools-that-touch-code) of the AI Engineering mentorship. The interface layer got [the same treatment](/blog/reading-the-claude-code-repl/) in Week 4.*
