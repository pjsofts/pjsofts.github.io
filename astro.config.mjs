// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: true },
  },
});
