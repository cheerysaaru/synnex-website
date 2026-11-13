import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Link } from '../lib/router.jsx';
import ServicesStack from '../components/ServicesStack.jsx';
import JobTimeline from '../components/JobTimeline.jsx';
import LetterHero from '../components/LetterHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import '../letter-hero.css';
import '../job-timeline.css';
import '../home.css';

/* --------------------------------------------------------------------------
   Home page — calm editorial layout: warm off-white page, large light serif
   headlines, a rounded full-bleed hero, and product-style panels that show
   what a Synnex customer actually gets (services, the job portal, results).
   Text comes from the translation table in App.jsx (t), falling back to
   English (en) and then to the defaults written here.
   -------------------------------------------------------------------------- */

const ICONS = {
  home: <path d="M4 11 12 4l8 7v9H4zM10 20v-5h4v5" />,
  building: <path d="M5 20V5h9v15M14 9h5v11M8 8h3M8 11h3M8 14h3M3 20h18" />,
  calc: <path d="M6 3h12v18H6zM9 7h6M9 11h1M14 11h1M9 14h1M14 14h1M9 17h1M14 17h1" />,
  sun: <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  board: <path d="M5 3h14v18H5zM8 7h2v4H8zM11 7h2v4h-2zM14 7h2v4h-2zM8 15h8" />,
  check: <path d="M4 5h12v14H4zM7 9l2 2 3-3M7 15h6M18 8l2 2-6 6-2 .5.5-2z" />,
  battery: <path d="M3 8h15v8H3zM18 11h2v2h-2zM9 9l-2 3h3l-2 3" />,
};

const SERVICES = [
  { icon: 'home', tag: 'Residential', title: 'Residential wiring', text: 'Safe, tidy wiring for new homes, renovations and extensions.', points: ['New builds and full rewiring', 'Lighting and socket layouts', 'Earthing and RCD protection'] },
  { icon: 'building', tag: 'Commercial', title: 'Commercial and industrial', text: 'Electrical systems planned around your site, your hours and the machines you run.', points: ['Offices, shops and plants', 'Three-phase distribution', 'Work scheduled around opening hours'] },
  { icon: 'calc', tag: 'Design', title: 'Design and load calculation', text: 'Load planning that keeps your system balanced, efficient and ready to grow.', points: ['Load and cable sizing', 'Balanced phases', 'Spare capacity for later'] },
  { icon: 'sun', tag: 'Solar', title: 'Solar PV systems', text: 'Rooftop solar that cuts your CEB bill, installed with clean, safe cable runs.', points: ['Roof and shading assessment', 'Grid-tied and hybrid systems', 'Net metering paperwork'] },
  { icon: 'board', tag: 'Distribution', title: 'Panel boards and distribution', text: 'Distribution boards you can open without worrying: labelled, protected and tidy.', points: ['Every circuit labelled', 'Correct breakers and RCDs', 'Tested before handover'] },
  { icon: 'check', tag: 'Maintenance', title: 'Maintenance and inspections', text: 'Fault finding and safety checks that catch problems before they trip the house.', points: ['Fault finding', 'Insulation and earth tests', 'Written report of findings'] },
  { icon: 'battery', tag: 'Backup', title: 'Generator and UPS setup', text: 'Backup power that switches over by itself when the supply drops.', points: ['Automatic changeover', 'UPS for critical loads', 'Villa and office setups'] },
];

/* Each project gets a quiet, abstract "photo" built from gradients so the
   grid reads like a media library until real job photos are added. */
