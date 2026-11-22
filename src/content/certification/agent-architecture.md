---
{
  "title": "Agent Architecture & Orchestration",
  "domain": 1,
  "weight": 17,
  "description": "Supervisor/worker and parallel subagents, durable execution and checkpointing, workflow-vs-agent decisions from production data, and context policies for long-running agents.",
  "lab": {
    "file": "lab_durable_agent.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/01-agent-architecture/lab_durable_agent.py",
    "blurb": "Crash an agent mid-task and resume it from a checkpoint without repeating a side effect."
  }
}
---

## 1.1 Multi-agent orchestration

### The patterns

| Pattern | Shape | Use when | Failure it invites |
|---|---|---|---|
| **Supervisor / worker** | One orchestrator plans, delegates subtasks, and synthesizes | Work decomposes into distinct subtasks needing different context or tools | Supervisor becomes a bottleneck; workers return too much text and flood its context |
| **Parallel fan-out** | Dispatch N independent subagents at once, gather results | Breadth tasks: research across sources, per-file or per-record work | Duplicated work, inconsistent assumptions, cost scales with N |
| **Pipeline / handoff** | Agent A's output is agent B's input | Fixed stages with clear contracts | Errors compound silently between stages |
| **Hierarchical** | Supervisors of supervisors | Very large tasks | Latency and cost explode; hard to trace |
| **Human-in-the-loop** | Agent pauses for an approval or answer | Irreversible, costly or ambiguous steps | Approval fatigue, so humans rubber-stamp |

### Context isolation is the point

A subagent's main value is that it **starts with a clean, small context** and returns a **compressed result**. The supervisor never sees the 40 pages the worker read, only the 300-token summary. Design rules:

- Give each worker a **complete, self-contained brief**: goal, constraints, output format, and what *not* to do. Workers can't ask the supervisor what it meant.
- Define the **return contract** (schema or structured summary). Free-text returns get long and drift.
- Pass **only the context the worker needs**. Sharing the full parent transcript defeats isolation and raises cost.
- Scope **tools per worker** (least privilege). A research worker doesn't need the email tool.

### Inter-agent failure modes (exam favorites)

- **Lost constraints:** a constraint known to the supervisor never made it into the worker's brief. Fix it in the delegation contract, not by making the worker smarter.
- **Conflicting outputs:** parallel workers make incompatible assumptions. Add a reconciliation step or shared assumptions in the brief.
- **Infinite delegation / loops:** agents hand work back and forth. Enforce depth and step limits and budgets in the harness.
- **Error swallowing:** a worker fails and returns plausible-looking text. Require explicit status fields (`ok` / `failed` / `partial`) in the return contract.
- **Cost blowup:** fan-out of N multiplies tokens about N times. Fan out only where parallelism buys quality or latency you need.

### Approval flows

Put approvals **at the action boundary** (when the tool is about to execute) and **enforce them in the harness**, not by asking the model to ask. Make approvals specific ("send this email to x@y.com with this body") so the human can actually judge them. Batch low-risk actions; require approval for irreversible, external or high-cost ones.

---

## 1.2 Durable execution and state management

A long-running agent **will** be interrupted: deploys, crashes, rate limits, timeouts, human approvals that take a day. Production agents need:

| Concern | Practice |
|---|---|
| **Checkpointing** | Persist state after every step: the message history, tool results, plan, and step counter. Write it atomically (temp file + rename, or a DB transaction). |
| **Resumability** | On restart, load the last checkpoint and continue. Don't start over and don't re-run completed steps. |
| **Idempotency** | Tool calls with side effects carry an **idempotency key** (e.g., `run_id:step_n`) so a replay after a crash doesn't send the email twice. |
| **Side-effect journaling** | Record "about to do X" → do X → "did X". On resume, a started-but-unconfirmed action is checked, not blindly repeated. |
| **Session persistence** | Session ID → stored transcript plus metadata, so a user or a scheduler can reattach. |
| **Model version change** | The checkpoint records the model ID and prompt version. On resume under a new model, decide explicitly: continue, re-plan, or restart. Never assume old reasoning artifacts carry over. Thinking blocks, for example, are tied to the model that produced them. |

Managed platforms (e.g., Claude Managed Agents sessions, durable-workflow engines) give you some of this, but the exam expects you to know **what** must be durable and **why**, whatever the tool.

