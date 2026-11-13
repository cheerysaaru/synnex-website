/* ==========================================================================
   LetterHero — the site video plays inside a giant word on the white page.

   Scrolling zooms into one letter until the video fills the screen, then the
   headline and button appear over the video.

   How it works: a white layer with black text sits over the video with
   mix-blend-mode: screen, so white stays white and the black letters show
   the video through them. Scrolling scales that layer up around a point
   inside the "E", and fades it out at the end.
   ========================================================================== */
import { useEffect, useRef } from 'react';

const WORD = 'SYNNEX';
const ZOOM_LETTER = 4; // the "E" in SYNNEX: its stem is a solid block to zoom into
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function LetterHero({ video = '/city-lights.mp4' }) {
  const trackRef = useRef(null);
  const maskRef = useRef(null);
  const letterRef = useRef(null);
  const introRef = useRef(null);
  const copyRef = useRef(null);
  const tintRef = useRef(null);
  const hintRef = useRef(null);
  const paperRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    let fallback = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* zoom origin = where the stem and middle arm of the "E" cross (solid ink).
       Found by drawing the letter on a canvas with the same font. */
    const stemPoint = (span) => {
      try {
        const cs = getComputedStyle(span);
        const size = parseFloat(cs.fontSize);
        const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        ctx.font = font;
        const m = ctx.measureText('E');
        const capH = m.actualBoundingBoxAscent;
        const left = m.actualBoundingBoxLeft;
        const inkW = m.actualBoundingBoxRight + left;
        c.width = Math.ceil(inkW + 20);
        c.height = Math.ceil(capH + 20);
        ctx.font = font;
        ctx.fillText('E', 10 + left, 10 + capH);
        const row = Math.round(10 + capH * 0.75); // a quarter up from the baseline: only the stem is there
        const data = ctx.getImageData(0, row, c.width, 1).data;
        let x0 = -1;
        let x1 = -1;
        for (let x = 0; x < c.width; x += 1) {
          const ink = data[x * 4 + 3] > 128;
          if (ink && x0 < 0) x0 = x;
          if (!ink && x0 >= 0) { x1 = x; break; }
        }
        if (x0 < 0 || x1 < 0) return null;
        const stemX = (x0 + x1) / 2 - (10 + left);
        const fA = m.fontBoundingBoxAscent;
        const fD = m.fontBoundingBoxDescent;
        let lh = parseFloat(cs.lineHeight);
        if (!lh) lh = size * 0.78;
        const r = span.getBoundingClientRect();
        const baseline = r.top + (lh - (fA + fD)) / 2 + fA;
        return { x: r.left + stemX, y: baseline - capH * 0.5 };
      } catch (e) {
        return null;
      }
    };

    const placeOrigin = () => {
      const mask = maskRef.current;
      const letter = letterRef.current;
      if (!mask || !letter) return;
      mask.style.transform = 'none';
      const m = mask.getBoundingClientRect();
      const l = letter.getBoundingClientRect();
      const pt = stemPoint(letter) || { x: l.left + l.width * 0.2, y: l.top + l.height * 0.5 };
      mask.style.transformOrigin = `${pt.x - m.left}px ${pt.y - m.top}px`;
    };

    const update = () => {
      frame = 0;
      window.clearTimeout(fallback);
      const track = trackRef.current;
      if (!track || reduce) return;
      const total = track.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-track.getBoundingClientRect().top / total) : 0;

      /* 0–0.12: intro text fades. 0.06–0.78: zoom. 0.66–0.8: letters fade out.
         0.72–0.86: headline and button come in over the video, then stay. */
      const z = ease(clamp((p - 0.06) / 0.72));
      const scale = Math.pow(70, z);
      const maskOpacity = 1 - clamp((p - 0.66) / 0.14);
      const intro = 1 - clamp(p / 0.12);
      const copy = clamp((p - 0.72) / 0.14);

      if (maskRef.current) {
        maskRef.current.style.transform = `scale(${scale.toFixed(3)})`;
        maskRef.current.style.opacity = maskOpacity.toFixed(3);
        maskRef.current.style.visibility = maskOpacity <= 0.001 ? 'hidden' : 'visible';
      }
      if (paperRef.current) paperRef.current.style.opacity = maskOpacity.toFixed(3);
      if (introRef.current) introRef.current.style.opacity = intro.toFixed(3);
      if (hintRef.current) hintRef.current.style.opacity = intro.toFixed(3);
      if (scriptRef.current) scriptRef.current.style.opacity = intro.toFixed(3);
      if (tintRef.current) tintRef.current.style.opacity = (copy * 0.7).toFixed(3);
      if (copyRef.current) {
        copyRef.current.style.opacity = copy.toFixed(3);
        copyRef.current.style.transform = `translateY(${((1 - copy) * 30).toFixed(1)}px)`;
        copyRef.current.style.pointerEvents = copy > 0.5 ? 'auto' : 'none';
        copyRef.current.classList.toggle('on', copy > 0.5);
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

    const onResize = () => {
      placeOrigin();
      onScroll();
    };

    placeOrigin();
    update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header className="lh" id="top" ref={trackRef}>
      <div className="lh-stage">
        <video className="lh-video" src={video} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="lh-tint" ref={tintRef} aria-hidden="true" />

        {/* white layer with the word cut out (screen blend shows the video in the letters) */}
        <div className="lh-mask" ref={maskRef} aria-hidden="true">
          <span className="lh-word" translate="no">
            {WORD.split('').map((ch, i) => (
              <span key={i} ref={i === ZOOM_LETTER ? letterRef : undefined}>{ch}</span>
            ))}
          </span>
        </div>

        <div className="lh-paper" ref={paperRef} aria-hidden="true" />

        {/* "Technology" written in script under the word */}
        <span className="lh-script" ref={scriptRef} translate="no">Technology</span>

        <div className="lh-intro" ref={introRef}>
          <span className="lh-eyebrow">Synnex Technology</span>
          <span className="lh-sub">Electrical engineering, Colombo</span>
        </div>

        <div className="lh-hint" ref={hintRef} aria-hidden="true">
          <span className="lh-mouse"><i /></span>
          <span>Scroll to explore more</span>
        </div>

        <div className="lh-copy" ref={copyRef}>
          <span className="lh-copy-eyebrow">Synnex Technology</span>
          <h1>Electrical work you never have to think about again.</h1>
          <p>Wiring, solar and power systems for homes and businesses across Sri Lanka, planned and tested by one engineer.</p>
          <div className="hm-actions">
            <a className="hm-pill hm-pill-light" href="#services">Learn more</a>
          </div>
        </div>
      </div>
    </header>
  );
}
