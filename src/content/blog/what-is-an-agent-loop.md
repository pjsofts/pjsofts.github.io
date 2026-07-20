---
title: "What is an agent loop, really? (It's about 40 lines of code)"
description: "Agent frameworks make the loop look complicated. It isn't. Here is the whole thing in Python and TypeScript — the exchange, the stop rule, the step limit, and why writing it yourself changes how you debug everything else."
pubDate: 2026-07-10
tags: ["Agents", "Agent Loop", "Python", "TypeScript", "Fundamentals"]
readingTime: 8
---

There's a lot of mystique around "agents." Frameworks sell orchestration graphs, state machines, and abstractions with names like `AgentExecutor`. It's easy to conclude that an agent is a complicated thing.

It isn't. An agent loop is roughly forty lines of code, and once you've written it yourself, every framework becomes readable.

## The difference between a chatbot and an agent

A chatbot answers. An agent **acts, checks the result, and acts again**.

That's the whole distinction. A chatbot is one request and one response. An agent is a loop that keeps going until the work is done — calling tools, reading what came back, and deciding what to do next.

## The exchange

Everything is built on one exchange:

1. You describe some tools to the model.
2. The model responds with a **structured request** to use one — a name and arguments.
3. You run the actual function.
4. You feed the result back.
5. The model either calls another tool or answers.

Step 5 is the loop. That's it.

## The loop in Python

```python
MAX_STEPS = 10

def run_turn(context):
    for _ in range(MAX_STEPS):
        r = client.responses.create(model=MODEL, input=context, tools=TOOLS)

        # The model's output IS the memory — feed it back in.
        context += r.output

        # Stop rule: no tool call means the agent is done.
        if not any(i.type == "function_call" for i in r.output):
            return r.output_text

        for item in r.output:
            if item.type != "function_call":
                continue
            args = json.loads(item.arguments)
            result = TOOL_FNS[item.name](**args)
            context.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": result,
            })

    return "Stopped: hit the step limit."
```

## The same loop in TypeScript

```ts
const MAX_STEPS = 10;

export async function runTurn(context: OpenAI.Responses.ResponseInput): Promise<string> {
  for (let step = 0; step < MAX_STEPS; step++) {
    const r = await client.responses.create({ model: MODEL, input: context, tools: TOOLS });

    context.push(...(r.output as OpenAI.Responses.ResponseInputItem[]));

    if (!r.output.some((i) => i.type === "function_call")) return r.output_text;

    for (const item of r.output) {
      if (item.type !== "function_call") continue;
      const args = JSON.parse(item.arguments);
      const result = await TOOL_FNS[item.name](args);
      context.push({ type: "function_call_output", call_id: item.call_id, output: result });
    }
  }
  return "Stopped: hit the step limit.";
}
```

## The four decisions that actually matter

The code is short. The engineering is in four choices it encodes.

### 1. The conversation list is the memory

There is no memory on the server. The model knows exactly what you put in `input` and nothing else. Appending the model's own output back into that list is what makes the next turn coherent — and forgetting to is the single most common agent bug.

### 2. The stop rule

*No tool call means the agent is done.* That one line is what separates "an agent that finishes" from "an agent that loops forever asking itself questions." It's a rule you choose, not a property of the model.

### 3. The step limit

An agent without a step limit is an unbounded bill and a potential infinite loop. Ten steps is a reasonable default. What you do when you hit it — fail loudly, ask the user, summarize progress — is a product decision.

### 4. Errors are data, not exceptions

When a tool fails, don't crash. Return the error text to the model as a normal tool result. A capable model reads `<tool_error>No such file: confg.json</tool_error>` and retries with `config.json`. If you throw instead, you've thrown away a free self-correction.

## Why write it yourself

Frameworks hide exactly this loop, which means when your agent misbehaves you're debugging someone else's abstraction instead of your own control flow.

Once you've written the loop:

- **Runaway loops** are obvious — you know where the step counter lives.
- **Context bloat** is obvious — you know exactly what's being appended each turn.
- **Bad tool selection** is obviously a description problem, not a mystery.
- **Frameworks become readable.** You can look at any agent library and map it back to these forty lines.

That last point is the real argument. This isn't anti-framework — it's that you can't evaluate a framework you don't understand the shape of.

## What comes next

The loop is the foundation, but a loop alone isn't a product. Around it you need tools worth calling, evals that prove it works, context management so long conversations stay affordable, and human approval before anything irreversible.

Each of those is a real subsystem. But they all hang off the forty lines above.

---

*Building this loop by hand — plus tools, evals, context management and human approval — is [Week 1 of the AI Engineering mentorship](/curriculum/week-1-your-first-agent).*
