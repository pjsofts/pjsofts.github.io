---
title: "Where did the frontend jobs go? A year of Jobinja listings, measured"
description: "Frontend postings on Jobinja fell 30% in one year — three times faster than their category and seven times faster than the market — while AI postings grew 41%. Here's the data, the method, and the caveats."
pubDate: 2026-08-16
tags: ["Job market", "Frontend", "Data analysis", "Iran tech"]
readingTime: 6
---

Everyone in Iranian tech Twitter has a feeling about the job market. Feelings are cheap. Numbers are better.

So I measured it. Jobinja shows an exact count of active listings on every search and category page — "۳۵۱ فرصت شغلی فعال یافت شد" — and the Wayback Machine happens to have archived many of those pages last summer. Compare the archived count with today's count on the *identical URL*, and you get a clean year-over-year measurement: same page, same query, same counting logic.

The headline: **frontend developer postings fell 30% in one year.** The market as a whole fell 4.5%.

## The numbers

Each row compares a Wayback Machine snapshot from 2025 with the same URL fetched live on August 16, 2026.

| What was measured | 2025 snapshot | 2025 | 2026 | Change |
|---|---|---:|---:|---:|
| **Frontend** search (react / front / فرانت, web dev category) | Aug 10, 2025 | 351 | 244 | **−30.5%** |
| Web, programming & software (category) | Aug 10, 2025 | 2,259 | 2,031 | −10.1% |
| **AI** search (هوش مصنوعی) | Jun 28, 2025 | 228 | 321 | **+40.8%** |
| Python (keyword search) | Aug 6, 2025 | 257 | 284 | +10.5% |
| DevOps: IT/DevOps/Server (category) | Jun 28, 2025 | 815 | 625 | −23.3% |
| Design (category) | Jul 25, 2025 | 612 | 438 | −28.4% |
| Graphic designer (role page) | Jul 7, 2025 | 441 | 248 | −43.8% |
| Sales specialist (کارشناس فروش, role page) | Jul 6, 2025 | 2,711 | 2,852 | +5.2% |
| All active listings on Jobinja | Aug 6, 2025 | 15,043 | 14,372 | −4.5% |

The frontend row is the cleanest measurement in the table: its baseline is August 10, 2025 — an almost exact one-year window — and it comes from a specific search (`react front فرانت`) scoped to the web development category.

## Three things the data says

**1. Frontend fell three times faster than its own category.** The web & software category lost 10% of its listings; frontend lost 30%. The overall market lost only 4.5%. So this isn't "Jobinja shrank" or "tech shrank" — frontend specifically cooled.

**2. Demand is rotating, not just shrinking.** Inside the same shrinking category, AI-keyword postings grew 41% (and that's against a June baseline; against a May baseline of 267 they still grew 20%). Python grew 10%. That's a ~70-point spread between AI and frontend within one category, in one year. The pie got slightly smaller; the slices moved a lot.

**3. Frontend is not uniquely cursed.** Graphic design postings fell 44% and the design category fell 28% — as hard or harder than frontend. Sales grew 5%. The pattern reads less like "frontend is dying" and more like a broad pullback in UI-adjacent and creative hiring, with frontend as the soft spot *within* software engineering: without it, the rest of the web & software category would be roughly flat.

## What I couldn't measure

Honesty section. Some numbers I wanted don't exist:

- **Backend and full-stack have no 2025 baseline.** The only archived backend search snapshot is a 1.7 KB anti-bot challenge page with no content, and no full-stack page was archived at all. Today backend and frontend keyword searches sit at near-parity (226 vs 223 listings) — but I can't tell you which direction backend moved, only that its two rough proxies point opposite ways (Python +10%, Django −53% on a stale 15-month baseline).
- **A few baselines are late-June/July rather than August**, so those rows are ~13-month comparisons, not exactly twelve.
- **One tempting number was excluded.** The sales & marketing *category* shows −41.8%, but its only usable snapshot is May 2025 — fifteen months back, not year-over-year — and it flatly contradicts the sales-specialist page (+5.2%). Seasonal confound, most likely. Into the bin.

## Method and caveats

The method is reproducible in an afternoon: find the page's Wayback Machine snapshot, read the listing count from the archived HTML, fetch the same URL live, read it again. No scraping of individual postings, no estimation — Jobinja does the counting on both ends.

The caveats are real, though:

- **Keyword search is a proxy.** The frontend query catches some full-stack postings and misses ones that name only a framework. The same bias applies to both years, which is why the *change* is meaningful even if the absolute count is fuzzy.
- **Counts fluctuate week to week.** The software category read 2,259 in August 2025 but 2,901 in an October 2025 snapshot. Single-snapshot comparisons carry noise; the frontend signal (−30%) is well outside it, the market signal (−4.5%) is not.
- **Postings measure advertised demand on one platform**, not hires, not salaries, and not the whole Iranian market.

If you want to check my work, the key snapshot is [the frontend search as archived on August 10, 2025](https://web.archive.org/web/20250810172400/https://jobinja.ir/jobs?&filters%5Bjob_categories%5D%5B%5D=%d9%88%d8%a8%d8%8c%e2%80%8c%20%d8%a8%d8%b1%d9%86%d8%a7%d9%85%d9%87%e2%80%8c%d9%86%d9%88%db%8c%d8%b3%db%8c%20%d9%88%20%d9%86%d8%b1%d9%85%e2%80%8c%d8%a7%d9%81%d8%b2%d8%a7%d8%b1&filters%5Bkeywords%5D%5B0%5D=react%20front%20%d9%81%d8%b1%d8%a7%d9%86%d8%aa&filters%5Blocations%5D%5B%5D=&preferred_before=1754846350&sort_by=relevance_desc) — run the same search on Jobinja today and count.

## So what do you tell a junior frontend developer?

Not "learn a different job." The honest read is narrower: the entry ticket that worked in 2021 — React alone — is the part of the market that's evaporating, and the listings that grew are the ones where frontend skills sit next to something else: AI integration, Python, product breadth. The market didn't stop hiring people who build interfaces. It stopped hiring people who *only* build interfaces.
