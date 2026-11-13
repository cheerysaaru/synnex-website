/* ==========================================================================
   JobTimeline — the customer-portal story as a vertical timeline.

   Left: heading + a job summary card that stays on screen (desktop).
   Right: the five job steps. While you scroll, a blue line draws down
   through them and each step lights up; the job stops at "Testing"
   (in progress) and "Handover" stays as the next step.

   All visible text is English and is translated by lib/i18n.js.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Link } from '../lib/router.jsx';

const NOW = 4; // the example job is finished: every step, including handover, is done

const STEPS = [
  { title: 'Quote approved', note: 'Quote approved and materials ordered the same day.', img: '1503387762-592deb58ef4e' },
  { title: 'Site visit', note: 'Roof and shading checked, panel layout marked out.', img: '1668097613572-40b7c11c8727' },
  { title: 'Installation', note: 'Twelve panels fitted, inverter and isolators wired.', img: '1624397640148-949b1732bb0a' },
  { title: 'Testing', note: 'Insulation and earth tests under way.', img: '1758101755915-462eddc23f57' },
  { title: 'Handover', note: 'Walkthrough, test certificate and net metering papers.' },
];

const photo = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.5)}&q=70`;

const Check = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
);

export default function JobTimeline() {
  const listRef = useRef(null);
  const fillRef = useRef(null);
  const dotsRef = useRef([]);
  const [reached, setReached] = useState(-1);
  const reachedRef = useRef(-1);

  useEffect(() => {
    let frame = 0;
    let fallback = 0;

    const update = () => {
      frame = 0;
      window.clearTimeout(fallback);
      const list = listRef.current;
      if (!list) return;
      const top = list.getBoundingClientRect().top;
      const trigger = window.innerHeight * 0.58;
      const centers = dotsRef.current.map((d) => {
        if (!d) return Infinity;
        const r = d.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let r = -1;
      centers.forEach((c, i) => { if (c <= trigger) r = i; });
      r = Math.min(r, NOW);
      /* the line follows the scroll but never goes past the current step */
      const max = centers[NOW] - top;
      const fill = Math.min(Math.max(trigger - top, 0), max);
      if (fillRef.current) fillRef.current.style.height = `${fill}px`;
      if (r !== reachedRef.current) {
        reachedRef.current = r;
        setReached(r);
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

  /* before the reader reaches the timeline, the card shows the real status */
  const shown = reached < 0 ? NOW : reached;
  const stateOf = (i) => {
    if (i > NOW) return 'next'; // (unused while the job is finished)
    if (i > reached) return 'idle';
    return 'done';
  };
  const label = { done: 'Done', now: 'In progress', next: 'Up next', idle: '' };

  return (
    <section className="hm-sec jt-sec" id="portal">
      <div className="hm-w jt-grid">
        <div className="jt-side">
          <div className="jt-intro">
            <h2>Follow every job, step by step</h2>
            <p>Your quotes, bookings and test certificates live in one place. You always know what happens next.</p>
            <Link className="hm-textlink" to="/login">Open your portal</Link>
          </div>

          <div className="jt-job" aria-hidden="true">
            <div className="jt-job-head">
              <div>
                <strong>Rooftop solar PV system</strong>
                <span>Nugegoda · 5 kW grid-tied</span>
              </div>
              <span className="jt-status" key={shown}>{shown === STEPS.length - 1 ? 'Completed' : STEPS[shown].title}</span>
            </div>
            <div className="jt-bar"><i style={{ width: `${((shown + 1) / STEPS.length) * 100}%` }} /></div>
            <ol className="jt-mini" aria-hidden="true">
              {STEPS.map((st, i) => (
                <li key={st.title} className={i <= shown ? 'done' : ''}>{st.title}</li>
              ))}
            </ol>
          </div>
        </div>

        <ol className="jt-list" ref={listRef}>
          <span className="jt-rail" aria-hidden="true" />
          <span className="jt-fill" ref={fillRef} aria-hidden="true" />
          {STEPS.map((s, i) => {
            const st = stateOf(i);
            return (
              <li key={s.title} className={`jt-step is-${st}`}>
                <span className="jt-dot" ref={(el) => { dotsRef.current[i] = el; }}>
                  {st === 'done' ? <Check /> : <b>{i + 1}</b>}
                </span>
                <div className="jt-body">
                  {label[st] ? (
                    <div className="jt-meta">
                      <span className={`jt-tag jt-tag-${st}`}>{label[st]}</span>
                    </div>
                  ) : null}
                  <h3>{s.title}</h3>
                  <p>{s.note}</p>
                  {s.img ? (
                    <div className="jt-photo">
                      <img src={photo(s.img, 900)} srcSet={`${photo(s.img, 600)} 600w, ${photo(s.img, 900)} 900w, ${photo(s.img, 1300)} 1300w`} sizes="(max-width: 1024px) 90vw, 600px" alt="" loading="lazy" decoding="async" />
                    </div>
                  ) : (
                    <div className="jt-cert">
                      <span className="jt-cert-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                      </span>
                      <div>
                        <strong>Installation test certificate</strong>
                        <em>PDF · ready to download</em>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