const PROJECTS = [
  { type: 'Residential', title: 'Modern residence wiring', place: 'Colombo 07', scope: 'Full installation', tone: ['#2a3a52', '#c9a27a'] },
  { type: 'Commercial', title: 'Retail distribution upgrade', place: 'Nugegoda', scope: 'Panel board rework', tone: ['#3d3a35', '#e2b04a'] },
  { type: 'Industrial', title: 'Workshop power planning', place: 'Kelaniya', scope: 'Load calculation', tone: ['#1f2a24', '#8fa889'] },
  { type: 'Solar', title: 'Rooftop solar PV system', place: 'Nugegoda', scope: '5 kW installation', tone: ['#1c3a6b', '#f2c46d'] },
  { type: 'Residential', title: 'Villa backup power', place: 'Battaramulla', scope: 'Generator setup', tone: ['#43352c', '#d98f5c'] },
  { type: 'Commercial', title: 'Office safety inspection', place: 'Colombo 03', scope: 'Compliance review', tone: ['#2b2f3a', '#9fb3c8'] },
];

const STEPS = [
  ['Consultation', 'We listen first. We look at your space, your needs and your priorities.'],
  ['Design', 'We plan a solution that is safe, efficient and practical for how you use power.'],
  ['Installation', 'Our work is tidy, careful and built to last.'],
  ['Testing', 'We check every detail and test the system before anything is handed over.'],
  ['Handover', 'You get a clear walkthrough and a team you can call.'],
];

const QUOTES = [
  ['The work was organised, clearly explained and finished exactly when promised. We finally feel confident about the wiring in our home.', 'Homeowner', 'Colombo'],
  ['They explained every option before touching a wire, and the board is the tidiest we have ever had.', 'Business owner', 'Nugegoda'],
];

