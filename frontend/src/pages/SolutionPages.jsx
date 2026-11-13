/* Solution routes: /solutions (overview) and /solutions/:slug (detail) */
import { PageHero, SectionHeading, Card, CTABand, Accordion } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { solutions, company } from '../data/site-data.js';
import { NotFoundPage } from './MiscPages.jsx';

const ORDER = ['residential', 'commercial', 'industrial', 'solar', 'testing', 'power-backup'];

export function SolutionsOverviewPage() {
  const items = ORDER.map((key) => solutions.items[key]).filter(Boolean);

  useSeo({ title: solutions.title, description: solutions.intro, path: '/solutions' });

  return (
    <>
      <PageHero eyebrow={solutions.eyebrow} title={solutions.title} intro={solutions.intro} />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="What we do" title="Pick the area that fits." />
          <div className="grid grid-3">
            {items.map((item) => (
              <Card key={item.slug} href={`/solutions/${item.slug}`} className="solution-card">
                <h3>{item.title}</h3>
                <p>{item.intro}</p>
                <span className="post-foot">
                  Explore
                  <span aria-hidden="true"> →</span>
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTABand intro="Not sure which solution fits? Describe the site and we will advise." />
    </>
  );
}

export function SolutionPage({ slug }) {
  const item = solutions.items[slug];

  useSeo({
    title: item ? item.title : 'Solution not found',
    description: item ? item.intro : 'This solution could not be found.',
    path: `/solutions/${slug}`,
  });

  if (!item) return <NotFoundPage />;

  return (
    <>
      <PageHero eyebrow={item.eyebrow} title={item.title} intro={item.intro} />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Scope" title="What this covers." />
          <ul className="check-grid">
            {item.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Process" title="How the work runs." />
          <ol className="process-row">
            {item.process.map((step, index) => (
              <li className="process-step" key={step.title}>
                <span className="process-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="w split">
          <div>
            <SectionHeading eyebrow="FAQ" title="Common questions." />
            <Accordion idPrefix={`sol-${item.slug}`} items={item.faqs} />
          </div>
          <aside className="survey-box">
            <h2>Book a site survey</h2>
            <p>A short visit lets us size the work properly and give you a clear quote.</p>
            <div className="survey-actions">
              <a className="btn" href={`tel:${company.phoneHref}`}>Call us</a>
              <a className="btn ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            <p className="survey-alt">
              Prefer to browse first? <Link to="/solutions">See all solutions</Link>
            </p>
          </aside>
        </div>
      </section>

      <CTABand intro="Tell us about your site and we will plan the next step." />
    </>
  );
}
