/* News routes: /news (list + tag filter) and /news/:slug (article stub) */
import { useMemo, useState } from 'react';
import { PageHero, SectionHeading, Card, Badge, CTABand, Placeholder } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { formatDate } from '../lib/format.js';
import { news } from '../data/site-data.js';
import { NotFoundPage } from './MiscPages.jsx';

const ALL = 'All';

export function NewsPage() {
  const [tag, setTag] = useState(ALL);
  const tags = useMemo(() => [ALL, ...new Set(news.posts.map((post) => post.tag))], []);
  const posts = tag === ALL ? news.posts : news.posts.filter((post) => post.tag === tag);

  useSeo({ title: news.title, description: news.intro, path: '/news' });

  return (
    <>
      <PageHero eyebrow={news.eyebrow} title={news.title} intro={news.intro} />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Filter" title="Browse by topic." />
          <div className="chips" role="group" aria-label="Filter news by tag">
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
              <Card key={post.slug} href={`/news/${post.slug}`} className="post-card">
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

      <CTABand intro="Have a project in mind? Tell us what you are planning." />
    </>
  );
}

export function NewsArticlePage({ slug }) {
  const post = news.posts.find((item) => item.slug === slug);

  useSeo({
    title: post ? post.title : 'Article not found',
    description: post ? post.excerpt : 'This article could not be found.',
    type: 'article',
    path: `/news/${slug}`,
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
            <p>This update is being written up. In the meantime, talk to us if you need details.</p>
          </div>
          <p className="back-link">
            <Link to="/news">← Back to all news</Link>
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
