---
title: "Claude Code vs. Grok Build vs. DeepSeek Harness: the third data point"
description: "We read a third production coding agent at the source level — DeepSeek Harness, a 219-package plugin system with no terminal UI, event-sourced sessions, and a fail-closed sandbox. Three teams, three architectures — and where all three agree, you're looking at load-bearing engineering."
pubDate: 2026-08-18
tags: ["Claude Code", "Grok", "DeepSeek", "Agents", "Architecture", "TypeScript", "Rust"]
readingTime: 15
featured: true
---

Last month we read [Claude Code and Grok Build side by side](/blog/claude-code-vs-grok-cli-architecture/) and argued that where two independent teams converge, you're looking at load-bearing engineering. Now there's a third open codebase to test that claim: **DeepSeek Harness** (`dsh`), DeepSeek's agent harness, currently in developer preview.

The claim holds up better than expected — and the third data point is the strangest of the three.

## Three bets on structure

Claude Code organizes by **convention**: one TypeScript process, modules under `src/`, boundaries the author maintains. Grok Build organizes by **compiler**: a Cargo workspace of 70+ crates, boundaries the build enforces. DeepSeek Harness organizes by **runtime**: *everything is a plugin* — 219 workspace packages on a vendored plugin framework (Cordis), where the agent you actually run is assembled from a YAML list of plugins (`cordis.yml`), and even the agent loop is just one more package.

And the most surprising product choice: **dsh has no terminal UI at all**. Claude Code lives inline in your terminal; Grok takes over the whole screen; `npx @deepseek-ai/dsh web` starts a local web app on `127.0.0.1:3080`. The CLI is a *launcher* for profiles, not an app — a `headless` profile does one-shot runs for scripting and CI.

| Dimension | Claude Code | Grok Build | DeepSeek Harness |
|---|---|---|---|
| Language | TypeScript (Node/Bun) | Rust (70+ crates, one binary) | TypeScript (219 pnpm packages) |
| Unit of structure | module (convention) | crate (compiler-enforced) | plugin (runtime-composed) |
| Human interface | inline terminal (Ink/React) | full-screen TUI (ratatui) | web app at `:3080` — no TUI |
| Sandbox | seccomp + Seatbelt | Landlock + Seatbelt + seccomp + bwrap | bwrap/Landlock + Seatbelt + Windows token; fail-closed |
| Token counting | tokenizer-backed + heuristics | heuristic `bytes/4` | heuristic `chars/4`, anchored to real usage |
| Compaction trigger | threshold ladder + micro-compact | 85% → 9-section summary | 80% → summary, keep 16% tail verbatim |
| Sessions | append-only JSONL | SQLite indexes + JSON checkpoints | append-only event log |
| Memory file | `CLAUDE.md` + memory dir | `AGENTS.md` / `.grok/rules` | `AGENTS.md` + `CLAUDE.md` chain |
| Subagents | markdown agents + `Task` | markdown agents + `task` | provider seam — can spawn **real Claude Code or Codex** |

In dsh, a capability is a **seam** of three roles: a Service *Definition* (abstract API plus typed events), a Service *Provider* (swap it, swap the product), and a *Consumer* (usually a model-facing tool). The payoff is concrete: swapping the filesystem and subprocess providers for **E2B cloud-sandbox adapters** relocates the agent's whole execution world — bash, terminals, LSP included — with two config rows. The cost is a framework the team vendors and fully owns, and indirection everywhere. It's Grok's crate-boundary idea pushed from compile time to run time.

## The loop: one rule, three nervous systems

The stop rule is identical in all three, and it's the one you'd write yourself: *call the model; if it asked for tools, run them and loop; if it didn't, you're done.*

What differs is the machinery. Claude Code's loop is one **async generator** — a single call stack you read top to bottom. Grok splits the turn across **three tokio actors** (session, sampler, chat-state) communicating over channels. DeepSeek Harness makes the loop **event-sourced**: every model chunk is appended to the session log *before* it's even assembled into a message, and the history for the next request is derived from the log:

```ts
for await (const chunk of stream) {
  signal.throwIfAborted()
  chunkSeqs.push(this.session.append('assistant/chunk', { turn, step, chunk }).seq)
  assembler.push(chunk)
}
// the assembled assistant/message cites its chunks: sourceEventSeqs
```

The log is the only source of context. The loop's joints are typed **waterfall events** (`agent/pre-step`, `agent/request-error`, `tools/pre-execute`…) that other plugins intercept — so retries are a *separate plugin* answering the request-error waterfall with `{ kind: 'retry' }`, and compaction-on-overflow is just another listener on the same waterfall. Even the retry itself gets logged.

My favorite detail is dsh's answer to doom loops. Grok keeps a resample budget; dsh ships a guard plugin that counts **consecutive identical tool calls** (same tool, same canonicalized arguments) and, at 3, 5, and 8 repetitions, injects an escalating reminder into context — "the repeated calls are not making progress; choose a different action" — without ever blocking the call. The gentlest fix, and the easiest to copy.

