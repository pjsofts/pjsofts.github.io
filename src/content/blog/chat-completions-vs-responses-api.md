---
title: "Chat Completions vs. the Responses API: a practical migration guide"
description: "The mental-model shift from messages to items, a field-by-field migration map, tool calling with call_id, conversation state, and how the same code runs through the OpenAI SDK, a gateway, and LangChain."
pubDate: 2026-07-19
tags: ["OpenAI", "Responses API", "Agents", "API Design", "Migration"]
readingTime: 12
featured: true
---

If you build agents on OpenAI's SDK, you have two APIs to choose from and the difference is not cosmetic. **Chat Completions** thinks in *messages*. **Responses** thinks in *items*. Almost every other difference — tool calling, state, streaming, structured output — falls out of that one shift.

Here is the practical version: what changes, what breaks, and what to do about it.

## The mental model

Chat Completions gives you a flat list of `role`/`content` objects that you resend in full on every turn. One object type carries every concern — text, tool calls, tool results — distinguished by role.

Responses gives you **typed items**: `message`, `reasoning`, `function_call`, `function_call_output`. Each is a distinct unit of model context, and the server can optionally remember them for you.

> Items are distinct from one another and better represent the basic unit of model context — unlike a Chat Completions message, where many concerns are glued together into one object.

That sounds academic until you hit a reasoning model, at which point the difference is very concrete: reasoning is its own item type, and dropping it between turns measurably degrades results.

## Hello world, both ways

Three changes: the system message becomes a top-level `instructions` field, `messages` becomes `input` (a bare string is allowed), and you read `output_text` instead of digging into `choices[0].message.content`.

```python
# Chat Completions — the old shape
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user",   "content": "Hello!"},
    ],
)
print(resp.choices[0].message.content)
```

```python
# Responses
resp = client.responses.create(
    model="gpt-4o-mini",
    instructions="You are helpful.",   # was the system message
    input="Hello!",                    # a string OR a list of items
)
print(resp.output_text)                # helper: joins all text output
```

In TypeScript it reads almost identically:

```ts
const resp = await client.responses.create({
  model: "gpt-4o-mini",
  instructions: "You are helpful.",
  input: "Hello!",
});
console.log(resp.output_text);
```

## Field-by-field migration map

| Chat Completions | Responses | Note |
|---|---|---|
| `messages` (array) | `input` (string or item array) | A plain string is shorthand for one user message |
| system message in `messages` | `instructions` (top-level) | Separated from turn history |
| `tools[].function.name` | `tools[].name` | Schema is flattened — no nested `function` object |
| functions non-strict by default | omit `strict` → tries strict | Falls back to best-effort if the schema can't be made strict |
| `response_format` | `text.format` | Structured-output config moved under `text` |
| `choices[0].message.content` | `output_text` / walk `output` | Output is a list of typed items, not one message |
| resend full history | `previous_response_id` + `store` | Optional server-side state |
| `delta` chunks | typed `response.*` events | Branch on `event.type` |

## Tool calling: flat schemas, results keyed by call_id

Two things change. The tool schema is **internally tagged** — `name` and `parameters` sit at the top level:

```json
// Chat Completions — externally tagged
{ "type": "function", "function": { "name": "get_weather", "parameters": { } } }

// Responses — internally tagged
{ "type": "function", "name": "get_weather", "parameters": { }, "strict": false }
```

And a tool call and its result are now **two separate items** correlated by `call_id`. The model emits a `function_call`; you reply with a `function_call_output` carrying the same `call_id`. With parallel tool calls, that join key is what keeps things unambiguous.

## The agent loop

The key move is **appending the model's own output back into `input`** — that list *is* the agent's memory.

```python
context = [{"role": "user", "content": "Weather in Paris?"}]
resp = client.responses.create(model=MODEL, input=context, tools=tools)

context += resp.output                      # the memory
for item in resp.output:
    if item.type != "function_call":
        continue
    args = json.loads(item.arguments)
    result = get_weather(**args)
    context.append({
        "type": "function_call_output",
        "call_id": item.call_id,            # correlate by call_id
        "output": json.dumps(result),
    })

final = client.responses.create(model=MODEL, input=context, tools=tools)
print(final.output_text)
```

### One TypeScript cast you will need

