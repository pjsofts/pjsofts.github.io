// The Design Engineer course: a 10-week path from UI/UX designer to design engineer.
//
// The syllabus follows what design engineer job posts asked for in 2026 (Vercel,
// Linear, and the boards): React + TypeScript + Tailwind, design systems owned
// across Figma and code, motion, accessibility, AI coding tools (Cursor, Claude
// Code, the Figma MCP server), and a portfolio of shipped work rather than mockups.

export type DEWeek = {
  n: number;
  slug: string;
  phase: 'Canvas' | 'Systems' | 'Craft' | 'Ship';
  title: string;
  /** The Figma idea the week starts from. */
  figma: string;
  /** What it becomes in code. */
  code: string;
  summary: string;
  topics: string[];
  build: string;
  ships: string;
};

export const DE = {
  name: 'Design Engineer',
  weeks: 10,
  hours: 6,
  url: 'https://pjsofts.github.io/design-engineer/',
  tagline: 'From Figma to production. Ten weeks.',
  description:
    'A 10-week, cohort-based course for UI/UX designers who want to become design engineers: HTML, CSS, design tokens, React, TypeScript, Tailwind, motion, accessibility and AI coding tools. You finish with three shipped projects, not mockups.',
};

export const PHASES: Record<DEWeek['phase'], { label: string; weeks: string; blurb: string }> = {
  Canvas: { label: 'The browser is your canvas', weeks: '01–03', blurb: 'Layout, type and colour in the medium your designs actually live in.' },
  Systems: { label: 'Components, in code', weeks: '04–06', blurb: 'Interactivity, React and a real design system with tokens and variants.' },
  Craft: { label: 'The details people feel', weeks: '07–08', blurb: 'Motion, accessibility and performance, the work that makes a design engineer worth hiring.' },
  Ship: { label: 'Ship it, get hired', weeks: '09–10', blurb: 'An AI-native workflow, a deployed capstone and a portfolio of shipped work.' },
};

