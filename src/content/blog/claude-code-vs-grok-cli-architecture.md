---
title: "Claude Code vs. Grok CLI: how two production coding agents talk to their models"
description: "A source-level comparison of two shipping AI coding agents — which API shape each uses, why Grok speaks OpenAI's wire format on its own servers, and the multi-backend abstraction that lets one client target three APIs."
pubDate: 2026-07-20
tags: ["Claude Code", "Grok", "Agents", "Architecture", "API Design"]
readingTime: 9
featured: true
---

Reading the source of shipping AI tools is the fastest way to learn agent architecture. Two of the most interesting are **Claude Code** (TypeScript) and the **Grok CLI** (Rust) — both are production coding agents, and they made noticeably different choices at the layer where the agent talks to its model.

Here is what the code actually says.

## Claude Code: the Anthropic Messages API

Claude Code doesn't use either OpenAI API. It's built on the **Anthropic Messages API** — specifically the beta variant:

```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "@anthropic-ai/claude-agent-sdk": "^0.1.0"
}
```

Types throughout are `BetaMessageStreamParams`, `BetaUsage`, and `ContentBlockParam`, imported from `@anthropic-ai/sdk/resources/beta/messages/messages.mjs`. Configuration is all `ANTHROPIC_*` — `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, `ANTHROPIC_API_KEY` — with third-party routing through Bedrock, Vertex and Foundry as first-class alternatives.

That matters for anyone porting concepts between ecosystems, because the Messages API is a **third shape**, distinct from both OpenAI APIs:

| Concept | OpenAI Chat Completions | OpenAI Responses | Anthropic Messages |
|---|---|---|---|
| Input | `messages[]` | `input` items | `messages[]` with content blocks |
| System prompt | a message with `role: system` | `instructions` | top-level `system` |
| Tool call | `tool_calls[]` on a message | `function_call` item | `tool_use` content block |
| Tool result | `role: "tool"` message | `function_call_output` item | `tool_result` content block |

The interesting design point is that Anthropic's *content blocks* sit conceptually between the two OpenAI shapes: richer than a flat message, but attached to a message rather than promoted to standalone items.

## Grok CLI: OpenAI's shape, xAI's servers

The Grok CLI is where it gets genuinely instructive. Its sampler crate documents three supported backends up front:

```rust
//! * Chat Completions (`/chat/completions`)
//! * Responses API (`/responses`)
//! * Anthropic Messages API (`/messages`)
```

And it encodes that as an explicit enum:

```rust
pub enum ApiBackend {
    #[default]
    ChatCompletions,   // /v1/chat/completions
    Responses,         // /v1/responses
    Messages,          // /v1/messages  (Anthropic)
}
```

All three are wired end to end. The client dispatches on the backend and hands off to a shape-specific streaming decoder:

```rust
let result = match self.api_backend() {
    ApiBackend::ChatCompletions => { /* stream_chat_completions */ }
    ApiBackend::Responses       => { /* stream_responses */ }
    ApiBackend::Messages        => { /* stream_messages */ }
};
```

The Responses path even reuses the `async_openai` crate's `CreateResponse` types and handles Responses-specific SSE events like `response.completed` and cumulative `context_details.input_tokens`.

**Which one ships?** The `#[default]` is `ChatCompletions`, and every production construction uses `Default::default()`. `ApiBackend::Responses` is only ever selected in tests. So the shipping CLI talks Chat Completions — with the other two backends built, tested, and waiting.

### "Chat Completions" doesn't mean OpenAI

This is the part that confuses people. The hosts in the code are all xAI-owned:

- `https://api.x.ai/v1/chat/completions` — xAI's public API
- `https://cli-chat-proxy.grok.com/v1/chat/completions` — the CLI's proxy
- `https://auth.x.ai` — xAI's OIDC issuer

None of them are OpenAI. Two separate things get conflated by the phrase "Chat Completions API":

- **The service** — who runs the servers and the models. Here: entirely xAI.
- **The wire format** — the JSON schema of the request and response. Here: OpenAI's, because xAI implements OpenAI-compatible endpoints.

xAI didn't adopt OpenAI's *service*. It adopted OpenAI's *interface* — which is exactly why the Grok CLI can reuse an OpenAI Rust crate's types while talking to `api.x.ai`.

## The lesson: abstract the shape, not the provider

The most portable idea in either codebase is Grok's `ApiBackend` enum. It's a small abstraction with a big payoff:

- **One agent loop, three wire formats.** Tool calling, streaming and usage accounting each get a per-backend adapter; everything above that is shared.
- **Provider moves become config.** Switching from xAI to Anthropic isn't a rewrite, it's an enum variant plus a base URL.
- **New APIs land incrementally.** The Responses backend could be built and tested long before it becomes the default — which is precisely the state the code is in.

Compare that to the common shortcut of scattering `client.chat.completions.create(...)` through an entire codebase. That works right up until you want a reasoning model, a hosted tool, or a second provider — and then every call site is a migration.

If you're building an agent you expect to live longer than one model generation, the seam to protect is the one between *"decide the next step"* and *"speak this provider's dialect."*

## What to take away

1. **Claude Code** uses Anthropic Messages with content blocks — a third shape worth knowing alongside the two OpenAI ones.
2. **Grok CLI** ships on Chat Completions but is architected for three backends, with Responses fully implemented behind a default.
3. **OpenAI-compatible ≠ OpenAI.** xAI runs its own models and servers behind OpenAI's request schema, and so do many gateways.
4. **The wire format is a dependency.** Treat it like one — put it behind a seam.

---

*We read production agent source throughout the [AI Engineering mentorship](/curriculum) — after you build each subsystem yourself, we open the real implementation and compare. Start with [Week 1](/curriculum/week-1-your-first-agent).*
