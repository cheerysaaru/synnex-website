/* Case-study routes: /case-studies (list) and /case-studies/:slug (detail) */
import { PageHero, Card, Badge, CTABand, Placeholder } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { formatDate } from '../lib/format.js';
import { caseStudies } from '../data/site-data.js';
import { NotFoundPage } from './MiscPages.jsx';

export function CaseStudiesPage() {
  useSeo({ title: caseStudies.title, description: caseStudies.intro, path: '/case-studies' });

  return (
    <>
      <PageHero eyebrow={caseStudies.eyebrow} title={caseStudies.title} intro={caseStudies.intro} />

      <section className="sec">
        <div className="w">
          <div className="grid grid-3 post-grid">
            {caseStudies.items.map((item) => (
              <Card key={item.slug} href={`/case-studies/${item.slug}`} className="case-card">
                {item.image ? (
                  <img className="case-img" src={item.image} alt={`${item.title} — ${item.location}`} loading="lazy" />
                ) : (
                  <Placeholder label={`${item.title} — ${item.sector} project in ${item.location}`} className="case-img" ratio="16 / 10">
                    {item.title}
                  </Placeholder>
                )}
                <div className="case-body">
                  <div className="post-meta">
                    <Badge>{item.sector}</Badge>
                    <span>{item.location}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <time className="case-date" dateTime={item.date}>
                    {formatDate(item.date)}
                  </time>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTABand intro="Want a similar result on your site? Tell us what you need." />
    </>
  );
}

export function CaseStudyPage({ slug }) {
  const item = caseStudies.items.find((entry) => entry.slug === slug);

  useSeo({
    title: item ? item.title : 'Case study not found',
    description: item ? item.excerpt : 'This case study could not be found.',
    type: 'article',
    path: `/case-studies/${slug}`,
  });

  if (!item) return <NotFoundPage />;

  const sections = [
    { key: 'challenge', label: 'Challenge', body: item.challenge },
    { key: 'solution', label: 'Solution', body: item.solution },
    { key: 'result', label: 'Result', body: item.result },
  ];

  return (
    <>
      <PageHero eyebrow={`${item.sector} · ${item.location}`} title={item.title} intro={item.excerpt}>
        <p className="post-meta page-meta">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
        </p>
      </PageHero>

      <section className="sec">
        <div className="w narrow">
          {sections.map((section) => (
            <div className="case-section" key={section.key}>
              <h2>{section.label}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          <p className="back-link">
            <Link to="/case-studies">← Back to all case studies</Link>
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
