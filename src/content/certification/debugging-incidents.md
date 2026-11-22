---
{
  "title": "Debugging & Incident Response",
  "domain": 4,
  "weight": 10,
  "description": "Localizing failures to model, harness, tool or data; non-deterministic and multi-agent failures; refusals as a failure class; mitigation-first incident response.",
  "lab": {
    "file": "lab_failure_triage.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/04-debugging-incidents/lab_failure_triage.py",
    "blurb": "Walk six recorded incidents through the hand-off method to find each origin."
  }
}
---

## 4.1 Complex failure diagnosis

### Localize the origin first

Every failure originates in one of four places. The exam gives you evidence and asks you to pick the origin, or the next diagnostic step.

| Origin | Typical evidence | Example |
|---|---|---|
| **Model output** | The model saw correct inputs and still produced the wrong thing; reproducible at the same inputs across samples | Ignores an instruction; wrong tool choice; hallucinated field |
| **Agent harness** | The model's request was right but the harness mishandled it; or the harness sent the model the wrong context | Tool result truncated before reaching the model; history dropped on compaction; wrong tool_result ID; retry resent a stale message; parallel tool results split across messages |
| **Tools** | The tool returned an error, wrong or empty data, or changed its schema | Search API returns empty after an upstream change; schema v2 renamed a field |
| **Data** | Inputs or knowledge are wrong or stale | Outdated KB article; bad chunking; mislabeled golden set; poisoned memory |

**Method:** read the trace in order and check each hand-off. *What did the model receive? What did it emit? What did the harness execute? What came back?* The first point where reality diverges from expectation is the origin.

### Non-deterministic failures

- **Reproduce statistically:** replay the same inputs N times (e.g., 20). A 15% failure rate is a real, measurable bug, not "flakiness".
- **Hold everything fixed** except one variable (model, prompt, tool version, context length) to isolate.
- **Replay from traces:** a good trace lets you reconstruct the exact request. If you can't replay it, fix your instrumentation first.

### Multi-turn and multi-agent failures

- The error often appears **turns after** the cause: a constraint lost during compaction, an early wrong assumption, a poisoned memory entry.
- In multi-agent systems, check **delegation briefs** (what the worker was actually told) and **return contracts** (whether failure was reported or swallowed).
- Look for **loops**: repeated identical tool calls signal the model isn't getting a useful observation (often the tool error message is unhelpful).

### Refusals as a failure class

A refusal (`stop_reason: "refusal"`) is **not** a transient error.

- **Legitimate** refusals: the request really is out of policy. Handle with a safety path, not retries.
- **False-positive** refusals: benign traffic declined, e.g., security-research or medical wording. Measure the refusal rate by cohort, use `stop_details` categories to see which classifier triggered, adjust prompts and context so the legitimate purpose is clear, and consider configured fallbacks. Track the rate after model updates because classifier behavior changes.
- **A sudden jump in refusals** after a release suggests a prompt or context change; one concentrated on a tenant may signal abuse.

### Retrieval-grounding failures

The answer is wrong **and** cites sources: localize by stage (Domain 2). Was the correct doc indexed? Retrieved? Ranked? Used faithfully? Each stage needs a different fix.

> **Lab:** [`lab_failure_triage.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/04-debugging-incidents/lab_failure_triage.py) walks through six recorded incidents (trace hand-offs) and classifies each origin with the hand-off method. You can also add your own.

---

## 4.2 Incident response and learning loops

### During the incident

1. **Triage:** severity by user impact (how many, how bad, safety or security implications?). Declare an incident and assign roles (incident commander, comms, investigators).
2. **Mitigate first, root-cause later.** The fastest safe reversible action wins:
   - roll back the prompt, model or tool version (that's why you version and flag them)
   - flip a feature flag or kill switch (disable a tool, an agent capability, or a route)
   - fail over to a fallback model or degraded mode
   - rate-limit or block an abusive tenant or key
3. **Communicate:** status page and internal updates on a fixed cadence; say what is known, what is being done, and when the next update comes.
4. **Preserve evidence:** traces, configs, versions, and timeline, before rotating logs or redeploying.

**Security incidents** (data exfiltration via prompt injection, leaked keys): contain first (revoke credentials, disable the tool), then scope the blast radius with audit logs.

### After the incident: close the loop

| Output | Why |
|---|---|
| **Blameless postmortem** | Timeline, impact, root cause *and* contributing factors, what went well and badly |
| **Regression eval** | Turn the failing cases into permanent eval items so CI catches a recurrence |
| **Monitoring coverage** | If users found it before alerts did, add the SLI or alert that would have caught it |
| **Action items** with owners | Guardrail, process, or architecture fixes, tracked to completion |

The exam favors answers that **convert the incident into durable detection and prevention** (eval + monitor) over one-off fixes like "patch the prompt and move on".

---

## Common traps

- Prompt-tweaking a failure that originates in the harness or a tool.
- Declaring a 15% failure "non-deterministic, can't fix".
- Root-causing for an hour while users are impacted, when a rollback was available.
- Retrying refusals as if they were transient.
- A postmortem with no new regression test and no new alert.

## Self-check

- [ ] Given a trace, I can say whether the origin is the model, harness, tool or data.
- [ ] I can design a replay experiment to quantify a non-deterministic failure.
- [ ] I can separate legitimate from false-positive refusals and handle each.
- [ ] I know the mitigation-first order and what reversible levers a team should prepare in advance.
- [ ] I can list the four outputs of a good postmortem.
