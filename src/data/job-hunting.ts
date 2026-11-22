import { SITE } from './site';

// The free Job Hunting in the Age of AI webinar. The agenda below is the
// published syllabus (5 sections, 17 topics) — the landing page and the slide deck both read from here.
export const W = {
  slug: 'job-hunting-ai',
  title: 'Job Hunting in the Age of AI',
  /** ISO date: پنجشنبه ۵ آذر ۱۴۰۵. The weekday is derived from it, never typed. */
  date: '2026-11-26',
  start: '10:00',
  end: '14:00',
  tz: 'Tehran time',
  tzOffset: '+03:30',
  hours: 4,
  where: 'Online · live',
  price: 'Free',
  join: { href: SITE.instructor.linkedin, label: 'Message me to join' },
} as const;

export const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Date(`${W.date}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
export const day = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const dayShort = fmt({ weekday: 'short', day: 'numeric', month: 'short' });

export const KIT = 'https://github.com/Vets-Who-Code/ai-era-job-kit';

export interface Topic { title: string; line: string }
export interface Section { n: string; title: string; reader: string; topics: Topic[]; leave: string; tools: string[] }

export const SECTIONS: Section[] = [
  {
    n: '01',
    title: 'Introduction',
    reader: 'You, setting up the system',
    topics: [
      {
        title: 'Claude Code Job Tool Kit',
        line: 'An open-source kit of skills, agents and scripts that scores your resume, LinkedIn, GitHub and portfolio, then tells you what to fix first. We install it together and run /job-hunt.',
      },
    ],
    leave: 'The kit installed and your first /job-hunt run.',
    tools: ['/job-hunt', 'career-scorecard'],
  },
  {
    n: '02',
    title: 'Resume & ATS',
    reader: 'Read by the ATS and its AI ranker',
    topics: [
      { title: 'The Tech Job Market', line: 'Layoffs are real and so is demand: BLS projects ~106k developer openings a year. Hiring runs in seasons, and late November is when you build for the January surge.' },
      { title: 'Who Reads Your Resume', line: 'An AI-powered ATS, then a hiring manager, then the dev team. Each one only sees what the one before it let through.' },
      { title: 'Building Your Resume', line: 'Write one complete record first, then cut lane resumes from it. Action, context, result, and a link to proof on every strong line.' },
      { title: 'Scoring Your Resume', line: 'Every skill graded proven, applied, listed, stale or none against live O*NET and BLS data, plus an A–D Screen Grade per posting.' },
      { title: 'How Applicant Tracking Systems Work', line: 'Knockouts, parse, search and filter, AI rank, then a human. What breaks the parser, and what a Workday or Greenhouse grade actually means.' },
      { title: 'ATS Strategies', line: 'Decode the posting, mirror its words where it is honest, prove each keyword in the same line. And why hidden text and stuffing now backfire.' },
    ],
    leave: 'A parse-tested resume with a lane score and a Screen Grade for one real posting.',
    tools: ['resume-scorer', 'ats-screener', 'resume-rebuilder'],
  },
  {
    n: '03',
    title: 'Portfolios and Projects',
    reader: 'Read by the dev team',
    topics: [
      { title: 'Portfolio: Single Source of Truth', line: 'Your resume, LinkedIn and GitHub are all generated from one record, with a Brag Database inside it. Fix the record, then regenerate everything.' },
      { title: 'Github Portfolios & Projects', line: 'Pin only finished repos. Climb the depth ladder: local, deployed, tests and a decision record, real users. Show specs, harnesses and evals.' },
    ],
    leave: 'A Brag Database started, pins chosen, and GitHub and portfolio scores.',
    tools: ['github-scorer', 'portfolio-scorer', 'brag-curator', 'dev-team-reviewer'],
  },
  {
    n: '04',
    title: 'Linkedin',
    reader: 'Read by recruiters',
    topics: [
      { title: 'Linkedin & Dice', line: 'Apply on Dice, get found on LinkedIn. How each platform’s recruiter search and filters work, and how to set both up to rank.' },
      { title: 'Linkedin Profile', line: 'Photo, headline with your target role, Open to Work for recruiters, an About that ends with an ask, and Featured as your portfolio.' },
      { title: 'Experience Projects & Linkedin', line: 'Same titles, dates and skills as your resume. Every role written as impact, with demos and repos pinned to the role they came from.' },
    ],
    leave: 'A LinkedIn score against the same target as your resume, and a fix list.',
    tools: ['linkedin-scorer', 'recruiter-screen', 'composite-scorer'],
  },
  {
    n: '05',
    title: 'AI Job Search Tools',
    reader: 'Read by AI screeners, then by you',
    topics: [
      { title: 'AI Interviewers & Phone Screening', line: 'What AI interviewers score (your transcript against a rubric) and what they shouldn’t. Answer to the rubric, say “I” not “we”, and defend every line.' },
      { title: 'AI Tools For Job Search', line: 'Use agents for research, company briefs, rubrics, mock screens and tracking. Never for mass submission, and never to invent experience.' },
      { title: 'Funnel & Postmortems', line: 'Track every application by channel. Find the stage where you drop, fix that layer, and run a blameless postmortem on every loss.' },
      { title: 'Four Rules When the Offer Comes', line: 'Ask for 48 hours, get it in writing, negotiate base first, and know your alternative before you counter.' },
      { title: 'Advice for Junior Engineers', line: 'Build visible proof, learn in public, apply with intention, and review the process every week.' },
    ],
    leave: 'A mock AI screen on your own resume, a funnel tracker and an offer matrix.',
    tools: ['ai-interviewer', 'final-round-panel', '/mock-screen'],
  },
];

export const TOPIC_COUNT = SECTIONS.reduce((n, s) => n + s.topics.length, 0);
