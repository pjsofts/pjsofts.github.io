---
title: "Most AI agent failures aren't model failures — they're tool design failures"
description: "Better models won't fix badly designed tools. Task-oriented tools over raw APIs, fewer tools over more, designing for the model rather than the human, high-signal returns, and evaluating the tool interface itself."
pubDate: 2026-07-15
tags: ["Agents", "Tool Design", "Evals", "LLM"]
readingTime: 7
featured: true
---

Spend enough time debugging production agents and a pattern emerges: when the agent misbehaves, the instinct is to reach for a bigger model. Most of the time, that's the wrong lever.

**Better models won't fix poorly designed tools.** They'll just fail more expensively.

Here's what actually moves reliability.

## Don't expose raw APIs. Build task-oriented tools.

The tempting move is to mirror your existing REST endpoints one-for-one and call it a toolset. But an agent shouldn't have to orchestrate five separate API calls to accomplish one obvious task.

Give it `create_calendar_event`, not `list_calendars` + `check_availability` + `create_event` + `add_attendees` + `send_invites`. Every step of that orchestration is a place for the agent to lose the thread.

Tools should be shaped like **the tasks a user wants done**, not like your service boundaries. Your internal architecture is not the model's problem.

## Fewer tools often outperform more tools

Each tool you add expands the model's search space and decision complexity. Twenty tools means twenty descriptions competing for attention in the context window, and twenty chances to pick the wrong one.

This is counterintuitive because adding capability *feels* like progress. But an agent that reliably does eight things beats one that unreliably attempts thirty. When you catch yourself adding a tool, ask whether an existing one should absorb the job instead.

The sharpest version of this: if two tools are frequently used together in a fixed order, that's usually one tool.

## Design for the model, not the human

A tool description is a prompt. The model never sees your implementation — it sees a name, a description telling it *when* to use the tool, and an argument schema.

Ninety percent of "the model uses tools badly" is actually "my tool descriptions are vague."

What helps:

- **Clear, unambiguous names.** `search_codebase` beats `query`.
- **Descriptions that say when, not just what.** "Use this when you need semantic matches and don't know the exact symbol name" is far more useful than "searches the codebase."
- **Predictable, consistent schemas.** If three tools take a file path, they should all call it `file_path`.
- **Actionable error messages.** When a tool fails, return the error to the model as data. A good model reads a specific error and fixes its next call. Your error messages are a second prompt.

## Return only high-signal information

Dumping 1,000 log lines into the context window is almost always worse than returning the 20 that matter. You're not just wasting tokens — you're burying the signal and inviting the model to latch onto something irrelevant.

Think of a tool return as a summary written *for a reader with limited attention*, because that's exactly what it is. Truncate deliberately, and say that you truncated. Sort by relevance. Strip boilerplate.

## Evaluate tools, not just prompts

This is the one most teams skip. Everyone iterates on the system prompt; almost nobody measures the tool interface.

Useful signals:

- How many **retries** does a task need?
- How many **unnecessary tool calls** happen per task?
- How often does the agent pick the **wrong tool** for an unambiguous request?

If your agent needs three retries or five wasted calls to complete a task, that's not a model problem. That's an interface problem, and it will show up as latency and cost long before anyone calls it a bug.

Build an eval suite that scores tool *selection*, not just final answers. It's cheap, and it catches the failures that vibes-based testing never surfaces.

## Let the model help design its own interface

One idea worth stealing: use AI itself to improve tool descriptions, parameter names, and documentation. Show a model your tool schema alongside cases where the agent chose badly, and ask what's ambiguous.

It's a much better use of iteration cycles than endlessly tweaking the system prompt, because you're optimizing the interface the model actually reads.

## The shift

As AI engineering matures, I think we'll spend less time asking *"which model should we use?"* and more time asking:

> **"Are we giving the model the right tools?"**

That's where reliability is won or lost.

---

*Tool design is the whole of [Week 5](/curriculum/week-5-tools-that-touch-code) in the AI Engineering mentorship — six tools, a permission system, and the error-message design that lets an agent recover from its own mistakes.*
