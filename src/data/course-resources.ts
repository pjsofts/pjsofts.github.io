export const COURSE = {
  lab: '/labs/first-agent/',
  starter: '/labs/first-agent/v1/first_agent.py',
  demo: '/webinar/ai-agent-workflows/demo/',
  teach: '/teach/',
  slides: '/teach/slides/',
  evalArticle: '/blog/diagram-agent-eval-baseline/',
  repo: 'https://github.com/pjsofts/pjsofts.github.io',
  reportPass: 'https://github.com/pjsofts/pjsofts.github.io/issues/new?template=lab-result.yml',
  reportTeaching: 'https://github.com/pjsofts/pjsofts.github.io/issues/new?template=teaching-use.yml',
} as const;

const workshop1 = 'https://github.com/pjsofts/ai-engineering-1/tree/4c529544ac92511501e8e0d904dbcf9fc7a31c5d';
const workshop2 = 'https://github.com/pjsofts/ai-engineering2/tree/082361bd1a3199d61982f3c87f1e410207339da7';
const workflows = 'https://github.com/pjsofts/ai-agent-workflows/tree/e36c82f6a23ac0a6db9a8d7f583d511b6a5';

export const WEEK_RESOURCES: Partial<Record<number, { label: string; href: string }[]>> = {
  1: [
    { label: 'Start the free Python lab', href: COURSE.lab },
    { label: 'Minimal chat agent source', href: workshop2 },
  ],
  2: [
    { label: 'Try the workflow demo', href: COURSE.demo },
    { label: 'Workflow examples and local replay', href: workflows },
  ],
  3: [{ label: 'Harness workshop', href: `${workshop1}/week3-workshop` }],
  5: [
    { label: 'Read the diagram-agent eval case study', href: COURSE.evalArticle },
    { label: 'Diagram-agent workshop', href: `${workshop2}/week2-diagram-workshop` },
  ],
  6: [
    { label: 'Streaming chat workshop', href: `${workshop1}/week4-workshop` },
    { label: 'Tool-calling workshop', href: `${workshop1}/week5-workshop` },
  ],
  8: [{ label: 'RAG workshop', href: `${workshop1}/week7-rag` }],
  9: [{ label: 'Planning and memory workshop', href: `${workshop1}/week9-planning-memory` }],
};
