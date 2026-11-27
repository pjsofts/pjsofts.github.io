---
title: "Why a diagram agent went from 91% to 75% without a code change"
description: "How stricter evals exposed disconnected arrows and labels, how the tool interface changed, and how to inspect all 14 recorded cases."
pubDate: 2026-11-27
tags: ["Evals", "Agents", "Tool design"]
readingTime: 6
featured: true
---

The diagram looked like a flowchart. Its arrows sat next to boxes and its labels sat inside them. Move a box, though, and some arrows and text stayed behind. The canvas looked right at one instant while failing one of the simplest editing tasks.

The diagram-agent workshop reports **91%** on its early rubric and **75%** once the authors graded the same implementation on the structure it produced. The stricter scorer checked whether arrows reference actual shape IDs and whether text is bound to the shape it labels. Those checks inspect the canvas state directly. The 91% is the earlier result narrated in the walkthrough. [Scorer walkthrough](https://github.com/pjsofts/ai-engineering2/blob/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop/BUILD.md#L1828)

## Move the failure into the tool interface

The original tool could place an arrow by coordinates and write text as a separate element. The revised tool accepts arrow endpoints as shape references and a label as a property of its shape. The application builds the actual bindings. The change gives the eval something precise to check, and it gives the model a simpler way to express what the user meant.

In the recorded `create-02-three-chain` case, the bound-arrow check went from **0** to **1**. Across the 14 cases, the captured baseline and revised runs rounded to **75%** and **99%**. Both used `gpt-5.4-mini` with the stricter rubric. The saved configs also use different system-prompt files, so the comparison shows what changed across the two configurations. A matched-prompt experiment is needed to isolate the effect of the tool surface. [Tool-schema walkthrough](https://github.com/pjsofts/ai-engineering2/blob/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop/BUILD.md#L2562) · [Saved runs and caveats](https://github.com/pjsofts/ai-engineering2/tree/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop/app/evals/results)

## Verify the recorded results

Use a fresh checkout of the workshop, which the current curriculum assigns in [Week 5](/curriculum/week-5-evals-and-discipline/). The folder keeps its original name. The commands below use Git and `jq` to recalculate the metric from the saved records without calling a model.

```bash
git clone https://github.com/pjsofts/ai-engineering2.git
cd ai-engineering2
git checkout 082361bd1a3199d61982f3c87f1e410207339da7
cd week2-diagram-workshop/app

jq '{
  model, system, tools, cases: (.rows | length),
  recomputed: ([.rows[].scores[] | select(.score != null)]
    | group_by(.name)
    | map((map(.score) | add) / length)
    | add / length),
  chain_arrows: (.rows[] | select(.id == "create-02-three-chain")
    | .scores[] | select(.name == "boundArrows") | .score)
}' evals/results/{baseline-part2-tools,final-with-part3-prompt}.json
```

The first record gives about `0.7475` overall and `0` for the chain's arrow check. The second gives about `0.9852` and `1`. Each overall score averages the per-metric means. The underlying cases, scorers, and exact run configuration are in the pinned source. Both records are single runs of a small workshop suite. [Dataset and scorers](https://github.com/pjsofts/ai-engineering2/tree/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop/app/evals)

## Collect fresh measurements

From the same directory, run `npm ci` and copy `.dev.vars.example` to `.dev.vars`. Set your own `OPENAI_API_KEY` locally. These commands call the model and judge and can incur API charges. They use the same configuration files as the two saved runs.

```bash
EVAL_MODEL=gpt-5.4-mini \
  EVAL_SYSTEM_FILE=steps/part2/system-prompt.ts \
  EVAL_TOOLS_FILE=steps/part2/tools.ts \
  npm run eval:local

EVAL_MODEL=gpt-5.4-mini \
  EVAL_SYSTEM_FILE=steps/part3/system-prompt.ts \
  npm run eval:local
```

The runner writes each result to `evals/results/`. To isolate one change in your own agent, keep the dataset, model, prompt, and graders fixed, and swap only the tool implementation. Repeat each condition and compare the per-case and per-metric spread. [Runner source](https://github.com/pjsofts/ai-engineering2/blob/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop/app/evals/run.ts)

The [free first-agent lab](/labs/first-agent/) gives you a smaller version of the same debugging loop. A tool call fails with the model response held fixed, and five offline checks tell you whether your fix worked.
