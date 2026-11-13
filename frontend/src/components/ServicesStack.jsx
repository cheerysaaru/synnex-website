/* ==========================================================================
   ServicesStack — Synnex services as stacking cards.

   Each service is a dark rounded card (top bar + big photo). The cards are
   sticky, so while you scroll the next card slides up over the previous
   one; the covered card shrinks a little and dims, leaving its top edge
   peeking out above the new card.

   Photos: free Unsplash stock photos, linked by id below.
   All visible text is English and is translated by lib/i18n.js.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';

const SERVICES = [
  { id: 1, img: '1621905251189-08b45d6a269e', icon: 'home', title: 'Residential wiring', text: 'Safe, tidy wiring for new homes, renovations and extensions.', points: ['New builds and full rewiring', 'Lighting and socket layouts', 'Earthing and RCD protection'] },
  { id: 2, img: '1615774925655-a0e97fc85c14', icon: 'building', title: 'Commercial and industrial', text: 'Electrical systems planned around your site, your hours and the machines you run.', points: ['Offices, shops and plants', 'Three-phase distribution', 'Work scheduled around opening hours'] },
  { id: 3, img: '1581092160562-40aa08e78837', icon: 'calc', title: 'Design and load calculation', text: 'Load planning that keeps your system balanced, efficient and ready to grow.', points: ['Load and cable sizing', 'Balanced phases', 'Spare capacity for later'] },
  { id: 4, img: '1624397640148-949b1732bb0a', icon: 'sun', title: 'Solar PV systems', text: 'Rooftop solar that cuts your CEB bill, installed with clean, safe cable runs.', points: ['Roof and shading assessment', 'Grid-tied and hybrid systems', 'Net metering paperwork'] },
  { id: 5, img: '1544724569-5f546fd6f2b5', icon: 'board', title: 'Panel boards and distribution', text: 'Distribution boards you can open without worrying: labelled, protected and tidy.', points: ['Every circuit labelled', 'Correct breakers and RCDs', 'Tested before handover'] },
  { id: 6, img: '1758101755915-462eddc23f57', icon: 'check', title: 'Maintenance and inspections', text: 'Fault finding and safety checks that catch problems before they trip the house.', points: ['Fault finding', 'Insulation and earth tests', 'Written report of findings'] },
  { id: 7, img: '1780445392484-38a4852a1fd8', icon: 'battery', title: 'Generator and UPS setup', text: 'Backup power that switches over by itself when the supply drops.', points: ['Automatic changeover', 'UPS for critical loads', 'Villa and office setups'] },
];

const N = SERVICES.length;
const pad = (n) => String(n).padStart(2, '0');
const photoUrl = (svc, w) => `https://images.unsplash.com/photo-${svc.img}?auto=format&fit=crop&w=${w}&q=70`;
const photoSet = (svc) => [700, 1200, 1800].map((w) => `${photoUrl(svc, w)} ${w}w`).join(', ');

const ICONS = {
  home: 'M3 12l2-2 7-7 7 7 2 2M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6M4 12v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9',
  building: 'M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16',
  calc: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8 10h8M8 13h2M14 13h2M8 16h2M14 16h2',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 12h1M12 3v1M20 12h1M12 20v1M5.6 5.6l.7.7M18.4 5.6l-.7.7M17.7 17.7l.7.7M6.3 17.7l-.7.7',
  board: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 4v16M3 12h18',
  check: 'M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  battery: 'M6 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM19 10h2v4h-2M11 9l-2 3h3l-2 3',
};

function SvcIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function ServicesStack() {
  const cardsRef = useRef([]);
  const [failed, setFailed] = useState(() => new Set());

  /* shrink + dim each card as the next one slides over it
     (writes CSS variables directly, no React re-render while scrolling) */
  useEffect(() => {
    let frame = 0;
    let fallback = 0;

    const update = () => {
      frame = 0;
      window.clearTimeout(fallback);
      const cards = cardsRef.current;
      for (let i = 0; i < N; i += 1) {
        const card = cards[i];
        if (!card) continue;
        const next = cards[i + 1];
        let p = 0;
        if (next) {
          const a = card.getBoundingClientRect();
          const b = next.getBoundingClientRect();
          /* 0 when the next card is a full card-height below, 1 when it is stacked on top */
          p = 1 - (b.top - a.top) / Math.max(a.height, 1);
          p = Math.min(Math.max(p, 0), 1);
        }
        card.style.setProperty('--p', p.toFixed(3));
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
      fallback = window.setTimeout(() => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          update();
        }
      }, 120);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const markFailed = (id) =>
    setFailed((s) => {
      if (s.has(id)) return s;
      const next = new Set(s);
      next.add(id);
      return next;
    });

  return (
    <section id="services" className="sk">
      <div className="sk-head">
        <span className="sk-label">Our services</span>
        <h2 className="sk-title">Seven services, one team</h2>
        <p className="sk-sub">Every service from first drawing to final test, handled by the same engineer.</p>
      </div>

      <div className="sk-list" style={{ '--n': N }}>
        {SERVICES.map((svc, i) => (
          <article
            key={svc.id}
            className="sk-card"
            ref={(el) => { cardsRef.current[i] = el; }}
            style={{ '--i': i }}
          >
            <div className="sk-inner">
              <header className="sk-bar">
                <span className="sk-num">{pad(i + 1)}</span>
                <div className="sk-meta">
                  <small>Service</small>
                  <b>{svc.title}</b>
                </div>
                <div className="sk-meta sk-meta-wide">
                  <small>What's included</small>
                  <span>
                    {svc.points.map((p, k) => (
                      <em key={p}>{p}{k < svc.points.length - 1 ? <i aria-hidden="true">·</i> : null}</em>
                    ))}
                  </span>
                </div>
                <a href="#contact" className="sk-btn">
                  <span>Quote this job</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </a>
              </header>

              <div className="sk-media">
                {failed.has(svc.id) ? (
                  <div className="sk-fallback" />
                ) : (
                  <img
                    src={photoUrl(svc, 1200)}
                    srcSet={photoSet(svc)}
                    sizes="(max-width: 1240px) 100vw, 1200px"
                    alt=""
                    loading="eager"
                    decoding="async"
                    onError={() => markFailed(svc.id)}
                  />
                )}
                <div className="sk-shade" aria-hidden="true" />
                <div className="sk-copy">
                  <span className="sk-icon"><SvcIcon name={svc.icon} /></span>
                  <h3>{svc.title}</h3>
                  <p>{svc.text}</p>
                  <ul className="sk-chips">
                    {svc.points.map((p) => (
                      <li key={p}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="sk-dim" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