## Tools: the exact-match camp wins 2–1

The toolboxes converged again — read/edit/bash/grep/web/todos/delegate/ask-the-human, near-identical names — which is now three-for-three evidence that these are the right primitives.

The contracts differ in flavor. Claude Code: a `Tool` interface with a Zod schema. Grok: a Rust trait whose JSON schema is generated from the type at compile time. dsh: a `defineTool()` DSL compiled to JSON Schema *and* inferred to TypeScript types, with a twist — a tool returns **one canonical JSON value**, validated against a mandatory `output` schema, and a separate pure `render()` turns it into model-visible text. Presentation is part of the contract too: `presentCall`/`presentResult` declare which UI card a tool renders as (`generic | terminal | diff`), and presenters must be pure because they re-run when a session log is replayed.

On editing, the newest agent voted with the oldest design. dsh's `edit` is **exact literal replacement, no fuzz**: zero matches → `FS_EDIT_NOT_FOUND`; multiple matches without `replace_all` → `FS_AMBIGUOUS_EDIT` ("provide a more specific old_string"). That's Claude Code's contract down to the error messages, against Grok's 4-tier fuzzy patch engine. When the newest agent in the room copies the simplest design instead of the cleverest one, that's your signal: fuzzy patching is a power feature, not the foundation.

One real divergence: the shell. Grok fakes persistence by snapshotting shell state between commands; Claude Code runs a managed persistent shell; **dsh's default `bash` is deliberately stateless** — "each call runs in a fresh shell; pass `workdir` instead of using `cd`" — with persistence available as a separate, opt-in PTY-backed tool. Stateless calls are replayable and parallel-safe; persistence becomes something you choose.

## The sandbox: fail closed, all three

dsh sandboxes on all three OSes: bubblewrap or Landlock on Linux (the Landlock path is a ~300-line static C launcher that applies the ruleset *to itself* and then `execve`s your command, so the child and all its descendants are confined), Seatbelt on macOS, and — new among the three — an ACL restricted-token runner on Windows that honestly reports its enforcement as `partial`. If the kernel can't enforce, it **refuses to run** rather than run unprotected: the launcher exits 125, unsupported platforms get `SANDBOX_UNAVAILABLE`.

Escalation is designed into the tool schema: a denied write renders `[sandbox: file access denied under workspace-write mode]`, and the model may retry with `sandbox_permissions` plus a `justification` argument — which raises an approval prompt to the human. Deny → justify → approve, as a first-class flow.

Approval itself is the strictest of the three: grants are **allowed-once only** — no persistent allow-rules exist — and every question and answer is appended to the session log as an audit pair. If the audit write fails, the approval fails.

## Context: the numbers agree again

Grok compacts at 85% with a 9-section full-replace summary. Claude Code compacts on a threshold ladder plus micro-compaction of tool outputs. dsh compacts at **80%** (`DEFAULT_THRESHOLD_RATIO = 0.8`), keeps the newest **16%** of the window verbatim, and — before summarizing at all — tries a cheaper move: prune oversized tool results (over 8,192 chars → head + omission marker + tail) and re-measure. Often no summary is needed.

Two dsh details worth stealing. First, the summarization request replays the conversation's own system prompt, tools, and messages **verbatim**, appending the "summarize this" instruction as the final user message — so the provider's prompt cache for the live conversation is reused and the summary costs a fraction of a cold call. Second, token counting is a `chars/4` heuristic like Grok's, but **anchored**: the meter reuses the real token usage from the newest successful call and only estimates the delta since. Cheap like a heuristic, honest like a tokenizer.

Compact at ~80–85%, keep a recent tail, summarize with structure, decide with a 4-chars-per-token estimate: that's now a **three-way-confirmed** load-bearing technique.

## Sessions: event sourcing taken to the limit

Claude Code persists one append-only JSONL transcript. Grok spreads state across SQLite indexes and JSON rewind checkpoints. dsh commits fully to **event sourcing**, under a rule enforced repo-wide: **"model-visible ⟺ logged"** — anything that reaches a model request must be reconstructable from the session log, and any new model-visible input requires a new event type. Todos, plan mode, titles, approvals, hook runs, retries: all events, all folded back by pure functions.

The consequences are everywhere. Crash repair is *append-only* — a crashed turn is closed, not truncated, with synthetic tool results ("its outcome is unknown… retry only if the operation is read-only or idempotent") appended so the log stays valid for the model. `fork()` starts a child session from any completed-turn prefix, lineage recorded. The UI is pure **projections** over the log, cached in SQLite. Full-text search over your past sessions is just another index — and the model gets `session_search` tools over it, which is dsh's entire answer to long-term memory: it has **no memory feature at all, deliberately**. Recall is searching what actually happened.

