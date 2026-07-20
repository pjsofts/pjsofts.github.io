# AI Engineering — course site

Marketing + content site for the 12-week **AI Engineering** mentorship by Pouria Jahandideh.
Built with [Astro](https://astro.build), deployed to GitHub Pages at
**https://pjsofts.github.io**.

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
