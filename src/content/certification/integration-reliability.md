---
{
  "title": "Integration, Reliability & Knowledge Grounding",
  "domain": 2,
  "weight": 20,
  "description": "Stop-reason-aware retries and fallbacks, rate limits and multi-tenant throughput, MCP and model change management, and retrieval quality diagnosed by stage.",
  "lab": {
    "file": "lab_resilience.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/02-integration-reliability/lab_resilience.py",
    "blurb": "Compare a naive retry wrapper with one that classifies 429s, 400s, length stops and refusals."
  }
}
---

## 2.1 Reliability engineering for Claude services

### Classify before you retry

The single most important idea in this domain: **different stop conditions are different failure classes**. A retry path that treats them all the same is a bug.

| Signal | What it means | Right response | Wrong response |
|---|---|---|---|
| HTTP **429** `rate_limit_error` | You exceeded a rate limit | Back off (honor `retry-after`), retry; shed or queue load | Hammering retries; failing over every request to another model (multiplies cost, may hit *its* limits) |
| HTTP **529** `overloaded_error` / **5xx** | Service-side transient issue | Retry with exponential backoff + jitter; circuit-break; fall back to another model or region if sustained | Treating it as a client bug |
| HTTP **408** / connection errors / timeouts | Transport problem | Retry with backoff; use streaming for long generations | Huge single non-streaming requests |
| HTTP **400** `invalid_request_error` | Your request is wrong | Fix the request. **Do not retry.** | Retrying, which wastes money and repeats the error |
| HTTP **401/403** | Auth or permission | Alert; fix credentials | Retrying |
| `stop_reason: "max_tokens"` (HTTP 200) | Output hit the length cap | Raise `max_tokens`, continue the generation, or ask for shorter output | Retrying the same request, which reproduces the truncation |
| `stop_reason: "refusal"` (HTTP 200) | The model declined for safety reasons; `stop_details` gives the category | Route to a safety-handling path: user message, review queue, or a configured refusal fallback | Blind retry or a fallback that assumes it was a transient error |
| `stop_reason: "pause_turn"` | Long server-tool turn paused | Send the response back to let it continue | Treating it as complete |
| Context window exceeded | Input too large | Compact, trim, retrieve less, or route to a larger-context model | Retrying unchanged |

Key facts: the official SDKs already retry connection errors, 408, 409, 429 and 5xx with exponential backoff (2 retries by default, configurable), and respect `x-should-retry`. **A refusal arrives as a successful HTTP 200**, so you must check `stop_reason` before reading `content`. Always log the response's request ID.

### Resilience patterns

- **Exponential backoff with jitter.** Prevents synchronized retry storms.
- **Retry budgets.** Cap retries as a fraction of traffic (e.g., at most 10% extra) so a partial outage doesn't triple load.
- **Circuit breaker.** After N failures in a window, stop calling the failing dependency for a cooldown, fail fast or fall back, then half-open to probe.
- **Graceful degradation.** Cached answer, smaller model, reduced feature (no tool use), or a human handoff, instead of an error page.
- **Fallback chains.** Cross-model (e.g., primary → secondary model), cross-region, or cross-platform (first-party API → a cloud platform). Caveats:
  - **Feature parity.** Not every feature, beta, tool type or model is available on every platform. A fallback that silently drops a feature the request depends on (structured outputs, a server tool, a beta header) produces wrong results, not errors. Test each fallback path.
  - **Behavior differences.** A fallback model may answer differently. Eval the fallback path too.
  - **Prompt cache is per model.** Failover means cold caches and higher cost and latency.

