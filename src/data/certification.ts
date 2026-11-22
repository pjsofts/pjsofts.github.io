// Claude Certified Developer – Professional (CCDV-P) study section.
// Domain notes live in src/content/certification and questions in
// ccdvp-questions.json; both are generated from the certified-architect repo
// by scripts/export_site.py. Edit them there, not here.

import questions from './ccdvp-questions.json';

export const CERT = {
  name: 'Claude Certified Developer – Professional',
  code: 'CCDV-P',
  repo: 'https://github.com/pjsofts/claude-certified-developer-guide',
  facts: [
    ['Items', '70 (60 scored, 10 unscored)'],
    ['Format', 'Scenario-based multiple choice and multiple response'],
    ['Time', '120 minutes'],
    ['Passing score', '720 on a 100–1,000 scale'],
    ['Fee', '$175 USD, proctored online or at a Pearson center'],
    ['Prerequisite', 'None (Foundations scope is assumed)'],
    ['Valid for', '12 months, free online renewal'],
  ] as [string, string][],
  rules: [
    {
      t: 'Name the failure class',
      d: 'Rate limit, length stop, refusal, retrieval miss, harness bug, tool bug, bad data. Each needs different handling, so a "retry everything" or "reroute everything" option is usually wrong.',
    },
    {
      t: 'Enforce outside the model',
      d: 'For security and irreversible actions, a prompt instruction is never the boundary. Allowlists, approval gates, scoped credentials and sandboxes are.',
    },
    {
      t: 'Measure before you trust',
      d: 'Judges, AI reviewers, new models and new prompts earn gating authority through calibration, shadow mode, canaries and A/B tests.',
    },
    {
      t: 'Prevent, not just detect',
      d: 'Logging and dashboards matter, but they rarely close an exploit path or fix a regression on their own.',
    },
    {
      t: 'Take the smallest reversible step',
      d: 'Roll back or flip a flag first, then root-cause, then turn the incident into a regression eval and an alert.',
    },
  ],
};

export interface Question {
  id: string;
  domain: number;
  stem: string;
  select?: number;
  options: Record<string, string>;
  answer: string[];
  explanation: string;
}

export const QUESTIONS = questions as Question[];
