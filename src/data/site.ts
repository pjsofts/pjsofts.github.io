export const SITE = {
  name: 'AI Engineering',
  tagline: 'Build an AI agent from scratch',
  url: 'https://pjsofts.github.io',
  description:
    'Learn AI engineering by building and evaluating an agent from scratch. Start with a free Python lab, then explore the 12-week curriculum and live mentorship.',
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
  // Contact for the live mentorship.
  cta: {
    label: 'Message me on LinkedIn',
    href: 'https://www.linkedin.com/in/pouria-jahandideh/',
  },
} as const;

export const NAV = [
  { label: 'Course', href: '/#course' },
  { label: 'Curriculum', href: '/curriculum' },
  { label: 'Certification', href: '/certification' },
  { label: 'Teach', href: '/teach' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructor', href: '/resume' },
] as const;
