---
title: "Durable execution: how an agent survives its own crash"
description: "Your agent is a for-loop holding all its state in a local variable. Kill the process at tool call six and the run is gone — or worse, the retry re-sends the email. Workflows, steps, and replay: the pattern behind DBOS, Temporal, Restate and the rest."
pubDate: 2026-08-24
tags: ["Durable Execution", "Agents", "DBOS", "Temporal", "TypeScript", "Production"]
readingTime: 12
---

Here is the [agent loop](/blog/what-is-an-agent-loop), stripped to its bones:

```ts
const messages = [system, user];
while (true) {
  const msg = await model(messages);
  messages.push(msg);
  if (!msg.tool_calls) return msg.content;
  for (const call of msg.tool_calls) {
    messages.push(await runTool(call));
  }
}
```

It works. Run it on your laptop and it does the job.

Now put it in production and kill the process on tool call six. Your pod gets evicted, a deploy rolls, the OOM killer picks your process, the model provider hangs for ninety seconds and your request times out. Pick whichever one you find most plausible — they all happen.

What did you just lose?

Everything. `messages` was a local variable in a dead process. The whole conversation — five model calls you paid for, six tool calls that touched the outside world — is gone. And here's the part that actually hurts: **the side effects aren't gone.** The refund was issued. The email was sent. The ticket was created. The record of *having done them* is what vanished.

So you retry. The loop starts from zero. The model gets called again, the refund gets issued **again**, the email goes out **again**. Your customer gets two refunds and two apologies for the double charge they got in the first place.

This is not an error-handling problem. `try/catch` does not help you here — your process isn't catching anything, it's *gone*. This is a state problem, and the fix has a name.

## The pattern: workflows, steps, replay

Durable execution is three ideas that fit together.

**A workflow** is a function whose progress is recorded outside the process, in a database. It has an identity. It can outlive the machine running it.

**A step** is a unit of work inside that workflow whose result gets **checkpointed the moment it completes** — written to that database before execution moves on.

**Replay** is what happens on restart. The engine runs the workflow function again, from the very top. But every step that already completed doesn't execute — it returns its saved result immediately, from the database. The function fast-forwards through everything already done and picks up live at the exact step that died.

Read that once more, because it's the whole trick and it's counterintuitive: **recovery re-runs your code from line one.** It doesn't resume a paused stack or deserialize a continuation. It replays, and the checkpoints make the replay free and side-effect-free.

That's it. That is the entire idea behind DBOS, Temporal, Restate, Inngest and every other engine in this category. Everything else they sell you — queues, timers, retries, dashboards, versioning — is built on top of these three ideas.

## Build it yourself in forty lines

You should write this once before you adopt a library, because it makes the rest obvious. A workflow is a JSON file. A step is a cache lookup.

```ts
export class Workflow {
  steps: Record<string, any>;

  constructor(public id: string) {
    this.path = `wf/${id}.json`;
    const data = fs.existsSync(this.path)
      ? JSON.parse(fs.readFileSync(this.path, "utf8"))
      : { status: "running", steps: {} };
    this.steps = data.steps;
  }

  async runStep<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (name in this.steps) return this.steps[name];  // already done — cached
    const result = await fn();                        // side effects live HERE
    this.steps[name] = result;
    this.save();                                      // checkpoint BEFORE moving on
    return result;
  }
}
```

Wrap the model call and each tool call in `runStep`, give the workflow a stable id, and you have crash recovery. Restart, construct a `Workflow` with the same id, run the loop again: the first six steps return from JSON without executing, and step seven runs live.

Forty lines. No cluster, no vendor. And the important thing about writing it is that you now know exactly what the production engines are doing, because it's this — with Postgres instead of a JSON file, and a decade of edge cases handled.

## The same thing on DBOS

DBOS Transact is the smallest step up from the hand-rolled version, because it's a **library, not a server**. The state goes in a Postgres you already have. There's nothing new to operate.

