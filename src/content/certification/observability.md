---
{
  "title": "Observability & Production Monitoring",
  "domain": 3,
  "weight": 12,
  "description": "Tracing agent loops and tool calls, token, cost and cache metrics, privacy-safe content capture, LLM SLIs and SLOs, drift, and failure-cohort analysis.",
  "lab": {
    "file": "lab_trace_cohorts.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/03-observability/lab_trace_cohorts.py",
    "blurb": "Find a systemic bug hidden in 5,000 traces with sampling and cohort lift."
  }
}
---

## 3.1 Telemetry and instrumentation

### Trace the agent loop

Use **distributed tracing** (OpenTelemetry is the standard; the official Anthropic SDKs can emit spans). A good trace for one agent task:

```
task (root span)  tenant=acme  prompt_version=support@v7  model=claude-opus-5-5
├── model_call #1   input_tokens, output_tokens, cache_read, cache_write, stop_reason, latency, ttft
├── tool_call search_kb   args_hash, result_size, status, latency
├── model_call #2   ...
├── subagent research  (child trace, linked)
│   └── ...
└── model_call #3   stop_reason=end_turn
```

Attributes to record on **every model call**: model ID, prompt or config version, `stop_reason`, input, output, cache-read and cache-write tokens, time-to-first-token and total latency, the API request ID, and retry count. On **tool calls**: tool name and version, status, latency, result size. Propagate trace context into tools, subagents and MCP servers so one trace covers the whole task.

### Metrics

| Category | Metric |
|---|---|
| Tokens and cost | input, output, cache-read and cache-write tokens per request, task, tenant and model; $ per task |
| Cache performance | cache hit rate = cache_read / (cache_read + cache_write + uncached input). A sudden drop means a prefix changed (a timestamp in the system prompt, reordered tools) |
| Reliability | error rate by class (429, 5xx, 400), refusal rate, max_tokens rate, retry rate, fallback rate |
| Latency | TTFT and total latency at p50/p95/p99; steps per task |
| Quality | task success, judge scores on sampled traffic, user feedback, escalation rate |
| Agent behavior | tool calls per task, loop or step-limit hits, tool error rate |

### Grounding and reasoning traceability

For knowledge-grounded answers, log **which documents were retrieved, their scores, and which were cited**, so an auditor can answer "why did it say that?". Where you use summarized thinking or progress updates, decide whether to store them; they are useful for debugging but may contain sensitive data.

### Structured logs

Log **events, not prose**: `{"event":"tool_denied","tool":"send_email","reason":"recipient_not_allowlisted","trace_id":...}`. Structured events are queryable and can become metrics.

### Content capture under privacy constraints

Prompts and completions are the most useful debugging data **and** the most sensitive.

- Make content capture **configurable**: off, redacted, sampled, or full, per environment and tenant.
- Under **zero data retention (ZDR)** or strict regulatory requirements, *your own* telemetry must not quietly keep what the provider agreed not to. Capture **metadata only** (token counts, stop reasons, latencies, hashes, classifier labels) or **redact PII before export**.
- Apply retention limits and access control to trace stores. Traces containing customer data are customer data.

---

## 3.2 Production monitoring and alerting

### SLIs and SLOs for LLM services

An **SLI** is a measured ratio; an **SLO** is the target. LLM services need quality SLIs alongside the classic ones.

| SLI | Example SLO |
|---|---|
| Availability: requests answered without error | 99.9% / 30 days |
| Latency: requests with TTFT < 1.5 s | 95% |
| Task success: sampled tasks judged successful | ≥ 90% weekly |
| Groundedness: sampled answers fully supported by sources | ≥ 97% |
| Cost: $ per resolved ticket | ≤ $0.12 |

Alert on **error-budget burn rate** (multi-window: fast burn pages someone, slow burn files a ticket), not on single spikes.

### Drift and regressions

- **Quality drift:** judge scores, success or escalation rate trend down. Causes include changing user mix, stale knowledge base, upstream tool changes, or a model or prompt change.
- **After a model update:** compare the before and after distributions of output length, tool-call rate, refusal rate, stop reasons, cost per task, and judge scores, sliced by cohort. Most regressions hide in a slice.
- **Anomalous usage:** token spikes per tenant or key (runaway loops, abuse, leaked key), unusual tool sequences, a jump in refusals (possible abuse attempts).

### Dashboards

One top-level dashboard per service: SLO status, traffic, cost and tokens by model and tenant, cache hit rate, error and stop-reason mix, quality scores, plus drill-downs. Put **release annotations** (prompt, model and tool versions) on every chart so regressions line up with changes.

---

## 3.3 Trace analysis at scale

Individual traces explain one failure. **Systemic** issues only show up in aggregate.

- **Sampling.** Keep 100% of errors and slow or expensive traces (**tail-based sampling**) plus a uniform random sample of the rest (for unbiased rates). Head-based sampling alone throws away the rare failures you need.
- **Aggregation.** Group by dimensions: model, prompt version, tenant, tool, route, input-length bucket, language.
- **Failure-cohort analysis.** Compare the failing cohort to the baseline: which dimensions are over-represented? A failure rate of 2% overall can be 30% for one `tool_version` or one tenant.
- **Quantify.** Express findings as "X% of failures, Y% of cost, affecting Z tenants" to prioritize.

> **Lab:** [`lab_trace_cohorts.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/03-observability/lab_trace_cohorts.py) generates 5,000 synthetic traces with a hidden systemic bug, computes SLIs, and finds the bug by cohort lift, which you can't see in any single trace.

---

## Common traps

- Capturing full prompts in traces for a ZDR or regulated tenant.
- Only head sampling at 1%, so the rare failure cohort is never captured.
- Alerting on raw error spikes instead of SLO burn rate (alert fatigue).
- Monitoring only latency and errors, with no quality SLI, so a "healthy" service gives wrong answers.
- Looking at average cost instead of the distribution (a few runaway loops dominate spend).

## Self-check

- [ ] I can list the attributes every model-call span should carry.
- [ ] I can compute cache hit rate and name three things that silently break caching.
- [ ] I can define a quality SLI and an error-budget alert for an LLM service.
- [ ] I can explain tail-based sampling and why it matters for failure analysis.
- [ ] I can find an over-represented dimension in a failure cohort.
