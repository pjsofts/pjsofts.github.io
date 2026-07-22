---
title: "Grok Build vs. Claude Code: two production coding agents, opposite engineering bets"
description: "A source-level walk through two shipping AI coding agents — xAI's Rust-based Grok Build and Anthropic's TypeScript Claude Code. Same job, opposite instincts on language, UI, sandbox, sessions and editing — and, underneath, the same machine: one loop, one tool contract, compaction at 85%."
pubDate: 2026-07-20
updatedDate: 2026-07-22
tags: ["Claude Code", "Grok", "Agents", "Architecture", "Rust", "TypeScript"]
readingTime: 14
featured: true
---

Reading the source of shipping AI tools is the fastest way to learn agent architecture. Two of the most instructive are **Grok Build** (xAI's Rust coding agent) and **Claude Code** (Anthropic's TypeScript one). They do the same job — read your code, edit files, run commands, search the web, manage long tasks — but they were built by teams that made almost **opposite engineering bets**.

Neither is "right." TypeScript gets you to a working agent in a weekend. Rust buys OS-level sandboxing, real parallelism, and a single shippable binary — at the cost of much more code. The point of reading both is to see which decisions are *essential* and which are *taste*.

## Two agents, one job, opposite instincts

The single biggest fork is the very first one: **language**.

- **Claude Code** is TypeScript on Node/Bun — one process, an async runtime, a React-in-the-terminal UI.
- **Grok Build** is Rust — a workspace of 70+ crates, a `tokio` async runtime, and a full-screen terminal app.

Everything downstream — how they sandbox, how they persist sessions, how they render — follows from that. Here is the map before we walk it:

| Dimension | Grok Build | Claude Code |
|---|---|---|
| Language | Rust (70+ crates, one binary) | TypeScript (Node/Bun) |
| Async model | `tokio` tasks + channels | async generators (`async function*`) |
| Terminal UI | full-screen `ratatui` (alt-screen) | inline Ink/React (scrollback) |
| Sandbox | Landlock + Seatbelt + seccomp + bwrap | seccomp (Linux) + Seatbelt (macOS) |
| Token counting | heuristic `bytes/4` | tokenizer-backed + heuristics |
| Sessions | SQLite indexes + JSON checkpoints | append-only JSONL transcripts |
| Editor embed | ACP (Agent Client Protocol) | IDE extensions / SDK |
| Memory file | `AGENTS.md` / `.grok/rules` | `CLAUDE.md` + memory dir |

## One binary vs. one process

Open each repo and the difference hits you immediately. Claude Code is a tree of TypeScript modules under `src/` — `query.ts`, `Tool.ts`, `tools/` — compiled and run by a JS engine. Grok Build is a Cargo **workspace**: dozens of small crates, each a hard boundary the compiler enforces.

Grok splits its 70+ crates into `crates/common` (reusable: tool-runtime, compaction, circuit-breaker) and `crates/codegen` (the agent: tools, shell, sandbox, TUI). A crate like `xai-tool-runtime` literally cannot depend on the UI — the boundary is compiled in. Even the MCP SDK is quarantined in its own crate so its dependency versions can't leak.

Claude Code draws the same boundaries **by convention**: `query.ts` is the loop, `Tool.ts` the tool contract, `tools/` the implementations. Nothing stops a UI file from importing a core file; discipline is on the author, not the compiler.

The trade-off is real. Compile-time boundaries scale to many contributors — a change to the shell crate can't accidentally break the sandbox crate's internals. For a solo project, that overhead isn't worth it, which is exactly why teaching starts with a single package. The lesson to keep either way: **your agent should still have seams**. Could you swap the terminal UI for a web UI without touching the agent loop? Grok can (via ACP); aim for the same.

## The loop at the center of everything

This is the heart of any agent, and the remarkable thing about reading both is that **they do exactly the same thing**. The rule is: *call the model; if it asked for tools, run them and loop; if it didn't, you're done.*

Here is the essence, in the ~40 lines you'd write yourself:

```python
for _ in range(MAX_STEPS):
    msg = call_model(messages, tools)
    messages.append(msg)
    if not msg.tool_calls:
        return msg.content            # model gave a final answer -> STOP
    for call in msg.tool_calls:       # else run every requested tool
        result = TOOL_FNS[call.name](call.args)
        messages.append(tool_result(call.id, result))
    # loop again with the results appended
```

And here is Grok's actual stop condition, in Rust — different language, identical logic:

```rust
let tool_calls = response.tool_calls().to_vec();
if tool_calls.is_empty() {
    // (maybe nudge about pending TODOs / drain interjections, else:)
    return Ok(TurnOutcome::Completed { .. });   // STOP
}
execute_tool_calls(tool_calls).await?;          // run them...
// ...fall through and loop again
```

The loop rule is trivial. Making it **robust and responsive** is not. Claude Code's async generator keeps the code linear and easy to follow. Grok's design splits the turn across actors communicating over `tokio` channels — a session actor owns the turn loop, a sampler actor owns model calls, a chat-state actor owns history — which buys concurrency (stream a response while the UI stays live, cancel an in-flight request instantly, run tools in parallel) at the cost of much more machinery. Same brain, different nervous system.

### What production wraps around the loop

These are the layers between a Week-4 loop and a shipped agent — worth naming so you know what "done" eventually means:

| Concern | Grok Build | In your clone |
|---|---|---|
| Loop cap | policy-driven continuation | a fixed `MAX_STEPS` |
| Provider API | one event stream over 3 backends | one SDK call |
| Retries | exp backoff, ≤15 tries, cap 30s + jitter | add later |
| Poisoned stream | separate "doom-loop" resample budget | — |
| Cancellation | `CancellationToken` per request, cancel-on-drop | Ctrl-C |
| Parallel tools | concurrent dispatch fan-out | a `for` loop |

