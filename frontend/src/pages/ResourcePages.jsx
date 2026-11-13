/* Resource routes: /blog, /blog/:slug, /docs, /faq,
   /resources/safety-checklist, /resources/solar-guide */
import { useMemo, useState } from 'react';
import {
  PageHero,
  SectionHeading,
  Card,
  Badge,
  CTABand,
  Accordion,
  Prose,
} from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { formatDate } from '../lib/format.js';
import { blog, docs, faq, safetyChecklist, solarGuide, company } from '../data/site-data.js';
import { NotFoundPage } from './MiscPages.jsx';

const ALL = 'All';

/* ---------------------------------------------------------------- Blog --- */

export function BlogPage() {
  const [tag, setTag] = useState(ALL);
  const tags = useMemo(() => [ALL, ...new Set(blog.posts.map((post) => post.tag))], []);
  const posts = tag === ALL ? blog.posts : blog.posts.filter((post) => post.tag === tag);

  useSeo({ title: blog.title, description: blog.intro, path: '/blog' });

  return (
    <>
      <PageHero eyebrow={blog.eyebrow} title={blog.title} intro={blog.intro} />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Filter" title="Browse by topic." />
          <div className="chips" role="group" aria-label="Filter articles by tag">
            {tags.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip${tag === item ? ' on' : ''}`}
                aria-pressed={tag === item}
                onClick={() => setTag(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-3 post-grid">
            {posts.map((post) => (
              <Card key={post.slug} href={`/blog/${post.slug}`} className="post-card">
                <div className="post-meta">
                  <Badge>{post.tag}</Badge>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="post-foot">
                  {post.readTime}
                  <span aria-hidden="true"> →</span>
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTABand intro="Have a question the article did not answer? Ask an engineer." />
    </>
  );
}

export function BlogArticlePage({ slug }) {
  const post = blog.posts.find((item) => item.slug === slug);

  useSeo({
    title: post ? post.title : 'Article not found',
    description: post ? post.excerpt : 'This article could not be found.',
    type: 'article',
    path: `/blog/${slug}`,
  });

  if (!post) return <NotFoundPage />;

  return (
    <>
      <PageHero eyebrow={post.tag} title={post.title} intro={post.excerpt}>
        <p className="post-meta page-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime}</span>
        </p>
      </PageHero>

      <section className="sec">
        <div className="w narrow">
          <div className="notice">
            <h2>Full article coming soon</h2>
            <p>We are finishing this guide. Talk to us if you need the answer now.</p>
          </div>
          <p className="back-link">
            <Link to="/blog">← Back to all articles</Link>
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}

/* ---------------------------------------------------------------- Docs --- */

export function DocsPage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  useSeo({ title: docs.title, description: docs.intro, path: '/docs' });

  const groups = docs.categories
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <PageHero eyebrow={docs.eyebrow} title={docs.title} intro={docs.intro} />

      <section className="sec">
        <div className="w">
          <label className="search">
            <span>Search documents</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title…"
            />
          </label>

          {groups.length === 0 ? (
            <p className="empty-state" role="status">
              No documents match “{query}”.
            </p>
          ) : (
            groups.map((group) => (
              <div className="doc-group" key={group.category}>
                <h2 className="doc-group-title">{group.category}</h2>
                <div className="grid grid-3">
                  {group.items.map((item) => (
                    <Card key={item.title} className="doc-card">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <CTABand intro="Need a specific document or standard reference? Ask us." />
    </>
  );
}

/* ----------------------------------------------------------------- FAQ --- */

export function FaqPage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const items = q
    ? faq.items.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
    : faq.items;

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }),
    [],
  );

  useSeo({ title: faq.title, description: faq.intro, path: '/faq', jsonLd });

  return (
    <>
      <PageHero eyebrow={faq.eyebrow} title={faq.title} intro={faq.intro} />

      <section className="sec">
        <div className="w narrow">
          <label className="search">
            <span>Search questions</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a keyword…"
            />
          </label>

          {items.length === 0 ? (
            <p className="empty-state" role="status">
              No questions match “{query}”. Try another word or contact us below.
            </p>
          ) : (
            <Accordion idPrefix="faq" items={items} />
          )}
        </div>
      </section>

      <CTABand intro="Still unsure? Talk to an engineer — no obligation." />
    </>
  );
}

/* ----------------------------------------------------- Safety checklist --- */

export function SafetyChecklistPage() {
  const [checked, setChecked] = useState(() => safetyChecklist.items.map(() => false));
  const passed = checked.filter(Boolean).length;
  const total = safetyChecklist.items.length;

  useSeo({ title: safetyChecklist.title, description: safetyChecklist.intro, path: '/resources/safety-checklist' });

  const toggle = (index) => {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <>
      <PageHero
        eyebrow={safetyChecklist.eyebrow}
        title={safetyChecklist.title}
        intro={safetyChecklist.intro}
      />

      <section className="sec">
        <div className="w narrow">
          <div className="checklist">
            {safetyChecklist.items.map((item, index) => (
              <label className="check-row" key={item}>
                <input type="checkbox" checked={checked[index]} onChange={() => toggle(index)} />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="check-score" aria-live="polite">
            <strong>
              {passed} of {total} passed
            </strong>
            <span>{passed === total ? 'All checks passed.' : 'Some checks still need attention.'}</span>
          </div>

          {passed < total ? (
            <div className="check-cta">
              <p>{safetyChecklist.note}</p>
              <a className="btn" href={`tel:${company.phoneHref}`}>
                Book an inspection
              </a>
            </div>
          ) : null}

          <p className="note-line">
            Nothing is stored or sent — this checklist runs entirely in your browser.
          </p>
        </div>
      </section>

      <CTABand title="Book a safety inspection" intro="A short visit can catch problems early." />
    </>
  );
}

/* --------------------------------------------------------- Solar guide --- */

export function SolarGuidePage() {
  useSeo({ title: solarGuide.title, description: solarGuide.intro, path: '/resources/solar-guide' });

  return (
    <>
      <PageHero eyebrow={solarGuide.eyebrow} title={solarGuide.title} intro={solarGuide.intro} />

      <section className="sec">
        <div className="w guide-layout">
          <aside className="guide-toc" aria-label="On this page">
            <span className="toc-label">On this page</span>
            <ol>
              {solarGuide.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="guide-body">
            {solarGuide.sections.map((section) => (
              <Prose key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </Prose>
            ))}

            <div className="info-callout">
              <h2>Before you decide</h2>
              <p>{solarGuide.note}</p>
            </div>
          </div>
        </div>
      </section>

      <CTABand title="Plan your solar system" intro="Book a survey for accurate sizing and a clear quote." />
    </>
  );
}
