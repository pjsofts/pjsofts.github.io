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
  /** Technical requirements, as listed by the employer. */
  stack: string[];
  /** Optional logo, root-relative from /public — e.g. '/jobs/algorithm-pouya.png'. */
  logo?: string;
  /** Optional application contact, if the post gave one publicly. */
  contact?: string;
}

/** Newest first. */
export const JOBS: Job[] = [
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
