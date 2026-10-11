---
title: "Building effective agents: the five workflows, one agent, and the advice most teams skip"
description: "A reader's guide to Anthropic's 'Building Effective Agents': the workflow-vs-agent split, the augmented LLM, the five workflow patterns with code, when a real agent is worth what it costs, and why the appendix on tool design is the most useful part."
pubDate: 2026-10-11
tags: ["Agents", "Workflows", "Tool Design", "Fundamentals", "Anthropic"]
readingTime: 11
---

In December 2024, Erik Schluntz and Barry Zhang at Anthropic published [**Building Effective Agents**](https://www.anthropic.com/engineering/building-effective-agents). It's short, it has no product pitch, and nearly two years later it's still the essay I send people first when they ask how to build an agent.

Its main claim fits in one sentence. After working with dozens of teams, Anthropic found that *"the most successful implementations use simple, composable patterns rather than complex frameworks."*

This post goes through the essay section by section. For each pattern I add the code I'd actually write, and I point out where the advice gets ignored in practice. Read the original too. It's quick, and this post is commentary on it, not a replacement.

## Workflows and agents are different things

The essay starts with a distinction that most people blur. Anthropic uses **agentic systems** as the umbrella term for everything in this space, and splits it in two:

- **Workflows**: LLMs and tools orchestrated through *predefined code paths*. You write the control flow, and the model fills in the steps.
- **Agents**: LLMs that *dynamically direct their own processes and tool usage*. The model writes the control flow as it goes.

This split is the most useful idea in the essay. Once you have it, you stop asking "should I build an agent?" and start asking **who should own the control flow, my code or the model?** For most production features the answer is your code.

## Start with less than you think you need

Before any patterns, the essay warns you: find the simplest solution, and only add complexity when you need it. Often that means no agentic system at all. A single LLM call with good retrieval and a few in-context examples handles a surprising share of real use cases.

The reason is cost. Agentic systems usually **trade latency and cost for better task performance**. That trade is worth making when the task needs it. It's a bad trade when you made it because agents are fashionable.

So the order is:

1. A single, well-prompted call with retrieval.
2. A workflow, when the task breaks into known steps.
3. An agent, when the steps can't be known ahead of time.

## On frameworks: know what's underneath

The essay doesn't oppose frameworks. It names several and admits they make the boring parts easy. Its concern is that frameworks add layers of abstraction that *hide the prompts and responses*, and those are exactly what you need to see when something goes wrong. They also make it tempting to add complexity a simpler setup wouldn't need.

The advice is to start with the LLM API directly, since most patterns take only a few lines. If you do use a framework, read enough of its source to know what it sends to the model. I've argued the same thing [about the agent loop itself](/blog/what-is-an-agent-loop): you can't judge an abstraction if you don't know what shape it has.

## The building block: the augmented LLM

Every pattern below is built from one unit: an LLM with **retrieval, tools, and memory** added. Current models are good at using these. They write their own search queries, pick tools, and decide what's worth remembering.

The essay's advice here is easy to miss. The hard part isn't connecting these capabilities. It's **tailoring them to your use case and giving the model a clear, well-documented interface to them**. The essay mentions the Model Context Protocol as one standard way to plug in third-party tools, but the protocol is just the connector. Whether the interface is any good is still your job.

For the code below, assume one helper:

```python
def llm(prompt: str, *, system: str = "", model: str = MODEL) -> str:
    """One call to an augmented LLM. Returns the text output."""
    ...
```

## Workflow 1: Prompt chaining

**The pattern:** break a task into a fixed sequence of steps. Each LLM call takes the previous call's output. Between steps you can add a programmatic **gate**, a plain code check that stops the chain early if something has gone wrong.

**Use it when** the task breaks cleanly into fixed subtasks. You're trading latency for accuracy by giving each call an easier job.

```python
def write_doc(brief: str) -> str:
    outline = llm(f"Write an outline for: {brief}")

    # Gate: plain code, not another LLM call.
    if outline.count("\n") < 3:
        raise ValueError("Outline too thin — refusing to draft from it.")

    return llm(f"Write the document following this outline:\n{outline}")
```

**Examples from the essay:** write marketing copy, then translate it. Or write an outline, check it against criteria, then write the document.

The gate is the part people leave out, and it's what makes this better than one long prompt. A failure caught at step two doesn't get passed on to step five.

## Workflow 2: Routing

**The pattern:** classify the input, then send it to a specialised prompt, tool set, or model.

**Use it when** you have distinct categories that are better handled separately, and you can classify accurately, with an LLM or a traditional classifier.

```python
ROUTES = {
    "refund":    handle_refund,
    "technical": handle_technical,
    "general":   handle_general,
}

def support(query: str) -> str:
    label = llm(
        f"Classify as one of {list(ROUTES)}. Reply with the label only.\n\n{query}",
        model=SMALL_MODEL,
    ).strip().lower()
    return ROUTES.get(label, handle_general)(query)
```

**Examples from the essay:** sending customer-service queries (general, refund, technical) to different downstream processes, and sending easy questions to a small, cheap model and hard ones to a more capable one.

Routing is about **separation of concerns**. Without it, a prompt tuned for refunds slowly gets worse at technical questions, and the other way round. Routing also gives you a cost lever for free.

## Workflow 3: Parallelization

**The pattern:** run several LLM calls at once and combine the results in code. There are two variants:

- **Sectioning**: split the task into *independent* subtasks that run in parallel.
- **Voting**: run the *same* task several times and combine the answers.

**Use it when** the subtasks really are independent and you want speed, or when several attempts or perspectives give you more confidence in the answer.

```python
import asyncio

async def review(code: str) -> bool:
    prompts = [
        f"Does this code have an injection vulnerability? yes/no\n{code}",
        f"Does this code leak secrets or credentials? yes/no\n{code}",
        f"Does this code have an auth bypass? yes/no\n{code}",
    ]
    votes = await asyncio.gather(*(allm(p) for p in prompts))
    flagged = sum(v.strip().lower().startswith("yes") for v in votes)
    return flagged >= 1          # the threshold is a product decision
```

**Examples from the essay.** Sectioning: one model call screens the input against guardrails while another writes the response. This works better than asking one call to do both. Another case is evals where each call scores a single aspect. Voting: several prompts reviewing code for vulnerabilities, or several checks on whether content is inappropriate, with a vote threshold that trades false positives against false negatives.

Same model, same input, different questions. Each call does better when it only has to think about one thing.

## Workflow 4: Orchestrator–workers

**The pattern:** a central LLM breaks the task into subtasks at runtime, hands them to worker LLMs, and combines what they return.

**Use it when** you *can't predict the subtasks in advance*. That's the difference from parallelization. The structure looks the same, but here the model decides what the subtasks are.

```python
def change_codebase(request: str) -> str:
    plan = llm_json(
        f"List the files that must change for: {request}. "
        'Return {"tasks": [{"file": ..., "instruction": ...}]}'
    )
    results = [
        llm(f"In {t['file']}: {t['instruction']}") for t in plan["tasks"]
    ]
    return llm(f"Summarise these changes for review:\n" + "\n---\n".join(results))
```

**Examples from the essay:** coding tasks that change an unknown number of files, and search tasks that pull from many sources.

This is the first pattern where the model takes over part of the control flow. It's a step toward an agent, but it's still bounded: one plan, one round of workers, one synthesis step.

## Workflow 5: Evaluator–optimizer

**The pattern:** one LLM writes a draft, another critiques it, and the loop repeats until the critic is satisfied.

**Use it when** three things hold. You have clear evaluation criteria. Iterating measurably improves the output. And the model can give feedback that's actually useful. A good test: if a human's feedback would clearly improve the draft, an LLM's feedback probably can too.

```python
def translate(text: str, max_rounds: int = 3) -> str:
    draft = llm(f"Translate to Persian, preserving tone:\n{text}")
    for _ in range(max_rounds):
        critique = llm(
            "Critique this translation for accuracy and tone. "
            f"Reply PASS if it needs no changes.\n\nSource:\n{text}\n\nDraft:\n{draft}"
        )
        if critique.strip().startswith("PASS"):
            break
        draft = llm(f"Revise using this feedback:\n{critique}\n\nDraft:\n{draft}")
    return draft
```

**Examples from the essay:** literary translation, where a critic picks up nuances the first pass missed, and multi-round search, where the evaluator decides whether another round is needed.

Note the `max_rounds`. Every loop needs an exit condition that doesn't depend on the model agreeing to stop.

## Agents: the model owns the loop

Now the real thing. An agent starts from a human command or conversation. It plans, acts, and gets **"ground truth" from the environment at each step**: tool results, test output, the state of a file. It can stop to ask a human for input or approval. It finishes when the task is done or a stopping condition is reached.

The essay's description is deliberately plain:

> They are typically just LLMs using tools based on environmental feedback in a loop.

That's the [forty-line loop](/blog/what-is-an-agent-loop). There's nothing more to it, which is also why **tool design matters so much**. The tools are the agent's only way to perceive and act.

**Use agents for** open-ended problems where you can't predict or hard-code the number of steps, and where you trust the model's decisions enough to let it run without you.

**The costs:** more money, and *compounding errors*, because a wrong turn at step three affects everything after it. The essay recommends extensive testing in **sandboxed environments with appropriate guardrails**. I wrote about the sandbox half of that [here](/blog/sandboxing-agent-code-execution).

**Examples from the essay:** a coding agent that resolves SWE-bench tasks, which means edits across many files based only on a task description, and Anthropic's computer-use reference implementation.

## Combine them and measure

The patterns aren't a menu of fixed options. They're parts you can combine. A router can send to a chain. An orchestrator's workers can each be evaluator–optimizer loops. An agent can call a parallelized guardrail before every tool call.

The essay's rule for combining them is the most important sentence in it:

> You should consider adding complexity *only* when it demonstrably improves outcomes.

"Demonstrably" means you measured it. You can't follow that rule without [evals](/blog/why-your-ai-agent-needs-evals). Without them, every extra layer is a guess.

## The three principles

The essay ends with three principles for building agents:

1. **Simplicity.** Keep the agent's design simple.
2. **Transparency.** Show the agent's planning steps explicitly, so you and your users can see what it's doing and why.
3. **A well-crafted agent–computer interface (ACI).** Document and test your tools thoroughly.

It also adds a practical note: frameworks are fine for getting started quickly, but **remove layers of abstraction and build with basic components** as you move to production.

## Appendix 1: where agents are already working

The essay points to two domains where agents deliver real value today. What they have in common matters more than the domains themselves. Both combine conversation and action, have clear success criteria, give the agent a feedback loop, and include human oversight.

**Customer support.** It's a chat interface by nature, the actions it needs are well defined (look up an order, issue a refund, update a ticket), and success is measurable as a resolved issue. That's clear enough that some companies charge only for successful resolutions.

**Coding agents.** Code can be checked with automated tests, so the agent can iterate on real feedback, and output quality is objectively measurable. Human review still matters, because passing tests doesn't guarantee the change fits the wider system.

If you're picking a first agent project, look for those properties: **verifiable outcomes, a tight feedback loop, and a human at the right checkpoint.**

## Appendix 2: prompt-engineer your tools

This is the appendix I'd make required reading, because it's where most agent quality comes from. Its argument is that **tool definitions deserve as much prompt engineering as your main prompt**. They're part of the prompt.

The advice on formats is specific. Give the model enough tokens to "think" before it commits to an output. Keep formats close to what the model has seen naturally in text on the internet. Avoid formatting overhead, like having to keep an accurate count of thousands of lines or escape every quote in code it writes. One example: writing a diff requires knowing how many lines change *before* writing the new code, which is harder than just writing the file.

The guidelines:

- **Put yourself in the model's shoes.** If a capable human would need to think hard to use the tool from its description, the model will too.
- **Write descriptions like a docstring for a junior developer.** Include example usage, edge cases, input format requirements, and clear boundaries from other tools.
- **Test with many example inputs** and see what mistakes the model makes, then iterate.
- **Poka-yoke your tools.** Change the arguments so mistakes are harder to make.

The essay's example of that last point: on SWE-bench, the model made mistakes with relative file paths after it had moved out of the root directory. The fix wasn't a better prompt. They changed the tool to **always require absolute paths**, and the errors stopped.

That's the lesson in one example. When an agent keeps making the same mistake, the cause is usually the interface, not the model. I go further into this in [designing tools for AI agents](/blog/designing-tools-for-ai-agents) and [reading Claude Code's tool layer](/blog/reading-the-claude-code-tool-layer).

## What to take away

If you remember one thing from the essay, make it this: **the goal is the right system, not the most sophisticated one.**

In practice:

- Try a single good call first. Most problems stop there.
- When you need more, use a workflow, because your code owning the control flow is cheaper, faster, and easier to debug.
- Use an agent only when the steps really can't be known ahead of time, and then spend most of your effort on the tools, the sandbox, and the evals.

Nearly two years and several model generations later, the patterns haven't changed much. Models have gotten better at the agent loop. The best teams still keep most of it out of the model's hands.

---

*Source: Erik Schluntz and Barry Zhang, [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), Anthropic, December 2024. Quotations are from the original. Code samples are mine.*

*The five workflows and the agent loop are [Week 8](/curriculum/week-8-planning-and-agent-loops) of the AI Engineering mentorship, and orchestrator–workers at scale is [Week 12](/curriculum/week-12-multi-agent-orchestration).*
