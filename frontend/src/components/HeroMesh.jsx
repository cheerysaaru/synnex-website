/* ==========================================================================
   HeroMesh — "mesh flow" hero background (blue, for Synnex).

   A fine line grid that sits almost invisible on the dark hero until the
   pointer draws it into a singularity: lines near the pointer are pulled
   hard toward one point (one Gaussian), bending like a rubber sheet under a
   weight, and light up blue. The pinch trails smoothly behind the pointer.
   Phones (no pointer): the pinch drifts slowly on its own; touch moves it.
   Canvas 2D, no libraries. Pauses off screen / in background tabs.
   Reduced motion: a still grid.
   ========================================================================== */
import { useEffect, useRef } from 'react';

/* colours: idle line grey → lit blue */
const GREY = [255, 255, 255];
const LIT = [59, 125, 255]; // bright blue for the pinched lines
const CORE = [170, 200, 255]; // near-white blue right at the centre

export default function HeroMesh({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchOnly = window.matchMedia('(hover: none)').matches;

    let w = 0;
    let h = 0;
    let gap = 18;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let px = null;
    let py = null;
    let lit = null;

    const target = { x: 0, y: 0, active: false, last: 0 };
    const cur = { x: 0, y: 0, power: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 640 ? 16 : 19;
      cols = Math.ceil(w / gap) + 2;
      rows = Math.ceil(h / gap) + 2;
      ox = (w - (cols - 1) * gap) / 2;
      oy = (h - (rows - 1) * gap) / 2;
      px = new Float32Array(cols * rows);
      py = new Float32Array(cols * rows);
      lit = new Float32Array(cols * rows);
      if (!target.active) {
        cur.x = w * 0.7;
        cur.y = h * 0.35;
      }
    };

    /* ---------- one Gaussian pinch */
    const field = () => {
      const sigma = Math.min(110, Math.max(55, Math.min(w, 1800) * 0.055));
      const inv = 1 / (2 * sigma * sigma);
      const pull = 0.92 * cur.power; // how hard the centre collapses
      for (let r = 0; r < rows; r += 1) {
        const by = oy + r * gap;
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c;
          const bx = ox + c * gap;
          const dx = cur.x - bx;
          const dy = cur.y - by;
          const g = Math.exp(-(dx * dx + dy * dy) * inv);
          px[i] = bx + dx * g * pull;
          py[i] = by + dy * g * pull;
          /* light reaches a bit further than the pull, so the bend reads */
          lit[i] = Math.exp(-(dx * dx + dy * dy) * inv * 0.45) * cur.power;
        }
      }
    };

    const mix = (a, b, t) => Math.round(a + (b - a) * t);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      /* idle grid: one faint batch, skipping lit segments (drawn after) */
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c;
          if (c < cols - 1 && (lit[i] + lit[i + 1]) * 0.5 < 0.04) {
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[i + 1], py[i + 1]);
          }
          if (r < rows - 1 && (lit[i] + lit[i + cols]) * 0.5 < 0.04) {
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[i + cols], py[i + cols]);
          }
        }
      }
      ctx.stroke();

      /* lit segments near the pinch: grey → blue → near-white at the core */
      const seg = (i, j) => {
        const t = (lit[i] + lit[j]) * 0.5;
        if (t < 0.04) return;
        const toBlue = Math.min(1, t * 2.4);
        const toCore = Math.max(0, (t - 0.75) / 0.25);
        const rC = mix(mix(GREY[0], LIT[0], toBlue), CORE[0], toCore);
        const gC = mix(mix(GREY[1], LIT[1], toBlue), CORE[1], toCore);
        const bC = mix(mix(GREY[2], LIT[2], toBlue), CORE[2], toCore);
        ctx.strokeStyle = `rgba(${rC},${gC},${bC},${Math.min(1, 0.06 + t * 0.95).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      };
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c;
          if (c < cols - 1) seg(i, i + 1);
          if (r < rows - 1) seg(i, i + cols);
        }
      }
    };

    /* ---------- loop */
    let raf = 0;
    let last = performance.now();
    let running = false;

    const frame = (time) => {
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;

      const hasPointer = target.active && time - target.last < 4000;
      let tx = target.x;
      let ty = target.y;
      let wantPower = hasPointer ? 1 : 0;
      if (!hasPointer && touchOnly) {
        /* phones: let the pinch wander slowly so the hero isn't static */
        const s = time / 1000;
        tx = w * (0.5 + 0.32 * Math.sin(s * 0.27));
        ty = h * (0.5 + 0.3 * Math.sin(s * 0.37 + 1.1));
        wantPower = 0.85;
      }
      /* trail behind the pointer, like the reference */
      const follow = 1 - Math.pow(0.012, dt);
      cur.x += (tx - cur.x) * follow;
      cur.y += (ty - cur.y) * follow;
      cur.power += (wantPower - cur.power) * (1 - Math.pow(0.03, dt));

      field();
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* ---------- pointer (listen on the hero so text and buttons stay clickable) */
    const host = canvas.parentElement;
    const local = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e) => {
      const p = local(e);
      if (!target.active) {
        cur.x = p.x; // appear right where the pointer enters
        cur.y = p.y;
      }
      target.x = p.x;
      target.y = p.y;
      target.active = true;
      target.last = performance.now();
    };
    const onLeave = () => {
      target.active = false;
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      field();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    field();
    draw();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={`hero-mesh ${className}`} aria-hidden="true" />;
}
