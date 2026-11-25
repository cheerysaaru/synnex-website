/* Public pages for the sitemap and the prerender step (prints JSON).
   Private pages (/track, /portal, /admin, /login) are left out on purpose. */
import { solutions, news, blog, caseStudies } from '../src/data/site-data.js';

const routes = [
  '/',
  '/about', '/team', '/safety', '/certifications', '/careers',
  '/solutions', ...Object.values(solutions.items).map((s) => `/solutions/${s.slug}`),
  '/case-studies', ...Object.values(caseStudies.items).map((c) => `/case-studies/${c.slug}`),
  '/news', ...news.posts.map((p) => `/news/${p.slug}`),
  '/blog', ...blog.posts.map((p) => `/blog/${p.slug}`),
  '/docs', '/faq', '/resources/safety-checklist', '/resources/solar-guide',
  '/contact', '/cookies',
];

console.log(JSON.stringify(routes));
