---
title: "Context management: keeping an agent sharp over a long session"
description: "A finite context window is the one resource every long-running agent runs out of. The four moves that keep it from degrading — write, select, compress, isolate — and how to know which one a symptom is asking for."
pubDate: 2026-07-27
tags: ["Context Management", "Agents", "Memory", "Sub-agents", "Tokens"]
readingTime: 9
---

Assembling a good context for a *single* request is one skill. Keeping the context healthy across a *thousand* requests, while an agent grinds through a real task for an hour, is a different one — and it's the one that decides whether your agent finishes strong or slowly turns to mush.

The window is finite. The task is not. Every tool call, every file read, every reasoning step adds tokens, and nothing removes them unless you decide to. Left alone, a long session doesn't crash — it *degrades*. The agent gets vaguer, repeats work it already did, forgets the original ask, and starts confidently contradicting itself around turn forty. That's not the model getting dumber. That's the context rotting.

Context management is the set of moves you make so it doesn't.

## Why "just use a bigger window" isn't the answer

The instinct is to reach for a model with a 200k or 1M window and call the problem solved. It isn't, for two reasons.

First, **attention is not uniform**. A model reads the start and end of its context far more reliably than the middle. Pour 400k tokens in and the critical constraint you set on turn three is now buried in a swamp the model barely looks at. A bigger window makes the swamp bigger.

Second, **every token you carry, you pay for on every turn** — in latency and in money. The API is stateless: there's no conversation living on the server, so each request re-sends the whole history. A 300k-token context isn't a one-time cost; it's a tax on every single step for the rest of the session. (This is exactly why [prompt caching](/blog/prompt-caching-and-agent-cost) matters so much — but caching a bloated context just makes the bloat cheaper, not better.)

So the goal isn't "fit everything." It's to **keep the working set small, relevant, and ordered** no matter how long the agent runs. There are exactly four moves for that.

## Move 1: Write — get it out of the window

The most underused technique: don't keep information in the context at all. **Write it somewhere the agent can read later**, and keep only a pointer in the window.

Two flavors:

- **Scratchpad.** The agent writes its plan, findings, and intermediate results to a file (or a notes tool) as it goes. The context holds "plan is in `plan.md`," not the plan's full text. When it needs the plan, it reads it back.
- **Memory.** Facts that should survive *across* sessions — user preferences, decisions, project conventions — go to durable storage, one fact per record, recalled by relevance when a new session starts.

The win is that persisted information doesn't decay when the window fills. A plan written to disk on turn 5 is exactly as crisp on turn 90. Contrast that with a plan living in the chat history, which is one compaction away from being paraphrased into uselessness.

Rule of thumb: **if the agent generated something it will need later but not next, write it out.**

## Move 2: Select — pull in only what this step needs

Writing things down is only half of it; the other half is being disciplined about what you read *back*. The failure mode here is loading everything "just in case."

- Don't dump an entire 2,000-line file into context to change one function. Read the function.
- Don't paste a whole search index. Retrieve the handful of chunks that match, and only those. (This is what [RAG](/curriculum/week-7-rag-and-vector-databases) is *for* — selection under a token budget, not a magic knowledge upgrade.)
- Don't reload the memory store wholesale. Recall the records relevant to the current task.

Selection is where a token budget stops being theoretical. Decide what fraction of the window each source is *allowed* to claim, and enforce it. A single greedy tool return that grabs 40% of the budget is a bug, even when it "works," because it silently evicts whatever the agent needed to remember.

## Move 3: Compress — spend fewer tokens for the same meaning

When you genuinely need information in the window, get it in for less.

- **Prune tool output at the source.** A command that emits 1,000 log lines shouldn't put 1,000 lines in the context. Return the 20 that matter. High-signal tool results are a context-management decision, not a formatting nicety.
- **Summarize on eviction.** An old file you read and already edited doesn't need its full contents anymore — a one-line note of what it contained and what you changed will do.
- **Compact the conversation.** This is the big one, and the hard one.

Eventually the whole session outgrows the window and you have to shrink the history itself. The two naive options are both traps: truncate the oldest turns and the agent forgets the original task; summarize everything and it forgets the specific detail the next step depends on.

Good compaction is *selective*. What must survive:

- The **original task** and any constraints the user stated out loud.
- **Decisions already made** — "we chose Postgres," "the user rejected approach B" — so they aren't relitigated.
- **Current state**: what's done, what's in progress.
- The **last few turns verbatim**, because the very next action almost always depends on them.

What can go: superseded reasoning, full contents of files already handled, exploratory tool calls that led nowhere, duplicate search hits. The practical shape is a summarization pass over the *old* turns into a structured digest, with the last N turns left untouched — and then you test it like anything else, with an [eval](/blog/why-your-ai-agent-needs-evals) that checks whether the agent can still finish the task after compaction fires.

## Move 4: Isolate — give a sub-task its own window

The fourth move is structural: when a chunk of work would flood the main context with detail nobody needs afterward, hand it to a **sub-agent** with its own clean window. It does the noisy work — reads twenty files, runs the search, sifts the logs — and returns only the conclusion. The main agent's context gains a two-line answer instead of the twenty-file mess that produced it.

This is the real argument for multi-agent setups, and it's easy to miss. It's not mainly about parallel speed. It's **context hygiene**: isolation keeps exploratory sprawl out of the conversation that has to stay coherent for the whole task. A research fan-out that reads a hundred sources and reports five findings has spent a hundred sources' worth of tokens *in windows you throw away*, and kept your main window pristine.

The cost is coordination — you have to specify the sub-task well and trust a summary — so reach for it when the isolation is worth more than the overhead, not by default.

## Reading the symptoms

The useful thing about having four named moves is that symptoms start pointing at fixes:

| Symptom | Likely cause | Move |
|---|---|---|
| Agent forgets the original goal late in a session | history truncated, not summarized | Compress (compaction) |
| Agent re-derives work it already did | results never persisted | Write |
| One file read and quality fell off a cliff | greedy load blew the budget | Select |
| Context balloons doing research/exploration | noisy sub-work in the main window | Isolate |
| Repeats a mistake it was already corrected on | correction scrolled out of the window | Write (memory) |

Notice none of these say "switch to a bigger model." Almost every "the agent got dumb over time" complaint is one of these five rows, and every one is fixable in your own code.

## The mental shift

Context engineering asks *"what do I put in this one request?"* Context management asks the harder, longer question: *"how do I keep that request healthy on turn 2, turn 20, and turn 200?"*

The answer is that you stop treating the window as an append-only log and start treating it as a **working set you actively curate** — writing things out, selecting things back in, compressing what stays, and isolating what doesn't belong. Do that, and an agent can run for an hour and end as sharp as it started. Skip it, and no model, however large its window, will save you.

---

*This pairs with [context engineering](/blog/context-engineering-for-agents), which covers assembling a single request well. Managing context across a long, stateful session — compaction, memory, and sub-agent isolation — is built and evaluated in [Week 9](/curriculum/week-9-memory-and-sessions) of the AI Engineering mentorship.*
