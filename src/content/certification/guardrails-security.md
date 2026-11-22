---
{
  "title": "Runtime Guardrails & Security",
  "domain": 7,
  "weight": 11,
  "description": "Layered, deterministic guardrails, prompt injection and the lethal combination, secure MCP, red-teaming, OWASP and NIST, and identity, secrets and audit.",
  "lab": {
    "file": "lab_tool_gateway.py",
    "url": "https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/07-guardrails-security/lab_tool_gateway.py",
    "blurb": "Replay an injected-ticket exfiltration attack against a prompt-only defense and a policy gateway."
  }
}
---

## 7.1 Runtime guardrail systems

### The core principle

> **The model is not a security boundary.** Prompt instructions reduce risk; they do not enforce anything. For irreversible, external or privileged actions, enforcement must be **deterministic and outside the model**: code in the harness, the tool, the gateway or the infrastructure.

### Layers (defense in depth)

| Layer | Examples |
|---|---|
| **Input** | Classifiers for jailbreaks and abuse; PII detection and redaction before the model sees it (if policy requires); size limits; mark untrusted content clearly (e.g., wrap retrieved text and say it is data) |
| **Model / prompt** | Clear operator instructions; least information needed; safety-oriented system prompt. *Helpful but not sufficient* |
| **Tool / action** | **Hooks** (pre-tool-use checks) that allow, deny or require approval; argument validation; allowlists (recipients, domains, paths, SQL tables); rate limits per tool |
| **Execution environment** | **Sandboxing**: containers with no production credentials, restricted network egress (allowlisted hosts), read-only mounts, resource limits. Lets agents use tools and the web without touching production |
| **Output** | PII redaction, secret scanning, policy classifiers, schema validation before results reach users or downstream systems |
| **Human** | Approval gates for irreversible or high-impact actions (payments, deletes, external sends, deploys) |
| **Monitoring** | Audit logs, anomaly alerts, refusal and denial rates |

### Destructive-action prevention

- Classify tools by **reversibility and blast radius**: read-only < reversible write < irreversible or external.
- Irreversible actions get **deterministic enforcement**: deny lists (e.g., `rm -rf`, `DROP TABLE`, `git push --force` to protected branches), approval gates, dry-run-then-confirm, and soft deletes.
- Use **scoped credentials** so destructive operations are impossible, not just discouraged (a read-only DB role for an analysis agent).

### Refusal handling and safety fallbacks

When the model declines (`stop_reason: "refusal"`), respond with a safe, helpful user-facing message, log the category, and route to a human or alternative flow where appropriate. Don't loop retries. If your provider supports configured refusal fallbacks, treat them as a policy decision with monitoring, not as a way around safety.

### Tuning false positives and negatives

Every guardrail has both. Too strict leads to blocked legitimate work, user frustration and workarounds. Too loose leads to incidents. Tune against **labeled data** (benign and malicious sets), track precision and recall per guardrail, and set thresholds **by risk**: strict for irreversible actions, lenient (with logging) for low-risk reads.

---

## 7.2 Threat defense and adversarial testing

### The attack surface of a tool-using agent

| Threat | How it works |
|---|---|
| **Prompt injection (indirect)** | Instructions hidden in content the agent reads: tickets, web pages, emails, documents, tool results, code comments |
| **Tool poisoning** | A malicious or compromised tool (e.g., a third-party MCP server) whose description or outputs contain instructions, or which changes behavior after approval |
| **Memory poisoning** | Injected content gets written to persistent memory and influences future sessions |
| **Data exfiltration** | Agent sends private data out via email, HTTP requests, image URLs or links with query strings, or by writing to public places |
| **Excessive agency / unsafe autonomy** | Agent has more permissions or autonomy than its task needs; long unattended runs with broad access |

### The lethal combination

An agent is high-risk when it has all three:

1. **access to private data**,
2. **exposure to untrusted content** (anything an attacker can influence), and
3. **the ability to communicate externally** (send, post, fetch URLs).