Under `strict`, output items are a *superset* of input items (extra hosted-tool and MCP variants), so `ResponseOutputItem[]` isn't assignable to `ResponseInputItem[]`:

```ts
context.push(...(resp.output as OpenAI.Responses.ResponseInputItem[]));
```

The cast is safe for a plain function-calling agent — those variants never appear at runtime. Everything else typechecks clean.

## Conversation state: three options

This is the headline capability. Chat Completions is stateless; you replay the whole transcript every call. Responses gives you a choice.

**1. Server-side chaining.** Set `store: true`, then pass `previous_response_id` and send only the new turn:

```python
r1 = client.responses.create(model=MODEL, input="What is France's capital?", store=True)
r2 = client.responses.create(model=MODEL, input="And its population?",
                             previous_response_id=r1.id, store=True)
```

Two gotchas that bite people: you are **still billed** for the earlier input tokens in the chain, and `instructions` do **not** carry over — resend them each call.

**2. Manual replay.** Keep the item list yourself. Fully portable, server holds nothing — this is what the agent loop above does.

**3. Conversations API.** A persistent server object for thread-like apps that need durable history.

For zero-data-retention setups, `store: false` returns **encrypted** reasoning content you pass back on the next call. It is decrypted in memory, used, and discarded — you keep reasoning continuity without the server persisting anything.

## Reading the response

Do not assume one message. A single response can carry a `reasoning` item, several `function_call` items, and a final `message`:

```json
{
  "output": [
    { "type": "reasoning", "summary": [ ] },
    { "type": "function_call", "name": "...", "call_id": "...", "arguments": "..." },
    { "type": "message", "content": [ { "type": "output_text", "text": "..." } ] }
  ],
  "output_text": "…"
}
```

Streaming follows the same logic — typed server-sent events (`response.created`, `response.output_text.delta`, `response.function_call_arguments.delta`, `response.completed`) instead of one `delta` shape.

## Hosted tools

Because tools are native, several run entirely on OpenAI's side. You declare them and read the answer — no local function, no result plumbing:

```python
resp = client.responses.create(
    model=MODEL,
    input="What shipped in AI this week?",
    tools=[{"type": "web_search"}],   # also: file_search, code_interpreter
)
```

## The shape travels

Here is the part people miss: the Responses **request shape** has become a de-facto standard, independent of who runs the model.

**Gateways.** Point the same OpenAI SDK at a gateway base URL and select a model with a `provider/model` prefix — the same call routes to Anthropic or Google, and output still arrives as `output_text` and `output` items:

```ts
const client = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});
const resp = await client.responses.create({
  model: "anthropic/claude-sonnet-4.6",
  input: "What is the capital of France?",
});
```

**Frameworks.** LangChain's `ChatOpenAI` defaults to Chat Completions but auto-routes to Responses the moment you use a Responses-only feature — or you force it:

```python
llm = ChatOpenAI(model="gpt-4o-mini", use_responses_api=True)
llm_tools = llm.bind_tools([{"type": "web_search"}])
```

**Other providers.** xAI's own API implements OpenAI-compatible `/v1/chat/completions` and `/v1/responses` endpoints on `api.x.ai`. They didn't adopt OpenAI's *service* — they adopted its *interface*.

## The five errors people actually hit

1. Reading `choices[0].message.content` on a Responses object
2. Treating every output entry as a message (dropping `reasoning` and tool items)
3. Sending a tool result without a matching `call_id`
4. Still passing `response_format` instead of `text.format`
5. Assuming `previous_response_id` makes earlier tokens free — it does not

## Which one, when

**Reach for Responses** for anything agentic: tool loops, reasoning models, hosted web/file/code tools, server-side memory, or multi-provider routing. New builds start here.

**Chat Completions is still fine** for a one-shot completion with no tools and no state, or an integration you aren't ready to touch. It isn't going away tomorrow — but it isn't gaining agent features either.

The one-line version: Chat Completions asks *"what are the messages?"* every turn. Responses asks *"what changed since last turn?"* — and lets the server hold the rest. Build agents against the second question.

---

*This is the kind of thing we go deep on in [Week 1 of the AI Engineering mentorship](/curriculum/week-1-your-first-agent), where you build the whole agent loop by hand.*
