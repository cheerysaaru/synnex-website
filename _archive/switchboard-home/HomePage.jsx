import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import '../home.css';

/* --------------------------------------------------------------------------
   Home page — "Switchboard" design.
   Everything on this page is borrowed from the inside of a distribution
   board: the enclosure, the breaker rail, label tape, the rating plate,
   the circuit schedule on the door and the commissioning checklist.
   Text comes from the translation table in App.jsx (t), falling back to
   English (en) and then to the defaults written here.
   -------------------------------------------------------------------------- */

const SERVICES = [
  {
    tape: 'Home wiring',
    title: 'Residential wiring',
    text: 'Safe, tidy wiring for new homes, renovations and extensions.',
    points: ['New builds and full rewiring', 'Lighting and socket layouts', 'Earthing and RCD protection'],
  },
  {
    tape: 'Commercial',
    title: 'Commercial and industrial',
    text: 'Electrical systems planned around your site, your hours and the machines you run.',
    points: ['Offices, shops and plants', 'Three-phase distribution', 'Work scheduled around opening hours'],
  },
  {
    tape: 'Load design',
    title: 'Design and load calculation',
    text: 'Load planning that keeps your system balanced, efficient and ready to grow.',
    points: ['Load and cable sizing', 'Balanced phases', 'Spare capacity for later'],
  },
  {
    tape: 'Solar PV',
    title: 'Solar PV systems',
    text: 'Rooftop solar that cuts your CEB bill, installed with clean, safe cable runs.',
    points: ['Roof and shading assessment', 'Grid-tied and hybrid systems', 'Net metering paperwork'],
  },
  {
    tape: 'Boards',
    title: 'Panel boards and distribution',
    text: 'Distribution boards you can open without worrying: labelled, protected and tidy.',
    points: ['Every circuit labelled', 'Correct breakers and RCDs', 'Tested before handover'],
  },
  {
    tape: 'Inspection',
    title: 'Maintenance and inspections',
    text: 'Fault finding and safety checks that catch problems before they trip the house.',
    points: ['Fault finding', 'Insulation and earth tests', 'Written report of findings'],
  },
  {
    tape: 'Backup',
    title: 'Generator and UPS setup',
    text: 'Backup power that switches over by itself when the supply drops.',
    points: ['Automatic changeover', 'UPS for critical loads', 'Villa and office setups'],
  },
];

const PROJECTS = [
  { type: 'Residential', title: 'Modern residence wiring', place: 'Colombo 07', scope: 'Full installation' },
  { type: 'Commercial', title: 'Retail distribution upgrade', place: 'Nugegoda', scope: 'Panel board rework' },
  { type: 'Industrial', title: 'Workshop power planning', place: 'Kelaniya', scope: 'Load calculation' },
  { type: 'Solar', title: 'Rooftop solar PV system', place: 'Nugegoda', scope: '5 kW installation' },
  { type: 'Residential', title: 'Villa backup power', place: 'Battaramulla', scope: 'Generator setup' },
  { type: 'Commercial', title: 'Office safety inspection', place: 'Colombo 03', scope: 'Compliance review' },
];

const PILLARS = [
  ['Safety first', 'Good work starts with protecting people, property and everything that depends on your power.'],
  ['Plain advice', 'We explain what matters, what it will cost and what your best options are before work begins.'],
  ['Built around your day', 'We plan carefully so disruption to your home or business stays as small as possible.'],
  ['Support after switch-on', 'Questions after handover? Call the same team that planned and installed your system.'],
];

const STEPS = [
  ['Consultation', 'We listen first. We look at your space, your needs and your priorities.'],
  ['Design', 'We plan a solution that is safe, efficient and practical for how you use power.'],
  ['Installation', 'Our work is tidy, careful and built to last.'],
  ['Testing', 'We check every detail and test the system before anything is handed over.'],
  ['Handover', 'You get a clear walkthrough and a team you can call.'],
];

const QUOTES = [
  ['The work was organised, clearly explained and finished exactly when promised. We finally feel confident about the wiring in our home.', 'Homeowner, Colombo'],
  ['They explained every option before touching a wire, and the board is the tidiest we have ever had.', 'Business owner, Nugegoda'],
];

