export interface Week {
  n: number;
  slug: string;
  part: 'Foundations' | 'Build the Clone';
  title: string;
  subtitle: string;
  hours: string;
  ship: string;
  /** Short blurb for cards + meta description. */
  summary: string;
  /** Long-form intro shown on the week page. */
  intro: string[];
  topics: string[];
  /** Numbered walkthrough of the week. */
  parts: { title: string; detail: string }[];
  /** What the learner can do afterwards. */
  outcomes: string[];
}

export const WEEKS: Week[] = [
  {
    n: 1,
    slug: 'week-1-your-first-agent',
    part: 'Foundations',
    title: 'Your First Agent',
    subtitle: 'The loop that thinks',
    hours: '~5 hours, hands-on',
    ship: 'A working agent that reasons and calls tools',
    summary:
      'Build a general-purpose AI agent from scratch in nine parts — from a single tool call to a complete agent with evals, file, web and shell tools, context management and human approval. No frameworks.',
    intro: [
      "This is an intensive, build-everything week. By Friday you'll have written a general-purpose agent that runs in your terminal, reasons with a model, and acts on your machine — reading and writing files, searching the web, running shell commands — while staying affordable on long conversations and pausing for your approval before it does anything irreversible. And you'll have built the evals that prove it works.",
      'We build it in nine short parts. Each adds one capability to the same growing codebase, and each is a runnable checkpoint. No agent framework — just a model API, a loop, and code you understand end to end, because the whole point is to see what the frameworks hide.',
      'A chatbot answers. An agent acts, checks the result, and acts again. This week is about everything that has to be true for that loop to survive contact with the real world.',
    ],
    topics: ['The agent loop from scratch', 'Tool calling & function calls', 'Structured outputs', 'Streaming basics', 'Single & multi-turn evals', 'Human-in-the-loop approval'],
    parts: [
      { title: 'One tool call', detail: 'Describe a tool to the model, read back a structured call, run it, and return the result. The whole field is built on this exchange.' },
      { title: 'Single-turn evals', detail: 'Before adding features, add a scorer. A tiny eval harness that checks whether the model picked the right tool for a prompt.' },
      { title: 'The agent loop', detail: 'Wrap the exchange in a loop with a step limit and a stop rule: no tool call means the agent is done and should answer.' },
      { title: 'Multi-turn evals', detail: 'Score whole trajectories, not just one call — including a negative case where the agent should use no tools at all.' },
      { title: 'Filesystem tools', detail: 'Read, write and edit files safely, with errors returned to the model as data it can recover from.' },
      { title: 'Structured outputs & schemas', detail: 'Constrain the model to a JSON schema so downstream code can trust the shape of what comes back.' },
      { title: 'Web search', detail: 'Give the agent access to information it was never trained on, and learn when not to reach for it.' },
      { title: 'Context management', detail: 'Long conversations get expensive and eventually overflow. Compact old turns without losing the decision the next step depends on.' },
      { title: 'Shell tool & human approval', detail: 'The most dangerous tool, gated behind a y/n prompt — and a denial fed back to the model as an ordinary observation.' },
    ],
    outcomes: [
      'Explain exactly what an agent loop is and write one without a framework',
      'Design tool schemas a model can actually use correctly',
      'Score an agent with automated evals instead of vibes',
      'Gate irreversible actions behind human approval',
    ],
  },
  {
    n: 2,
    slug: 'week-2-evals-and-discipline',
    part: 'Foundations',
    title: 'Evals & Engineering Discipline',
    subtitle: 'Make it good, prove it',
    hours: '~10 hours, hands-on',
    ship: 'An agent you can measure and improve',
    summary:
      'Build a diagram-design agent, put real evals around it, then make it measurably better — context engineering, sharper tools, RAG, richer output, human approval, and a data flywheel that turns every correction into a test.',
    intro: [
      'Last week you built an agent from scratch and you know exactly how it works. This week you learn the part of the job that separates a demo from a product: the discipline.',
      'We build a new agent — a diagram design assistant that draws flowcharts, org charts and architecture diagrams onto a canvas you can watch in your browser — and then we stop adding features and start measuring. Golden datasets. Automated scorers. A baseline.',
      "Then, for the entire second half, we improve the agent one technique at a time — and after every single change we re-run the evals and look at the numbers. Some scores will jump 2×. Some won't move, and that's a lesson too.",
      'You never ship an improvement you haven\'t measured. That single habit is the profession.',
    ],
    topics: ['Golden datasets & scorers', 'Context engineering', 'RAG from scratch', 'Generative UI', 'Human-in-the-loop', 'The data flywheel'],
    parts: [
      { title: 'Build the diagram agent', detail: 'A domain agent with a visible canvas, so every improvement is something you can see as well as score.' },
      { title: 'Golden datasets', detail: 'Curate the cases that matter, including the ones your agent currently fails.' },
      { title: 'Automated scorers', detail: 'Deterministic checks where possible, LLM-as-judge where not — and knowing which is which.' },
      { title: 'Establish a baseline', detail: 'The number you have to beat. Without it, every later change is an opinion.' },
      { title: 'Context engineering', detail: 'Change what the model sees, not which model it is, and re-measure.' },
      { title: 'Sharper tool design', detail: 'Rewrite descriptions and schemas; watch the score move without touching the loop.' },
      { title: 'RAG from scratch', detail: 'Ground the agent in real reference material and measure whether it actually helped.' },
      { title: 'Generative UI', detail: 'Richer output than text — and the evals that keep it honest.' },
      { title: 'Human-in-the-loop', detail: 'Approval as a product feature, not just a safety valve.' },
      { title: 'Smarter architectures', detail: 'Restructure the agent and let the numbers arbitrate.' },
      { title: 'The data flywheel', detail: 'Every user correction becomes a new test case, so the suite grows with usage.' },
      { title: 'Ship it', detail: 'A final measured comparison against the Part 4 baseline.' },
    ],
    outcomes: [
      'Build golden datasets and automated scorers for a real agent',
      'Improve an agent with evidence instead of intuition',
      'Know when RAG helps and when it is overhead',
      'Turn user corrections into a growing regression suite',
    ],
  },
  {
    n: 3,
    slug: 'week-3-the-runtime-harness',
    part: 'Foundations',
    title: 'The Runtime — Build a Harness',
    subtitle: 'Make it survive production',
    hours: '~6 hours, hands-on',
    ship: 'A runtime that runs any agent reliably',
    summary:
      'Build the layer that makes an agent survive production: durable execution that shrugs off crashes, a sandbox for model-written code, flat memory, least-privilege routing, parallel supervision, and human approval that can wait three days.',
    intro: [
      'Week 1 you built an agent. Week 2 you built the discipline around one. This week we build the thing most engineers never see until it bites them: the harness — the runtime layer between your agent loop and the real world.',
      'This is a systems week, not an app week. The agent itself is deliberately boring: a domain-neutral support-triage bot, our crash-test dummy. The harness is the protagonist.',
      'Agent systems are workflow systems. The LLM decides the next semantic step; the harness owns execution. Everything this week hangs off that one split.',
      'The rhythm is the same in every part: name a production failure mode, watch the naive agent fail live, build the one harness capability that fixes it, then re-run and watch it survive.',
    ],
    topics: ['Durable execution & crash recovery', 'Sandboxed code execution', 'Flat memory', 'Routing & handoffs', 'Parallel supervision', 'Approval that waits days'],
    parts: [
      { title: 'The failure modes', detail: 'Watch a naive agent break in the five ways production actually breaks it.' },
      { title: 'Durable state', detail: 'Persist the workflow so a crash mid-tool-call is a resume, not a restart.' },
      { title: 'Sandboxed execution', detail: 'Run model-written code without handing it your machine.' },
      { title: 'Flat memory', detail: 'Keep context bounded so a long-running agent does not grow without limit.' },
      { title: 'Routing to specialists', detail: 'Least-privilege handoffs — each sub-agent gets only the tools it needs.' },
      { title: 'Parallel supervision', detail: 'Run work concurrently and degrade gracefully when one branch fails.' },
      { title: 'Long-lived approval', detail: 'Pause a workflow for three days waiting on a human, then resume exactly where it stopped.' },
    ],
    outcomes: [
      'Separate semantic decisions (the model) from execution (the harness)',
      'Make an agent crash-recoverable with durable state',
      'Sandbox untrusted, model-generated code',
      'Support human approval that outlives the process',
    ],
  },
  {
    n: 4,
    slug: 'week-4-the-chat-interface',
    part: 'Build the Clone',
    title: 'The Chat Interface',
    subtitle: 'The product begins',
    hours: '~6 hours, hands-on',
    ship: 'mycode v0.1 — a streaming chat agent',
    summary:
      'The capstone begins. Build a streaming terminal REPL with slash commands, safe interrupts and a live cost meter — the interface layer that makes an agent feel like a product.',
    intro: [
      'Weeks 1–3 gave you every primitive: the agent loop, tools, evals, streaming, RAG, durable execution, sandboxing, human approval. Starting now, you stop building exercises and start building a product — a working clone of a professional AI coding agent, one subsystem per week.',
      'By Week 12 it reads codebases, edits files, runs commands, plans, remembers, previews artifacts, traces itself, and orchestrates sub-agents. It goes in your portfolio, not in a folder of course exercises.',
      'And we are not designing in the dark. This course uses the actual Claude Code source as a reference implementation. Each week, after building our own version of a subsystem, we open the real thing and study the decisions a production team made.',
      'Why start with the interface? Because the interface is the product. An agent that thinks brilliantly but dumps a wall of text after forty silent seconds feels broken.',
    ],
    topics: ['Streaming terminal REPL', 'Slash commands', 'Safe interrupts', 'A live cost meter', 'Inside Claude Code: the real REPL'],
    parts: [
      { title: 'The REPL skeleton', detail: 'A read-eval-print loop that feels instant and never blocks on a long model call.' },
      { title: 'Streaming output', detail: 'Tokens as they arrive, so the machine visibly thinks out loud.' },
      { title: 'Slash commands', detail: 'An escape hatch for everything that is not a model turn.' },
      { title: 'Safe interrupts', detail: 'Ctrl-C that cancels the turn without corrupting the conversation state.' },
      { title: 'The cost meter', detail: 'Live token and dollar accounting, because the bill is a feature.' },
    ],
    outcomes: [
      'Build a responsive streaming terminal interface',
      'Handle cancellation without losing conversation state',
      'Track and display real-time token cost',
    ],
  },
  {
    n: 5,
    slug: 'week-5-tools-that-touch-code',
    part: 'Build the Clone',
    title: 'Tools That Touch Code',
    subtitle: 'Give the agent hands',
    hours: '~6 hours, hands-on',
    ship: 'A coding agent that edits your files — safely',
    summary:
      'A chatbot talks about your code; an agent changes it. Add the six tools that make a coding agent — read, write, edit, bash, glob, grep — plus the permission system that makes it safe to live with.',
    intro: [
      'Last week you built an interface: a streaming REPL that talks. This week you cross the line that separates a toy from a tool.',
      'The mechanism is function calling — you describe tools to the model, it responds with structured requests to use them, you run them and feed the results back, and you loop until it is done. That loop, plus six well-designed tools, plus a permission gate, is a coding agent.',
      'A tool is a contract, not a function. The model never sees your code — it sees a name, a description that says when to use the tool, and a schema of arguments. Ninety percent of "the model uses tools badly" is actually "my tool descriptions are vague."',
      'The result is the teacher. When a tool fails, you do not crash — you return the error to the model as data, and a good model reads it and fixes its next call.',
    ],
    topics: ['Read · Write · Edit · Bash', 'Glob & Grep search', 'The permission system', 'Tool error design', 'Fixing a real bug end-to-end'],
    parts: [
      { title: 'Read & Write', detail: 'The two simplest tools, and the path-safety rules that keep them inside the project.' },
      { title: 'Edit', detail: 'Exact-match replacement — why it beats "rewrite the file" for reliability and cost.' },
      { title: 'Glob & Grep', detail: 'Fast, exact, free search. The right first move before anything semantic.' },
      { title: 'Bash', detail: 'The most powerful and most dangerous tool, and how to scope it.' },
      { title: 'The permission system', detail: 'Allow, deny, ask — and remembering the answer for the rest of the session.' },
      { title: 'Fix a real bug', detail: 'End-to-end milestone: the agent finds, fixes and verifies an actual bug in a real repo.' },
    ],
    outcomes: [
      'Write tool descriptions a model uses correctly the first time',
      'Design tool errors that let the model self-correct',
      'Build a permission system you would actually trust',
    ],
  },
  {
    n: 6,
    slug: 'week-6-context-and-prompt-engineering',
    part: 'Build the Clone',
    title: 'Context & Prompt Engineering',
    subtitle: 'Own the context window',
    hours: '~6 hours, hands-on',
    ship: "An agent that reads your project's rules",
    summary:
      'The highest-leverage week of the course. Assemble the system prompt, read project rules from an AGENTS.md the agent discovers itself, and survive long conversations by compacting without losing what matters.',
    intro: [
      'The model has no memory. Everything it knows on any turn is something you put in the request. The API is stateless — there is no conversation on the server, no "it remembers."',
      'This has a liberating consequence: whoever controls the context controls the agent. A mediocre model with excellent context beats a brilliant model fed garbage. Context engineering is the highest-leverage skill in this entire field, and it is almost entirely under your control.',
      'Context = system prompt (who the agent is + project rules) + history (what has happened) + fetched material (files, search results) — assembled fresh for every request, within a fixed token budget. Your job is to spend that budget well.',
    ],
    topics: ['Assembling the system prompt', 'AGENTS.md project memory', 'Token budgets', 'Compaction for long sessions'],
    parts: [
      { title: 'Assembling the system prompt', detail: 'Static identity plus dynamic facts, composed per request.' },
      { title: 'Owning the whole context window', detail: 'Why representation is a design choice, not a detail.' },
      { title: 'AGENTS.md', detail: 'Rules the agent reads itself — walk up the tree, nearest wins.' },
      { title: 'Token budgets', detail: 'Decide in advance what each part of the context is allowed to cost.' },
      { title: 'Compaction', detail: 'Summarize old turns without losing the decision the next step depends on.' },
    ],
    outcomes: [
      'Assemble context deliberately instead of appending blindly',
      'Give an agent project-specific rules it discovers on its own',
      'Compact long sessions without breaking continuity',
    ],
  },
  {
    n: 7,
    slug: 'week-7-rag-and-vector-databases',
    part: 'Build the Clone',
    title: 'RAG + Vector Databases',
    subtitle: 'Give the agent a map',
    hours: '~6 hours, hands-on',
    ship: 'Semantic search over any codebase',
    summary:
      'Grep finds exact strings; it cannot answer "where do we handle rate limiting?" when the code says throttle. Build a vector database from scratch — chunking, embeddings, cosine similarity, incremental re-indexing — and wire it in as a tool.',
    intro: [
      'Week 5 gave your agent grep and glob — fast, exact, free. They are the right first tool for most searches. But they share one blind spot: they match text, not meaning.',
      'Ask "where do we decide if a user can retry a payment?" and grep needs you to already know the code says retry and not reattempt, backoff, or idempotency_key. When you do not know the words, you need search by concept.',
      'This week you build the whole pipeline yourself — chunker, embedder, vector store, and an incremental indexer — because a "vector database" sounds like infrastructure you rent and is actually a JSON file and a loop.',
      'The most important judgment this week is knowing when not to use RAG. Known symbol or string → grep. Vague "where/how do we…" question → semantic search.',
    ],
    topics: ['Chunking strategies', 'Embeddings', 'A vector store from scratch', 'Incremental indexing', 'Grounded codebase Q&A'],
    parts: [
      { title: 'Chunking', detail: 'Split code into nameable units, not fixed windows.' },
      { title: 'Embeddings', detail: 'Text into vectors — batched, cheap, and about meaning.' },
      { title: 'The vector store', detail: 'Cosine similarity over a JSON file. No infrastructure required.' },
      { title: 'Incremental indexing', detail: 'Re-index only what changed, so the map stays current.' },
      { title: 'The search tool', detail: 'Expose it to the agent alongside grep, and teach it which to pick.' },
      { title: 'Ask the codebase', detail: 'A full RAG command that answers questions about a repo it was never told about.' },
    ],
    outcomes: [
      'Build a vector search pipeline end to end, no library',
      'Choose correctly between lexical and semantic search',
      'Keep an index fresh as a codebase changes',
    ],
  },
  {
    n: 8,
    slug: 'week-8-planning-and-agent-loops',
    part: 'Build the Clone',
    title: 'Planning & Agent Loops',
    subtitle: 'Think before you act',
    hours: '~6 hours, hands-on',
    ship: 'An agent that plans, then executes',
    summary:
      'An agent with tools but no plan overreaches on some tasks and quits early on others. Add a read-only plan mode, a todo list the agent maintains, feature lists the harness verifies, and a maker/checker loop.',
    intro: [
      'Give a capable model a vague task — "add user authentication" — and watch one of two things happen. It overreaches: two hours later there are twelve files, eight hundred lines, and nothing works end to end. Or it under-finishes: it declares victory when the code "looks done," before anything was actually run.',
      'These are two faces of the same problem — the agent has no externalized plan and no honest definition of done, so it optimizes for looking productive instead of being finished.',
      'Planning is the cure, and it is not one feature but four, each attacking a different part of the problem.',
      'This week is about restraint, not power. Every tool so far made the agent more capable; this week makes it more disciplined — which, counterintuitively, makes it far more useful.',
    ],
    topics: ['Plan mode', 'Todo lists the agent maintains', 'Feature lists & scope control', 'Loop engineering', 'Maker/checker separation'],
    parts: [
      { title: 'The todo list', detail: 'One task in progress, always — externalized so it cannot drift.' },
      { title: 'Plan mode', detail: 'Read-only exploration that proposes but cannot touch your code until you approve.' },
      { title: 'Feature lists', detail: 'The harness, not the model, owns what "done" means — verification-gated state.' },
      { title: 'Loop engineering', detail: 'When to keep going, when to stop, and how to tell the difference.' },
      { title: 'Maker/checker', detail: 'The worker never grades its own homework.' },
    ],
    outcomes: [
      'Separate planning from execution with an approval gate',
      'Stop scope creep with externalized task state',
      'Define "done" in the harness rather than trusting the model',
    ],
  },
  {
    n: 9,
    slug: 'week-9-memory-and-sessions',
    part: 'Build the Clone',
    title: 'Memory & Sessions',
    subtitle: 'Never lose your place',
    hours: '~6 hours, hands-on',
    ship: 'An agent that remembers across days',
    summary:
      'Close the terminal and a normal agent forgets everything. Add resumable session transcripts, persistent cross-project memory, and a handoff file so a fresh session continues exactly where the last one stopped.',
    intro: [
      'An agent that forgets everything when the terminal closes is a goldfish with tools. Real work spans days and projects, and the agent needs to remember three different things, each with its own lifetime.',
      'The session — this specific conversation, so you can close your laptop and resume tomorrow. User memory — durable facts about you that follow the agent across every project. The workspace handoff — where the work stands in this repo, so the next session starts without re-discovering everything.',
      'All three are the same trick you have used since Week 4: the conversation is just data, so memory is just files. No database, no service — a JSONL transcript, a directory of markdown facts, and a PROGRESS.md.',
      'Durable state lives in plain files on disk, written as it happens. That makes memory inspectable, portable, and crash-proof.',
    ],
    topics: ['Resumable sessions', 'Persistent cross-session memory', 'Workspace management', 'Clean handoffs'],
    parts: [
      { title: 'Sessions', detail: 'A durable transcript — one line per message, saved live as it happens.' },
      { title: 'Resume', detail: 'Pick a session back up days later with full fidelity.' },
      { title: 'User memory', detail: 'Durable facts about you, scoped across projects.' },
      { title: 'Workspace state', detail: 'Where the work stands in this repo, right now.' },
      { title: 'The handoff', detail: 'A PROGRESS.md that lets a fresh session continue without a re-brief.' },
    ],
    outcomes: [
      'Make agent sessions durable and resumable',
      'Design memory with the right lifetime for each kind of fact',
      'Hand work off cleanly between sessions',
    ],
  },
  {
    n: 10,
    slug: 'week-10-artifacts-preview-sandbox',
    part: 'Build the Clone',
    title: 'Artifacts, Preview & Sandbox',
    subtitle: 'See it run, safely',
    hours: '~6 hours, hands-on',
    ship: 'Live previews from a locked-down sandbox',
    summary:
      'Add artifact rendering and a live-preview server so generated pages refresh as the agent edits them, a background-task runner for long jobs, and a real OS-enforced sandbox so model-written code cannot touch what it should not.',
    intro: [
      'Your agent can build things — now let it show them, and run untrusted code without risking your machine.',
      'This week you add artifact rendering and a live-preview server so a generated page or chart appears in your browser and refreshes as the agent tweaks it; a background-task runner for long jobs; and a real secure sandbox — OS-enforced limits, a scrubbed environment, a directory jail.',
      'The sandbox is the week\'s real lesson: model-written code is untrusted code, and the only durable answer is enforcement by the operating system, not by a prompt.',
    ],
    topics: ['Artifact rendering', 'A live-preview server', 'Hardened secure sandbox', 'Background tasks'],
    parts: [
      { title: 'Artifacts', detail: 'Render what the agent produces instead of printing it.' },
      { title: 'The preview server', detail: 'Live reload so you watch the agent iterate in real time.' },
      { title: 'The sandbox', detail: 'OS-enforced limits, a scrubbed environment, and a directory jail.' },
      { title: 'Background tasks', detail: 'Long jobs that run without blocking the conversation.' },
    ],
    outcomes: [
      'Render agent output as live, previewable artifacts',
      'Sandbox untrusted code with real OS enforcement',
      'Run long tasks without freezing the interface',
    ],
  },
  {
    n: 11,
    slug: 'week-11-evals-tracing-reliability',
    part: 'Build the Clone',
    title: 'Evals, Tracing & Reliability',
    subtitle: 'Trust, but verify',
    hours: '~6 hours, hands-on',
    ship: 'An agent you can debug and trust',
    summary:
      'Add full request tracing, cost and latency observability, an eval suite for your own agent, and the reliability patterns that let it recover from its own mistakes.',
    intro: [
      'You have built a capable agent. This week you make it legible — because an agent you cannot debug is an agent you cannot ship.',
      'Full request tracing shows you every model call, every tool call, and every token. Cost and latency observability turns "it feels slow" into a number. And an eval suite built for your own agent catches regressions before your users do.',
      'Then reliability: retries that are not infinite, self-healing that is not magical, and failure modes that degrade instead of collapsing.',
    ],
    topics: ['Full request tracing', 'Cost & latency observability', 'An eval suite for your agent', 'Reliability & self-healing'],
    parts: [
      { title: 'Tracing', detail: 'Every model call, tool call and token, recorded and inspectable.' },
      { title: 'Observability', detail: 'Cost and latency as first-class metrics, not afterthoughts.' },
      { title: 'The eval suite', detail: 'Regression tests for your own agent, run before every change.' },
      { title: 'Reliability', detail: 'Bounded retries, graceful degradation, and honest failure.' },
    ],
    outcomes: [
      'Trace an agent end to end and find why it did what it did',
      'Measure cost and latency continuously',
      'Catch regressions with an eval suite you own',
    ],
  },
  {
    n: 12,
    slug: 'week-12-multi-agent-orchestration',
    part: 'Build the Clone',
    title: 'Multi-Agent Orchestration',
    subtitle: 'A team of agents',
    hours: '~6 hours, hands-on',
    ship: 'Your finished Claude Code clone — in your portfolio',
    summary:
      'Sub-agents, parallel orchestration and small focused agents — then final capstone assembly. By Friday you have a complete AI coding agent you built yourself.',
    intro: [
      'One agent with twenty tools gets confused. Several small agents, each with a narrow job and a narrow toolset, do not.',
      'This week you add sub-agents and a task tool that spawns them, parallel orchestration so independent work happens concurrently, and the design discipline of keeping each agent small and focused.',
      'Then we assemble the capstone. By Friday of Week 12 you do not have notes. You have a tool — a complete, working AI coding agent you built from scratch, with streaming chat, a full toolset, semantic codebase search, planning, memory, a secure sandbox, tracing and multi-agent orchestration.',
      'Something real to show, and the deep understanding to explain every line of it.',
    ],
    topics: ['Sub-agents & the Task tool', 'Parallel orchestration', 'Small focused agents', 'Capstone assembly & showcase'],
    parts: [
      { title: 'Sub-agents', detail: 'Spawn a fresh agent with its own context and a narrow toolset.' },
      { title: 'The Task tool', detail: 'Delegation as a first-class tool the main agent can call.' },
      { title: 'Parallel orchestration', detail: 'Independent work runs concurrently and results merge cleanly.' },
      { title: 'Small focused agents', detail: 'Why narrower scope beats a bigger prompt.' },
      { title: 'Capstone assembly', detail: 'Everything from Weeks 4–12, integrated and shipped.' },
    ],
    outcomes: [
      'Decompose work across specialized sub-agents',
      'Orchestrate parallel agent work safely',
      'Ship a complete, portfolio-ready AI coding agent',
    ],
  },
];

export const getWeek = (slug: string) => WEEKS.find((w) => w.slug === slug);