With all three present, assume injection **will** succeed sometimes, and **break at least one leg** deterministically: scope data access to the current task or user, remove or allowlist external communication, or put a human approval on outbound actions. This is exactly the official guide's sample 3: the fix is *recipient allowlisting or approval on email* plus *CRM scoped to the ticket's own account*, not a stronger prompt, lower effort, or logging.

### Mitigations

- Least-privilege tools and data scoping (per tenant, per user, per task).
- Egress control: allowlisted domains; no arbitrary URL fetches with data in query strings; strip or deny external image and link rendering in outputs that could leak data.
- Separate the **planner** that sees untrusted content from the **privileged actor** (dual-LLM / quarantine patterns), or require structured, validated hand-offs between them.
- Provenance on memory writes; review or expire memories; never let untrusted content write memory directly.
- Secure MCP configuration: **allowlist** approved servers, pin versions, review tool descriptions, run third-party servers sandboxed with minimal scopes, and authenticate remote servers (OAuth); watch for tool definitions that change after approval.

### Red-team exercise design

1. **Threat model** the agent: assets, entry points for untrusted content, privileged actions.
2. Write **attack cases** for each path (direct and indirect injection, exfiltration via each channel, privilege escalation, memory poisoning).
3. Turn them into an **automated adversarial eval suite** that runs in CI. The metric is attack success rate, which should be zero for deterministic controls.
4. Re-run on every model, prompt and tool change.

### Frameworks to know by name

- **OWASP Top 10 for LLM Applications** (2025): prompt injection; sensitive information disclosure; supply chain; data and model poisoning; improper output handling; excessive agency; system prompt leakage; vector and embedding weaknesses; misinformation; unbounded consumption.
- **NIST AI Risk Management Framework** (AI RMF 1.0): functions **Govern, Map, Measure, Manage**; plus the **Generative AI Profile** (NIST AI 600-1), which maps GenAI-specific risks to those functions.

> **Lab:** [`lab_tool_gateway.py`](https://github.com/pjsofts/claude-certified-developer-guide/blob/main/domains/07-guardrails-security/lab_tool_gateway.py) is a policy-enforcing tool gateway (a pre-tool-use hook). It replays an injected-ticket attack against a "prompt-only" agent and against the gateway.

---

## 7.3 Identity, secrets and audit at scale

- **Agent identity:** each agent or deployment gets its own identity (service account), not a shared human's key. Then you can scope, rotate and audit per agent.
- **Workload identity federation (WIF):** replace long-lived static API keys with short-lived tokens exchanged from your cloud or CI identity (an OIDC JWT). Nothing to leak in a repo or env file, and automatic expiry. The Claude API supports this through federation rules and service accounts.
- **Secrets management:** secrets in a vault or secret manager, injected at runtime, never in prompts, tool descriptions, code or logs. Keep secrets **out of the model's context**: the tool or gateway holds the credential and the model just calls the tool. Some managed agent platforms substitute credentials at the network egress so the sandbox only ever sees a placeholder.
- **Least-privilege tool permissions:** per agent, per tool, per resource; deny by default; time-bound elevation with approval.
- **Audit logging:** record security-relevant actions (tool calls with arguments, approvals and denials, credential use, config changes) with who or what, when, on whose behalf, and trace ID. Store append-only, with retention matching compliance needs.

---

## Common traps

- "Add a stronger system prompt" as the fix for an exploit path.
- Logging (detect) chosen over allowlisting or approval (prevent).
- Agents running with a human admin's API key.
- Secrets passed to the model so it can "use them in tool calls".
- Trusting a third-party MCP server's tool descriptions.
- Guardrails that are equally strict for reads and irreversible writes.

## Self-check

- [ ] I can name the three legs of the lethal combination and how to break each.
- [ ] I can design layered guardrails and say which layer is the real boundary for a given action.
- [ ] I can list five OWASP LLM risks and the four NIST AI RMF functions.
- [ ] I can explain why WIF beats static keys and how secrets stay out of model context.
- [ ] I can design a red-team suite that runs in CI.