const FAQS = [
  ['Do you work outside Colombo?', 'Yes. Synnex Technology serves clients across Sri Lanka. Share your location and project type and we will advise on the best next step.'],
  ['Can you inspect an existing electrical system?', 'Yes. We check wiring, boards and earthing, then give you a clear list of what is safe and what needs attention.'],
  ['Do you install solar panels and backup power?', 'Yes. We design and install rooftop solar PV, generators and UPS systems.'],
  ['How do I request a quote?', 'Use the form below, call 070 377 1851 or message us on WhatsApp. Tell us the location and what you need.'],
];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HomePage({ t, en, phone }) {
  const tr = (key, fallback) => t[key] ?? en[key] ?? fallback;

  const [active, setActive] = useState(-1);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [stepsOn, setStepsOn] = useState(0);
  const serviceNames = SERVICES.map((s, i) => tr(`service.${i + 1}`, s.title));
  const blankForm = { name: '', email: '', phone: '', service: serviceNames[0], message: '' };
  const [form, setForm] = useState(blankForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const checklistRef = useRef(null);

  /* The one load moment: circuit 1 switches on. */
  useEffect(() => {
    if (reducedMotion()) {
      setActive(0);
      return undefined;
    }
    const timer = window.setTimeout(() => setActive(0), 450);
    return () => window.clearTimeout(timer);
  }, []);

  /* Commissioning checklist ticks off as it scrolls past the middle of the screen. */
  useEffect(() => {
    const update = () => {
      const list = checklistRef.current;
      if (!list) return;
      const line = window.innerHeight * 0.6;
      let count = 0;
      Array.from(list.children).forEach((child, index) => {
        if (child.getBoundingClientRect().top < line) count = index + 1;
      });
      setStepsOn((prev) => Math.max(prev, count)); // once ticked, stays ticked
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const onRailKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const dir = event.key === 'ArrowRight' ? 1 : -1;
    const next = (Math.max(active, 0) + dir + SERVICES.length) % SERVICES.length;
    setActive(next);
    event.currentTarget.querySelectorAll('button')[next]?.focus();
  };

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setFormError('');
    setSent(false);
    try {
      await api.submitEnquiry({ ...form });
      setSent(true);
      setForm(blankForm);
    } catch (error) {
      setFormError(error.message || tr('form.error', 'Could not send your enquiry. Please call us instead.'));
    } finally {
      setSending(false);
    }
  };

  const shown = Math.max(active, 0);
  const svc = SERVICES[shown];
  const n = shown + 1;

  return (
    <div className="sb">
      {/* ------------------------------------------------ enclosure (hero + services) */}
      <header className="sb-hero" id="top">
        <div className="sb-encl">
          <svg className="sb-supply" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="sbEarth" width="28" height="10" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
                <rect width="14" height="10" fill="var(--sb-earth-g)" />
                <rect x="14" width="14" height="10" fill="var(--sb-earth-y)" />
              </pattern>
            </defs>
            <path d="M0 14 H1200" stroke="var(--sb-live)" strokeWidth="7" />
            <path d="M0 30 H1200" stroke="var(--sb-neutral)" strokeWidth="7" />
            <path d="M0 46 H1200" stroke="url(#sbEarth)" strokeWidth="7" />
          </svg>

          <div className="sb-face">
            <div className="sb-intro">
              <h1>{tr('hero.h1', 'Every circuit planned, labelled and tested.')}</h1>
              <p>{tr('hero.p', '')}</p>
              <div className="sb-actions">
                <a className="sb-btn" href="#contact">{tr('hero.btn.quote', 'Get a free quote')}</a>
                <a className="sb-btn sb-btn-line" href={`tel:${phone}`}>{tr('hero.btn.call', 'Call 070 377 1851')}</a>
              </div>
            </div>

            <dl className="sb-plate" aria-label="Company details">
              <div className="sb-plate-head">Synnex Technology</div>
              <div><dt>{tr('plate.exp', 'Experience')}</dt><dd>{tr('hero.facts.1.n', '20+')} <small>{tr('plate.years', 'years')}</small></dd></div>
              <div><dt>{tr('plate.jobs', 'Projects finished')}</dt><dd>{tr('hero.facts.2.n', '200+')}</dd></div>
              <div><dt>{tr('plate.support', 'Support')}</dt><dd>{tr('hero.facts.3.n', '24/7')} <small>{tr('plate.island', 'island-wide')}</small></dd></div>
              <div><dt>{tr('plate.engineer', 'Engineer')}</dt><dd className="sb-plate-txt">K. Arulalagan</dd></div>
            </dl>
          </div>

          <section className="sb-board" id="services" aria-labelledby="sbBoardTitle">
            <div className="sb-board-top">
              <h2 id="sbBoardTitle">{tr('services.h2', 'Seven circuits, one team.')}</h2>
              <p>{tr('services.hint', 'Switch on a breaker to see what we wire.')}</p>
            </div>

            <div className="sb-board-body">
              <div className="sb-rail" role="group" aria-label={tr('services.rail', 'Services')} onKeyDown={onRailKeyDown}>
                {SERVICES.map((service, index) => (
                  <button
                    key={service.title}
                    type="button"
                    className="sb-mcb"
                    aria-pressed={active === index}
                    onClick={() => setActive(index)}
                  >
                    <span className="sb-mcb-no">C{index + 1}</span>
                    <span className="sb-mcb-body" aria-hidden="true">
                      <span className="sb-mcb-slot"><span className="sb-mcb-lever" /></span>
                      <span className="sb-mcb-flag" />
                    </span>
                    <span className="sb-tape">{tr(`svc.${index + 1}.tape`, service.tape)}</span>
                  </button>
                ))}
              </div>

              <div className="sb-detail" aria-live="polite">
                <span className={`sb-detail-state${active >= 0 ? ' on' : ''}`}>
                  {tr('services.circuit', 'Circuit')} {n} {active >= 0 ? tr('services.on', 'on') : tr('services.off', 'off')}
                </span>
                <h3>{tr(`svc.${n}.t`, svc.title)}</h3>
                <p>{tr(`svc.${n}.s`, svc.text)}</p>
                <ul>
                  {svc.points.map((point, i) => <li key={point}>{tr(`svc.${n}.p.${i + 1}`, point)}</li>)}
                </ul>
                <a className="sb-btn" href="#contact">{tr('services.cta', 'Quote this job')}</a>
              </div>
            </div>
          </section>
        </div>
      </header>

      {/* ------------------------------------------------ about */}
      <section className="sb-sec sb-about" id="about">
        <div className="sb-w sb-about-grid">
          <h2>{tr('about.h2', 'Good electrical work is the quiet confidence behind a space.')}</h2>
          <div>
            <p className="sb-lead">{tr('about.lead', '')}</p>
            <p>{tr('about.lead2', '')}</p>
            <div className="sb-signoff">
              <span>{tr('about.sig.label', 'Planned, installed and tested by')}</span>
              <strong>{tr('about.sig.name', 'K. Arulalagan')}</strong>
              <small>{tr('about.sig.title', 'Owner and electrical engineer, Colombo')}</small>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ circuit schedule (work) */}
      <section className="sb-sec sb-work" id="work">
        <div className="sb-w">
          <div className="sb-head-row">
            <h2>{tr('work.h2', 'Recent work, by circuit.')}</h2>
            <p>{tr('projects.p', 'Selected work across homes, businesses and industrial sites.')}</p>
          </div>
          <div className="sb-schedule" role="table" aria-label={tr('work.table', 'Recent projects')}>
            <div className="sb-sched-row sb-sched-head" role="row">
              <span role="columnheader">{tr('work.col.no', 'No.')}</span>
              <span role="columnheader">{tr('work.col.job', 'Job')}</span>
              <span role="columnheader">{tr('work.col.place', 'Location')}</span>
              <span role="columnheader">{tr('work.col.scope', 'Scope')}</span>
              <span role="columnheader">{tr('work.col.type', 'Type')}</span>
            </div>
            {PROJECTS.map((project, index) => {
              const k = `project.${index + 1}`;
              const meta = t[`${k}.meta`] ?? en[`${k}.meta`];
              const [place, scope] = meta ? meta.split(/,\s*/) : [project.place, project.scope];
              return (
                <div className="sb-sched-row" role="row" key={project.title}>
                  <span role="cell" className="sb-sched-no">{String(index + 1).padStart(2, '0')}</span>
                  <span role="cell" className="sb-sched-job">{tr(`${k}.title`, project.title)}</span>
                  <span role="cell">{place || project.place}</span>
                  <span role="cell">{scope || project.scope}</span>
                  <span role="cell" className="sb-sched-type">{tr(`${k}.tag`, project.type)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ why */}
      <section className="sb-sec sb-why">
        <div className="sb-w">
          <h2>{tr('home.why.h', 'The right way to do electrical work.')}</h2>
          <div className="sb-pillars">
            {PILLARS.map(([title, text], index) => (
              <div key={title}>
                <h3>{tr(`pillar.${index + 1}.t`, title)}</h3>
                <p>{tr(`pillar.${index + 1}.s`, text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ process = commissioning checklist */}
      <section className="sb-sec sb-process" id="process">
        <div className="sb-w sb-process-grid">
          <div className="sb-process-intro">
            <h2>{tr('home.process.h', 'Simple steps. Solid results.')}</h2>
            <p>{tr('home.process.p', '')}</p>
          </div>
          <ol className="sb-checklist" ref={checklistRef}>
            {STEPS.map(([title, text], index) => (
              <li key={title} className={index < stepsOn ? 'on' : ''}>
                <span className="sb-check" aria-hidden="true" />
                <div>
                  <h3><span>{index + 1}</span>{tr(`step.${index + 1}.t`, title)}</h3>
                  <p>{tr(`step.${index + 1}.s`, text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ quote */}
      <section className="sb-sec sb-quote" aria-label={tr('home.quote.kicker', 'Client notes')}>
        <div className="sb-w">
          <blockquote>
            <p>{tr(`quote.${quoteIndex + 1}.t`, QUOTES[quoteIndex][0])}</p>
            <footer>{tr(`quote.${quoteIndex + 1}.a`, QUOTES[quoteIndex][1])}</footer>
          </blockquote>
          <div className="sb-quote-nav">
            <button type="button" onClick={() => setQuoteIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length)} aria-label={tr('quote.aria.prev', 'Previous quote')}>&larr;</button>
            <span>{quoteIndex + 1} / {QUOTES.length}</span>
            <button type="button" onClick={() => setQuoteIndex((i) => (i + 1) % QUOTES.length)} aria-label={tr('quote.aria.next', 'Next quote')}>&rarr;</button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ faq */}
      <section className="sb-sec sb-faq" id="faq">
        <div className="sb-w sb-faq-grid">
          <div>
            <h2>{tr('faq.h2', 'Questions, answered.')}</h2>
            <p>{tr('faq.intro', '')}</p>
            <a className="sb-link" href={`tel:${phone}`}>{tr('home.faq.call', 'Call 070 377 1851')}</a>
          </div>
          <div className="sb-faq-list">
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

      {/* ------------------------------------------------ contact = job request */}
      <section className="sb-sec sb-contact" id="contact">
        <div className="sb-w sb-contact-grid">
          <div>
            <h2>{tr('contact.h2', 'Let’s make your next project safer.')}</h2>
            <p>{tr('contact.intro', '')}</p>
            <a className="sb-phone" href={`tel:${phone}`}>{tr('home.contact.phone', '070 377 1851')}</a>
            <p className="sb-base">{tr('contact.base', 'Based in Colombo, working island-wide')}<br />{tr('contact.hours', 'Monday to Friday, 10am to 6pm')}</p>
          </div>

          <form className="sb-form" onSubmit={handleSubmit}>
            <h3>{tr('form.title', 'Job request')}</h3>
            <label>
              {tr('form.label.name', 'Your name')}
              <input name="name" value={form.name} onChange={updateForm} placeholder={tr('form.placeholder.name', '')} required autoComplete="name" />
            </label>
            <div className="sb-form-pair">
              <label>
                {tr('form.label.phone', 'Phone number')}
                <input name="phone" type="tel" value={form.phone} onChange={updateForm} placeholder={tr('form.placeholder.phone', '')} required autoComplete="tel" />
              </label>
              <label>
                {tr('form.label.email', 'Email address')}
                <input name="email" type="email" value={form.email} onChange={updateForm} placeholder={tr('form.placeholder.email', '')} required autoComplete="email" />
              </label>
            </div>
            <label>
              {tr('form.label.service', 'What do you need help with?')}
              <select name="service" value={form.service} onChange={updateForm}>
                {serviceNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>
              {tr('form.label.message', 'Tell us a little more')}
              <textarea name="message" rows="3" value={form.message} onChange={updateForm} placeholder={tr('form.placeholder.message', '')} />
            </label>
            <button className="sb-btn" type="submit" disabled={sending}>
              {sending ? tr('form.sending', 'Sending…') : tr('form.submit', 'Send enquiry')}
            </button>
            {formError ? <p className="sb-err" role="alert">{formError}</p> : null}
            {sent ? <p className="sb-ok" role="status">{tr('contact.thanks', 'Thank you. We will call you back soon.')}</p> : null}
          </form>
        </div>
      </section>
    </div>
  );
}