export const DE_WEEKS: DEWeek[] = [
  {
    n: 1,
    slug: 'the-web-is-your-canvas',
    phase: 'Canvas',
    title: 'The web is your canvas',
    figma: 'Frames & layers',
    code: 'HTML & the DOM',
    summary:
      'How a browser turns text into pixels, and why your layers panel was a DOM tree all along. Set up the tools engineers use every day.',
    topics: [
      'Semantic HTML: headings, landmarks, lists, buttons vs links',
      'The DOM as a layer tree; reading any site with DevTools',
      'Editor, terminal and Git basics (commit, branch, push)',
      'Files, folders and how a website is served',
    ],
    build: 'Hand-code your own profile card and personal page from a Figma frame, no frameworks.',
    ships: 'A live page on GitHub Pages, under your name.',
  },
  {
    n: 2,
    slug: 'layout-is-auto-layout',
    phase: 'Canvas',
    title: 'Layout is Auto Layout',
    figma: 'Auto Layout & layout grids',
    code: 'Flexbox, Grid & responsive CSS',
    summary:
      'Auto Layout is Flexbox with a friendlier face. Learn the box model, Flexbox, CSS Grid and how to build layouts that behave at every width.',
    topics: [
      'Box model, spacing and units (px, rem, %, vw, ch)',
      'Flexbox = Auto Layout: direction, gap, alignment, fill vs hug',
      'CSS Grid = layout grids, plus subgrid',
      'Responsive design, media queries and container queries',
    ],
    build: 'Rebuild a real landing page from Figma, pixel-faithful from 360px to 1440px.',
    ships: 'A responsive marketing page that holds up on a phone.',
  },
  {
    n: 3,
    slug: 'type-colour-and-tokens',
    phase: 'Canvas',
    title: 'Type, colour & tokens',
    figma: 'Styles & variables',
    code: 'Custom properties & design tokens',
    summary:
      'Your Figma variables become CSS custom properties. Build a token system with primitive and semantic layers, fluid type and dark mode.',
    topics: [
      'Fluid type with clamp(), variable fonts, line length and rhythm',
      'Modern colour: OKLCH, contrast ratios, colour-mix()',
      'Primitive → semantic → component tokens',
      'Theming and dark mode with one set of variables',
    ],
    build: 'Export your Figma variables and turn them into a working token file that themes a page.',
    ships: 'A themeable token system, light and dark.',
  },
  {
    n: 4,
    slug: 'javascript-for-designers',
    phase: 'Systems',
    title: 'JavaScript for designers',
    figma: 'Prototype interactions',
    code: 'Events, state & TypeScript',
    summary:
      'The logic behind every prototype noodle. Enough JavaScript and TypeScript to make interfaces respond, without drowning in computer science.',
    topics: [
      'Variables, functions, arrays and objects, with UI examples',
      'Events and the DOM: clicks, inputs, keyboard',
      'State: the data a screen is drawn from',
      'TypeScript basics, and reading other people’s code',
    ],
    build: 'Build tabs, an accordion and a filterable list in plain JavaScript.',
    ships: 'Three interactive components that work with keyboard and mouse.',
  },
  {
    n: 5,
    slug: 'react-is-components',
    phase: 'Systems',
    title: 'React is components',
    figma: 'Components & variants',
    code: 'React components & props',
    summary:
      'A Figma component with variants is a React component with props. Learn React the way a designer already thinks: composition, properties and instances.',
    topics: [
      'Components, props (variants) and children (slots)',
      'State, effects and controlled inputs',
      'Lists, conditional UI, empty, loading and error states',
      'Project setup with Vite and Next.js',
    ],
    build: 'Port a set of Figma components into React and assemble a full app screen from them.',
    ships: 'A multi-screen React app built from your own components.',
  },
  {
    n: 6,
    slug: 'design-systems-in-code',
    phase: 'Systems',
    title: 'Design systems in code',
    figma: 'Libraries & Code Connect',
    code: 'Tailwind, shadcn/ui, Radix & Storybook',
    summary:
      'Own the system on both sides. Tailwind as your token layer, Radix and shadcn/ui as accessible foundations, Storybook as the shared library.',
    topics: [
      'Tailwind CSS v4: theme, utilities and when not to use them',
      'Headless primitives: Radix and shadcn/ui',
      'Variant APIs with cva; naming that matches Figma',
      'Storybook docs, and linking Figma to code with Code Connect',
    ],
    build: 'Ship a small design system: tokens, eight components, Storybook docs, mapped to your Figma library.',
    ships: 'Portfolio piece 1: a documented design system.',
  },
  {
    n: 7,
    slug: 'motion-and-interaction',
    phase: 'Craft',
    title: 'Motion & interaction',
    figma: 'Smart Animate',
    code: 'Transitions, springs & Motion',
    summary:
      'Smart Animate, but you control every frame. Easing, springs, gestures and page transitions, and knowing when motion helps and when it gets in the way.',
    topics: [
      'CSS transitions, keyframes and custom easing curves',
      'Springs, gestures and layout animation with Motion',
      'View Transitions API for page and state changes',
      'prefers-reduced-motion and animation performance',
    ],
    build: 'Recreate five micro-interactions from products you admire, then design one of your own.',
    ships: 'A motion study with code people can copy.',
  },
  {
    n: 8,
    slug: 'accessibility-and-performance',
    phase: 'Craft',
    title: 'Accessibility & performance',
    figma: 'Annotations & handoff specs',
    code: 'WCAG, ARIA & Core Web Vitals',
    summary:
      'The details nobody sees in a mockup and everybody feels in a product. Keyboard, focus, screen readers, contrast and speed.',
    topics: [
      'WCAG 2.2 in practice: keyboard, focus and target size',
      'ARIA only when HTML runs out; testing with a screen reader',
      'Images, fonts and Core Web Vitals; Lighthouse audits',
      'Polish: hover, focus, empty states, skeletons, edge cases',
    ],
    build: 'Audit a real public site, write the findings, then fix your own projects to the same bar.',
    ships: 'An accessibility audit case study.',
  },
  {
    n: 9,
    slug: 'the-ai-native-workflow',
    phase: 'Ship',
    title: 'The AI-native workflow',
    figma: 'Figma MCP & Figma Make',
    code: 'Claude Code, Cursor & pull requests',
    summary:
      'AI writes a lot of code now, so taste and review matter more than ever. Drive coding agents from your Figma files, and check what they produce.',
    topics: [
      'Claude Code and Cursor: specs, context and rules files',
      'The Figma MCP server: designs as agent context',
      'Figma Make and v0 for fast prototypes, and their limits',
      'Reviewing AI code, Git branches, pull requests and working with engineers',
    ],
    build: 'Take a Figma feature to a merged pull request with a coding agent, and write up what you changed by hand.',
    ships: 'A feature built with an agent, with your review notes.',
  },
  {
    n: 10,
    slug: 'ship-and-get-hired',
    phase: 'Ship',
    title: 'Ship it & get hired',
    figma: 'Your portfolio',
    code: 'Next.js, deployment & demo day',
    summary:
      'Deploy a real product, tell its story, and prepare for the design engineer interview: take-homes, live UI builds and portfolio reviews.',
    topics: [
      'Next.js routing and fetching real data',
      'Deploying to Vercel, custom domains, previews',
      'Case studies that show process and code',
      'The interview: live UI exercise, take-home and design critique',
    ],
    build: 'Finish and deploy your capstone product, then present it at demo day.',
    ships: 'Portfolio pieces 2 and 3: a shipped product and a rebuilt portfolio.',
  },
];