```ts
import { DBOS } from "@dbos-inc/dbos-sdk";

export const agentWorkflow = DBOS.registerWorkflow(async (task: string) => {
  const messages: Msg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: task },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    // every non-deterministic thing lives inside a step
    const msg = await DBOS.runStep(() => modelTurn(messages),
                                   { name: `model-${step}` });
    messages.push(msg);

    if (!msg.tool_calls?.length) return msg.content;

    for (const call of msg.tool_calls) {
      const result = await DBOS.runStep(
        () => runTool(call.function.name, JSON.parse(call.function.arguments)),
        { name: `tool-${call.id}` },
      );
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
}, { name: "agentWorkflow" });
```

Compare it to the loop at the top of this article. The control flow is **identical**. It's still a `for` loop, still pushing onto a `messages` array, still branching on `tool_calls`. Two API calls got added — `registerWorkflow` around the outside, `runStep` around each thing that touches the world.

That's the ergonomic argument for this whole category: you don't rewrite your agent as a state machine or a DAG. You annotate the loop you already wrote.

The recovery side is almost aggressively boring:

```ts
await DBOS.launch();
```

That's the whole recovery pass. `launch()` scans Postgres for workflows still marked `PENDING`, and resumes each one in the background from where it stopped. **No task, no workflow id, no arguments.** The engine already knows — it's all in the database.

I run this as a live demo in the workshop. Start an agent on three support tickets, let it make six real tool calls, then `process.exit(1)` mid-run. Then start the process again and *do nothing else*. It finishes itself. The drafts go out, the replies get sent, and not one of the six pre-crash tool calls runs a second time.

Then you ask the engine for its receipts, and it prints every step, its output and its duration:

```
  #   step                    ms     output
  8   tool-call_xVFHnK3Y9HL   556    "{\"articles\":[\"Team plans are $20/seat...
  ---- 21.0s gap: the process was dead here; everything above was replayed ----
  9   model-2                 3868   {"role":"assistant","content":null,...
```

That gap line is the lesson in one row.

## The one rule you cannot break

Every engine in this category demands the same thing, and it is the only genuinely hard part:

> **The workflow body must be deterministic. Every interaction with the outside world goes inside a step.**

Replay re-executes your function from the top. If the code takes a different path on the second run than it did on the first, the replay diverges from the recorded history — and now the engine is handing step 4's saved result to what is actually step 5's call. That's not a crash. That's *silent corruption*, which is worse.

So this is the failure mode:

```ts
// WRONG — new value on replay, different path, diverged history
if (Date.now() - start > TIMEOUT) return "gave up";
const id = randomUUID();
const flags = await fetch("/feature-flags");
```

And this is the fix — same calls, wrapped:

```ts
const now   = await DBOS.runStep(() => Date.now(),          { name: "clock" });
const id    = await DBOS.runStep(() => randomUUID(),        { name: "id" });
const flags = await DBOS.runStep(() => fetchFlags(),        { name: "flags" });
```

The list of things that violate determinism is short and worth memorizing: **the clock, randomness, UUIDs, network calls, file reads, environment variables, database queries.** If it can return a different answer on Tuesday than it did on Monday, it belongs in a step.

Two details that bite people specifically on DBOS:

**Steps are matched by position, not by name.** The hand-rolled version above keys its cache on the step *name*, which is forgiving — reorder the steps and it still finds them. DBOS matches on the order the workflow issues them. That's stricter, and it means a conditional that runs a step on the first pass but skips it on replay will desynchronize everything after it.

**Recovery is scoped to an application version.** DBOS only resumes workflows whose recorded app version matches the running code — by default a hash of your code. That's the correct default, because replaying old workflow state through new workflow logic is exactly how you corrupt things. But it does mean that editing a file between the crash and the recovery orphans the pending workflow. Pin `DBOS__APPVERSION` explicitly when you're demoing or developing, and understand that in production, deploying mid-workflow is a real decision with real semantics, not an afterthought.

