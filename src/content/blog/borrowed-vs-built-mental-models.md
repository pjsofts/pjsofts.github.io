---
title: "Andrew Ng is right about coding agents. Here's the fastest way to build the mental model he's talking about."
description: "Ng's AI Engineering Skills Map names 'using coding agents' as one of four core skills — and says it requires a good mental model of how agents work. You can borrow that model from blog posts, or you can build it by building the agent. We argue for building."
pubDate: 2026-08-21
tags: ["AI Engineering", "Agents", "Learning", "Curriculum", "Coding Agents"]
readingTime: 7
featured: true
---

Andrew Ng just published his [AI Engineering Skills Map](https://www.deeplearning.ai/) — a synthesis of over 10,000 job postings and dozens of expert interviews, boiled down to the four skills that matter most for developers right now. One of the four is **using coding agents**, and his definition of the skill is worth quoting exactly:

> "When you have this skill, you have a good mental model for how agents work. You understand their limitations and how to work around them."

He's right. And he's pointing at something most advice about coding agents skips past: the skill isn't a list of prompting tricks. It's a **mental model** — an accurate internal picture of what the thing on the other side of your terminal actually does.

Which raises the practical question: where does a good mental model come from?

## Borrowed models vs. built models

There are two ways to get a mental model of a system.

You can **borrow** one — read blog posts, watch talks, collect heuristics: "keep your context small," "give it a spec," "agents get lost in long sessions." Borrowed models are fast to acquire and they work until the situation drifts slightly outside the heuristic. Then they fail silently, because a heuristic tells you *what* to do, not *why* — so you can't tell when it stops applying.

Or you can **build** one. A builder's model comes from having implemented the system yourself, even once, even small. It's slower to acquire, and it doesn't go stale the same way — when a new agent tool ships next month, you recognize the machinery under the new paint, because you've had your hands on the machinery.

For most systems, borrowing is the right call — you don't need to write a database to use Postgres well. Coding agents are different, for a reason Ng himself names elsewhere in the essay: the field is moving so fast that "using coding agents skillfully means not only knowing cutting-edge practices, but also having routines to keep trying new tools and evolve your workflows as best practices change." Heuristics about agents have a shelf life of months. The architecture underneath them has barely changed in two years.

And here's the thing that makes building the model unusually cheap: **the machine is small.** A coding agent, at its core, is a loop that calls a model, runs the tools it asks for, feeds the results back, compacts the context when it fills up, and gates the dangerous parts behind approval and a sandbox. We recently read the source of three production agents — Claude Code, Grok Build, and DeepSeek Harness — [side by side](/blog/claude-code-vs-grok-vs-deepseek-harness/), and the strongest finding was that all three are that same machine, three times, in three styles. You can build a working version of it in weeks. People do, in our program, every cohort.

## Ng's sub-skills, from the builder's side

What convinced me this framing is right is how precisely Ng's list of sub-skills maps onto the subsystems you'd implement. Read his list as a user and it's advice. Read it as a builder and it's a table of contents.

**"Manage a coding agent's context."** As a user, this is the vaguest advice on the list — manage it *how*? As a builder, it's concrete: you've implemented compaction, so you know the agent is watching a token meter and will summarize the conversation when it crosses a threshold. You know that threshold isn't folklore — Grok compacts at 85%, DeepSeek Harness at 80% with the newest 16% kept verbatim, Claude Code on a threshold ladder. Three independent teams landed within five points of each other. Once you've built that, "manage context" stops being a vibe and becomes a set of levers you can name: what's in the window, what survives a summary, what a tool result costs.

**"Help the agent autonomously close loops by providing verifiers or evals."** This one is *about the loop itself*. Every production agent stops the same way: the model didn't ask for a tool, so the turn is over. The agent keeps going as long as each step produces something to react to — which is exactly why a test suite or a typechecker transforms agent performance. You're not "adding quality checks"; you're feeding the loop the tool results that keep it converging instead of guessing. That's obvious in about a week of building it, and genuinely hard to internalize from the outside.

**"Avoid pitfalls like an agent messing up your production database."** From the outside: be careful, use permissions. From the inside: you know the containment machinery by name, because you've read three versions of it — OS-level sandboxes that fail closed (DeepSeek Harness refuses to run at all if the kernel can't enforce confinement), approval gates in front of dangerous tools, escalation flows where the model must *justify* a permission request to the human. Knowing this machinery exists — and where each tool draws the line — is the difference between fear-driven caution and calibrated trust.

**"Make tradeoffs between planning and execution," "orchestrate multiple agents."** Plan modes and subagents are features you can implement in an afternoon once you have the loop — a plan mode is a loop with the write-tools removed; a subagent is the same loop given a task and a clean context window. Users of these features debate when to use them. Builders know what they cost — a subagent can't see your conversation, which is precisely why it's useful — and the "when" follows from the "what."

None of this means everyone must build an agent to use one, any more than everyone who works with the cloud needs to have written a hypervisor. But Ng's map is about *prioritizing what to learn* — and if "a good mental model for how agents work" is the stated requirement, building the small version of the machine is the shortest reliable path to one. It compresses months of accumulating heuristics into weeks of understanding causes.

## The honest scope note

Ng's map has four skills: building and deploying AI applications, software engineering fundamentals, using coding agents, and shaping the build. Our [mentorship](/curriculum) goes deep on one of them — the third — plus a meaningful slice of the first (you build evals, RAG, and context engineering *into* your agent, because a coding agent is itself an AI application under Ng's definition: unpredictable outputs that you steer with measurement). Software fundamentals and product sense come from your career, not from us; a twelve-week program claiming to cover all four would be selling you something.

But there's a compounding effect Ng's framing makes visible: the four skills aren't independent. Steering a coding agent well *is* applied software fundamentals — his own words: "steering coding agents using the precise language of software engineering." And the freed-up capacity from effective agent use is what makes room for shaping the build. The mental-model skill is upstream of the others. It's a good place to start.

---

*In the [AI Engineering mentorship](/curriculum) you build a working coding agent from scratch — the loop, tools, context management, sandboxing, subagents — and then read the production source of Claude Code, Grok Build, and DeepSeek Harness to compare your choices with theirs. Start with [Week 1](/curriculum/week-1-your-first-agent), or read the [three-way source comparison](/blog/claude-code-vs-grok-vs-deepseek-harness/).*
