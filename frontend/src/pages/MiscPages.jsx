/* Standalone routes: /contact and the 404 fallback. */
import { PageHero, CTABand } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { company } from '../data/site-data.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import '../home.css';

const contactRows = (company) => [
  { label: 'Phone', value: 'Call us', href: `tel:${company.phoneHref}` },
  { label: 'WhatsApp', value: 'Message us on WhatsApp', href: `https://wa.me/${company.whatsapp}` },
  { label: 'Email', value: company.email, href: company.emailHref },
];

export function ContactPage() {
  useSeo({
    title: 'Contact',
    description: `Contact ${company.name} in ${company.addressLocality} for electrical engineering, solar and maintenance work.`,
    path: '/contact',
  });

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to an engineer." intro={company.slogan} />

      <section className="sec">
        <div className="w split">
          <div>
            <h2>Speak to us directly.</h2>
            <p className="lead">{company.description}</p>
            <p>
              Call, message or email with your location and project type. We will tell you what the next step looks
              like.
            </p>
          </div>

          <div className="contact-card">
            <dl className="contact-list">
              {contactRows(company).map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    <a
                      href={row.href}
                      {...(row.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {row.value}
                    </a>
                  </dd>
                </div>
              ))}
              <div>
                <dt>Hours</dt>
                <dd>{company.hours}</dd>
              </div>
              <div>
                <dt>Service area</dt>
                <dd>{company.areaServed}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="sec contact-enquiry">
        <div className="w split">
          <div>
            <h2>Send us an enquiry.</h2>
            <p className="lead">Tell us what you need and where. An engineer will call you back, usually within one working day.</p>
          </div>
          <div className="hm contact-enquiry-form">
            <EnquiryForm />
          </div>
        </div>
      </section>

      <CTABand intro="Prefer to call? The number above reaches the same team." />
    </>
  );
}

export function NotFoundPage() {
  useSeo({ title: 'Page not found', description: 'The page you were looking for could not be found.', path: '/404' });

  return (
    <>
      <PageHero
        eyebrow="404"
        title="This page could not be found."
        intro="The link may be out of date, or the page may have moved."
      >
        <Link className="btn" to="/">Back to home</Link>
        <Link className="btn ghost" to="/solutions">Explore solutions</Link>
      </PageHero>
    </>
  );
}
