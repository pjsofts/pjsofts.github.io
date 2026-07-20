---
title: "Context engineering: the highest-leverage skill in AI engineering"
description: "The model has no memory — everything it knows on any turn is something you put in the request. How to assemble a system prompt, budget tokens, load project rules, and compact long sessions without losing what matters."
pubDate: 2026-07-05
tags: ["Context Engineering", "Prompt Engineering", "Agents", "Tokens"]
readingTime: 9
---

Here's the uncomfortable truth that reframes everything once you internalize it: **the API is stateless.** There is no conversation on the server. No memory. No "it remembers."

On every single turn you send the entire context, and the model's answer is a pure function of what you sent.

That sounds like a limitation. It's actually the most liberating fact in this field, because it means **whoever controls the context controls the agent**. A mediocre model with excellent context beats a brilliant model fed garbage — and context is almost entirely under your control.

## The anatomy of context

Every request is assembled from three parts:

```
context = system prompt      (who the agent is + project rules)
        + history            (what has happened so far)
        + fetched material   (files, search results, tool output)
```

Assembled **fresh for every request**, within a fixed token budget. Your job is to spend that budget well.

Most people treat this as an append-only log: shove everything in, hope for the best, and act surprised when quality degrades at turn thirty. Context engineering is the discipline of deciding deliberately what goes in, in what order, and what to do when there's too much.

## 1. Assemble the system prompt, don't hardcode it

A system prompt isn't a string constant. It's **static identity plus dynamic facts**, composed per request:

- *Static:* who the agent is, how it should behave, its output conventions.
- *Dynamic:* the current working directory, today's date, which files are open, what platform it's on, which tools are available right now.

The dynamic half is what makes an agent feel like it understands your situation. It's also where a surprising amount of "the model is dumb" turns out to be "the model wasn't told."

## 2. Let the project speak for itself

The best trick here: have the agent **read the project's own rules**.

Drop a markdown file at the project root — call it `AGENTS.md` — containing conventions the agent should follow: which test runner to use, code style, things never to touch. The agent discovers it by walking up the directory tree from the current file, nearest match wins.

Why this beats stuffing conventions into your system prompt:

- Rules live **with the code**, versioned alongside it.
- Different projects get different rules, automatically.
- Anyone on the team can edit them without touching agent code.
- Nested directories can override the root.

## 3. Budget tokens explicitly

Decide in advance what each part of the context is *allowed* to cost. Something like:

| Part | Budget |
|---|---|
| System prompt + project rules | ~10% |
| Conversation history | ~50% |
| Fetched material (files, search) | ~35% |
| Headroom for the response | ~5% |

The specific numbers matter less than having them at all. Without a budget, a single large file read silently evicts everything the agent needed to remember, and the failure looks like amnesia rather than what it is — an allocation problem.

This is also why tool returns should be high-signal. A tool that dumps 1,000 log lines isn't just noisy; it's spending a large fraction of your entire budget.

## 4. Compaction: the hard part

Eventually a long conversation exceeds the window. The naive answers are both bad:

- **Truncate the oldest turns** → the agent forgets the original task.
- **Summarize everything** → the agent forgets the specific detail the next step depends on.

Good compaction is selective. What must survive:

- The **original task** and any constraints the user stated.
- **Decisions already made** ("we chose Postgres," "the user rejected approach B").
- **Current state** — what's done, what's in progress.
- **Recent turns verbatim**, because the next step usually depends on them.

What can go: superseded intermediate reasoning, full contents of files already edited, exploratory tool calls that led nowhere, and duplicated search results.

The practical shape is a summarization pass over old turns that produces a structured digest, keeping the last N turns untouched. Then you test it the same way you test anything else — with evals that check whether the agent can still complete a task after compaction fires.

## 5. Order matters

Models attend unevenly across a long context. Information at the very beginning and the very end tends to land harder than material buried in the middle.

Practical consequences:

- Put **stable, important instructions** at the top (they also cache better).
- Put the **immediate task and most recent turns** at the end.
- Don't bury a critical constraint in the middle of a 40k-token dump.

## The mental shift

Stop thinking of context as "the chat history" and start thinking of it as **a working set you curate on every single request**.

That reframe changes the questions you ask. Not *"why did the model forget?"* but *"what did I actually send it, and what did I spend the budget on?"* The second question always has an answer, and it's usually one you can fix without changing models at all.

---

*Context engineering gets a full week — [Week 6](/curriculum/week-6-context-and-prompt-engineering) — in the AI Engineering mentorship, including AGENTS.md discovery and a compaction implementation you evaluate.*
