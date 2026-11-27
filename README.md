# AI Engineering

Build an AI agent from scratch and learn to prove it works. This course is for software developers who want to implement tools, workflows, and evals in code. The [free public materials](https://pjsofts.github.io/) can be used alongside the [12-week curriculum](https://pjsofts.github.io/curriculum/) and the optional [live mentorship](https://pjsofts.github.io/#mentorship).

## Start here

1. Open the [browser replay](https://pjsofts.github.io/webinar/ai-agent-workflows/demo/) and run a recorded workflow. It needs no install or key.
2. Work through the [first-agent lab](https://pjsofts.github.io/labs/first-agent/). It needs Python 3 and a text editor. Run the starter, fix the lookup, and rerun the five checks.
3. Continue with [Week 1](https://pjsofts.github.io/curriculum/week-1-your-first-agent/) and [Week 2](https://pjsofts.github.io/curriculum/week-2-agent-workflows/). If you're running a group session, use the [75-minute facilitator kit](https://pjsofts.github.io/teach/).

## Public workshops by current week

The curriculum is the full course outline. This table lists standalone materials that are public. Pinned repository links refer to the workshop as it was mapped here. Some folder names use the earlier week numbers.

| Week | Public materials | What to run |
| --- | --- | --- |
| 1 · First agent | [Python starter v1](public/labs/first-agent/v1/first_agent.py) · [Minimal chat agent](https://github.com/pjsofts/ai-engineering2/tree/082361bd1a3199d61982f3c87f1e410207339da7) | Run `python3 first_agent.py --check`. The [lab](https://pjsofts.github.io/labs/first-agent/) includes a reference fix. |
| 2 · Workflows | [Browser demo](https://pjsofts.github.io/webinar/ai-agent-workflows/demo/) · [Python source](https://github.com/pjsofts/ai-agent-workflows/tree/e36c82f6a23ac0a6db9a8d7f583d511b6a5) | Replay recorded runs online or follow the source project's Replay setup. |
| 3 · Harness | [Harness workshop](https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d/week3-workshop) | Follow its README for the checkpoints and checks. |
| 4 · Background agents | [Slide deck](https://pjsofts.github.io/curriculum/week-4-background-agents/slides/) | Read the slides with the [week outline](https://pjsofts.github.io/curriculum/week-4-background-agents/). |
| 5 · Evals | [Diagram-agent workshop](https://github.com/pjsofts/ai-engineering2/tree/082361bd1a3199d61982f3c87f1e410207339da7/week2-diagram-workshop) | Use the [case study](https://pjsofts.github.io/blog/diagram-agent-eval-baseline/) to check saved scores offline or run the original suite with a provider key. |
| 6 · Chat and tools | [Streaming chat](https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d/week4-workshop) · [Tool calls](https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d/week5-workshop) | Follow each workshop's setup and checkpoints. |
| 8 · Retrieval | [RAG workshop](https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d/week7-rag) | Follow the Python walkthrough or run the visualizer in Replay mode. |
| 9 · Planning and memory | [Planning and memory workshop](https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d/week9-planning-memory) | Follow the workshop README for its checkpoints and supported languages. |

[Share a lab result or blocker](https://github.com/pjsofts/pjsofts.github.io/issues/new?template=lab-result.yml) or [tell us where you taught the kit](https://github.com/pjsofts/pjsofts.github.io/issues/new?template=teaching-use.yml). Reports are optional. The facilitator page gives reuse terms and a private contact option.

## About the site

The site is built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in ./dist
npm run preview  # preview the production build
```

## Deploying

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and
publishes it to GitHub Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment**
and set **Source** to **GitHub Actions**.

The repo must be named `pjsofts.github.io` for the site to serve from the domain root.

## Structure

```
src/
  data/
    site.ts         # site name, LinkedIn/CTA, contact — edit here first
    weeks.ts        # the 12-week curriculum (single source of truth)
  content/blog/     # articles as Markdown — add a file, it appears everywhere
  layouts/          # BaseLayout: all SEO meta + JSON-LD
  components/       # Header, Footer
  pages/            # routes
  styles/global.css # design system (matches the PDF handouts)
public/
  logo.jpg          # favicon + brand mark
  og-default.png    # social share card
```

## Adding a blog post

Create `src/content/blog/my-post.md`:

```markdown
---
title: "Post title"
description: "One-sentence summary — used for SEO and social cards."
pubDate: 2026-08-01
tags: ["Agents", "Evals"]
readingTime: 7
featured: false      # true -> shown in the Featured grid
draft: false         # true -> excluded from the build
---

Body in Markdown.
```

It's automatically added to `/blog`, the sitemap, and the RSS feed.

## Editing the curriculum

All 12 weeks live in `src/data/weeks.ts`. Editing an entry updates the homepage,
the curriculum index, and that week's detail page at once.

## SEO

- Per-page `<title>`, meta description, canonical URL
- Open Graph + Twitter card meta with a generated share image
- JSON-LD structured data: `Course`, `BlogPosting`, `Person`, `FAQPage`, `BreadcrumbList`
- `sitemap-index.xml`, `robots.txt`, and an RSS feed at `/rss.xml`

## Things you may want to change

- `src/data/site.ts` — contact email and CTA target
- `public/logo.jpg` — currently the course mark; swap for a headshot if you want
  a personal photo on `/resume`
