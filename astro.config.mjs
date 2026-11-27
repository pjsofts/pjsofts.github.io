// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod for each article, from its frontmatter (updatedDate, else pubDate).
// Other pages get the build date, since they change with the curriculum.
const BLOG_DIR = './src/content/blog';
const blogDates = Object.fromEntries(
  readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const fm = readFileSync(`${BLOG_DIR}/${f}`, 'utf8').split('---')[1] ?? '';
      const d = fm.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? fm.match(/^pubDate:\s*(\S+)/m)?.[1];
      return [f.replace(/\.mdx?$/, ''), d];
    })
    .filter(([, d]) => d),
);
const buildDate = new Date().toISOString();

// User/organization GitHub Pages site -> served from the domain root.
export default defineConfig({
  site: 'https://pjsofts.github.io',
  base: '/',
  trailingSlash: 'ignore',
  // The curriculum was reordered in November 2026. Old week URLs keep working.
  redirects: {
    '/curriculum/week-2-evals-and-discipline': '/curriculum/week-5-evals-and-discipline',
    '/curriculum/week-3-the-runtime-harness': '/curriculum/week-3-harness-engineering',
    '/curriculum/week-4-the-chat-interface': '/curriculum/week-6-chat-interface-and-tools',
    '/curriculum/week-5-tools-that-touch-code': '/curriculum/week-6-chat-interface-and-tools',
    '/curriculum/week-6-context-and-prompt-engineering': '/curriculum/week-7-context-and-prompt-engineering',
    '/curriculum/week-7-rag-and-vector-databases': '/curriculum/week-8-rag-and-vector-databases',
    '/curriculum/week-8-planning-and-agent-loops': '/curriculum/week-9-planning-and-memory',
    '/curriculum/week-9-memory-and-sessions': '/curriculum/week-9-planning-and-memory',
    '/curriculum/bonus-background-agents': '/curriculum/week-4-background-agents',
  },
  integrations: [
    mdx(),
    sitemap({
      customPages: ['https://pjsofts.github.io/webinar/ai-agent-workflows/demo/'],
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/?$/)?.[1];
        item.lastmod = slug && blogDates[slug] ? new Date(blogDates[slug]).toISOString() : buildDate;
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: true },
  },
});
