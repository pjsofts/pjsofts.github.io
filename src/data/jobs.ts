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
  // ---------- 2026-09-08 ----------
  {
    slug: 'restar-ai-engineer',
    title: 'AI Engineer',
    company: 'Restar',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Remote',
    posted: '2026-09-08',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7503103732306382848',
    status: 'open',
    summary:
      'An AI engineering role built on a back-end foundation: the post asks first for architecture, system design and database work, then for hands-on agentic development with retrieval and vector stores. Full-time and remote, Saturday to Thursday, 9:00 to 18:00.',
    stack: [
      'Back-end engineering fundamentals', 'Software architecture and system design',
      'Database design', 'Clean Code and SOLID', 'Agentic AI development',
      'RAG', 'Deep Agent', 'LangGraph', 'Vector databases',
    ],
    applyUrl: 'https://t.me/ahengine',
    applyNote: 'Résumés go to the poster on Telegram — there is no email or form.',
  },

  {
    slug: 'telegraphi-senior-ai-engineer',
    title: 'Senior AI Engineer',
    company: 'Telegraphi',
    category: 'AI & Data',
    location: 'Mashhad',
    arrangement: 'On-site',
    posted: '2026-09-08',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7503157680828506113',
    status: 'open',
    summary:
      'Speech and language modelling rather than integration work: training and fine-tuning STT, TTS and LLM models, then optimising and quantising them for inference. The post is explicit that it wants architecture-level depth — reading papers, debugging performance — and not someone who runs pre-built models or wires up an API.',
    stack: [
      'At least 4 years in AI / ML', 'Transformer architectures', 'PyTorch',
      'Training and fine-tuning STT, TTS and LLM models',
      'Model optimisation and quantisation', 'Performance debugging',
      'Reading research papers in English',
    ],
    applyNote:
      'The post asks for a résumé plus samples of technical work, but publishes no address — apply through the poster on LinkedIn. A commenter asked whether the role could be remote; the post does not say.',
  },

  // ---------- 2026-09-06 ----------
  {
    slug: 'azki-ai-enablement-engineer',
    title: 'AI Enablement Engineer',
    company: 'Azki',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-09-06',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7502238165013897216',
    status: 'open',
    summary:
      'A role about getting LLMs, retrieval and agents into the company\'s own engineering practice. The post is short and pointed — it wants an engineer who builds things with AI rather than one who chats with it — and keeps the requirements behind the application link.',
    stack: [
      'Software engineering background', 'LLMs', 'RAG', 'AI agents', 'AI tooling',
    ],
    applyUrl: 'https://lnkd.in/eXN55UPK',
    applyNote: 'The post is a call for candidates and referrals; the full description is behind the link.',
  },

  {
    slug: 'linkup-senior-genai',
    title: 'Senior Generative AI Engineer',
    company: 'Linkup',
    category: 'AI & Data',
    location: 'Relocation required — Armenia, Azerbaijan or similar',
    arrangement: 'On-site after relocation',
    posted: '2026-09-06',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7502292977709637632',
    status: 'open',
    summary:
      'Building real products on LLMs, retrieval and agents, at a stated $1,500–$2,200 a month. Interviews are held online from Iran, but the role itself requires relocating: the post names Armenia, Azerbaijan or comparable countries.',
    stack: [
      'Python', 'LLMs, RAG and agents in production', 'Transformer-based models',
      'Prompt engineering', 'Embeddings and vector databases', 'Semantic search',
      'AI agents and assistants', 'API integration',
      'Fine-tuning, LoRA, PEFT (preferred)', 'LangChain, LlamaIndex (preferred)',
      'MLOps (preferred)', 'Multimodal AI, OCR, computer vision (preferred)',
      'Real-time systems (preferred)', 'Model monitoring (preferred)',
      'Llama / Mistral / Qwen infrastructure (preferred)',
    ],
    applyUrl: 'https://lnkd.in/eQEpvU-t',
    applyNote:
      'Relocation is mandatory for the contract, and the post says employment runs through a contractor intermediary rather than direct hire. Read those terms before applying.',
  },

  // ---------- 2026-09-05 ----------
  {
    slug: 'tunoo-senior-agentic-dev',
    title: 'Senior AI Agentic Developer',
    company: 'Tunoo',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Remote',
    posted: '2026-09-05',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7502021400476639232',
    status: 'open',
    summary:
      'Agentic systems on a Python and FastAPI microservice stack — tool calling, multi-agent workflows and retrieval over a vector store. The post asks specifically for hands-on experience building agentic AI and LLM architectures, not adjacent ML work. Full-time and remote.',
    stack: [
      'Python', 'FastAPI', 'REST APIs', 'LangChain', 'LangGraph', 'RAG',
      'Milvus and other vector databases', 'SQL and NoSQL', 'MCP',
      'Microservice architecture', 'LLM and AI agent development',
      'Tool calling and multi-agent workflows',
    ],
    applyNote: 'Résumés go by direct message to the poster on LinkedIn.',
  },

  // ---------- 2026-08-29 ----------
  {
    slug: 'datin-senior-llm-agentic',
    title: 'Senior LLM & Agentic AI Engineer',
    company: 'Datin (AI solutions unit)',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Remote',
    posted: '2026-08-29',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7499332489534992384',
    status: 'open',
    summary:
      'Turning LLM work into a product instead of a demo: agent architecture, context management, retrieval, evaluation, and the trade-offs between quality, cost, latency and scalability. The post says plainly that connecting an LLM API is not the job. Fully remote.',
    stack: [
      'Python', 'System architecture', 'RAG', 'Agent architecture',
      'Context management', 'Vector databases', 'Deploying AI systems',
      'Model evaluation', 'Quality, cost, latency and scalability trade-offs',
      'Fine-tuning (bonus)', 'Hugging Face (bonus)', 'vLLM (bonus)', 'MCP (bonus)',
      'Multi-agent systems (bonus)', 'GPU optimisation (bonus)', 'LLM security (bonus)',
    ],
    applyUrl: 'https://lnkd.in/dma4wY3m',
  },

  // ---------- 2026-07-26 ----------
  {
    slug: 'snapptrip-data-engineer',
    title: 'Data Engineer',
    company: 'SnappTrip',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-26',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7487035103739588608',
    status: 'open',
    summary:
      'Designing and maintaining scalable batch and streaming data pipelines that feed analytics and operational products on a travel platform, working across a modern lakehouse setup with the product and backend teams.',
    stack: [
      'Python (required)', 'Scala (preferred)', 'Java or Go (a plus)', 'SQL', 'dbt',
      'Apache Spark', 'Trino', 'Kafka, Kafka Connect, Debezium', 'ETL / ELT',
      'PostgreSQL', 'Apache Iceberg / Delta Lake', 'Airflow', 'Kubernetes, Docker, Linux',
      'Grafana, Zabbix', 'Data modelling & distributed systems',
    ],
    applyUrl: 'https://lnkd.in/ew6tjDzE',
  },

  {
    slug: 'iran-credit-scoring-data-analyst',
    title: 'Data Analyst',
    company: 'Iran Credit Scoring',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-07-26',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7487056982428848128',
    status: 'open',
    summary:
      'Analysing large volumes of financial and credit data to find patterns, then presenting them through reports and dashboards to support risk analysis, credit decisions and data-driven product work. At least three years in data analysis is required.',
    stack: [
      '3+ years in data analysis', 'Python (Pandas, NumPy)',
      'SQL & optimised queries', 'Power BI or Tableau', 'Dashboard & report design',
      'Statistics', 'Insight extraction',
    ],
    contact: 'mahmood.yadegari@gmail.com',
  },

  {
    slug: 'tod-game-data-analyst',
    title: 'Game Data Analyst',
    company: 'TOD Game Studio',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'On-site',
    posted: '2026-07-26',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7487136325393874944',
    status: 'open',
    summary:
      'Analysing player behaviour to drive mobile-game growth — KPIs, A/B tests, and retention, monetisation and LiveOps optimisation, working with product, game design and engineering.',
    stack: [
      'Mobile-gaming experience', 'User behaviour analysis', 'KPI analysis',
      'A/B test design & evaluation', 'Retention, monetisation & LiveOps',
    ],
    contact: 'atiyeh@tod.ir',
    applyNote: 'The post asks you to include your experience in mobile games with your resume.',
  },

  {
    slug: 'modalal-hr-data-analyst',
    title: 'HR Data Analyst',
    company: 'Modalal',
    category: 'AI & Data',
    location: 'Tehran',
    arrangement: 'Not specified',
    posted: '2026-07-22',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485627690658541568',
    status: 'open',
    summary:
      'Collecting and analysing HR data to support management decisions — designing KPIs, building reports in Excel and Power BI, and improving the HR information system.',
    stack: [
      '2+ years in data analysis, HRIS or HR analytics',
      'Degree in industrial engineering, statistics, management or computer engineering',
      'Advanced Excel', 'Power BI', 'SQL and reporting tools (preferred)',
      'KPI design', 'Management reporting', 'HRIS concepts',
    ],
    applyNote:
      'The post gives no email, form or link. Nothing in it says how to apply.',
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

  // ---------- 2026-06-28 ----------
  {
    slug: 'snappshop-junior-data-analyst',
    title: 'Junior Data Analyst',
    company: 'SnappShop',
    category: 'AI & Data',
    location: 'Not specified',
    arrangement: 'Not specified',
    posted: '2026-06-28',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7476951136864829440',
    status: 'open',
    summary:
      'A junior data analyst opening — one of the few on the board aimed at people early in their career. The post gives no requirements; they are behind the link.',
    stack: [],
    applyUrl: 'https://lnkd.in/e7XwUSh2',
  },
];