Two details reward a closer look. First, Grok normalizes **three** different provider APIs — OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages — into one uniform `SamplingEvent` stream (`StreamStarted`, `ToolCallDelta`, `Completed`…), so the rest of the agent never knows which model it's talking to. That's the payoff of putting a **seam** between *"decide the next step"* and *"speak this provider's dialect."* (One caveat that trips people up: "Chat Completions" names a *wire format*, not a service — every host in Grok's code is xAI-owned. OpenAI-compatible ≠ OpenAI.)

Second, Grok's decision to keep looping is richer than "are there tool calls?" It also continues to compact-and-resubmit when the window is full, to refresh auth, to drain a message you typed mid-turn, or to fire a **todo-gate nudge** that refuses to let the model end a turn while TODOs are unfinished. Each is a small policy bolted onto the same loop — a good model for how you'll grow yours.

## The tool contract

Both agents converge on the same core idea: a tool is a function plus a machine-readable schema, dispatched by name. But the shape of the contract differs sharply.

Grok defines a Rust `trait Tool` with *typed* associated types (`Args: Deserialize`, `Output`), and the JSON schema is **generated from the Rust type at compile time** — the schema literally cannot drift from the code. A blanket `impl<T: Tool> ToolDyn for T` erases it to a JSON-in/JSON-out object for the registry.

Claude Code defines a `Tool` interface with a **Zod** `inputSchema` plus behavior flags (`isReadOnly()`, `isConcurrencySafe()`, `checkPermissions()`). The Zod object both validates the model's arguments and is the whole contract in one file — simpler, dynamic, and readable end to end.

The built-in toolboxes are strikingly similar — evidence these are the *right* primitives, not arbitrary ones:

| Job | Grok tool | Claude Code |
|---|---|---|
| Read a file | `read_file` | `Read` |
| Edit a file | `search_replace` / `apply_patch` | `Edit` / `Write` |
| Run a command | `run_terminal_cmd` | `Bash` |
| Find files/text | `grep`, `list_dir` | `Grep`, `Glob` |
| Web | `web_search`, `web_fetch` | `WebSearch`, `WebFetch` |
| Plan | `todo_write`, `enter_plan_mode` | `TodoWrite`, plan mode |
| Delegate | `task` (+ `wait_tasks`) | `Task` (subagents) |
| Ask the human | `ask_user_question` | `AskUserQuestion` |

### Editing files: full rewrite vs. fuzzy patch

This is where the contracts diverge most. Claude Code's `Edit` does an exact `old_string → new_string` replacement with **unique-match enforced**; `Write` replaces whole files. The model is expected to read before it edits. Simple, and the same "unique match or fail loudly" safety you'll want in your own clone.

Grok runs three engines: `search_replace` (whole-file, exact, CRLF-preserving), a ported Codex diff engine with a **4-tier fuzzy line matcher** (so context lines needn't match byte-for-byte), and a separate `xai-hunk-tracker` actor that **attributes each changed hunk** as agent-written vs. human-written for review.

For your own agent, start with Claude Code's model: **exact unique-string replace, fail loudly if the match isn't unique** — it's the highest safety-to-effort ratio. And a tool should return **a string the model can read** on both success *and* failure: "No matches found" teaches the model to re-read; a silent failure derails it.

## Giving an agent a shell without giving away the machine

Both agents let the model run shell commands; both then work hard to make that safe. Their approaches show two layers of defense you should understand.

**The persistent-shell trick.** A naive shell tool runs each command in a fresh process, so `cd` and `export` don't stick. Grok snapshots shell state: it runs a login shell once, dumps env/cwd/aliases after a marker, and for each later command re-spawns a shell, pipes the prior snapshot in on **fd 3**, and reads the new state back out. Commands detach from the controlling TTY so a child's password prompt can't corrupt the TUI. Claude Code runs commands through a managed shell with persisted cwd and environment, output captured and truncated, timeouts enforced. Two bugs bite every first agent here: **unbounded output** and **no timeout** — fix both early.

**The sandbox: four mechanisms, one goal.** This is where Rust's system-level reach shows. Grok applies OS isolation **once at startup**, irreversibly, so it covers both in-process file access and every child process:

| Concern | Grok mechanism | Claude Code mechanism |
|---|---|---|
| Filesystem (Linux) | Landlock | seccomp-bpf filter |
| Filesystem (macOS) | Seatbelt (`sandbox-exec`) | Seatbelt (`sandbox-exec`) |
| Deny sub-paths (Linux) | bubblewrap re-exec | proxy + policy |
| Child network | seccomp-BPF blocks connect/bind | network proxy w/ allowed domains |
| Policy source | `.grok/sandbox.toml` profiles | settings + `allowedDomains` |

Grok ships named profiles — `workspace` (read all, write workspace, network open), `read-only`, `strict`. A security-critical rule: a project's `sandbox.toml` may **add** profiles but **cannot redefine** a globally-defined one, so a malicious repo can't hollow out an enterprise policy. It **fails closed**: if it can't guarantee a deny, it refuses rather than under-enforce.

**Where approval happens.** These are *two independent layers*, and conflating them is a classic mistake:

1. **Approval** — ask the human before a risky action (Grok's `Ask` / `Auto` / `AlwaysApprove` modes; Claude Code's `checkPermissions()` + `isReadOnly()`).
2. **Sandbox** — make the action *impossible* even if approved by mistake.

Grok shows how far layer 2 goes in production — and that a good sandbox lets you *relax* approval, because the kernel is now enforcing the rules. Build the approval gate first (it's cheap and stops the worst mistakes), then harden it into a real sandbox.

## Fitting a long task into a short memory

A model's context window is finite; real coding tasks aren't. Both agents solve this the same way in spirit — and, revealingly, almost the same way in detail.

**Compaction.** Grok triggers at **85%** of the window (`DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT = 85`). Its default strategy is a full replace: summarize the entire conversation into a structured 9-section summary (Primary Request, Key Concepts, Files & Code, Errors & Fixes, …), then rebuild history as `[system, user-prefix, AGENTS.md, last query, recent tail, summary]`, carrying a prior summary forward so nothing is lost across repeated compactions. Claude Code auto-compacts on a threshold ladder plus a lightweight **micro-compact** that trims tool outputs; summaries preserve the same kinds of things and the transcript continues from a "this session is being continued" seam. The 85% trigger and the summarize-then-rebuild pattern are nearly identical across both — when two independent teams converge, you're looking at a **load-bearing** technique. Build it in from the start.

**Token counting.** Both are pragmatic. Grok uses a pure heuristic — `bytes / 4` (`BYTES_PER_TOKEN = 4`), images a flat 765 tokens — deliberately approximate, and it's the single source of truth for the compaction gate. Claude Code uses tokenizer-backed counts with heuristics as backup. A `bytes/4` estimator is perfectly good for deciding *when* to compact.

**Memory across sessions.** Grok reads `AGENTS.md`, `Claude.md`, and `.grok/rules/*.md` from the workspace up to the git root, injected as project instructions and preserved across compaction; an experimental RAG memory does hybrid BM25 + vector search with MMR re-ranking. Claude Code reads `CLAUDE.md` for project/user instructions plus a memory directory where each fact is a file with a description header, and a small model selects the relevant few for the current query. Both: a committed instructions file + a smarter store the agent pulls from on demand.

**Sessions & resume — the sharpest contrast.** Claude Code is one **append-only JSONL** transcript per session — every event is a line, resume replays the file, recovery walks the chain. Dead simple, grep-able. Grok spreads state across rebuildable **SQLite** indexes (the memory FTS5 + vector DB; a worktree-metadata DB), per-prompt **JSON rewind checkpoints**, plus markdown transcripts; a tiny `xai-sqlite-journal` crate even picks WAL vs. TRUNCATE per filesystem. JSONL = one human-readable log, trivial to inspect and replay. Grok's split = each concern in the store that fits it (SQLite for search, JSON snapshots for instant rewind). **Start with JSONL**; reach for specialized stores only when a feature (fast rewind, semantic search) demands it.

## How the human sees the agent

**Terminal UI.** Grok is a full-screen `ratatui` app on the **alternate screen** — its own buffer, mouse capture, themes, scrollback and search — plus an experimental `Minimal` mode that prints finalized blocks into the terminal's *native* scrollback. Claude Code is an **inline** Ink UI: output flows into normal scrollback, so your conversation is still in the terminal after you exit. Alt-screen gives a persistent app frame but discards its buffer on exit; inline leaves history in your terminal and composes with pipes, but you manage redraws yourself. For a clone, **inline is the right first choice** — less to manage, and it composes with the terminal.

**Embedding in an editor: ACP.** Grok ships a capability Claude Code handles differently — the **Agent Client Protocol**, newline-delimited JSON-RPC over stdio that lets an editor drive the agent as a black box; the same protocol even tunnels MCP and hook extensions. It's the clean version of the seam from earlier: because the loop talks a *protocol*, any front-end can host it.

**Interrupting mid-turn.** Grok's interjection core handles you typing while the agent works: the message is queued and, at the next safe point, framed as a synthetic user message ("The user sent a message while you were working…") with **no** instruction on how to prioritize it — the model decides. A small, concrete example of designing for the human who won't wait for the turn to finish.

## Making the agent extensible

Production agents must let users change behavior without forking the code. Both land on the same three mechanisms — and Grok deliberately copies Claude Code's config shapes so the ecosystem stays compatible.

- **Hooks.** Claude Code originated a `settings.json` hooks format: matchers on tool names, shell commands that can approve/block a tool via stdout/exit code, fired at lifecycle points. Grok reads a `settings.json` in Claude Code's exact shape (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `SessionStart/End`…) and even maps external event names onto its own — the sincerest form of flattery.
- **MCP.** Both are **MCP clients**: they connect to external Model Context Protocol servers (stdio or HTTP/SSE) and expose those tools to the model, namespaced. This is how either agent gains a database tool or a browser tool without shipping new code.
- **Subagents.** Both define subagents as **markdown + frontmatter** files spawned via a `task` tool into a fresh context window with their own tool allow-list. Grok even reads Claude Code's `.claude/agents/` directory for compatibility, and adds git **worktree** isolation so a subagent's file edits are physically separate until merged.

The pattern under all three: a stable **interface** — event, tool schema, agent file — that third parties target without touching your core loop.

## What to take back to your own agent

Strip away Rust vs. TypeScript and the two agents are the **same machine**: a loop that calls a model, runs the tools it asks for, feeds results back, compacts when full, and gates the dangerous parts behind approval and — in production — a sandbox.

The differences are taste. Rust vs. TypeScript, full-screen vs. inline, SQLite vs. JSONL — those are choices. But the loop, the tool contract, the approval gate, compaction at 85% — two independent teams arrived at those the same way. That's the signal worth trusting: **build the machine first; the rest is layers of resilience wrapped around it.**

| Subsystem | You build it in | Grok's production version |
|---|---|---|
| Agent loop & streaming | Week 4 | `tokio` turn engine + circuit breaker |
| Tools + schema contract | Week 5 | compile-time `Tool` trait, generated schema |
| Shell tool | Week 5, hardened Week 10 | snapshot-based persistent shell |
| Permission / approval gate | Week 5 | Ask/Auto/yolo + sandbox auto-allow |
| Context & compaction | Week 6 | 85% full-replace 9-section summary |
| Semantic search (RAG) | Week 7 | BM25 + vector memory, MMR re-rank |
| Sessions & durable memory | Week 9 | SQLite indexes + JSON rewind checkpoints |
| Artifacts + OS-level sandbox | Week 10 | Landlock + Seatbelt + seccomp + bwrap |
| Sub-agents & parallel dispatch | Week 12 | `task` tool + worktree isolation |

---

*We read production agent source throughout the [AI Engineering mentorship](/curriculum) — after you build each subsystem yourself, we open the real implementation and compare. Start with [Week 1](/curriculum/week-1-your-first-agent).*
