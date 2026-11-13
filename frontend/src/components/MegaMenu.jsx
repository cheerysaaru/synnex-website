/* --------------------------------------------------------------------------
   MegaMenu — single reusable component rendering all three mega panels
   (Company, Solutions, Resources) from the NAV_MENUS data object.
   No duplicated markup; copy/translation keys come from NAV_T.
-------------------------------------------------------------------------- */

import { useEffect, useState } from 'react';
import { NAV_MENUS } from '../data/navMenus.js';
import MorphPanel from './MorphPanel.jsx';

const NV_CHEV = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const NV_ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const pageKey = (href) => href.replace(/^\//, '').replace(/\//g, '-');

export default function MegaMenu({
  panelKey,
  t,
  openKey,
  setOpenKey,
  triggerRefs,
  onItemEnter,
  onItemLeave,
  onNavLinkClick,
  isMobile,
  menuOpen,
}) {
  /* Small screens: each section opens and closes on its own (several can be
     open), so opening one never collapses another and shifts the list. */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [primed, setPrimed] = useState(false); // desktop: photos load on first hover
  useEffect(() => {
    if (!menuOpen) setMobileOpen(false); // drawer closed: reset sections
  }, [menuOpen]);

  const panel = NAV_MENUS.find((m) => m.key === panelKey);
  if (!panel) return null;

  const small = typeof isMobile === 'function' ? isMobile() : false;
  const isOpen = small ? mobileOpen : openKey === panelKey;

  return (
    <div
      className={`nv-item${isOpen ? ' open' : ''}`}
      data-key={panelKey}
      onMouseEnter={() => {
        setPrimed(true);
        onItemEnter(panelKey);
      }}
      onFocus={() => setPrimed(true)}
      onMouseLeave={onItemLeave}
    >
      <button
        className="nv-tr"
        ref={(el) => {
          triggerRefs.current[panelKey] = el;
        }}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={panel.id}
        onClick={(event) => {
          event.preventDefault();
          /* With a mouse, hovering already opens the panel, so a click must not
             toggle it shut again (that made the arrow flip back). Mouse: click
             only opens; the panel closes when the pointer leaves. Touch / small
             screens: tap toggles open and closed. */
          const mouseDesktop =
            window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !window.matchMedia('(max-width: 1024px)').matches;
          if (mouseDesktop) setOpenKey(panelKey);
          else if (small) setMobileOpen((open) => !open);
          else setOpenKey(isOpen ? null : panelKey);
        }}
      >
        <span>{t[panel.labelKey]}</span>
        <span className="chev" aria-hidden="true">
          {NV_CHEV}
        </span>
      </button>

      <MorphPanel
        panel={panel}
        t={t}
        onNavLinkClick={onNavLinkClick}
        close={() => setOpenKey(null)}
        primed={primed || isOpen}
      />

      <div className="nv-mega" id={panel.id} role="region" aria-label={t[panel.regionKey]}>
        <div className="nv-mega-in">
          <div className="nv-mega-intro">
            <div className="nv-kick">{t[panel.kickerKey]}</div>
            <div className="nv-mega-h" role="heading" aria-level={2}>
              {t[panel.headingKey]}
            </div>
            <p className="nv-mega-p">{t[panel.textKey]}</p>
            <a
              className="nv-mega-all"
              href={panel.ctaHref}
              data-page={pageKey(panel.ctaHref)}
              onClick={onNavLinkClick}
            >
              <span>{t[panel.ctaKey]}</span>
              {NV_ARROW}
            </a>
          </div>

          <div className="nv-mega-col">
            <div className="nv-kick">{t[panel.colLabelKey]}</div>
            <ul className="nv-mega-list">
              {panel.links.map((entry) => (
                <li key={entry.tKey}>
                  <a
                    className="nv-mega-item"
                    href={entry.href}
                    data-page={pageKey(entry.href)}
                    onClick={onNavLinkClick}
                  >
                    <b>{t[entry.tKey]}</b>
                    <span>{t[entry.sKey]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a
            className="nv-feat"
            href={panel.feature.href}
            data-page={pageKey(panel.feature.href)}
            onClick={onNavLinkClick}
          >
            <span className="nv-feat-img">
              <img
                src={panel.feature.img}
                alt={t[panel.feature.altKey]}
                width="640"
                height="400"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </span>
            <span className="nv-feat-txt">
              <b>{t[panel.feature.tKey]}</b>
              <span>{t[panel.feature.sKey]}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