/** The Figma → code dictionary shown on the page. */
export const DICTIONARY: [string, string][] = [
  ['Frame', '<div> / <section>'],
  ['Auto Layout', 'display: flex'],
  ['Layout grid', 'display: grid'],
  ['Hug / Fill', 'fit-content / flex: 1'],
  ['Constraints', 'responsive units & container queries'],
  ['Variables', 'CSS custom properties'],
  ['Component', 'React component'],
  ['Variant', 'prop'],
  ['Slot / instance swap', 'children'],
  ['Prototype', 'state + events'],
  ['Smart Animate', 'transition / Motion'],
  ['Dev Mode', 'the code itself'],
];

export const DE_FAQ: { q: string; a: string }[] = [
  {
    q: 'I have never written code. Is this for me?',
    a: 'Yes, if you design interfaces already. Week 1 starts from zero: an editor, a terminal and one HTML file. What you need is a working eye for design and about six hours a week.',
  },
  {
    q: 'Will I become a full frontend engineer?',
    a: 'No, and that is the point. A design engineer owns the interface: layout, components, motion, accessibility, the design system. You will not learn databases or backend architecture. You will learn to ship the front of a product to the standard engineers merge.',
  },
  {
    q: 'Why learn to code when AI writes code?',
    a: 'Because AI writes average code fast, and someone has to know what good looks like. Teams hire design engineers to steer tools like Claude Code and the Figma MCP server, then fix the last 20% by hand. You cannot review what you cannot read.',
  },
  {
    q: 'How much time per week?',
    a: 'About six hours: a live session, a workshop and the weekly build. The build is the part that changes you.',
  },
  {
    q: 'Is it cohort-based or self-paced?',
    a: 'Cohort-based, with live sessions, code review and a group of designers making the same jump. The material stays yours afterwards.',
  },
  {
    q: 'What do I need?',
    a: 'A laptop (Mac, Windows or Linux), Figma, and free accounts on GitHub and Vercel. Everything else we install together in Week 1.',
  },
];
