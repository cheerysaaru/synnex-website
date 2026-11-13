/* ==========================================================================
   ServicesFlip — full-screen, scroll-driven "flip deck" of Synnex services.

   The section pins to the screen while you scroll; each scroll step flips the
   full-bleed photo to the next service like a calendar page, and the service
   name, description, points and button animate in over it.

   Photos: free Unsplash stock photos, linked by id in SERVICES below.
   A missing photo shows a designed blue panel with the service icon.
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
const FLIP_MS = 850;
/* stock photos (Unsplash, free licence), sized for the screen */
const photoUrl = (svc, w) => `https://images.unsplash.com/photo-${svc.img}?auto=format&fit=crop&w=${w}&q=70`;
const photoSet = (svc) => [800, 1400, 2000].map((w) => `${photoUrl(svc, w)} ${w}w`).join(', ');
const pad = (n) => String(n).padStart(2, '0');

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/* one full-bleed photo (or the designed fallback) */
function Layer({ svc, failed, onFail, className }) {
  return (
    <div className={`fl-layer ${className}`}>
      {failed ? (
        <div className="fl-fallback">
          <span className="fl-fallback-icon"><SvcIcon name={svc.icon} /></span>
        </div>
      ) : (
        <img src={photoUrl(svc, 1400)} srcSet={photoSet(svc)} sizes="100vw" alt="" decoding="async" onError={() => onFail(svc.id)} />
      )}
    </div>
  );
}

export default function ServicesFlip() {
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const timerRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(0);
  const [dir, setDir] = useState(1);
  const [flipId, setFlipId] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(() => new Set());

  const markFailed = (id) =>
    setFailed((s) => {
      if (s.has(id)) return s;
      const next = new Set(s);
      next.add(id);
      return next;
    });

  /* scroll position → active service (listener registered once) */
  useEffect(() => {
    let frame = 0;
    let fallback = 0;

    const update = () => {
      frame = 0;
      window.clearTimeout(fallback);
      const el = trackRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 0));
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const i = Math.min(N - 1, Math.floor(p * N));
      if (i !== indexRef.current) {
        const old = indexRef.current;
        indexRef.current = i;
        setPrev(old);
        setIndex(i);
        setDir(i > old ? 1 : -1);
        setFlipId((f) => f + 1);
        setFlipping(true);
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setFlipping(false), FLIP_MS);
      }
    };

    /* at most once per frame; the timeout covers background tabs where
       animation frames are paused */
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
      window.clearTimeout(timerRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* preload the photos on either side so a flip never shows a blank */
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      if (i >= 0 && i < N) {
        const img = new Image();
        img.sizes = '100vw';
        img.srcset = photoSet(SERVICES[i]);
        img.src = photoUrl(SERVICES[i], 1400);
      }
    });
  }, [index]);

  const scrollToService = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const step = (el.offsetHeight - window.innerHeight) / N;
    window.scrollTo({ top: top + i * step + step * 0.5, behavior: 'smooth' });
  };

  const svc = SERVICES[index];
  const way = dir > 0 ? 'down' : 'up';

  const rail = (variant) =>
    SERVICES.map((s, i) => (
      <button
        key={s.id}
        type="button"
        className={`fl-rail-item${i === index ? ' on' : ''}`}
        onClick={() => scrollToService(i)}
        aria-current={i === index ? 'step' : undefined}
        aria-label={variant === 'dash' ? s.title : undefined}
      >
        {variant === 'rail' ? <span>{s.title}</span> : null}
        <i aria-hidden="true" />
      </button>
    ));

  return (
    <section id="services" className="fl-track" ref={trackRef}>
      <div className="fl-stage">
        {/* photo layers: during a flip the old one flips away and the new one flips in */}
        {flipping && prev !== index ? (
          <Layer
            key={`out-${flipId}`}
            svc={SERVICES[prev]}
            failed={failed.has(SERVICES[prev].id)}
            onFail={markFailed}
            className={`fl-out-${way}`}
          />
        ) : null}
        <Layer
          key={`cur-${flipId}`}
          svc={svc}
          failed={failed.has(svc.id)}
          onFail={markFailed}
          className={flipping ? `fl-in-${way}` : 'fl-still'}
        />

        <div className="fl-shade" aria-hidden="true" />

        <div className="fl-ui">
          <div className="fl-top">
            <span className="fl-label">Seven services, one team</span>
            <div className="fl-counter" aria-hidden="true">
              <span className="fl-roll">
                <span style={{ transform: `translateY(-${(index * 100) / N}%)` }}>
                  {SERVICES.map((s, i) => (
                    <b key={s.id}>{pad(i + 1)}</b>
                  ))}
                </span>
              </span>
              <span className="fl-total">/ {pad(N)}</span>
            </div>
            <nav className="fl-dashes" aria-label="Services">{rail('dash')}</nav>
          </div>

          <div className="fl-content" key={`txt-${index}`} aria-live="polite">
            <h2 className="fl-h">{svc.title}</h2>
            <p className="fl-p">{svc.text}</p>
            <div className="fl-chips">
              {svc.points.map((p) => (
                <span key={p} className="fl-chip">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                  {p}
                </span>
              ))}
            </div>
            <a href="#contact" className="hm-pill hm-pill-light fl-btn">Quote this job</a>
          </div>
        </div>

        <nav className="fl-rail" aria-label="Services">{rail('rail')}</nav>

        <div className="fl-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </div>
    </section>
  );
}
