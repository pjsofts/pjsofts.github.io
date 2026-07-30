---
title: "What a $500K–$850K evals role actually asks for"
description: "Anthropic is hiring a Research Engineer for Model Evaluations at $500K–$850K. The qualifications aren't exotic — they're the fundamentals of eval engineering, done at scale. Here's the exact list, decoded, and how to build toward every line of it."
pubDate: 2026-07-29
tags: ["Evals", "Careers", "AI Engineering", "Anthropic", "Research Engineering"]
readingTime: 8
---

Anthropic has an open role — **Research Engineer, Model Evaluations** — paying **$500,000 to $850,000 a year**. It's worth looking at closely, not because most of us will apply tomorrow, but because the qualifications are a remarkably clean answer to a question people keep asking me: *what does "good at evals" actually mean, and what's it worth?*

The answer, apparently, is a lot. So let's read the posting the way you'd read a syllabus — line by line — and see what it's really testing for.

## What the role is

In Anthropic's words, the job is to turn "ambiguous notions of 'intelligence' into clear, defensible metrics," and to build the infrastructure that runs those evaluations reliably at scale while models are being trained. The headline responsibilities:

- Design and run evaluations of a model's capabilities — reasoning, agentic behavior, knowledge, safety — with visualizations researchers can actually use.
- Build and operate a **distributed eval platform** that runs hundreds of evaluations against live training checkpoints.
- Own the **dashboards that monitor model health during training**, and catch regressions.
- **Debug anomalous eval results mid-training** — and figure out, under time pressure, whether the model or the infrastructure is at fault.
- Run experiments on how prompting, sampling, and scaffolding change benchmark results.

Read that list again and notice what it *isn't*. It's not "invent a new architecture." It's not even mostly about training models. It's about **measuring** them — rigorously, at scale, in production, while the ground is moving. That's eval engineering, and it's the least glamorous, most valuable skill in the field.

## The minimum qualifications, decoded

Here's the required list, verbatim, with what each line is really asking:

**"Strong Python programming for production/research infrastructure."**
Not "can write a script." Can write code other researchers depend on — tested, readable, maintainable. Eval harnesses are software, and they're held to software standards.

**"Experience building/operating distributed systems or data pipelines at scale."**
Running *hundreds* of evals against training checkpoints is a systems problem before it's an ML problem. You need to move data, parallelize work, handle partial failures, and not fall over when one eval in three hundred hangs.

**"Clear written and verbal communication explaining technical results to non-specialists."**
An eval result nobody can interpret is worthless. Half this job is turning a number into a sentence a researcher can make a decision on. This is a hard technical skill, not a soft one.

**"Comfort with on-call/production-support during live training runs."**
Training runs don't pause for your weekend. When a metric craters at 2 a.m., someone has to determine fast whether the model regressed or the harness broke. That someone is you.

**"Care about the societal impacts of your work and an interest in steering powerful AI to be safe."**
Not filler. Evals *are* the safety mechanism — they're how you know what a model can and can't do before it ships.

Notice the shape of it: **most of these are engineering fundamentals, not research credentials.** Distributed systems, clean Python, clear writing, operational nerve. The bar is "excellent engineer who is rigorous about measurement," not "PhD in a narrow subfield." The posting even lists the education requirement as a bachelor's degree *or equivalent experience.*

## The preferred qualifications — the eval-specific layer

This is where the domain shows up. The "nice to have" list:

- Hands-on experience with LLMs — **prompting and scaffolding**.
- **Data visualization** and dashboard development.
- **Developing robust evaluation metrics** for language models.
- **Observability, monitoring, or experiment-tracking** systems.
- **Statistics and experimental design.**
- Large-scale dataset sourcing, curation, and processing.
- ML training infrastructure.
- "A bias toward picking up slack and operating flexibly across team boundaries."

If the minimum list is "great engineer," this list is "great engineer *who has actually done evals.*" And every single item is learnable outside a frontier lab. You can practice prompting and scaffolding on any model. You can build a dashboard over your own eval runs this weekend. You can learn enough experimental design to know why "I ran it once and it looked better" is not a result.

## Why this maps so cleanly onto fundamentals

Here's the thing I want you to take from this posting: **there's no secret sauce.** A half-million-dollar role is asking for the disciplined version of skills you can start building today. Strip it down and it's three things:

1. **You can measure a model rigorously** — define a metric that means something, run it enough times to trust it, and know the difference between a real change and noise. This is exactly [why your agent needs evals](/blog/why-your-ai-agent-needs-evals): a number you can't defend is worse than no number, because it *feels* like signal.

2. **You can make the measurement run at scale and stay up** — the systems and observability half. Hundreds of evals, live checkpoints, dashboards that catch regressions.

3. **You can explain what you found** — to people who will make a training decision based on your sentence.

None of that requires a frontier cluster to *learn*. It requires reps: write an eval, run it against a model, be honest about what it does and doesn't tell you, then make it faster and more reliable and easier to read. Do that a hundred times and you have the exact muscle this posting is screening for.

## How to actually build toward it

Concretely, if this is the kind of role you want:

- **Build an eval harness yourself.** Pick a task, write a grader, run a model against a dataset, and produce a single defensible metric. Then run it ten times and look at the variance — that's the lesson most people skip.
- **Add the systems layer.** Parallelize it. Make it resume after a crash. Log every run. Put a dashboard on top so you can see a regression at a glance.
- **Practice the interpretation.** For every result, write the one sentence a decision-maker would need. If you can't, your eval isn't done.
- **Learn just enough statistics** to talk honestly about significance and noise. You don't need a stats degree; you need to stop being fooled by a single lucky run.

That progression — measurement first, then reliability and scale, then communication — is deliberately the arc of two full weeks in the mentorship: [evals and discipline](/curriculum/week-2-evals-and-discipline) early, then [evals, tracing, and reliability](/curriculum/week-11-evals-tracing-reliability) once your agent is real. Not because we're trying to place people at Anthropic, but because this posting is simply the market pricing a skill honestly — and it's a skill you can start earning today.

The takeaway isn't "go apply for the $850K job." It's that the industry is now paying frontier-engineer money for **rigorous measurement**, and the qualifications to get there are fundamentals, not magic. Build the boring thing well. The market has told you what it's worth.

---

*Evals are the spine of the [AI Engineering mentorship](/curriculum) — you build a working eval harness in Week 2 and a production-grade tracing-and-reliability layer in Week 11. Salary figures and qualifications quoted from Anthropic's public job posting for Research Engineer, Model Evaluations.*
