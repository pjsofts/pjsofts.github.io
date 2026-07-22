export type JobCategory =
  | 'Engineering'
  | 'AI & Data'
  | 'Design'
  | 'Product'
  | 'Security'
  | 'Media & Creative'
  | 'Business & Ops';

/** Display order of the category sections on /jobs. */
export const CATEGORIES: JobCategory[] = [
  'Engineering',
  'AI & Data',
  'Design',
  'Product',
  'Security',
  'Media & Creative',
  'Business & Ops',
];

export interface Job {
  /** Stable slug — used as the anchor id, keep it unchanged once published. */
  slug: string;
  title: string;
  company: string;
  category: JobCategory;
  /** Free text. 'Not specified' when the post did not say — never inferred. */
  location: string;
  /** e.g. 'On-site', 'Remote', 'Hybrid', 'Not specified'. */
  arrangement: string;
  /** Date the original post went up, YYYY-MM-DD, decoded from the LinkedIn activity ID. */
  posted: string;
  /** The LinkedIn post link. */
  url: string;
  /**
   * 'open'   — believed to still be live
   * 'closed' — filled, expired, or the original post is gone
   *
   * LinkedIn posts get deleted and roles get filled, so entries are written to
   * stand alone without the link. Flip to 'closed' rather than deleting: the
   * archive is the point.
   */
  status: 'open' | 'closed';
  /** One to three sentences on the role. */
  summary: string;
  /** Skills or requirements, as listed by the employer. Not always a tech stack. */
  stack: string[];
  /** Optional logo, root-relative from /public — e.g. '/jobs/algorithm-pouya.png'. */
  logo?: string;
  /** Application email, if the post published one. Rendered as a mailto link. */
  contact?: string;
  /** Application page or form, if the post linked one. */
  applyUrl?: string;
  /** Application instruction or a caveat worth reading before applying. */
  applyNote?: string;
  /** True when the post offers equity/experience instead of a salary. */
  unpaid?: boolean;
}

