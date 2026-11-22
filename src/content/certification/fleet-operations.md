---
{
  "title": "Agent Fleet Operations",
  "domain": 8,
  "weight": 10,
  "description": "Parallel coding agents on worktrees, merge strategy, AI code review in shadow mode, unattended and event-driven runs, and org-wide agent configuration.",
  "lab": {
    "file": "lab_ai_reviewer_shadow.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/08-fleet-operations/lab_ai_reviewer_shadow.py",
    "blurb": "Calibrate an AI code reviewer per category before letting it block merges."
  }
}
---

## 8.1 Parallel agent orchestration for engineering work

### Fan-out on isolated worktrees

Running several coding agents in one checkout means they overwrite each other's files. Give each agent an **isolated git worktree** (or container) on its own branch.

### Task decomposition

Good parallel tasks are:

- **Independent:** they touch disjoint files or modules (e.g., per-package migrations, per-endpoint tests).
- **Well specified:** clear acceptance criteria (tests pass, lint clean, specific behavior).
- **Verifiable:** each agent can run tests locally in its worktree.
- **Similar size:** so the slowest task doesn't dominate.

Bad: "refactor the auth system" split five ways across files that all import each other.

### Merge and conflict strategy

- Decompose **along module boundaries** to minimize overlap.
- **Shared-file hotspots** (lockfiles, route tables, generated code, central configs): serialize those changes, regenerate after merge, or assign one owner.
- **Merge order:** small and foundational changes first; rebase the others; re-run tests after each merge (the combination can fail even if each branch passed).
- An integration agent or human resolves conflicts with full context; don't let agents "resolve" conflicts by deleting the other side.

### Fleet telemetry and failure modes

Track per run: success rate, tests passing, CI pass on first try, tokens and $ per merged PR, wall time, human-intervention rate, revert rate after merge.

| Fleet symptom | Likely cause |
|---|---|
| Many agents fail the same way | Shared cause: broken main branch, missing dependency, environment or config issue, an ambiguous shared instruction (e.g., in CLAUDE.md) |
| High merge-conflict rate | Decomposition along the wrong boundaries |
| Agents pass their tests but integration fails | Tasks weren't independent; contract changes not coordinated |
| Cost per PR rising | Agents looping on flaky tests, context bloat, over-broad tasks |
| Reverts after merge | Verification too weak (Section 8.2) |

---

## 8.2 Verification and AI code review operations

When agents produce code faster than humans can review it, **review becomes the bottleneck and the risk**.

### Verification first

- Agents must **run the tests, linter and type checker** before claiming done; CI re-verifies.
- Prefer verification the agent can't talk its way past: tests, builds, static analysis, policy checks.
- Require tests for new behavior; watch for agents weakening or deleting tests to make them pass.

### Introducing AI code review safely

1. **Shadow mode:** the AI reviewer comments privately (or into a log) and does **not** block merges. Humans review as usual.
2. **Calibrate:** compare AI findings to human review outcomes and post-merge defects. Measure **precision** (are its flags real issues?) and **recall** (does it catch what humans caught, or the bugs that escaped?). Break it down by category (security, correctness, style).
3. **Graduate gradually:** let it gate only the categories where it is well calibrated (e.g., blocking on high-confidence security findings), and keep human review for the rest.
4. **Keep monitoring:** re-calibrate after reviewer model or prompt changes; track override rates.

### Human oversight design

Humans should review **what matters, at the right level**: risky areas (auth, payments, migrations, infra), design decisions, and samples of low-risk changes, instead of skimming every line of every agent PR. Use risk-based routing: path rules (CODEOWNERS), diff size, sensitive-file detection.

> **Lab:** [`lab_ai_reviewer_shadow.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/08-fleet-operations/lab_ai_reviewer_shadow.py) runs an AI reviewer in shadow mode over 1,000 simulated PRs, calibrates it by category against human review and escaped defects, and decides which categories it may gate.

---

## 8.3 Unattended and event-driven agent operations

Patterns:

- **Goal-driven:** run until an objective is met (all tests pass, migration complete), with a budget.
- **Scheduled:** nightly dependency updates, flaky-test triage, doc refresh.
- **Event-driven:** a CI failure, an alert or a new issue triggers an agent as **first responder**. It gathers logs, bisects, proposes a fix PR, and pages a human with a summary.

Design requirements:

| Requirement | Why |
|---|---|
| **Checkpointing** | Long runs survive restarts; progress isn't lost (Domain 1) |
| **Budgets and limits** | Tokens, $, wall time, step count; no runaway loops overnight |
| **Least privilege** | Unattended means nobody is watching. Open PRs, don't push to main; no prod credentials |
| **Notification** | Report outcomes (success, failure, needs input) to a channel or ticket with links |
| **Escalation** | Clear rules: when stuck, unsure, or about to do something high-risk, stop and ask a human |
| **Idempotency / dedupe** | The same CI failure firing 20 times shouldn't spawn 20 agents |
| **Headless operation** | Coding agents run non-interactively in CI (e.g., Claude Code's headless or print mode, or the Agent SDK) with pre-approved tool permissions |

---

## 8.4 Organization-wide coding agent configuration

- **Managed settings and policies:** org-level settings that users can't override, such as permission rules (deny dangerous commands, protect secrets files), allowed models, and hooks.
- **MCP allowlists:** only approved MCP servers; block arbitrary installs.
- **Telemetry:** export usage, cost and activity (e.g., via OpenTelemetry) to see adoption, spend per team, and failure patterns.
- **Gateway routing:** route agent traffic through an LLM gateway for auth, quotas, logging and cloud-platform routing.
- **Governance for shared assets:** prompts, Skills, subagents, plugins and MCP servers shared across teams need an owner, versioning, review, **evals**, and a security review before entering the shared catalog. This is a quality and safety bar, not a free-for-all.
- **Project instructions** (e.g., `CLAUDE.md`) checked into repos so agent behavior is reviewable and consistent.

---

## Common traps

- Parallel agents in one working directory.
- Letting an uncalibrated AI reviewer block merges on day one, or never measuring it at all.
- Unattended agents with push-to-main or production credentials.
- Event-driven agents without dedupe, budgets or escalation.
- Letting anyone publish Skills or MCP servers org-wide without review.

## Self-check

- [ ] I can decompose a large change for parallel agents and plan merge order around hotspots.
- [ ] I can diagnose fleet-level failure modes from telemetry.
- [ ] I can describe the shadow → calibrate → gate path for AI code review.
- [ ] I can list the design requirements for an unattended CI first-responder agent.
- [ ] I can describe org-level controls: managed settings, MCP allowlists, telemetry, governance.
