---
{
  "title": "Evaluation Engineering & QA",
  "domain": 5,
  "weight": 12,
  "description": "Golden sets, regression suites and CI gates, suite validity over time, LLM-as-judge calibration against humans, and online quality measurement.",
  "lab": {
    "file": "lab_judge_calibration.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/05-evaluation/lab_judge_calibration.py",
    "blurb": "Measure a position-biased judge against human labels, debias it, and decide whether it may gate releases."
  }
}
---

## 5.1 Evaluation system design

### The layers

| Layer | What it is | Runs |
|---|---|---|
| **Golden set** | Curated inputs with reference outputs or grading criteria, representative of real traffic *and* its hard cases | Every change |
| **Regression suite** | Cases that once failed (from incidents and bug reports) and must never fail again | Every change |
| **Behavioral checks** | Deterministic assertions: valid JSON, required fields, no PII in output, correct tool chosen, refuses out-of-scope requests, stays under N steps | Every change, fast |
| **Model-graded evals** | Judge scores for open-ended quality (helpfulness, tone, groundedness) | Every change or nightly |
| **Retrieval metrics** | Recall@k, precision@k, MRR on labeled query → doc pairs | On retrieval changes |
| **Groundedness** | Each claim supported by the retrieved sources; citation accuracy | On prompt, model or retrieval changes |

**Prefer deterministic checks** wherever they can express the requirement. They are cheap, stable and unambiguous. Use judges for what code can't check.

### Agent evals

Grade both the **outcome** (did the task get done? check the end state: DB row written, file changed, test passing) and the **trajectory** (right tools, no forbidden actions, reasonable step count and cost). Run agent evals multiple times; report **pass rate** (e.g., pass@1 averaged over k trials) because agents are non-deterministic.

### CI/CD evaluation gates

```
PR changes prompt/model/tool/retrieval config
   └─ CI: behavioral checks (must be 100%)
        └─ golden + regression suite vs baseline
             └─ gate: no regression beyond noise on key metrics, no new safety failures
                  └─ shadow → canary in production (Domain 2)
```

**Release criteria** should be explicit and set *before* you look at results: e.g., "task success ≥ baseline − 1pt (95% CI), zero safety regressions, cost per task ≤ +10%". Compare against the **current production baseline run in the same harness at the same time**, not against an old number.

**Noise matters.** With 200 cases, a 2-point difference may be noise. Use repeated runs, paired comparisons on the same items, and confidence intervals.

### Keeping suites valid over time

| Threat | Symptom | Fix |
|---|---|---|
| **Contamination** | Eval items leak into prompts, few-shot examples or training data; scores rise and real quality doesn't | Keep a held-out set never used during prompt iteration; rotate items; check for verbatim overlap |
| **Saturation** | Everything scores 98–100%, so the suite can't tell candidates apart | Add harder cases mined from production failures and edge cases |
| **Coverage gaps** | Production failures happen in categories the suite doesn't contain | Sample production traffic regularly; tag cases by category; track the distribution against live traffic |
| **Label rot** | Reference answers become wrong (policy changed) | Version labels and review them on a schedule |

---

## 5.2 LLM-as-judge engineering

A judge is a **model you deploy**. It needs its own eval: **agreement with human labels**.

### Calibration loop

1. Get a **human-labeled set** (e.g., 100–300 items), ideally with two or more raters per item.
2. Measure **inter-rater reliability** among humans first (e.g., Cohen's kappa). If humans disagree, the rubric is ambiguous; fix the rubric before blaming the judge.
3. Run the judge and measure **judge–human agreement** (accuracy, Cohen's kappa, or correlation for scores). Look at the confusion matrix: is the judge too lenient or too harsh?
4. Iterate the judge prompt and rubric on a **dev split**, confirm on a **held-out split**.
5. Only then give the judge **gating authority**. Re-calibrate whenever the judge model, rubric or task changes.

### Biases and fixes

| Bias | Fix |
|---|---|
| **Position bias** (pairwise judges favor the first or second option) | Randomize order, or run **both orders** and only count consistent verdicts; measure the first-position win rate |
| **Verbosity bias** (longer = better) | Rubric says length isn't a merit; length-controlled comparisons |
| **Self-preference** (a judge favors outputs from its own model family) | Use a different judge model or validate against humans |
| **Vague rubric** | Concrete criteria, scales anchored with examples, one criterion per judgment; ask for a short rationale before the score |
| **Judge drift** | Pin the judge model version; on judge model upgrade, re-run calibration and compare |

**Pairwise vs absolute:** pairwise is more sensitive for "is B better than A", but suffers from position bias. Absolute (rubric) scoring gives stable trend lines and is easier to monitor. Many teams use both. Note that switching formats does **not** by itself establish calibration.

> **Lab:** [`lab_judge_calibration.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/05-evaluation/lab_judge_calibration.py) simulates a pairwise judge with position bias, measures its kappa against humans, then debiases it by evaluating both orders.

---

## 5.3 Online quality measurement

Offline evals approximate production. Live traffic is the truth.

- **Live-traffic sampling:** run judges and checks on a random sample of real conversations (respect privacy and ZDR, see Domain 3), plus targeted samples (low confidence, escalations, refusals).
- **A/B tests:** randomize users or sessions (not requests, if conversations span requests) between variants; pick the primary metric and sample size in advance; watch guardrail metrics (cost, latency, safety).
- **Feedback loops:** thumbs up or down, edits to drafts, escalation to a human, re-asks, abandonment. These are **implicit signals**, biased (unhappy users click more) but cheap and continuous. Route negative-feedback cases into the golden and regression sets.

### Metric selection by task type

| Task type | Metrics |
|---|---|
| **Extraction / classification** | Exact match, field-level precision, recall and F1, schema validity |
| **Generation** (summaries, drafts) | Rubric judge scores, human preference, edit distance of accepted drafts |
| **Agentic** | Task success rate (end-state check), steps and cost per success, intervention rate, forbidden-action rate |
| **Retrieval-grounded** | Retrieval recall@k, groundedness or faithfulness, citation accuracy, answer correctness, abstention rate when the answer isn't in the sources |

---

## Common traps

- Giving an uncalibrated judge gating authority (official guide sample).
- Switching to a "bigger judge" without measuring agreement.
- Lowering the pass threshold to make the gate "more sensitive".
- Comparing a candidate to a months-old baseline number instead of a fresh paired run.
- Iterating prompts against the same items you report on (contamination).
- Using BLEU or ROUGE for agentic tasks.

## Self-check

- [ ] I can design an eval stack (behavioral, golden, regression, judge) and a CI gate with release criteria.
- [ ] I can define contamination, saturation and coverage gaps and the fix for each.
- [ ] I can calibrate a judge: human IRR first, then judge–human kappa, held-out confirmation.
- [ ] I can detect and correct position bias.
- [ ] I can pick metrics for extraction vs generation vs agentic vs retrieval-grounded tasks.
