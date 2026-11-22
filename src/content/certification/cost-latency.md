---
{
  "title": "Cost & Latency Optimization",
  "domain": 6,
  "weight": 8,
  "description": "Cost modeling per completed task, caching and cache diagnostics, batch economics, model routing and cascades, per-tenant budgets, and TTFT vs total latency.",
  "lab": {
    "file": "lab_cost_latency.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/06-cost-latency/lab_cost_latency.py",
    "blurb": "Model a support fleet's daily cost under caching, a cascade and batch, plus parallel tool latency."
  }
}
---

## 6.1 Cost architecture at scale

### Model the cost first

```
cost per request = uncached_input × p_in
                 + cache_write   × p_in × 1.25   (5-minute TTL; 1-hour TTL writes cost more)
                 + cache_read    × p_in × 0.1
                 + output        × p_out
cost per task    = Σ requests in the task (agent loops re-send history every turn!)
fleet cost       = Σ tasks × volume, by model, route and tenant
```

**Judge cost per completed task, not per request.** A cheaper model that needs more turns, retries or human escalations can cost more overall.

Prices vary a lot across the Claude family. At the time of writing, for example: Opus 5.5 is $4 in / $20 out per million tokens, Sonnet 5.5 is $2 / $10, and Haiku 5.5 is $0.10 / $0.50. Always check current pricing. Output tokens cost about 5× input, so verbose outputs and long reasoning are expensive.

### The levers, in order (free wins first)

1. **Prompt caching.** Cache the stable prefix (tools, system prompt, large documents, conversation history). Cache reads cost about 10% of base input. Requirements: a byte-identical prefix, stable tool order, volatile content after the last breakpoint. **Verify** with `usage.cache_read_input_tokens`. If it's zero across repeated requests, something is invalidating the prefix.
2. **Input hygiene.** Trim tool outputs, retrieve fewer and better chunks, clear old tool results, defer large tool catalogs.
3. **Output hygiene.** Ask for concise outputs; set sensible `max_tokens`; use structured outputs instead of prose.
4. **Batch.** The Message Batches API is about 50% cheaper for anything that can wait (up to 24 h): nightly enrichment, evals, backfills.
5. **Effort tuning.** Lower `effort` for simple routes. On the newest models, the top model at lower effort often matches an older or smaller model at higher effort.
6. **Model routing and cascades.**
   - **Routing:** a classifier or rules send each request to the cheapest model that handles it (FAQ → Haiku, complex agentic → Opus).
   - **Cascade:** try the cheap model first; escalate when confidence is low or a validator fails.
   - Caveats: the **prompt cache is per model**, so splitting traffic across models forfeits cache reuse; routing errors cost quality; measure the simpler alternative (one model at lower effort) first.

### Batch vs realtime economics

| | Realtime | Batch |
|---|---|---|
| Price | 1× | ~0.5× |
| Latency | seconds | minutes to 24 h |
| Use for | user-facing, interactive | evals, backfills, nightly reports, bulk classification |

### Forecasting and budgets

- **Forecast** from traffic × tokens per task × price per model, plus growth and a model-migration factor (new tokenizers can change counts).
- **Per-tenant budgets** are enforced in your gateway: soft limit → alert; hard limit → degrade (cheaper model, lower effort) or reject. Attribute cost with tenant IDs on every request (separate workspaces or keys help).
- **Runaway protection:** step limits, per-task token budgets, and anomaly alerts on spend per key.

### Cache diagnostics

| Symptom | Likely cause |
|---|---|
| `cache_read` is always 0 | Prefix shorter than the model's minimum cacheable length; a timestamp or UUID in the system prompt; tools serialized in varying order |
| Hit rate dropped after a deploy | Prompt or tool change moved volatile content into the prefix; or a mid-conversation edit to the system prompt |
| Hits fine in testing, poor in production | Traffic spread over many replicas or models; requests further apart than the TTL; per-user variation early in the prompt |

---

## 6.2 Latency engineering

### Know what you're measuring

- **TTFT (time to first token):** what a user *feels* in a chat UI. Driven by input processing (large uncached prompts), queueing, thinking before the first visible token.
- **Total latency:** what a *pipeline* or tool call waits for. Driven by output length, number of sequential turns, and tool execution time.
- **Agent latency** = Σ (model turns + tool executions) on the critical path.

### Levers

| Lever | Helps | Notes |
|---|---|---|
| **Streaming** | Perceived latency (TTFT) | Doesn't shorten total time; essential for chat UX and long outputs |
| **Prompt caching** | TTFT on long prompts | The cached prefix isn't reprocessed |
| **Parallel tool execution** | Total agent latency | Run independent tool calls concurrently; return all results in **one** user message |
| **Fewer sequential turns** | Total | Better tool design (one tool that does the job vs three chatty ones); workflows instead of agents for fixed paths |
| **Effort level** | Total and TTFT | Lower effort means less thinking. Tune per route |
| **Shorter outputs** | Total | Output tokens dominate generation time |
| **Smaller or faster model; fast mode** | Total | Trade cost or quality; measure |
| **Speculative or precomputed work** | Perceived | Prefetch retrieval, pre-warm caches |

Match the lever to the target: if the SLO is TTFT for a chat UI, streaming plus caching come first; if it's end-to-end time for a 12-step agent, parallelism and fewer turns matter more than streaming.

> **Lab:** [`lab_cost_latency.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/06-cost-latency/lab_cost_latency.py) models a support fleet. It compares no caching vs caching, single model vs a cascade, realtime vs batch, and sequential vs parallel tool execution.

---

## Common traps

- Routing to a cheaper model without measuring cost per *completed* task.
- Streaming to fix a pipeline's total latency.
- Building a cascade before trying the best model at lower effort.
- Putting `datetime.now()` in the system prompt.
- Running eval suites and backfills in realtime instead of batch.

## Self-check

- [ ] I can write the cost formula with cache reads and writes and apply it to an agent loop.
- [ ] I know the lever order: caching and hygiene → batch → effort → routing.
- [ ] I can diagnose a zero cache hit rate.
- [ ] I can tell TTFT from total latency and choose levers for each.
- [ ] I can design per-tenant budget enforcement.