> **Lab:** [`lab_durable_agent.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/01-agent-architecture/lab_durable_agent.py) runs an agent that crashes mid-task, resumes from its checkpoint, and uses idempotency keys so a side effect isn't repeated.

---

## 1.3 Architecture selection at scale

### Workflow vs agent

**Who decides the next step?** In a *workflow*, your code does, and the model fills in the blanks. In an *agent*, the model does. Moving that decision to the model buys flexibility and costs predictability, latency, and money.

Evolve **based on production data**, not fashion:

| Signal in production data | Direction |
|---|---|
| Agent traces show the same 4 steps in the same order 95% of the time | Collapse to a **workflow** (cheaper, faster, testable) |
| Workflow fails on a long tail of inputs needing different paths | Add **routing**, or an agentic step *only for that tail* |
| Agent cost per task is high but success is the same as a simpler pipeline | Simplify |
| Task success requires exploration (unknown number of steps) | Agent is justified |

The answer is often a **hybrid**: a deterministic workflow with one bounded agentic step.

### Harness and framework selection

When choosing a harness (raw Messages API loop, SDK tool runner, Claude Agent SDK, Claude Managed Agents, a third-party framework), weigh:

- **Control vs. undifferentiated work:** own the loop if you need custom control flow; take a managed harness if you'd otherwise rebuild sessions, sandboxes, and context management.
- **Data and compliance constraints:** retention requirements and which platforms (first-party API, Bedrock, Vertex AI, Foundry) support which features. **Feature parity is not guaranteed across platforms.**
- **Observability hooks:** can you trace every model and tool call?
- **Team standards:** pick reusable patterns (tool conventions, prompt templates, eval harness) and standardize them so teams don't rebuild the same thing five ways.

---

## 1.4 Context and memory architecture

Long-running agents hit the **context window** (hard limit) and the **cost ceiling** (each turn re-sends history). Tools:

| Technique | What it does | Trade-off |
|---|---|---|
| **Compaction** | Summarize older history into a compact block and continue | Lossy, so a detail a later step needs can vanish. Keep decisions, open tasks, and identifiers in the summary. |
| **Context editing** | Clear old tool results or thinking blocks while keeping the conversation structure | Cheap and precise for tool-heavy loops, but the model loses those raw results |
| **Persistent memory** | Agent writes durable notes (files or a memory store) and reads them later | Survives sessions, but it's a **poisoning surface** (see Domain 7) and needs curation |
| **Subagents** | Offload reading-heavy work to a fresh context; get back a summary | Extra calls and latency |
| **Tool search / deferred tool loading** | Don't put 300 tool definitions in every request; let the model search for the tools it needs | Extra step; a tool's description must be searchable |
| **Retrieval (just-in-time)** | Fetch documents when needed instead of stuffing them up front | Retrieval quality becomes critical (Domain 2) |

### Cache-safe changes

Prompt caching is a **prefix match**. The render order is tools → system → messages. Any byte change in the prefix invalidates everything after it. So:

- **Don't edit the top-level system prompt mid-conversation** to inject a new instruction. Newer models accept a **mid-conversation system message** appended to `messages`, which keeps the cached prefix intact.
- Keep the **tool list deterministic** (same order, same definitions). Adding or removing a tool mid-session busts the cache.
- Put volatile content (timestamps, request IDs) **after** the last cache breakpoint.

### Picking a context policy (exam reasoning)

- Agent reads many large tool outputs that are only needed briefly → **context editing** (clear old tool results).
- Conversation is long and earlier *decisions* matter → **compaction** with a summary that preserves decisions.
- Knowledge must survive across sessions → **persistent memory**, with provenance and review.
- Huge tool catalog bloating every request → **tool search / deferred loading**.
- Cost ceiling but context is fine → caching first, then trimming.

---

## Common traps

- "Add more agents" when the failure is a bad delegation contract.
- "Increase the context window" when the failure is a lossy summary or unbounded tool output.
- Resuming a run by replaying everything from scratch, which duplicates side effects.
- Editing the system prompt mid-session and wondering why cost jumped (cache invalidated).
- Assuming a feature on the first-party API exists identically on every cloud platform.

## Self-check

- [ ] I can name the failure each orchestration pattern invites, and its fix.
- [ ] I can list what a checkpoint must contain and why side effects need idempotency keys.
- [ ] I can argue from trace data whether to move a system toward workflow or agent.
- [ ] I can choose between compaction, context editing, memory, subagents and tool search for a given symptom.
- [ ] I can explain why mid-conversation instruction changes should not edit the system prompt.