const FAQS = [
  ['Do you work outside Colombo?', 'Yes. Synnex Technology serves clients across Sri Lanka. Share your location and project type and we will advise on the best next step.'],
  ['Can you inspect an existing electrical system?', 'Yes. We check wiring, boards and earthing, then give you a clear list of what is safe and what needs attention.'],
  ['Do you install solar panels and backup power?', 'Yes. We design and install rooftop solar PV, generators and UPS systems.'],
  ['How do I request a quote?', 'Use the form below, call us or message us on WhatsApp. Tell us the location and what you need.'],
];

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HomePage({ t, en, phone, heroVideo = `${import.meta.env.BASE_URL}city-lights.mp4` }) {
  const tr = (key, fallback) => t[key] ?? en[key] ?? fallback;

  /* the home page owns its tab title (other pages set theirs with useSeo) */
  useEffect(() => {
    document.title = 'Synnex Technology | Electrical Engineering, Colombo';
  }, []);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const serviceNames = SERVICES.map((s, i) => tr(`service.${i + 1}`, s.title));
  return (
    <div className="hm">
      {/* ------------------------------------------------ hero */}
      <LetterHero video={heroVideo} />

      {/* ------------------------------------------------ facts strip */}
      <section className="hm-facts" aria-label={tr('facts.label', 'Synnex at a glance')}>
        <div className="hm-w hm-facts-row">
          <div><b>{tr('hero.facts.1.n', '20+')}</b><span>{tr('hero.facts.1.s', 'years of experience')}</span></div>
          <div><b>{tr('hero.facts.2.n', '200+')}</b><span>{tr('hero.facts.2.s', 'projects finished')}</span></div>
          <div><b>{tr('hero.facts.3.n', '24/7')}</b><span>{tr('hero.facts.3.s', 'island-wide support')}</span></div>
          <div><b>{tr('facts.4.n', '1')}</b><span>{tr('facts.4.s', 'engineer, start to finish')}</span></div>
        </div>
      </section>

      {/* ------------------------------------------------ services */}
      <ServicesStack />

      {/* ------------------------------------------------ portal */}
      <JobTimeline />

      {/* ------------------------------------------------ work */}
      <section className="hm-sec" id="work">
        <div className="hm-w">
          <div className="hm-head">
            <h2>{tr('work.h2', 'Recent work across Sri Lanka')}</h2>
            <p>{tr('projects.p', 'Selected work across homes, businesses and industrial sites.')}</p>
          </div>
          <div className="hm-work">
            {PROJECTS.map((project, index) => {
              const k = `project.${index + 1}`;
              const meta = t[`${k}.meta`] ?? en[`${k}.meta`];
              const [place, scope] = meta ? meta.split(/,\s*/) : [project.place, project.scope];
              return (
                <article className="hm-job" key={project.title}>
                  <div
                    className="hm-job-img"
                    style={{ '--a': project.tone[0], '--b': project.tone[1] }}
                    role="img"
                    aria-label={`${tr(`${k}.tag`, project.type)} project placeholder image`}
                  >
                    <span className="hm-chip">{tr(`${k}.tag`, project.type)}</span>
                  </div>
                  <h3>{tr(`${k}.title`, project.title)}</h3>
                  <p>{place || project.place} · {scope || project.scope}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ about */}
      <section className="hm-sec hm-about" id="about">
        <div className="hm-w hm-narrow">
          <h2>{tr('about.h2', 'Good electrical work is the quiet confidence behind a space.')}</h2>
          <p className="hm-lead">{tr('about.lead', '')}</p>
          <p>{tr('about.lead2', '')}</p>
          <div className="hm-person">
            <span className="hm-avatar" aria-hidden="true">KA</span>
            <div>
              <strong>{tr('about.sig.name', 'K. Arulalagan')}</strong>
              <span>{tr('about.sig.title', 'Owner and electrical engineer, Colombo')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ process */}
      <section className="hm-sec" id="process">
        <div className="hm-w">
          <div className="hm-head">
            <h2>{tr('home.process.h', 'Simple steps. Solid results.')}</h2>
            <p>{tr('home.process.p2', 'A good result is easier when everyone knows what happens next.')}</p>
          </div>
          <ol className="hm-steps">
            {STEPS.map(([title, text], index) => (
              <li key={title}>
                <span className="hm-step-n">{index + 1}</span>
                <h3>{tr(`step.${index + 1}.t`, title)}</h3>
                <p>{tr(`step.${index + 1}.s`, text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ quote */}
      <section className="hm-sec hm-quote" aria-label={tr('home.quote.kicker', 'Client notes')}>
        <div className="hm-w hm-narrow">
          <blockquote>
            <p>{tr(`quote.${quoteIndex + 1}.t`, QUOTES[quoteIndex][0])}</p>
            <footer>{tr(`quote.${quoteIndex + 1}.a`, `${QUOTES[quoteIndex][1]}, ${QUOTES[quoteIndex][2]}`)}</footer>
          </blockquote>
          <div className="hm-quote-nav">
            <button type="button" onClick={() => setQuoteIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length)} aria-label={tr('quote.aria.prev', 'Previous quote')}>&larr;</button>
            <button type="button" onClick={() => setQuoteIndex((i) => (i + 1) % QUOTES.length)} aria-label={tr('quote.aria.next', 'Next quote')}>&rarr;</button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ faq */}
      <section className="hm-sec" id="faq">
        <div className="hm-w hm-narrow">
          <div className="hm-head">
            <h2>{tr('faq.h2', 'Questions, answered')}</h2>
          </div>
          <div className="hm-faq">
            {FAQS.map(([q, a], index) => (
              <details key={q} open={openFaq === index}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setOpenFaq(openFaq === index ? -1 : index);
                  }}
                >
                  {tr(`faq.${index + 1}.q`, q)}
                </summary>
                <p>{tr(`faq.${index + 1}.a`, a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ contact */}
      <section className="hm-sec hm-contact-sec" id="contact">
        <div className="hm-w">
          <div className="hm-contact">
            <div className="hm-contact-copy">
              <h2>{tr('contact.h2', 'Let’s make your next project safer.')}</h2>
              <p>{tr('contact.intro', '')}</p>
              <a className="hm-pill hm-pill-light hm-call" href={`tel:${phone}`}>{tr('home.contact.phone', 'Call us')}</a>
              <p className="hm-base">{tr('contact.base', 'Based in Colombo, working island-wide')}<br />{tr('contact.hours', 'Monday to Friday, 10am to 6pm')}</p>
            </div>

            <EnquiryForm services={serviceNames} tr={tr} />
          </div>
        </div>
      </section>
    </div>
  );
}