> **Lab:** [`lab_resilience.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/02-integration-reliability/lab_resilience.py) is a stop-reason-aware call wrapper with backoff, a circuit breaker and a fallback, run against a simulated flaky model.

---

## 2.2 Scale and throughput management

### Find the binding constraint

Claude rate limits are measured per model in **requests per minute (RPM)**, **input tokens per minute (ITPM)**, and **output tokens per minute (OTPM)**. Workloads usually hit one first:

| Symptom | Binding constraint | Lever |
|---|---|---|
| Many small requests rejected | RPM | Batch more work per request; queue and smooth |
| Few large-context requests rejected | ITPM | Prompt caching (cached reads typically count less against ITPM, so check the current docs for your model); trim context |
| Long generations rejected | OTPM | Shorter outputs; spread over time; more capacity |
| Nothing is latency-sensitive and volume is huge | Economics | **Message Batches API**: asynchronous, about 50% cheaper, results within 24 h |

### Queueing and backpressure

- Put a **queue** between producers and the Claude client. Size worker concurrency to your rate limit, not to incoming traffic.
- Apply **backpressure**: when the queue is deep, reject or defer low-priority work early (HTTP 429/503 to *your* callers) rather than letting latency grow without bound.
- Use **priority classes**: interactive traffic first, background work fills the gaps, batch work goes to the Batches API.

### Multi-tenant quota and isolation

- **Per-tenant quotas** (tokens/min, $/day) enforced in *your* gateway. One tenant's spike must not starve others ("noisy neighbor").
- **Separate workspaces or API keys** per tenant tier for spend limits and attribution.
- **Fair queuing** (weighted round-robin across tenant queues).
- **Isolation of data:** tenant ID flows into retrieval filters, cache keys, and logs. Never share a retrieval index without tenant filtering.

### Capacity planning

Forecast `requests × (input + output tokens)` per minute at peak, with headroom (often 30–50%), per model. Remember that model migrations change token counts (tokenizers differ) and output lengths, so re-baseline after a model change.

---

## 2.3 Production MCP and change management

### Remote MCP in production

- **Transport:** remote servers over HTTP (Streamable HTTP); local servers over stdio for developer tools.
- **Auth:** OAuth 2.1-style authorization for remote servers; never bake long-lived secrets into server configs that ship to clients.
- **Gateways:** an MCP gateway centralizes auth, an allowlist of approved servers, rate limits, audit logging and routing.
- **Platform config parity:** the same agent deployed on two platforms must get the same servers, versions and permissions. Drift here is a classic "works in staging" bug.

### Tool and schema versioning

- Tool **names and schemas are an API contract** with the model. Renaming a parameter, changing an enum, or rewording a description changes behavior.
- Version tools (`search_v2`) or support both shapes during migration; deprecate deliberately.
- **Run evals on tool-schema changes** exactly like prompt changes.

### Model version migrations

- New model ≠ drop-in. Expect **behavioral changes**: verbosity, tool-call frequency, refusal categories, formatting, effort defaults, removed parameters (e.g., removed sampling parameters or prefill on newer models). Read the migration notes.
- **Re-baseline token counts** (tokenizers change).
- **Migration testing:** run the full regression suite plus targeted tests for known breaking changes, then shadow traffic, then canary.

### Prompt versioning and progressive delivery

1. Prompts live in version control with an ID (`support-agent@v7`) that is logged on every trace.
2. Offline eval gate in CI (Domain 5).
3. **Shadow**: run the new version on copies of live traffic, don't serve it, compare.
4. **Canary**: 1% → 5% → 25% → 100%, with automatic rollback on SLO or quality-metric breach.
5. **Feature flags** let you roll back in seconds without a deploy.

---

## 2.4 Retrieval and knowledge grounding at scale

### Agentic search vs RAG

| | Classic RAG | Agentic search |
|---|---|---|
| How | Retrieve top-k once, stuff into the prompt, answer | The model issues searches, reads, refines and searches again with tools |
| Good for | Fast, cheap, predictable Q&A over a well-chunked corpus | Multi-hop questions, code bases, sources needing exploration |
| Cost | Low, fixed | Higher and variable |
| Failure | Retrieval miss → confident wrong answer | Loops, over-reading, cost blowups |

### The retrieval stack

1. **Chunking.** Respect document structure (headings, sections, code functions). Too small loses context; too large dilutes relevance. Add **contextual headers** (doc title and section path) to each chunk.
2. **Embeddings.** Dense vectors capture meaning; weak on exact identifiers (error codes, SKUs, names).
3. **Lexical (BM25).** Strong on exact terms; weak on paraphrase.
4. **Hybrid search.** Run both and merge (e.g., **reciprocal rank fusion**). This is usually the best default.
5. **Reranking.** A cross-encoder or LLM reranker reorders the top-50 into the best top-5. Big precision gains, at some latency cost.
6. **Metadata filters.** Tenant, permissions, recency, product version.

### Diagnose retrieval failures by stage

| Stage | Question | Metric |
|---|---|---|
| Ingestion | Is the right content even in the index? Parsed correctly? Current? | Coverage audits |
| Retrieval | Is the relevant chunk in the top-k candidates? | **Recall@k** |
| Ranking | Is it near the top after reranking? | **Precision@k**, MRR, nDCG |
| Generation | Given the right chunk, did the model use it faithfully? | **Groundedness / faithfulness**, citation accuracy |

If recall@50 is fine but answers are wrong, don't re-embed the corpus; look at ranking or generation. If the document isn't in the index, no prompt fix helps.

### Grounding practices

- **Citations.** Ask for, or use the API's citation feature to get, source spans for each claim; validate that cited text exists.
- **Uncertainty declaration.** Instruct and allow the model to say "the sources don't cover this" and reward that in evals.
- **Confidence signals.** Retrieval scores, citation coverage, and agreement across sources feed a confidence flag. Low confidence routes to a human or a hedged answer.

> **Lab:** [`lab_hybrid_retrieval.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/02-integration-reliability/lab_hybrid_retrieval.py) compares lexical, "semantic" and hybrid (RRF) retrieval on queries with exact identifiers and paraphrases, and measures recall@k.

---

## Common traps

- One retry path for rate limits, length stops and refusals (the official guide's own sample question).
- Failing over to a cloud platform that lacks a feature the request uses.
- Re-embedding everything when the failure is at the ranking or generation stage.
- Shipping a tool description edit without running evals.
- Measuring only the global rate limit when one tenant is starving the others.

## Self-check

- [ ] Given an error or stop reason, I know whether to retry, fix, raise the budget or route to safety handling.
- [ ] I can design a circuit breaker and say what "half-open" means.
- [ ] I can tell from symptoms whether RPM, ITPM, OTPM or economics binds, and pick the lever.
- [ ] I can describe a shadow → canary → rollout process for a prompt or model change.
- [ ] I can localize a RAG failure to ingestion, retrieval, ranking or generation.
