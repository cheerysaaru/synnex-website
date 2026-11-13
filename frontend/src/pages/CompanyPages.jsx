/* Company routes: /about, /team, /safety, /certifications, /careers */
import { PageHero, SectionHeading, Card, CTABand, Badge, Placeholder, Accordion, Prose } from '../components/ui.jsx';
import { useSeo, localBusinessJsonLd } from '../lib/seo.js';
import { Link } from '../lib/router.jsx';
import { about, team, safety, certifications, careers, testimonials, company } from '../data/site-data.js';

export function AboutPage() {
  useSeo({
    title: 'About Synnex Technology',
    description: about.intro,
    path: '/about',
    jsonLd: localBusinessJsonLd(company),
  });

  return (
    <>
      <PageHero eyebrow={about.eyebrow} title={about.title} intro={about.intro} />

      <section className="sec">
        <div className="w split">
          <Prose>
            {about.story.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Prose>
          <div className="stats-row" aria-label="Key figures">
            {about.stats.map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Our journey" title="How we got here." />
          <ol className="timeline">
            {about.timeline.map((item) => (
              <li className="timeline-item" key={item.year + item.title}>
                <span className="timeline-year">{item.year}</span>
                <div className="timeline-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="What guides us" title="The values behind every job." />
          <div className="grid grid-4">
            {about.values.map((v) => (
              <Card key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Client words" title="What people say." />
          <div className="grid grid-2">
            {testimonials.map((quote) => (
              <blockquote className="quote-card" key={quote.author}>
                <p>“{quote.text}”</p>
                <footer>— {quote.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <CTABand intro="Tell us about your project and we will point you in the right direction." />
    </>
  );
}

export function TeamPage() {
  useSeo({ title: 'Our team', description: team.intro, path: '/team' });

  return (
    <>
      <PageHero eyebrow={team.eyebrow} title={team.title} intro={team.intro} />

      <section className="sec">
        <div className="w">
          <div className="grid grid-4 team-grid">
            {team.members.map((member) => (
              <Card key={member.name + member.role} className="team-card">
                {member.image ? (
                  <img className="team-img" src={member.image} alt={`${member.name}, ${member.role}`} loading="lazy" />
                ) : (
                  <Placeholder label={`${member.name} — ${member.role}`} className="team-img" ratio="1 / 1" />
                )}
                <div className="team-body">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTABand intro="Want to work with this team? See our current openings." />
    </>
  );
}

export function SafetyPage() {
  useSeo({ title: 'Safety', description: safety.intro, path: '/safety' });

  return (
    <>
      <PageHero eyebrow={safety.eyebrow} title={safety.title} intro={safety.intro} />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="What we stand for" title="Four safety pillars." />
          <div className="grid grid-4">
            {safety.pillars.map((p) => (
              <Card key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Our process" title="Five steps, every job." />
          <ol className="process-row">
            {safety.process.map((step, i) => (
              <li className="process-step" key={step.title}>
                <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTABand title="Book a safety inspection" intro="A short visit can catch problems before they cost you." />
    </>
  );
}

export function CertificationsPage() {
  useSeo({ title: 'Certifications', description: certifications.intro, path: '/certifications' });

  return (
    <>
      {/* Placeholder data: replace before launch. */}
      <PageHero eyebrow={certifications.eyebrow} title={certifications.title} intro={certifications.intro} />

      <section className="sec">
        <div className="w">
          <div className="cert-list">
            {certifications.items.map((item) => (
              <Card key={item.name} className="cert-card">
                <div className="cert-head">
                  <h3>{item.name}</h3>
                  <Badge tone={item.status === 'Placeholder' ? 'badge-placeholder' : 'badge-ok'}>
                    {item.status}
                  </Badge>
                </div>
                <dl className="cert-meta">
                  <div>
                    <dt>Issuing body</dt>
                    <dd>{item.body}</dd>
                  </div>
                  <div>
                    <dt>Reference</dt>
                    <dd>{item.reference}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
          <p className="note-line">Placeholder data: replace before launch.</p>
        </div>
      </section>

      <CTABand intro="Need proof of credentials for a tender or project? Ask us directly." />
    </>
  );
}

export function CareersPage() {
  useSeo({ title: 'Careers', description: careers.intro, path: '/careers' });

  return (
    <>
      <PageHero eyebrow={careers.eyebrow} title={careers.title} intro={careers.intro} />

      <section className="sec">
        <div className="w split">
          <div>
            <SectionHeading eyebrow="Why join" title="What you get." />
            <ul className="check-list">
              {careers.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Open roles" title="Current openings." />
            <Accordion
              idPrefix="career"
              multiple
              items={careers.openings.map((role) => ({
                title: role.title,
                content: (
                  <div className="role-body">
                    <p className="role-meta">
                      <Badge>{role.type}</Badge> <span>{role.location}</span>
                    </p>
                    <p>{role.summary}</p>
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <div className="callout">
            <h2>How to apply</h2>
            <p>{careers.applyNote}</p>
            <div className="callout-actions">
              <a className="btn" href={company.emailHref}>Email your CV</a>
              <a className="btn ghost" href={`tel:${company.phoneHref}`}>Call us</a>
            </div>
          </div>
        </div>
      </section>

      <CTABand intro="Questions about a role? Talk to us before you apply." />
    </>
  );
}
