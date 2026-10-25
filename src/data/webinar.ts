// The free AI Agent Workflows webinar — the landing page and the slide deck both
// read from here, so the date and the agenda only ever change in one place.

export const WEBINAR = {
  slug: 'ai-agent-workflows',
  title: 'AI Agent Workflows',
  tagline: 'From one LLM call to many agents: the patterns, the trade-offs, and how to pick.',
  /** ISO date. The weekday on the page is derived from it, never typed by hand. */
  date: '2026-10-29',
  start: '10:00',
  end: '14:00',
  /** Iran has had no daylight saving since 2022, so the offset is fixed. */
  tz: 'Tehran time',
  tzOffset: '+03:30',
  hours: 4,
  where: 'Online · live',
  price: 'Free',
  /** How people get in: message me, I add them to the Telegram group. */
  join: {
    href: 'https://www.linkedin.com/in/pouria-jahandideh/',
    label: 'Message me to join',
  },
} as const;

/** "Thursday, 27 November 2026", computed in UTC so the build machine's zone can't shift it. */
export const webinarDay = (opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(`${WEBINAR.date}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });

export interface Topic {
  title: string;
  /** One line on the landing page. */
  line: string;
}

export interface Module {
  n: string;
  title: string;
  /** Who decides the next step, in this part of the session. */
  who: string;
  topics: Topic[];
  /** A topology from src/data/topologies.ts that stands for the whole module. */
  diagram: string;
}

export const MODULES: Module[] = [
  {
    n: '01',
    title: 'Agent fundamentals',
    who: 'The parts every agent is made of',
    diagram: 'react',
    topics: [
      { title: 'Reasoning LLMs vs agents', line: 'A model that thinks longer is not an agent. The loop and the tools are.' },
      { title: 'Tools', line: 'Name, description, schema, function. The model proposes, your code executes.' },
      { title: 'MCP & Skills', line: 'One standardises how tools plug in, the other teaches the agent how to work.' },
      { title: 'RAG', line: 'Chunk, embed, retrieve: adding knowledge at query time without retraining.' },
      { title: 'Context', line: 'The window is the agent’s whole world on every call. Budget it.' },
      { title: 'Agent memory', line: 'Short-term state, and the long-term kinds: semantic, episodic, procedural.' },
      { title: 'Planning & reflection', line: 'Break the goal down before acting; check the work before calling it done.' },
    ],
  },
  {
    n: '02',
    title: 'Non-agent workflows',
    who: 'Your code owns the control flow',
    diagram: 'chain',
    topics: [
      { title: 'Prompt chaining', line: 'Fixed steps, each output feeding the next, with gates in between.' },
      { title: 'Routing', line: 'Classify once, then send the input down the path built for it.' },
      { title: 'Parallelization', line: 'Sectioning and voting: many calls at once, then an aggregator.' },
    ],
  },
  {
    n: '03',
    title: 'Single-agent systems',
    who: 'The model picks the next step',
    diagram: 'plan',
    topics: [
      { title: 'ReAct', line: 'Think, act, observe, repeat: the loop under almost every agent.' },
      { title: 'Plan & execute', line: 'Write the whole plan first, run it, replan when reality disagrees.' },
      { title: 'Reflection & self-refining', line: 'Critique and revise, ideally against a signal the model can’t fake.' },
      { title: 'CodeAct', line: 'Actions as code instead of JSON tool calls, inside a sandbox.' },
    ],
  },
  {
    n: '04',
    title: 'Multi-agent systems',
    who: 'Models pick the step, and who takes it',
    diagram: 'supervisor',
    topics: [
      { title: 'Sequential agents', line: 'A pipeline where every stage is a full agent with its own tools.' },
      { title: 'Multi-agent parallelization', line: 'Fan out to agents with separate contexts, then merge.' },
      { title: 'Supervisor', line: 'One agent decomposes the task, delegates, and synthesises.' },
      { title: 'Dispatcher', line: 'Triage the request and hand it to exactly one specialist.' },
      { title: 'Evaluator-optimizer', line: 'A worker and a critic in a loop, with a hard stop.' },
      { title: 'Peer-to-peer', line: 'No coordinator. Powerful, rarely needed, hardest to debug.' },
    ],
  },
  {
    n: '05',
    title: 'Evaluation',
    who: 'Proving any of it works',
    diagram: 'evalopt',
    topics: [
      { title: 'Evaluating agents', line: 'Outcome vs trajectory, pass@k vs pass^k, and a suite built from real failures.' },
    ],
  },
];

export const TOPIC_COUNT = MODULES.reduce((n, m) => n + m.topics.length, 0);
