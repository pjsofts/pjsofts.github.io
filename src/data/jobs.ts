export interface Job {
  /** Stable slug — used as the anchor id, keep it unchanged once published. */
  slug: string;
  title: string;
  company: string;
  /** Free text. Use 'Not specified' rather than guessing. */
  location: string;
  /** e.g. 'On-site or remote', 'Remote', 'Hybrid'. */
  arrangement: string;
  /** Date the original post went up, YYYY-MM-DD. */
  posted: string;
  /** The LinkedIn post or job link. */
  url: string;
  /**
   * 'open'   — believed to still be live
   * 'closed' — filled, expired, or the link is dead
   *
   * LinkedIn posts get deleted and roles get filled, so entries are written to
   * stand alone without the link. Flip to 'closed' rather than deleting: the
   * archive is the point.
   */
  status: 'open' | 'closed';
  /** One or two sentences on the role. */
  summary: string;
  /** Skills or requirements, as listed by the employer. Not always a tech stack. */
  stack: string[];
  /** Optional logo, root-relative from /public — e.g. '/jobs/algorithm-pouya.png'. */
  logo?: string;
  /** Optional application contact, if the post gave one publicly. */
  contact?: string;
  /** Optional instruction from the employer, e.g. a required email subject line. */
  applyNote?: string;
}

/** Newest first. */
export const JOBS: Job[] = [
  {
    slug: 'fadak-trains-product-designer',
    title: 'Product Designer',
    company: 'Fadak Trains',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/posts/hrm-fadak-trains_aepaexagp-aeqaefaepaezabraepaexagp-fadakabrtrains-share-7484956433676124160-0bAc/',
    status: 'open',
    summary:
      'Fadak Trains is hiring a product designer to own research through delivery — user interviews and surveys, user flows and journey maps, UI for web and mobile, and the design system behind them. The role works closely with product, engineering and branding, and includes usability testing and competitor analysis.',
    stack: [
      'User research',
      'Information architecture',
      'User flows & journey mapping',
      'Prototyping',
      'UI design (web & mobile)',
      'Design systems',
      'Usability testing',
      'Competitor analysis',
    ],
    contact: 'hr@fadaktrains.com',
    applyNote: 'Use the subject line "Product Designer - [Your Name]".',
  },
  {
    slug: 'algorithm-pouya-frontend',
    title: 'Front-End Developer',
    company: 'Algorithm Pouya',
    location: 'Not specified',
    arrangement: 'On-site or remote',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/posts/pouyaerp_aecaezagpaesabraepaesagvaewaezahyaesaetabrafyaewahyaep-share-7485206697427275776-JWn0/',
    status: 'open',
    summary:
      'Algorithm Pouya is expanding its product team and hiring front-end developers to build web applications in Angular. The role can be worked on-site or remotely. Applications are accepted in English.',
    stack: [
      'Angular',
      'TypeScript',
      'NgRx',
      'RxJS',
      'REST APIs',
      'WebSockets',
      'PWA',
      'HTML / CSS / SCSS',
      'Bootstrap or Material',
      'Git',
      'Automated testing',
    ],
    contact: 'payacoweb@gmail.com',
  },
];
