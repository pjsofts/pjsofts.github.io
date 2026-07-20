export const SITE = {
  name: 'AI Engineering',
  tagline: 'Build a Claude Code clone from scratch',
  url: 'https://pjsofts.github.io',
  description:
    'A 12-week hands-on AI engineering mentorship. Build a real AI coding agent from scratch — agent loops, tool calling, evals, RAG, context engineering, sandboxing, memory and multi-agent orchestration. No frameworks.',
  instructor: {
    name: 'Pouria Jahandideh',
    role: 'AI Engineer · Engineering Team Lead',
    linkedin: 'https://www.linkedin.com/in/pouria-jahandideh/',
    email: 'pjsofts@gmail.com',
    location: 'Yerevan, Armenia · Remote',
  },
  // The single call-to-action used across the site.
  cta: {
    label: 'Message me on LinkedIn',
    href: 'https://www.linkedin.com/in/pouria-jahandideh/',
  },
} as const;

export const NAV = [
  { label: 'Course', href: '/#course' },
  { label: 'Curriculum', href: '/curriculum' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructor', href: '/resume' },
] as const;
