---
title: "Why your AI agent needs evals (and how to build them in an afternoon)"
description: "You never ship an improvement you haven't measured. Golden datasets, deterministic scorers vs LLM-as-judge, negative test cases, and the data flywheel that turns every user correction into a regression test."
pubDate: 2026-06-28
tags: ["Evals", "Testing", "Agents", "LLM-as-judge"]
readingTime: 8
---

Here's a scenario every AI engineer recognizes. You tweak a prompt. You run it on two examples. It looks better. You ship it.

Three days later something else is broken, and you have no idea whether your change caused it — because you have no baseline, no test set, and no number.

The habit that separates a demo from a product is small and unglamorous:

> **You never ship an improvement you haven't measured.**

That's it. That single habit *is* the profession. Everything below exists to make it cheap enough that you actually do it.

## Why normal tests don't work

Traditional tests assert exact outputs. LLM outputs are non-deterministic and often correct in many different phrasings, so `assert result == expected` fails immediately.

The answer isn't to give up on testing. It's to change what you assert:

- Assert on **structure** (did it return valid JSON matching the schema?)
- Assert on **behavior** (did it call the right tool?)
- Assert on **properties** (does the answer mention the required fact? is it under N tokens?)
- Assert on **judgment** (does a model rate this as answering the question?)

## Start with a golden dataset

A golden dataset is just a list of cases: an input, and what should happen.

Twenty cases is enough to start. Where they come from:

- **Real usage.** The best source, by far.
- **Failures you've seen.** Every bug you fix becomes a permanent case.
- **Edge cases you're afraid of.** Ambiguous requests, adversarial inputs, empty results.
- **Negative cases.** See below — these matter more than people expect.

Keep it in a plain JSON or YAML file in the repo. This is not infrastructure you rent.

## Include negative cases

The single most underrated eval case is one where the agent should do **nothing**.

Ask "what's the capital of France?" of an agent with file and shell tools. The correct behavior is to answer directly — no tool calls at all. Agents that have been over-tuned toward tool use will reach for `web_search` or start reading files, burning latency and money on a question the model already knows.

If your eval suite only contains cases where a tool *should* fire, you will never catch this.

## Two kinds of scorer

**Deterministic scorers** — use these wherever possible. They're free, instant, and never flaky:

```python
def scores_tool_choice(trajectory, expected_tool):
    tools_used = [s.name for s in trajectory if s.type == "function_call"]
    return expected_tool in tools_used
```

Did it call the right tool? Is the output valid JSON? Did it stay under the step limit? Did it avoid touching files outside the project? All checkable with plain code.

**LLM-as-judge** — for the genuinely subjective parts. Give a model the question, the answer, and a rubric, and have it return a structured verdict:

```python
verdict = client.responses.create(
    model=JUDGE_MODEL,
    instructions=(
        "You grade agent answers. Reply with JSON: "
        '{"passed": bool, "reason": str}. '
        "Pass only if the answer is factually correct and directly addresses the question."
    ),
    input=f"Question: {q}\n\nAnswer: {a}",
)
```

Two rules that keep judges honest: make the rubric **specific** (vague rubrics produce generous grades), and require a **reason** alongside the verdict so you can spot-check when the judge is wrong.

## Establish a baseline before you optimize

Run the suite once, write down the number. That's your baseline.

Without it, every subsequent change is an opinion. With it, you get to say "tool description rewrite: 62% → 81%" — which is both a much better engineering conversation and a much better thing to put in a standup.

Expect surprises. Some changes you're sure about won't move the number at all. That's not a failed experiment; that's the suite doing its job and saving you from shipping complexity for nothing.

## Score trajectories, not just answers

For agents, the final answer isn't the whole story. A correct answer reached through nine unnecessary tool calls is a latency and cost bug hiding inside a passing test.

Worth scoring:

- **Steps taken** vs. the minimum required
- **Tool selection accuracy** at each step
- **Retries** caused by malformed calls
- **Total tokens** and **cost** per case

These are the metrics that reveal interface problems — usually a vague tool description rather than anything about the model.

## The data flywheel

The final piece is what makes the suite compound: **every user correction becomes a test case.**

When someone reports the agent did the wrong thing, you don't just fix it. You add the case to the golden dataset. The suite grows with usage, and it grows specifically in the places your users actually care about.

That's the flywheel:

```
usage → failures → new eval cases → measured fixes → better agent → more usage
```

An eval suite built this way stops being a chore and becomes the most valuable artifact in the repo — a precise, executable specification of what your agent is supposed to do, written by reality.

## Start today

You can build the first version in an afternoon:

1. Write 20 cases in a JSON file, including 3 negative ones.
2. Write 2 deterministic scorers and 1 LLM judge.
3. Run it. Record the number.
4. Change one thing. Run it again.

That's a real eval suite. Everything after that is refinement.

---

*Evals are the spine of [Week 2](/curriculum/week-2-evals-and-discipline) in the AI Engineering mentorship — golden datasets, scorers, a baseline, and then an entire half-week of measured improvements.*
