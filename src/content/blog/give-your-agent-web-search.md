---
title: "How to give your agent web search (without building a scraper)"
description: "A model's knowledge stops at its training cutoff — web search closes the gap. The two ways to wire it up through a gateway: provider-agnostic search tools that work with any model, and native tools from Anthropic, OpenAI, Google and xAI. Code, citations, cost, and how to choose."
pubDate: 2026-07-26
tags: ["Agents", "Web Search", "RAG", "Tools", "Vercel AI SDK"]
readingTime: 9
featured: true
---

Every model has a training cutoff. Ask it about a framework version shipped last month, a company's latest funding round, or yesterday's release notes, and it will do one of two things: admit it doesn't know, or — worse — confidently invent an answer that sounds right.

Web search is how you close that gap. And in 2026 you no longer build it yourself. No scraper, no HTML parsing, no rate-limit roulette. You hand the model a **tool**, the model decides when to call it, and a search provider returns clean, citation-ready results.

Here's how it actually works, the two paths to wiring it up, and how to choose between them.

## The mental model: search is a tool the model triggers

You don't run a search and paste results into the prompt. That's the naive version, and it burns tokens on every turn whether the question needs fresh information or not.

Instead you register a **web search tool** and let the model pull the trigger. On an empty question — "reverse this string" — it never searches. On "what's the current stable version of the AI SDK?" it calls the tool, reads the results, and answers from them. This is the same on-demand pattern as any other tool call: the model owns the timing, you own the policy.

With a gateway in front of your models, that's a few lines. Everything below uses the AI SDK's `tools` parameter — the tool rides along in the same request as the prompt.

## Path 1: provider-agnostic search (works with any model)

The most flexible option is a search tool that isn't tied to the model's creator. Route any model — OpenAI, Anthropic, Google, whatever — through one consistent search backend. Three are worth knowing: **Perplexity**, **Exa**, and **Parallel**.

You import `gateway` and drop the tool into `tools`. Here's Perplexity search with `streamText`:

```typescript
import { gateway, streamText } from 'ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = streamText({
    model: 'openai/gpt-5.5', // works with ANY model, not just Perplexity
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

That's the whole integration. The model sees a tool called `perplexity_search`, decides when it needs current information, and the gateway routes the call to the search API. You never touch the search endpoint directly.

Each provider has a personality worth matching to your use case:

- **Perplexity** — general-purpose, well-rounded. Good default. Supports recency filters (`day`/`week`/`month`/`year`), domain allow/deny lists, and per-country results.
- **Exa** — built for agents. Strong on domain and date filtering, category targeting (`news`, `research paper`, `company`), and token-efficient excerpts you control tightly.
- **Parallel** — LLM-optimized excerpts with an `agentic` mode that returns concise, token-lean results specifically for multi-step workflows.

And you can constrain any of them. Here's Exa restricted to news from three outlets, only the last 24 hours, five results:

```typescript
import { gateway, generateText } from 'ai';

const { text } = await generateText({
  model: 'openai/gpt-5.5',
  prompt,
  tools: {
    exa_search: gateway.tools.exaSearch({
      type: 'fast',
      numResults: 5,
      category: 'news',
      includeDomains: ['reuters.com', 'bbc.com', 'nytimes.com'],
      contents: { highlights: true, maxAgeHours: 24 },
    }),
  },
});
```

**Reach for this path when** you want the *same* search behavior across different models, or when you're using a model whose provider offers no native search at all. One tool, consistent results, swap the model freely.

## Path 2: provider-native search

Every major provider now ships its own web search tool, tuned to its own model. These are optimized for the provider and often expose extra features. The wiring is nearly identical — you import the provider package instead of `gateway`.

**Anthropic** (Claude), with domain controls and location hints:

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({
  model: 'anthropic/claude-opus-4.8',
  prompt,
  tools: {
    web_search: anthropic.tools.webSearch_20250305({
      maxUses: 3,
      allowedDomains: ['techcrunch.com', 'wired.com'],
      blockedDomains: ['example-spam-site.com'],
      userLocation: {
        type: 'approximate',
        country: 'US',
        region: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
      },
    }),
  },
});
```

**OpenAI** is the terse one — no config needed to start:

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: 'openai/gpt-5.5',
  prompt,
  tools: {
    web_search: openai.tools.webSearch({}),
  },
});
```

**Google** grounds Gemini against Google Search (`vertex.tools.googleSearch({})` on Vertex, or `google.tools.googleSearch({})` on AI Studio — plus an enterprise variant with zero data retention). **xAI** gives Grok `xai.tools.webSearch({})`, and it's the only one that can also search *and understand images* via `enableImageUnderstanding: true`.

**Reach for this path when** you're committed to one provider and want its tuned search or a feature the generic tools don't have — Claude's per-conversation search budget, xAI's image understanding, Google's grounding.

## Getting the sources back (this is the part that matters)

A web-search answer without citations is a liability. If the model tells your user something, you want to show *where it came from* — both for trust and for your own debugging when it gets something wrong.

The native tools return source metadata — titles and URLs — through a dedicated `source` event in the stream. When you iterate the full stream, watch for it alongside the text:

```typescript
for await (const part of result.fullStream) {
  if (part.type === 'text-delta') {
    process.stdout.write(part.text);
  } else if (part.type === 'source') {
    // { title, url } — render these as citations under the answer
    console.log('source:', part.source.title, part.source.url);
  }
}
```

Render those as footnotes or inline chips. An answer with three linked sources reads as *research*; the same answer with none reads as *a guess*.

## What it costs (and the line item people miss)

Web search is metered **separately from tokens**, and the pricing is per request, not per token:

- **Perplexity** — about \$5 per 1,000 searches.
- **Exa** — about \$7 per 1,000 searches (up to 10 results each; extra results billed on top).
- **Parallel** — about \$5 per 1,000 searches (also 10 results included).
- **Provider-native** — priced per model; check the provider's web-search rate.

Here's the line item people forget: the search fee is only half the bill. Every result the model reads becomes **input tokens** on the next step. A search that pulls five pages of excerpts into context can easily cost more in tokens than in search fees. This is exactly why the `maxResults`, `maxTokens`, and excerpt-length knobs exist — they're not fussy details, they're your cost dial. Set them deliberately.

## How to choose, in three lines

- **Prototyping, or model-hopping?** Provider-agnostic (Perplexity/Exa/Parallel). One tool, any model.
- **Locked to a provider and want its best?** Native tool. Tuned results, extra features.
- **Either way:** cap results, always surface sources, and treat retrieved tokens as part of the cost.

## The bigger picture

Web search is on-demand retrieval — the open-web sibling of RAG. RAG retrieves from *your* private corpus; web search retrieves from the public web. The shape is identical: the model decides it needs a fact, calls a tool, reads what comes back, and reasons from it instead of from a fuzzy training-data memory.

Once you see it that way, "add web search" stops being a feature and becomes a design decision: *which knowledge does this agent need, and where does it live?* Some of it is in your database (RAG). Some of it is on the web (search). Some of it is in the current request (context). Picking the right source for each fact is most of what context engineering actually is.

---

*On-demand retrieval — both web search and RAG — is the spine of [Week 7](/curriculum/week-7-rag-and-vector-databases) in the AI Engineering mentorship: vector stores, embeddings, and giving an agent the judgment to fetch a fact instead of inventing one.*
