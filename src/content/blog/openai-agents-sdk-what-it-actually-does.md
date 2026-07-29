---
title: "The OpenAI Agents SDK: what it actually does for you"
description: "You can write the agent loop yourself in forty lines. So what does OpenAI's Agents SDK buy you? A clear-eyed tour of agents, tools, handoffs, guardrails, sessions, and tracing — and exactly which hand-rolled problem each one replaces."
pubDate: 2026-07-29
tags: ["OpenAI", "Agents SDK", "Agents", "Tools", "Orchestration"]
readingTime: 9
---

Once you've [written an agent loop by hand](/blog/what-is-an-agent-loop), frameworks stop being intimidating and start being *legible*. You can look at any of them and ask the only question that matters: **which part of the loop is this doing for me, and is that a part I wanted help with?**

So let's do exactly that with OpenAI's **Agents SDK** — the official framework that sits on top of the [Responses API](/blog/chat-completions-vs-responses-api). Not a feature list, but a map: for every piece it gives you, the hand-rolled problem it's replacing.

## The one-sentence version

The Responses API gives you *a model response*. The Agents SDK gives you *an agent run*.

That's the whole distinction. With the raw API, **you** run the loop: send the messages, read back the tool calls, execute them, append the results, send again, and decide when to stop. The SDK's runner does that loop for you — it "performs the tool loop, switches agents after handoffs, and stops when the run finishes or pauses for approval." Everything else in the SDK is a well-chosen abstraction hung off that runner.

If you want direct control over routing and custom loop logic, you stay on the Responses API. If you want the SDK to own the orchestration, you move up a level. Same underlying model calls either way.

## An agent, defined

The core object is the `Agent`: a name, instructions (its system prompt), a model, and a set of tools. Here it is in both languages, straight from the docs:

```python
from agents import Agent, function_tool

@function_tool
def get_weather(city: str) -> str:
    """Return the weather for a given city."""
    return f"The weather in {city} is sunny."

agent = Agent(
    name="Weather bot",
    instructions="You are a helpful weather bot.",
    model="gpt-5.6",
    tools=[get_weather],
)
```

```typescript
import { Agent, tool } from "@openai/agents";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new Agent({
  name: "Weather bot",
  instructions: "You are a helpful weather bot.",
  model: "gpt-5.6",
  tools: [getWeather],
});
```

Notice what a "tool" is here: **a normal function plus a schema**. In Python the `@function_tool` decorator reads your type hints and docstring to build the JSON schema the model sees. In TypeScript you hand it a [Zod](https://zod.dev) schema and an `execute` function. This is the exact thing you'd otherwise write by hand — a name, a description, a parameter schema, and the code that runs — just with the boilerplate generated for you. If you've [designed tools for an agent](/curriculum/week-5-tools-that-touch-code) before, nothing here is new; it's the same contract, less typing.

## Running it — the loop you didn't have to write

```python
from agents import Runner

result = await Runner.run(agent, "What's the weather in Kyoto?")
print(result.final_output)
```

```typescript
import { run } from "@openai/agents";

const result = await run(agent, "What's the weather in Kyoto?");
console.log(result.finalOutput);
```

That single `run` call is the forty-line loop. Under the hood: it calls the model, sees a request to call `get_weather`, runs your function, feeds the result back, calls the model again, and returns when the model produces a final answer instead of another tool call. The stop rule, the tool dispatch, the message-appending — all of it — is inside `Runner.run`.

**Structured output** is a first-class option: give the agent an `output_type` (a Pydantic model) or `outputType` (a Zod schema) and the run returns typed, validated data instead of free text:

```python
from pydantic import BaseModel
from agents import Agent, Runner

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text.",
    output_type=CalendarEvent,
)

result = await Runner.run(agent, "Dinner with Priya and Sam on Friday.")
print(result.final_output)  # a CalendarEvent, not a string
```

## Handoffs: multi-agent without a router you maintain

This is the SDK's signature feature and the clearest reason to reach for it. A **handoff** lets one agent delegate the rest of a run to another, specialist agent — and the runner "switches agents after handoffs" automatically.

The pattern is a *triage* agent whose whole job is to decide who should handle the request:

```python
triage_agent = Agent(
    name="Triage",
    instructions="Route the user to the right specialist.",
    handoffs=[billing_agent, refunds_agent, support_agent],
)
```

Contrast that with doing it yourself: you'd run one model call to classify the intent, `switch` on the result, and start a second loop with a different system prompt and toolset — wiring you write, test, and maintain. Handoffs make delegation a **built-in primitive with clear ownership**: whoever the run hands off to now owns the conversation, tools and all. This is the backbone of [multi-agent orchestration](/curriculum/week-12-multi-agent-orchestration) — a manager agent with specialists, where an agent can even be exposed *as a tool* to another.

## Guardrails: checks that can pause the run

**Guardrails** are input, output, and tool-level checks that "block or pause before risky work continues." An input guardrail can reject an off-topic or unsafe request before the expensive model call even happens; a tool guardrail can require **approval before a dangerous action runs** — and because runs are resumable, the agent pauses, a human approves, and it picks up where it left off.

By hand, this is a pile of `if` statements scattered around your loop and a bespoke mechanism for serializing state while you wait for a human. The SDK makes it a declarative layer with a resumable run built in — which matters the moment a tool can spend money or touch production.

## Sessions, state, and the memory question

The SDK gives you "the same options as the Responses API" for conversation state — manual history, response chaining, the Conversations API — **plus SDK sessions and resumable run state**. In plain terms: you can let the SDK track the running conversation for you across turns instead of threading the history list through every call yourself. It's the framework's answer to the [memory and session](/curriculum/week-9-memory-and-sessions) plumbing every real agent eventually needs.

## Tracing: the part you'll appreciate at 2 a.m.

Every run is traced — "built-in traces across model calls, tools, agents, guardrails, and handoffs." When a multi-agent run does something baffling, you get a structured timeline of *which agent was active, what it called, what came back, and where it handed off*, instead of squinting at raw request logs. This is genuinely hard to build well yourself, and it's the feature that quietly pays for the whole abstraction once you're debugging orchestration in anger.

## So should you use it?

Here's the honest framing the course takes. **Write the loop by hand first** — it's forty lines, and it makes every framework readable, this one included. Then adopt the SDK when your problem actually has the shape it's built for:

- **Reach for it** when you have genuine multi-agent orchestration (real handoffs, not one classifier), when you need approval gates on risky tools, or when tracing across specialists is worth the dependency.
- **Stay on the raw Responses API** when you want full control of routing and a custom loop, or when your "agent" is really one model with three tools — in which case the SDK is ceremony you don't need.

The SDK isn't magic and it isn't a crutch. It's a set of sensible defaults for the exact problems you hit *after* the loop works. Knowing what each piece replaces is what lets you choose it deliberately instead of cargo-culting a framework because the README looked impressive.

---

*Building the agent loop from scratch — then reading production frameworks like the OpenAI Agents SDK against it — is the arc of the [AI Engineering mentorship](/curriculum). You write [the loop](/curriculum/week-8-planning-and-agent-loops) and [the tools](/curriculum/week-5-tools-that-touch-code) yourself, so the frameworks become choices instead of mysteries.*