Your JSONL file and dsh's event log are two points on the same spectrum. dsh's end buys replay, fork, audit, and time-travel for free — and paid for it with a projection framework, a versioning scheme, and crash-repair rules. Start at the JSONL end.

## One ecosystem is emerging — everyone's

The most striking pattern in the third codebase is convergence on *each other's* extension formats:

- **Instructions:** dsh reads `AGENTS.md` *and* `CLAUDE.md`, root-to-cwd, deduplicating byte-identical siblings. (Grok already read both.)
- **Hooks:** dsh ships a **Claude Code hook bridge** (and a Codex one): it reads a Claude Code hooks config, maps seven events onto its own extension points, and folds verdicts most-restrictively — `deny > ask > allow`. Grok re-implemented the same format last month. Claude Code's `settings.json` hooks are becoming a de-facto standard.
- **Skills:** dsh is SKILL.md-compatible — same frontmatter vocabulary — loaded from `.dsh/skills`, `.agents/skills`, and `~/.dsh/skills`, with `/name` slash invocation.
- **MCP:** all three are clients; dsh registers server tools as `mcp__server__tool` — in its own words, "the same server-qualified shape Claude Code and Codex use."
- **Subagents:** here dsh goes furthest. Delegation is a provider seam, and among the shipped providers are in-process spawn/fork, an out-of-process dsh child — and providers that run a **real Codex child** and a **real Claude Code child through the official Claude Agent SDK**. The `subagent` tool is provider-blind; which vendor's agent answers is a config row. Delegation is becoming an *inter-vendor* interface.

Two frontiers are dsh-only for now: a `workflow` tool that lets the *model author an orchestration script* the harness executes over subagents, and an opt-in `cordis_*` toolset with which the agent inspects and extends **its own runtime** — defining and running new plugins in a VM sandbox, in-memory, gone on restart. The README is appropriately blunt: "treat this toolset like bash access."

## What the repo says about its authors

One more thing you notice reading dsh: it's a codebase built to be worked on **by agents**. CI requires 100% per-file test coverage on every package. Roughly seventy generate-and-diff gates keep catalogs of every tool, config key, and session event in sync with the code. Keyless snapshot tests replay recorded model responses so behavior diffs without an API key. And 1,390 "Agent Notes" — an in-repo, gated design-decision archive — exist because the contribution rules demand one with every non-trivial PR. Everything logged, everything reversible, every invariant machine-checked, every decision archived where a future contributor with no memory of the last six months will find it. That describes an AI agent — and increasingly, it describes you working with one.

## What three data points prove

**Where all three agree, it's load-bearing:** the stop rule (no tool calls → done); the core toolbox; exact-match editing as the default contract; compaction at ~80–85% with structured summaries and a preserved tail; ~4-chars-per-token heuristics for the compaction decision; append-only durable transcripts; an OS sandbox that fails closed; AGENTS-style instruction files; markdown-defined extensibility; MCP.

**Where they diverge is taste, shaped by constraints:** language, structure (convention / compiler / plugin runtime), UI (inline terminal / full screen / browser), shell persistence (persistent / snapshot-faked / stateless), memory (built-in / experimental RAG / deliberately none). Every one of these has at least two defensible answers — which is exactly why your own agent can choose the simple one.

| Subsystem | You build it in | Claude Code ships | Grok ships | dsh ships |
|---|---|---|---|---|
| Agent loop | Week 4 | async generator | tokio actors + circuit breaker | event-sourced loop + waterfalls |
| Tools + schemas | Week 5 | Zod contracts | compile-time trait schemas | schema DSL + canonical output |
| Approval gate | Week 5 | permissions + allowlists | Ask/Auto + sandbox auto-allow | allowed-once seam + audit events |
| Context & compaction | Week 6 | threshold + micro-compact | 85% 9-section rebuild | 80% + pruning + cache-warm summary |
| Semantic search / RAG | Week 7 | memory dir + selector | BM25 + vectors + MMR | session-log FTS (no RAG, on purpose) |
| Sessions | Week 9 | JSONL | SQLite + checkpoints | event sourcing + projections |
| OS sandbox | Week 10 | seccomp + Seatbelt | Landlock + Seatbelt + bwrap | bwrap/Landlock/Seatbelt/token, fail-closed |
| Subagents | Week 12 | `Task` + agent files | `task` + worktrees | provider seam, cross-vendor children |

Claude Code shows the machine at its simplest, Grok shows it hardened by a compiler, DeepSeek Harness shows it dissolved into replaceable parts — but it is the **same machine**, and it's the one you're building: a loop that calls a model, runs the tools it asks for, feeds results back, compacts when full, and gates the dangerous parts behind approval and a sandbox. Three teams, three languages, one architecture.

---

*We read production agent source throughout the [AI Engineering mentorship](/curriculum) — after you build each subsystem yourself, we open the real implementation and compare. Start with [Week 1](/curriculum/week-1-your-first-agent), or read [part one of this comparison](/blog/claude-code-vs-grok-cli-architecture/).*
