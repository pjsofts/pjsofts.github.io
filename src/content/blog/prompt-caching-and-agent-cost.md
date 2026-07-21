---
title: "Prompt caching and what an AI agent actually costs"
description: "Your agent resends the entire conversation on every single turn, so cost grows quadratically with steps. Prompt caching fixes most of it — but only if your prefix is stable. Here are the four rules, the mistake that silently triples your bill, and why caching and context trimming pull against each other."
pubDate: 2026-07-21
tags: ["Agents", "Cost", "Prompt Caching", "Context Engineering", "Production"]
readingTime: 9
featured: true
image: "/articles/prompt-caching.png"
imageAlt: "Four stacked bars showing an agent's context growing each turn, with the large cached prefix dimmed and only a small new segment highlighted"
---

Your AI agent is expensive for a specific reason, and it's rarely the one people expect.

On every iteration of the [agent loop](/blog/what-is-an-agent-loop/), the entire conversation is sent again.

Language models are stateless. Nothing is kept on the server between requests. So when your agent is deciding what to do at step 12, it has to be handed everything that came before: the system prompt, the tool definitions, the user's message, and the result of every tool call so far.

## The cost is quadratic, not linear

Work through a small example. Say you have:

- A system prompt of ~1,000 tokens
- Tool definitions of ~2,000 tokens
- Tool results averaging ~500 tokens each

Then your input per step looks like this:

| Step | Input tokens sent |
| --- | --- |
| 1 | ~3,000 |
| 2 | ~3,500 |
| 3 | ~4,000 |
| … | … |
| 20 | ~13,000 |

A 20-step run doesn't cost you 13,000 input tokens. It costs the **sum** of every row — roughly 160,000.

That's the part that catches people out. Cost doesn't scale with the number of steps; it scales with the number of steps *squared*. Double your agent's average trajectory length and you roughly quadruple the bill.

This is why so many people build an agent, run it on one real task, and get an invoice that makes no intuitive sense.

## The fix isn't "send less"

The instinctive reaction is to shrink the context. That's partly right, and we'll come back to why it's also partly a trap.

The real lever is **prompt caching**.

Providers cache the *prefix* of your request. Send the same opening tokens again and you pay a fraction of the normal input price for them instead of full freight.

Now notice what the agent loop does. Every single iteration resends the same system prompt and the same tool definitions, unchanged, in the same order. That's the exact access pattern prompt caching was designed for. A large share of your bill can become close to free.

If your prefix is stable. That conditional is the entire lesson.

## Rule 1: static content first

Order your request from least-changing to most-changing:

1. System prompt
2. Tool definitions
3. The conversation — messages and tool results

Cache matching is prefix-based. It walks forward from the first token and stops at the first byte that differs. Everything before that point can be a cache hit; everything after it is full price.

So the more stable material you can front-load, the bigger your cached region. Putting a large tool schema *after* the conversation is a quiet, expensive mistake.

## Rule 2: never put a timestamp at the top of your system prompt

This is the most common cache killer I see, and it's almost invisible:

```
You are a helpful coding assistant.
Current date and time: 2026-07-21 14:22:09
...
```

One changing character near the start of the request invalidates the cache for **the entire request** — on every turn, on every run, forever. Your hit rate is zero and nothing in your code looks wrong.

If you genuinely need the date, either move it to the end of the context, or reduce its precision. `2026-07-21` changes once a day. `14:22:09` changes every second.

The same applies to anything else dynamic that drifts into the prefix: a request ID, a random session token, a user's "last seen" time, a counter.

## Rule 3: append, don't edit

Adding to the end of the context leaves the prefix untouched — that's a cache hit.

Rewriting something in the middle invalidates everything from that point on. So patterns that feel like good hygiene have a hidden cost:

- "Let me clean up those older messages"
- "Let me truncate that giant tool result now that we're past it"
- "Let me re-order these for clarity"

Each one throws away the cached region downstream of the edit.

## Rule 4: compaction is a cache event

When the context gets too big, the natural move is to summarize older turns — compaction. But that is, by definition, a prefix rewrite. The very next call is a full-price cache miss on everything.

Two practical consequences:

- **Compact less often than instinct suggests.** Every compaction has a real cost attached, not just a token saving.
- **Compact in bigger chunks.** Ten small compactions mean ten cache misses. One larger compaction means one.

## The tension nobody mentions

Here's what surprised me most in production: **caching and context management pull in opposite directions.**

Aggressively pruning context reduces your token count but destroys your hit rate. Keeping a bloated context costs more tokens nominally, but most of them are cached and cheap.

Sometimes the cheaper move really is to leave the big context alone and let the cache carry it.

This isn't a rule you can apply blind — it's a genuine trade-off, and where it lands depends on the size of your static prefix, how long your runs are, and how quickly requests follow each other. Which is why the next section matters more than any of the rules above.

## Measure before you optimize

Every provider reports cached versus uncached input tokens in the response body. Log that ratio.

If your cache hit rate is near zero on a multi-step agent, something in your prefix is moving. Finding it is usually a ten-minute investigation, and it's worth more than any amount of prompt rewriting.

A few things worth knowing while you measure:

- **There's a minimum cacheable length.** Very short prompts aren't cached at all, so small test scripts may show a 0% hit rate for entirely boring reasons.
- **Caches expire after a period of inactivity.** Agents that fire requests back-to-back benefit most; a request every ten minutes may miss every time.
- **Some providers cache automatically; others need you to mark cache breakpoints explicitly.** Check the docs for the one you're actually using — this is not portable behaviour.
- **Discount rates and TTLs differ by provider and change over time.** Look at the current pricing page before you build a cost model on a number you half-remember.

If you're using OpenAI's Responses API with `previous_response_id`, you also tend to get better cache utilization than replaying the whole array yourself — the server already knows what the prefix was. (More on that in [Chat Completions vs the Responses API](/blog/chat-completions-vs-responses-api/).)

## The short version

- Your agent resends the whole context every step, so cost grows quadratically.
- Prompt caching removes most of that cost — but only while the prefix is stable.
- Static content first, dynamic content last.
- Never put a timestamp near the top of the system prompt.
- Append rather than edit. Compaction is not free.
- Log your cache hit rate. Most people have genuinely never looked at it.

Nothing here is exotic. It's the difference between an agent that's viable to run and one that quietly burns money on every request — and it's usually a one-line fix once you can see it.
