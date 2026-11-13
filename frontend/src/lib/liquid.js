/*
  Liquid hover: tracks where the pointer enters and leaves a button and stores
  it in --lx / --ly, so the blob in liquid.css grows from (and drains toward)
  the cursor. One delegated listener covers every button on every page.
*/
const LIQUID_SELECTOR = '.btn, .hm-pill, .nv-login, .nv-cta, .wa, .login-submit';

function setOrigin(el, event) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  el.style.setProperty('--lx', `${((event.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty('--ly', `${((event.clientY - r.top) / r.height) * 100}%`);
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerover', (event) => {
    const el = event.target.closest?.(LIQUID_SELECTOR);
    if (el && !el.contains(event.relatedTarget)) setOrigin(el, event);
  }, { passive: true });

  document.addEventListener('pointerout', (event) => {
    const el = event.target.closest?.(LIQUID_SELECTOR);
    if (el && !el.contains(event.relatedTarget)) setOrigin(el, event);
  }, { passive: true });
}
