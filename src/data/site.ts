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
    jobTitle: 'AI Engineer',
  },
  /** The LinkedIn company page that posts the daily lessons. */
  org: {
    name: 'Pouria Jahandideh Mentoring',
    linkedin: 'https://www.linkedin.com/company/pouria-jahandideh-mentoring/',
    logo: 'https://pjsofts.github.io/logo-mark.png',
  },
  /** Telegram channel where the job board is posted. */
  telegram: {
    handle: '@pjmentoring',
    href: 'https://t.me/pjmentoring',
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
  { label: 'Certification', href: '/certification' },
  { label: 'Webinar', href: '/webinar/job-hunting-ai' },
  { label: 'Blog', href: '/blog' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Instructor', href: '/resume' },
] as const;