/** Sorted newest first by the page itself; order here is only for readability. */
export const JOBS: Job[] = [
  // ---------- 2026-07-22 ----------
  {
    slug: 'snapptrip-senior-software-engineer',
    title: 'Senior Software Engineer',
    company: 'SnappTrip',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485617386000220160',
    status: 'open',
    summary:
      'A senior role on a microservices platform — taking on the harder technical problems, mentoring junior engineers, and helping shape both technical direction and product strategy.',
    stack: [
      'Go, Java, Scala or Python', 'Microservice design', 'REST / gRPC',
      'Design patterns', 'Kafka', 'RDBMS', 'Docker', 'CI/CD',
      'Kubernetes, ELK, Redis, MongoDB, Akka (advantage)',
    ],
    applyUrl: 'https://lnkd.in/e_EMqmGT',
  },
  {
    slug: 'tejarat-data-senior-data-engineer',
    title: 'Senior Data Engineer',
    company: 'Data (Tejarat Bank subsidiary)',
    category: 'AI & Data',
    location: 'Tehran',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485582035902869506',
    status: 'open',
    summary:
      'Designing, building and maintaining ETL pipelines that pull data out of banking sources — batch and near-real-time ingestion, cleaning and normalisation, feature engineering, and the monitoring that keeps the jobs honest. Works closely with the modelling and analytics teams.',
    stack: [
      'ETL pipeline design', 'Batch & near-real-time ingestion', 'SQL',
      'Data cleaning & normalisation', 'Feature engineering',
      'Data quality validation', 'Pipeline documentation & automation',
    ],
    contact: 'hr@datatejarat.ir',
    applyNote: 'Put the job title in the email subject line — the post asks for it explicitly.',
  },
  {
    slug: 'exir-pouya-power-bi-developer',
    title: 'Power BI Developer (mid-level)',
    company: 'Exir Pouya System',
    category: 'AI & Data',
    location: 'Tehran',
    arrangement: 'On-site',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485579797864308736',
    status: 'open',
    summary:
      'Designing and building management dashboards on Power BI Report Server for large national holdings and corporations. Full-time under labour law, on-site at various Tehran locations depending on the project.',
    stack: [
      '3–6 years relevant experience', 'Power BI Report Server', 'DAX',
      'Data visualisation & dashboard design', 'ETL in Power Query',
      'DAX Query Editor', 'SSAS Tabular (familiarity)',
    ],
    applyNote:
      'Applications go to a personal Telegram account (@MohammadRezaVafaeie), and the post asks for your expected salary plus a lot of personal detail up front — age, marital status, children, address. Worth knowing before you send it.',
  },
  {
    slug: 'zarrino-senior-data-scientist',
    title: 'Senior Data Scientist',
    company: 'Zarrino',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485590293791186944',
    status: 'open',
    summary:
      'Day-to-day ownership of pricing and monetisation analytics, supporting the rest of the team against unit objectives. The post itself lists no requirements — they are behind the application link.',
    stack: [],
    applyUrl: 'https://lnkd.in/ejzgT56q',
    applyNote: 'The post gives the role only in outline. Requirements are on the linked page.',
  },
  {
    slug: 'melligold-senior-qa-engineer',
    title: 'Senior QA Test Engineer',
    company: 'Melli Gold',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485599027158417408',
    status: 'open',
    summary:
      'Owning QA strategy across web and mobile products — designing both manual and automated test scenarios, and working with product and engineering through the whole product lifecycle.',
    stack: [
      'Minimum 4 years in QA', 'Manual & automated testing',
      'Selenium, Cypress, Playwright or Appium', 'Postman / REST Assured',
      'Jenkins or GitLab CI', 'JavaScript, HTML, CSS', 'Android / iOS',
      'Performance, load & security testing', 'Agile / Scrum',
    ],
    applyNote: 'The post asks for resumes but names no email, form or link — you will need to message the poster.',
  },
  {
    slug: 'tapsi-art-director',
    title: 'Art Director',
    company: 'TAPSI',
    category: 'Media & Creative',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485609588319494145',
    status: 'open',
    summary:
      'Developing and directing the creative idea behind brand campaigns, and owning visual identity and design across media. Works closely with the creative, content and marketing teams.',
    stack: [
      'Art direction, graphic design or advertising experience',
      'Campaign & brand creative direction', 'Visual identity principles',
      'Composition & typography', 'Cross-media design',
      'Giving professional design feedback',
    ],
    applyUrl: 'https://lnkd.in/eeb79Ey5',
  },
  {
    slug: 'unnamed-senior-product-manager-intl',
    title: 'Senior Product Manager',
    company: 'Not named in the post',
    category: 'Product',
    location: 'Tehran / Iran',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485633416630087680',
    status: 'open',
    summary:
      'Leading digital product strategy, development and delivery for international markets — the full lifecycle from discovery through launch, with international clients and cross-functional teams.',
    stack: [
      '5+ years in product management', 'Fluent written & spoken English',
      'International clients & cross-functional teams', 'Agile / Scrum',
      'SaaS, AI or digital products', 'Stakeholder management',
      'Data-driven mindset',
    ],
    contact: 'anahitazm90@gmail.com',
    applyNote: 'The hiring company is not named and applications go to a personal Gmail address. Ask who it is before investing time.',
  },

  // ---------- 2026-07-21 ----------
  {
    slug: 'snapp-group-senior-backend-go',
    title: 'Senior Backend Software Engineer (Go)',
    company: 'Snapp Group',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485255538067308544',
    status: 'open',
    summary:
      'A senior Go backend position at Snapp Group. The post is written as a short creative teaser and carries no requirements or responsibilities — everything concrete is behind the application link.',
    stack: ['Go'],
    applyUrl: 'https://lnkd.in/eC-gd-Us',
    applyNote: 'Snapp Group\'s wider openings are listed at https://lnkd.in/dZNEAhQ5',
  },
  {
    slug: 'farazpardazan-senior-java-backend',
    title: 'Senior Back-End Developer (Java)',
    company: 'Farazpardazan',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485354146267725825',
    status: 'open',
    summary:
      'Building clean, reliable, scalable services for banking and financial projects on Java and Spring Boot.',
    stack: ['Java', 'Spring Boot', 'Scalable service design', 'Banking / fintech domain experience'],
    applyUrl: 'https://lnkd.in/dE_VWRcJ',
  },
  {
    slug: 'talasea-backend-developer',
    title: 'Backend Developer',
    company: 'Talasea',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485274088681316352',
    status: 'open',
    summary:
      'Developing, optimising and maintaining backend services — designing APIs that scale and improving performance at both the application and database layer.',
    stack: [
      'JavaScript', 'Node.js', 'Express.js', 'MongoDB & query optimisation',
      'Redis', 'Git', 'Docker', 'Linux', 'REST APIs', 'Async programming',
      'Nginx, CI/CD, queues (advantage)', 'High-traffic systems (advantage)',
    ],
    contact: 'hr.talasea@gmail.com',
  },
  {
    slug: 'daneshkar-ai-teaching-assistant',
    title: 'Teaching Assistant — Artificial Intelligence',
    company: 'Daneshkar Academy',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Remote, part-time',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485238122750971904',
    status: 'open',
    summary:
      'Supporting AI and machine learning courses — setting and marking exercises, running problem-solving sessions, and mentoring students. Roughly 25–30 hours a month per student group.',
    stack: [
      'Python', 'AI with Python', 'Introductory & advanced machine learning',
      'Deep learning', 'Linear algebra', 'Signal processing', 'Time series',
      'NLP', 'Generative AI fundamentals', 'Git', 'Teaching experience (preferred)',
    ],
    contact: 'hr.daneshkar@gmail.com',
  },
  {
    slug: 'routinesaaz-ui-ux-designer',
    title: 'UI/UX Designer',
    company: 'Routinesaaz',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485382442271444992',
    status: 'open',
    summary:
      'Designing the user experience for a specialised skincare application — simplifying complex user journeys into something practical and engaging.',
    stack: [
      'Digital product design experience', 'Simplifying complex user journeys',
      'Attention to detail', 'Problem-solving orientation',
    ],
    applyNote: 'The post names no email, form or link, and commenters asking how to apply got no reply. Expect to message the poster directly.',
  },
  {
    slug: 'unnamed-fintech-senior-product-designer',
    title: 'Senior Product Designer (2 positions)',
    company: 'Not named in the post',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'On-site, full-time',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485288538943692800',
    status: 'open',
    summary:
      'Two senior product designers for a fintech team, owning the whole design process from research through to execution.',
    stack: ['5–6+ years of real product design experience', 'Full design process, research to execution'],
    applyNote: 'The company is not named and there is no application address — the post asks you to comment or send a direct message.',
  },
  {
    slug: 'taline-pr-events-specialist',
    title: 'PR Events Specialist',
    company: 'TALINE',
    category: 'Business & Ops',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485319032657645568',
    status: 'open',
    summary:
      'Designing and running media, specialist, internal and B2B events end to end — scheduling, budget, suppliers, guests, internal coordination, and finding sponsorship opportunities.',
    stack: [
      'Minimum 5 years running organisational events', 'Managing several projects at once',
      'Organised and detail-oriented', 'Network of organisers, venues & suppliers (advantage)',
      'Press conferences, exhibitions & conferences (advantage)',
    ],
    applyUrl: 'https://careers.taline.ir',
  },

  {
    slug: 'saraf-multi-role',
    title: 'Senior Frontend Developer · Senior DevOps Engineer · Senior Data Analyst · Project Coordinator · HR Talent Development Specialist',
    company: 'Saraf',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/posts/%D9%81%D8%B1%D8%B5%D8%AA%D9%87%D8%A7%DB%8C-%D8%B4%D8%BA%D9%84%DB%8C-%D8%AC%D8%AF%DB%8C%D8%AF-%D8%AF%D8%B1-%D8%B5%D8%B1%D8%A7%D9%81-%D8%B5%D8%B1%D8%A7%D9%81-%D8%A8%D8%B1%D8%A7%DB%8C-%D8%AA%D9%88%D8%B3%D8%B9%D9%87-share-7485292601970049024-2HQO/',
    status: 'open',
    summary:
      'Saraf is hiring across five roles at once, spanning its technical, data, project and HR teams: senior frontend, senior DevOps, senior data analyst, project coordinator, and an HR talent development specialist. The post lists the titles only — every requirement sits behind the application link.',
    stack: [],
    applyUrl: 'https://lnkd.in/eJ4bh8zt',
    applyNote:
      'One post covering five roles across different teams; say which you are applying for. No requirements, location or arrangement appear in the post itself.',
  },
  {
    slug: 'mofid-senior-applied-ai-engineer',
    title: 'Senior Applied AI Engineer',
    company: 'Mofid Securities',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/posts/hosein-toosi-1b6a71271_%D9%85%D8%A7-%D8%AF%D8%B1-%DA%A9%D8%A7%D8%B1%DA%AF%D8%B2%D8%A7%D8%B1%DB%8C-%D9%85%D9%81%DB%8C%D8%AF-%D8%A8%D9%87-%D8%AF%D9%86%D8%A8%D8%A7%D9%84-%DB%8C%DA%A9-senior-applied-share-7485250476301594624-ZqJN/',
    status: 'open',
    summary:
      'Mofid Securities is building an AI financial intelligence platform that lets investors and analysts query complex financial data in natural language. The role is designing and shipping production AI systems against real financial problems — the closest thing on this board to the work this course covers.',
    stack: [
      'LLMs', 'RAG', 'AI agents', 'Vector databases', 'Semantic search',
      'LangGraph', 'Python', 'SQL', 'Production AI system design',
    ],
    contact: 'Hoseintoosi9898@gmail.com',
    applyNote: 'Applications also accepted by LinkedIn DM to the poster, Hosein Toosi.',
  },
  {
    slug: 'algorithm-pouya-frontend',
    title: 'Front-End Developer',
    company: 'Algorithm Pouya',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'On-site or remote',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/posts/pouyaerp_aecaezagpaesabraepaesagvaewaezahyaesaetabrafyaewahyaep-share-7485206697427275776-JWn0/',
    status: 'open',
    summary:
      'Algorithm Pouya is expanding its product team and hiring front-end developers to build web applications in Angular. The role can be worked on-site or remotely. Applications are accepted in English.',
    stack: [
      'Angular', 'TypeScript', 'NgRx', 'RxJS', 'REST APIs', 'WebSockets',
      'PWA', 'HTML / CSS / SCSS', 'Bootstrap or Material', 'Git', 'Automated testing',
    ],
    contact: 'payacoweb@gmail.com',
  },
  {
    slug: 'darukade-video-editor',
    title: 'Video Editor (outsourced)',
    company: 'Darukade',
    category: 'Media & Creative',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-21',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485213780054970369',
    status: 'open',
    summary:
      'Darukade, an online pharmacy, is looking for a video editor for its content production team on an outsourced contract. The work is video editing in Premiere Pro and After Effects.',
    stack: ['Adobe Premiere Pro', 'Adobe After Effects', 'AI tools (advantage)'],
    applyNote: 'Send a resume and portfolio samples to 09010410351 on WhatsApp, Telegram or Bale.',
  },

  // ---------- 2026-07-20 ----------
  {
    slug: 'haji-freelance-laravel-developer',
    title: 'Laravel Developer (mid / senior)',
    company: 'Haji Freelance',
    category: 'Engineering',
    location: 'Applicant must live in Tehran or Karaj',
    arrangement: 'Remote, with at least one in-person meeting a week',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485070828708134912',
    status: 'open',
    summary:
      'Developing and maintaining a PHP/Laravel project as a backend-focused engineer.',
    stack: [
      'PHP', 'Laravel', 'REST API design', 'MySQL, PostgreSQL, MongoDB',
      'Git', 'Design patterns & SOLID', 'Queues, cache, Redis',
      'Debugging & optimisation',
    ],
    applyNote: 'Resumes go to @dvtwi on Telegram. The post sets a deadline of 1405/05/03 (late July 2026).',
  },
  {
    slug: 'tod-game-studio-full-stack',
    title: 'Full Stack Developer',
    company: 'TOD Game Studio',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484963054804369409',
    status: 'open',
    summary:
      'Building and maintaining software products across client and server, inside an agile, product-focused team.',
    stack: [
      'Client-side and server-side development', 'Databases',
      'Building stable, scalable applications', 'Technical problem-solving',
    ],
    contact: 'atiyeh@tod.ir',
  },
  {
    slug: 'unnamed-startup-junior-dotnet',
    title: 'Junior .NET Developer',
    company: 'Not named in the post',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485013950053462016',
    status: 'open',
    summary:
      'A junior position at a startup — C#/.NET development against SQL Server, applying object-oriented principles inside a team. One of the few genuinely entry-level posts on this board.',
    stack: [
      'C# and .NET', 'Basic SQL Server', 'OOP concepts',
      'Willingness to learn, responsibility, teamwork',
      'Portfolio or personal projects (advantage)',
    ],
    applyNote: 'Send your resume and a GitHub or portfolio link by direct message. If you already applied earlier, the poster says not to resend.',
  },

  {
    slug: 'fadak-trains-product-designer',
    title: 'Product Designer',
    company: 'Fadak Trains',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/posts/hrm-fadak-trains_aepaexagp-aeqaefaepaezabraepaexagp-fadakabrtrains-share-7484956433676124160-0bAc/',
    status: 'open',
    summary:
      'Fadak Trains is hiring a product designer to own research through delivery — user interviews and surveys, user flows and journey maps, UI for web and mobile, and the design system behind them. The role works closely with product, engineering and branding, and includes usability testing and competitor analysis.',
    stack: [
      'User research', 'Information architecture', 'User flows & journey mapping',
      'Prototyping', 'UI design (web & mobile)', 'Design systems', 'Usability testing',
      'Competitor analysis',
    ],
    contact: 'hr@fadaktrains.com',
    applyNote: 'Use the subject line "Product Designer - [Your Name]".',
  },
  {
    slug: 'doctorpay-senior-frontend',
    title: 'Senior Frontend Engineer',
    company: 'DoctorPay',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484958212169924608',
    status: 'open',
    summary:
      'DoctorPay is hiring a senior frontend engineer to lead its frontend team, covering both architecture and leadership. The stated stack is React and Next.js.',
    stack: ['React', 'Next.js'],
    applyNote: 'Very short post — send your CV by LinkedIn DM to the poster, Kamyab Farhadi.',
  },
  {
    slug: 'hasin-smart-card-programmer',
    title: 'Smart Card Programmer',
    company: 'Hasin Group',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484919598513893376',
    status: 'open',
    summary:
      'Hasin Group is hiring a smart card programmer. The post itself carries no description of duties or required skills — all detail sits behind the application form.',
    stack: [],
    applyUrl: 'https://lnkd.in/eQXctdXS',
    applyNote: 'Working conditions and requirements are only on the linked form.',
  },
  {
    slug: 'uiux-designer-intern',
    title: 'UI/UX Designer Intern',
    company: 'Undisclosed — design studio',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485017685706293249',
    status: 'open',
    summary:
      'An internship for someone interested in interface and user experience design who wants to learn through real projects. No qualifications, tools, duration or compensation are listed.',
    stack: [],
    contact: 'limrodvp@gmail.com',
    applyNote:
      'Company is not named anywhere in the post and the contact is a personal Gmail address plus a Telegram handle (@mroorg). Ask who the employer is before sending work.',
  },
  {
    slug: 'mohak-uiux-designer',
    title: 'UI/UX Designer (mid-level)',
    company: 'Mohak Software Group',
    category: 'Design',
    location: 'Mashhad, Iran',
    arrangement: 'On-site, full-time',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484934230884528128',
    status: 'open',
    summary:
      'Mohak is hiring a mid-level UI/UX designer for whom product design is more than arranging pixels. The role requires experience designing enterprise/SaaS products and working within a design system.',
    stack: ['UI/UX design', 'Enterprise/SaaS product design', 'Design systems', 'Figma'],
    applyUrl: 'https://jobinja.ir/1484880',
    applyNote: 'Send a resume and portfolio. "Figma" comes from the post hashtags rather than the body.',
  },
  {
    slug: 'extreme-walls-creative',
    title: 'Senior Graphic Designer · Video Specialist · Print Supervisor · Senior Campaign Specialist',
    company: 'Extreme Walls',
    category: 'Media & Creative',
    location: 'West Tehran, Iran Khodro intersection',
    arrangement: 'On-site',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484867458567430145',
    status: 'open',
    summary:
      'Extreme Walls is hiring across four creative roles to develop its brand and content output. The post gives job titles only — no requirements or per-role descriptions.',
    stack: [],
    contact: 'farkhamse1404@gmail.com',
    applyNote: 'One post covering four separate roles. Say which you are applying for; send a portfolio.',
  },
  {
    slug: 'mirana-senior-frontend',
    title: 'Senior Front-End Engineer',
    company: 'Mirana',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484861570418835457',
    status: 'open',
    summary:
      'Mirana is hiring a senior front-end engineer. The headline requirements are hands-on Web3 experience and expert-level React, TypeScript and Next.js, plus scalable architecture, security and component design.',
    stack: ['Web3', 'React', 'TypeScript', 'Next.js', 'Scalable architecture', 'Security', 'Component design'],
    applyUrl: 'https://mirana.ir/jobs/651',
  },
  {
    slug: 'currency-exchange-multi-role',
    title: 'Senior Frontend (React) · Product Manager · PMO · General Manager · C&B · Legal · Senior IT',
    company: 'Undisclosed — currency exchange',
    category: 'Business & Ops',
    location: 'Tehran, Shariati',
    arrangement: 'On-site',
    posted: '2026-07-20',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484843558047363072',
    status: 'open',
    summary:
      'A recruiter is sourcing for a currency-exchange business near Shariati across seven roles spanning engineering, product, management, HR compensation, legal and IT. Only job titles are given — no requirements for any of them.',
    stack: [],
    applyNote:
      'Recruiter post; the company is deliberately not named and no role has a description. Ask which company it is before investing time.',
  },

  // ---------- 2026-07-19 ----------
  {
    slug: 'surena-oracle-apex',
    title: 'Senior Oracle APEX Developer',
    company: 'Surena Software',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484595235419820032',
    status: 'open',
    summary:
      'Building and maintaining organizational systems: developing new systems, fixing bugs, optimizing existing platforms, implementing forms and dashboards, and integrating systems across Oracle technologies.',
    stack: ['Oracle APEX', 'PL/SQL', 'Oracle Database', 'Database design', 'Systems integration'],
    contact: 'hr.itsurena@gmail.com',
  },
  {
    slug: 'data-senior-data-engineer',
    title: 'Senior Data Engineer',
    company: 'DATA (Data Tejarat)',
    category: 'AI & Data',
    location: 'Tehran',
    arrangement: 'Full-time, arrangement not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484509857270874112',
    status: 'open',
    summary:
      'Design, build and maintain ETL pipelines across batch and near-real-time ingestion; cleanse, validate and standardize data across staging and processed layers; implement analytical features in SQL and data-quality checks; document pipelines and monitor jobs.',
    stack: ['ETL', 'SQL', 'Airflow', 'Data pipelines', 'Data quality'],
    contact: 'hr@datatejarat.ir',
    applyNote: 'Include the job title in the email subject line.',
  },
  {
    slug: 'kian-motion-graphics',
    title: 'Motion Graphics Specialist',
    company: 'Kian Trading Development Brokerage',
    category: 'Media & Creative',
    location: 'Tehran, Argentina Square',
    arrangement: 'On-site, full-time',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484581047544909824',
    status: 'open',
    summary:
      'Producing video content and developing creative concepts alongside a professional video production team. Capital markets knowledge is listed as an advantage rather than a requirement.',
    stack: ['Adobe After Effects', 'Adobe Premiere Pro', 'Video editing', 'Videography', 'AI video tools'],
    contact: 'HR@Kian.trade',
  },
  {
    slug: 'ritoon-qa-analyst',
    title: 'QA / Software Analyst',
    company: 'Ritoon',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484602369490649088',
    status: 'open',
    summary:
      'Ritoon, an insurtech company, is hiring an analyst/tester to turn business requirements into development tasks, design and run test cases for web services and UI, write bug reports, and document processes in Jira while working with designers in Figma.',
    stack: ['Jira', 'API testing', 'Postman', 'Figma', 'Test case design', 'Technical documentation'],
    contact: 'Prs.abachi.79@gmail.com',
    applyNote: 'Commenters asked about location and remote work; the post gives no answer.',
  },
  {
    slug: 'snapp-product-manager-superapp',
    title: 'Product Manager (SuperApp)',
    company: 'Snapp',
    category: 'Product',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484604732750221313',
    status: 'open',
    summary:
      'A result-oriented product manager role on a SuperApp, pitched as work whose results reach millions of daily users. The post is a teaser — the substantive job description is on the linked page.',
    stack: [],
    applyUrl: 'https://lnkd.in/dFju935Z',
    applyNote: 'The company name is inferred from the post hashtags rather than stated in the body.',
  },
  {
    slug: 'snappshop-commercial-data-analyst',
    title: 'Commercial Data Analyst',
    company: 'SnappShop',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484532734493822976',
    status: 'open',
    summary:
      'SnappShop is hiring a commercial data analyst. The post is an invitation rather than a specification — no requirements, location or arrangement appear in it.',
    stack: [],
    applyUrl: 'https://lnkd.in/ejnS9hwz',
  },
  {
    slug: 'itoll-frontend',
    title: 'Front-End Developer',
    company: 'iToll',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-19',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484537736406847488',
    status: 'open',
    summary:
      'iToll is hiring a front-end developer to build and optimize scalable products, with an emphasis on fast, user-centric interfaces.',
    stack: ['React', 'Next.js'],
    applyUrl: 'https://itoll.com/jobs',
    applyNote: 'A commenter asked whether remote is possible and received no visible answer.',
  },

  // ---------- 2026-07-18 ----------
  {
    slug: 'fertility-centre-technical-team-lead',
    title: 'Technical Team Lead',
    company: 'Not named in the post (a fertility clinic)',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484179240901406720',
    status: 'open',
    summary:
      'Building out an agile, scalable technical team at a fertility clinic — a hands-on development background combined with team leadership and scalable system architecture.',
    stack: ['Strong software development ability', 'Technical team leadership', 'Scalable system architecture'],
    applyNote: 'The organisation is not named and the only contact route is a phone number. Ask who it is before investing time.',
  },
  {
    slug: 'unnamed-ui-ux-wordpress-audit',
    title: 'UI/UX Specialist (project-based)',
    company: 'Not named in the post',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'Remote',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484169814052179968',
    status: 'closed',
    summary:
      'A project-based UX audit and optimisation of an existing WordPress site — reviewing user journeys, analysing navigation, and improving page structure and conversion paths.',
    stack: ['Proven UI/UX experience', 'UX audit', 'Figma', 'Portfolio of live sites', 'CRO (strong advantage)'],
    applyNote: 'Kept for the archive — the hiring manager posted two days later that the role was filled.',
  },

  {
    slug: 'sanaap-assistant-product-manager',
    title: 'Assistant Product Manager',
    company: 'Sanaap',
    category: 'Product',
    location: 'Tehran, Yousefabad',
    arrangement: 'On-site, Sat–Wed 09:00–18:00',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484225269587918848',
    status: 'open',
    summary:
      'Working alongside Sanaap\'s product team on analyzing problems and translating business needs into executable solutions, with engineering, design and business stakeholders. Requires at least one year in a product-related role.',
    stack: ['Agile', 'Scrum', 'Requirements documentation', 'User stories with acceptance criteria'],
    contact: 'hr.sanaap@gmail.com',
    applyNote: 'Sanaap (insurtech) — not Snapp. Applications also accepted by LinkedIn DM.',
  },
  {
    slug: 'saman-insurance-office-admin',
    title: 'Management Office Administrator',
    company: 'Saman Insurance',
    category: 'Business & Ops',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484194775055847424',
    status: 'open',
    summary:
      'Running the management office\'s affairs and communications: drafting letters and reports, circulating administrative directives, handling calls and coordinating management meetings. A non-technical administrative role.',
    stack: ['Administrative correspondence', 'English language', 'Coordination'],
    applyUrl: 'https://zaya.io/e59jb',
  },
  {
    slug: 'modai-ai-software-engineer',
    title: 'AI Software Engineer',
    company: 'ModAI',
    category: 'AI & Data',
    location: 'Tehran',
    arrangement: 'Hybrid, full-time',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484220881326522368',
    status: 'open',
    summary:
      'Designing, developing and shipping AI-powered capabilities in real products. The post explicitly weights genuine interest in learning, accountability and problem-solving above extensive prior experience.',
    stack: [
      'Python', 'Machine Learning', 'Deep Learning', 'LLMs', 'VLMs', 'Docker',
      'API development', 'Asynchronous processing', 'Message queues', 'Git',
    ],
    applyNote: 'Resumes by LinkedIn DM to Farshad Sangari; a commenter asked for an email and none was given.',
  },
  {
    slug: 'taline-talent-acquisition',
    title: 'Senior Talent Acquisition Specialist',
    company: 'Taline',
    category: 'Business & Ops',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484177330811219968',
    status: 'open',
    summary:
      'Taline is hiring a senior talent acquisition specialist, framing the role as building a precise, professional team rather than running an administrative process. No requirements beyond prior recruitment experience.',
    stack: [],
    applyNote: 'The post publishes no contact address — apply via the original post.',
  },
  {
    slug: 'yara-security-intern',
    title: 'Network & Cybersecurity Intern',
    company: 'Yara Intelligent Cybersecurity',
    category: 'Security',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484138022414811136',
    status: 'open',
    summary:
      'An internship training on real projects alongside cybersecurity specialists, with possible permanent employment after evaluation. Requires a degree in CS, IT or information security, networking fundamentals, and Windows and Linux knowledge.',
    stack: [
      'TCP/IP', 'Routing & switching', 'DNS', 'DHCP', 'Windows', 'Linux',
      'Fortinet', 'VMware', 'Kali Linux', 'Nmap', 'Wireshark', 'Active Directory',
    ],
    contact: 'info@yarasec.com',
    applyNote: 'Fortinet, VMware, Kali, Nmap, Wireshark, AD and certifications are bonuses, not requirements.',
  },
  {
    slug: 'amnpardazan-kavir-ai-engineer',
    title: 'AI Engineer',
    company: 'Amnpardazan Kavir',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484194706143252481',
    status: 'open',
    summary:
      'Owning the whole data path for the Data and AI team — collection and processing through to feeding models and deploying to production — building scalable pipelines optimized for accuracy, latency and cost.',
    stack: ['Python', 'LLMs', 'LangChain', 'LangGraph', 'Vector databases', 'RAG', 'Agent workflows'],
    applyUrl: 'https://lnkd.in/dXPSyrYb',
  },
  {
    slug: 'chargoon-backend',
    title: 'Back-End Developer',
    company: 'Chargoon',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484193375445929985',
    status: 'open',
    summary:
      'An open seat on Chargoon\'s technical team for a back-end developer with 3–5 years of experience. Written informally by a team member, emphasizing problem-solving, system optimization and teamwork.',
    stack: ['C#', '.NET', 'RESTful APIs', 'SQL', 'Dapper', 'ORMs', 'OOP', 'Design patterns'],
    applyNote: 'The post publishes no contact address — reply to the poster via the original post.',
  },
  {
    slug: 'abramed-devops',
    title: 'DevOps Engineer (senior or mid-level)',
    company: 'Abramed',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-18',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7484161206266654720',
    status: 'open',
    summary:
      'The Abramed AI team needs a senior or mid-level DevOps engineer. A short referral request — no requirements, skills, location or arrangement are stated.',
    stack: [],
    applyUrl: 'https://lnkd.in/eVG_-DF7',
    applyNote: 'Select "ml platform" as the job category when submitting.',
  },

  // ---------- 2026-07-16 ----------
  {
    slug: 'snapmarket-data-engineer',
    title: 'Data Engineer',
    company: 'SnapMarket',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-16',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7483471215752470529',
    status: 'open',
    summary:
      'SnapMarket\'s data engineering team is hiring a data engineer to work on large-scale data infrastructure. No skills or requirements appear in the post body — the detail is behind the application link.',
    stack: [],
    applyUrl: 'https://lnkd.in/eSFX5Ru3',
  },
  {
    slug: 'mirtello-frontend-backend',
    title: 'Frontend Developer & Backend Developer',
    company: 'Mirtello (early-stage startup)',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-16',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7483496910591410176',
    status: 'open',
    unpaid: true,
    summary:
      'A founder is recruiting a frontend developer (Next.js, React) and a backend developer (Node, Express, MongoDB) to help build the Mirtello startup on a MERN stack. The post states plainly that the main parts are already built.',
    stack: ['Next.js', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'MERN'],
    applyNote:
      'No salary. The post states outright that there is currently no ability to pay and that collaboration is co-founder / equity only.',
  },

  // ---------- 2026-07-14 ----------
  {
    slug: 'pingotrip-senior-backend',
    title: 'Senior Backend Developer',
    company: 'PingoTrip',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-14',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7482726662812536832',
    status: 'open',
    summary:
      'Backend service development, infrastructure improvement, architecture design and building a stable product. The post is an invitation — detailed requirements live behind the application link.',
    stack: [],
    applyUrl: 'https://lnkd.in/eFbMQVgv',
    applyNote: 'A comment mentions Mashhad, but the post itself states no location.',
  },

  {
    slug: 'zeevision-kotlin-android',
    title: 'Kotlin Android Developer',
    company: 'Zeevision',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Project-based / hourly contract',
    posted: '2026-07-14',
    url: 'https://www.linkedin.com/posts/%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D9%87-%D9%86%D9%88%DB%8C%D8%B3-%D8%A7%D9%86%D8%AF%D8%B1%D9%88%DB%8C%D8%AF-%DA%A9%D8%A7%D8%AA%D9%84%DB%8C%D9%86-kotlin-android-share-7482700475746680833-FwwH/',
    status: 'open',
    summary:
      'Zeevision is hiring an Android developer working in Kotlin, with an emphasis on shipping to the Iranian Android marketplaces. The engagement is project-based or hourly rather than a salaried position.',
    stack: [
      'Kotlin', 'Jetpack Compose', 'Navigation', 'DataStore', 'MVVM', 'MVI',
      'Git', 'Jira', 'TWA & PWA', 'Testing', 'Java Native (advantage)',
    ],
    applyNote:
      'Contract work, not a salaried role. Resumes go to Telegram @zeevision_contact — the post publishes no email or application form.',
  },

  // ---------- 2026-07-13 ----------
  {
    slug: 'faash-java-backend',
    title: 'Back-End Developer (Java)',
    company: 'Faash Corporation',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-13',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7482342996248723456',
    status: 'open',
    summary:
      'Designing and building distributed, scalable web services, plus maintaining and supporting existing systems, working with QA, product management and UI/UX.',
    stack: [
      'Java', 'Jakarta EE', 'Spring', 'Spring Boot', 'OOP', 'RESTful APIs',
      'SOLID', 'Git', 'RDBMS', 'Oracle Database', 'Design patterns', 'Security & cryptography',
    ],
    contact: 'F.arabi@faash.co',
    applyNote: 'Jira, Scrum and Docker are listed as nice-to-haves rather than requirements.',
  },

  // ---------- 2026-07-12 ----------
  {
    slug: 'technolife-senior-devops',
    title: 'Senior DevOps Engineer',
    company: 'Technolife',
    category: 'Engineering',
    location: 'Tehran',
    arrangement: 'On-site',
    posted: '2026-07-12',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7482078275444486144',
    status: 'open',
    summary:
      'Designing and implementing CI/CD pipelines, automating deployment and infrastructure management, building monitoring for high availability, and troubleshooting infrastructure issues. Requires 5+ years of DevOps experience.',
    stack: [
      'Docker', 'Kubernetes', 'GitLab', 'Jenkins', 'Bash', 'Ansible',
      'Python', 'Prometheus', 'Grafana', 'Cloud infrastructure',
    ],
    applyUrl: 'https://lnkd.in/ebEAcTru',
  },

  // ---------- 2026-07-10 ----------
  {
    slug: 'karaj-team-lead-software-engineering',
    title: 'Team Lead, Software Engineering',
    company: 'Not named in the post',
    category: 'Engineering',
    location: 'Karaj',
    arrangement: 'On-site, full-time',
    posted: '2026-07-10',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7481243218270048257',
    status: 'open',
    summary:
      'Leading a software team — system architecture, code review, mentoring, and coordination with the analysis team.',
    stack: [
      'C# and .NET', 'Next.js & front-end concepts', 'Software architecture',
      'Prior team lead or senior developer experience', 'Git', 'REST API design',
      'SQL Server', 'Team management & technical decision-making',
    ],
    contact: 'kaveh.norozi@gmail.com',
    applyNote: 'The company is not named and applications go to a personal Gmail address.',
  },

  // ---------- 2026-07-08 ----------
  {
    slug: 'ecommerce-devops-sre',
    title: 'Senior DevOps Engineer / Senior SRE',
    company: 'Undisclosed — e-commerce',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-08',
    url: 'https://www.linkedin.com/posts/nahid-abdollahi-33530a1a0_aexaehaewaesabraeqaevabraevaetagpaepaezahy-share-7480539579851399170-oWdP/',
    status: 'open',
    summary:
      'A recruiter post for an e-commerce company hiring two senior infrastructure roles — DevOps and SRE. The company is not named and the post lists no specific requirements beyond professional experience in the relevant area.',
    stack: [],
    contact: 'Hauntertalent@gmail.com',
    applyNote: 'Posted by a recruiter, not the employer. Ask which company it is before investing time.',
  },

  // ---------- 2026-07-05 ----------
  {
    slug: 'danacloud-product-designer',
    title: 'Product Designer (mid-level)',
    company: 'DanaCloud',
    category: 'Design',
    location: 'Not specified',
    arrangement: 'Remote, full-time',
    posted: '2026-07-05',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7479554167829839872',
    status: 'open',
    summary:
      'Turning complex cloud infrastructure concepts into a usable product — balancing a deep technical stack against the user experience. The team says it weighs how you think and approach problems above ticking every box.',
    stack: [
      'Analytical mindset', 'Translating technical concepts into design',
      'Defending design decisions with logic and data',
      'Effective use of AI tools in the design process',
      'Collaboration with product and engineering',
    ],
    contact: 'm.haq@danacloud.com',
  },

  // ---------- 2026-06-30 ----------
  {
    slug: 'taline-senior-talent-acquisition',
    title: 'Senior Talent Acquisition Specialist',
    company: 'TALINE',
    category: 'Business & Ops',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-06-30',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7477655999345139712',
    status: 'open',
    summary:
      'Recruitment treated as team-building rather than paperwork — finding talent that brings a different perspective and experience into the product team.',
    stack: ['Recruitment / talent acquisition experience', 'Team-building perspective on hiring'],
    applyUrl: 'https://careers.taline.ir',
  },

  // ---------- 2026-06-29 ----------
  {
    slug: 'taline-product-engineering-marketing',
    title: 'Senior Product Manager, Senior Software Engineer & Marketing Automation Specialist',
    company: 'TALINE',
    category: 'Engineering',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-06-29',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7477249668243070976',
    status: 'open',
    summary:
      'Three openings in one post — product, engineering and marketing automation. The post itself stays high-level; each role\'s description sits on the careers page.',
    stack: ['Analytical and creative perspective', 'Problem-solving in complex products', 'Focus on user behaviour'],
    applyUrl: 'https://careers.taline.ir',
    applyNote: 'Three separate roles behind one link — open each position on the careers page.',
  },
  {
    slug: 'unnamed-ai-ml-engineer-international',
    title: 'AI/ML Engineer',
    company: 'Not named in the post',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Remote',
    posted: '2026-06-29',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7477262147245248512',
    status: 'open',
    summary:
      'Full-time remote AI/ML work with international companies. English at B2 or above is required, including interviews and meetings conducted in English.',
    stack: [
      '5+ years professional AI/ML experience', 'Python', 'PyTorch or TensorFlow',
      'LLMs, generative AI, RAG or AI agents (advantage)', 'English at B2 or above',
    ],
    applyUrl: 'https://lnkd.in/gV7z8E3f',
    applyNote: 'The company is not named and applications run through Telegram. Ask who the employer is before going far.',
  },

  // ---------- 2026-06-23 ----------
  {
    slug: 'digikala-senior-engineers',
    title: 'Senior Frontend Engineer & Senior Software Engineer (Backend)',
    company: 'Digikala',
    category: 'Engineering',
    location: 'Vanak, Tehran',
    arrangement: 'On-site',
    posted: '2026-06-23',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7475168532180377601',
    status: 'open',
    summary:
      'Two senior positions in the core of Digikala\'s technology team. Both require at least five years of professional software development experience, with deep expertise in frontend development or software architecture respectively. Experience with generative AI tools is listed as an advantage.',
    stack: ['Frontend development', 'Software architecture', 'Generative AI tools (advantage)'],
    applyUrl: 'https://lnkd.in/da-BedgP',
    applyNote: 'Separate links per role — frontend above; backend at https://lnkd.in/dJMmWmxP. Oldest post on the board.',
  },
];