## Why agents need this more than normal backends

A CRUD request lives for 200 milliseconds. If it dies, the user hits refresh and you're fine.

An agent run lives for minutes. Sometimes hours. And within that window it is doing the two worst possible things to lose track of:

**It spends real money.** Every model call is billed. Losing a run twenty steps deep and restarting from zero doesn't just cost latency, it re-bills the entire trajectory. Durable execution turns a crash from "pay for all of it again" into "pay for one step again."

**It performs real side effects.** This is the serious one. [Tools that touch the world](/blog/designing-tools-for-ai-agents) — sending mail, issuing refunds, opening pull requests, writing to your database — are not safe to re-run. Without checkpointing, your retry policy is an at-least-once delivery guarantee pointed directly at your customers.

And there's a third thing you get almost for free. Once workflow state lives in Postgres instead of a variable, an agent can **stop and wait** — for a human approval, for a webhook, for tomorrow — without a process sitting there burning memory. The workflow parks. Something arrives. It resumes. Human-in-the-loop stops being an architectural problem and becomes a function call.

## The landscape

DBOS isn't the only answer, and the trade-off that actually separates these tools is simple: **is it a library on infrastructure you already run, or a server you have to operate?**

| Engine | Languages | What you operate |
|---|---|---|
| **DBOS Transact** | TypeScript, Python | nothing — a library on your own Postgres |
| **Hatchet** | TS, Python, Go | Postgres (self-hosted or cloud) |
| **Temporal** | Go, Java, TS, Python, .NET | a Temporal cluster, or their cloud |
| **Restate** | TS, Java, Python, Go, Rust | a single binary, or their cloud |
| **Inngest** | TS, Python, Go | hosted (self-host available) |
| **Trigger.dev** | TypeScript | hosted (self-host available) |
| **AWS Step Functions** | any, via ASL | nothing — AWS-managed |
| **Azure Durable Functions** | C#, JS, Python | nothing — Azure-managed |

A rough way to choose:

- **Already have Postgres, want the smallest possible diff to existing code?** DBOS. Adding a library beats adding infrastructure, and the code change is two decorators.
- **Multi-language, high volume, long histories, and you have platform engineers?** Temporal. It's the most battle-tested thing here and the ecosystem is deep.
- **Want durable execution to feel like ordinary HTTP handlers?** Restate.
- **Serverless, event-driven, want the queue and the scheduler in the same product?** Inngest or Trigger.dev.
- **All-in on one cloud and your workflow is a coordination graph rather than a program?** Step Functions or Durable Functions — though writing an agent loop in ASL is genuinely unpleasant, so weigh that.

Notice what isn't on this list: Airflow, Prefect, Dagster. Those are data-pipeline orchestrators. They schedule DAGs of batch jobs; they're not built for a fine-grained, long-lived, side-effect-heavy conversational loop. People reach for them because "workflow" is in the description, and then fight the tool for a month.

## What to actually do

If you take one thing from this, make it the mental model, not the vendor:

**Your agent's state does not belong in a variable. It belongs in a database, one step at a time.**

The order I'd suggest:

1. **Write the forty-line version.** Once. On a JSON file. Until you've watched a cached step return without executing, the production engines look like magic, and you'll misuse them.
2. **Draw the line.** Go through your loop and mark every call that touches the outside world. That set — and nothing else — is your steps. Everything left over must be deterministic.
3. **Then adopt an engine**, and let it hand you the things you were never going to build well yourself: queues, timeouts, retries with backoff, forking a workflow from step N, cancellation, and a query interface over what actually happened.

The failure this prevents isn't exotic. It's Tuesday afternoon, a routine deploy, and an agent that was fourteen steps into a customer's refund.

---

*The hand-rolled durable engine, the DBOS rewrite, and the crash-and-recover demo are built in [Week 3](/curriculum/week-3-the-runtime-harness) of the AI Engineering mentorship — where the harness stops being a script and starts being a runtime.*
