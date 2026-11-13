/* ==========================================================================
   MorphPanel — desktop dropdown content for the morphing navbar.
   Three layouts, one per menu:
     company   → list on the left, big photo preview on the right
     solutions → row of tall photo cards; the hovered one widens
     resources → compact list of guides with thumbnails and read time
   Mobile keeps the older single-column panel (.nv-mega) in MegaMenu.jsx.
   All visible text is English and is translated by lib/i18n.js.
   ========================================================================== */
import { useState } from 'react';
import { blog } from '../data/site-data.js';

/* Photos: local files in public/images/nav plus two Unsplash photos the
   site already used. Swap any of these for your own project photos later. */
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70&fm=webp`;
const IMG = {
  electrician: U('1621905251189-08b45d6a269e'), // electrician at a distribution board
  solar: U('1509391366360-2e959784a276'), // rooftop solar panels
  team: `${import.meta.env.BASE_URL}images/nav/careers.webp`, // team meeting
  meeting: `${import.meta.env.BASE_URL}images/nav/news.webp`, // laptop meeting
  tools: `${import.meta.env.BASE_URL}images/nav/power.webp`, // tools on technical drawings
  office: `${import.meta.env.BASE_URL}images/nav/commercial.webp`, // open office
  ceiling: `${import.meta.env.BASE_URL}images/nav/industrial.webp`, // office with ceiling lighting
};

const COMPANY_IMG = {
  '/about': IMG.electrician,
  '/team': IMG.team,
  '/careers': IMG.tools,
  '/news': IMG.meeting,
  '/certifications': IMG.tools,
};

const SOLUTION_IMG = {
  '/solutions/residential': IMG.electrician,
  '/solutions/commercial': IMG.office,
  '/solutions/industrial': IMG.ceiling,
  '/solutions/power-backup': IMG.tools,
  '/solutions/solar': IMG.solar,
  '/solutions/testing': IMG.ceiling,
};

const GUIDE_IMG = [IMG.electrician, IMG.solar, IMG.tools, IMG.office];

const pageKey = (href) => href.replace(/^\//, '').replace(/\//g, '-');
const pad = (n) => String(n).padStart(2, '0');

const uniqueLinks = (links) => {
  const seen = new Set();
  return links.filter((l) => !seen.has(l.href) && seen.add(l.href));
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export default function MorphPanel({ panel, t, onNavLinkClick, close, primed }) {
  const [hover, setHover] = useState(0);
  const src = (url) => (primed ? url : undefined); // load photos on first hover only

  /* ---------- Company: list + preview */
  if (panel.key === 'company') {
    const items = uniqueLinks(panel.links).filter((l) => COMPANY_IMG[l.href]);
    const active = items[hover] || items[0];
    return (
      <div className="nv-mx nv-mx-co" role="region" aria-label={t[panel.regionKey]}>
        <ul className="nv-mx-co-list">
          {items.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                data-page={pageKey(item.href)}
                className={`nv-mx-co-item${i === hover ? ' on' : ''}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={onNavLinkClick}
              >
                <span className="nv-mx-co-text">
                  <b>{t[item.tKey]}</b>
                  <span>{t[item.sKey]}</span>
                </span>
                <span className="nv-mx-go" aria-hidden="true"><Arrow /></span>
              </a>
            </li>
          ))}
        </ul>
        <div className="nv-mx-co-preview">
          {items.map((item, i) => (
            <img
              key={item.href}
              src={src(COMPANY_IMG[item.href])}
              alt=""
              aria-hidden="true"
              className={i === hover ? 'on' : ''}
              decoding="async"
            />
          ))}
          <button type="button" className="nv-mx-x" onClick={close} aria-label="Close menu">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
          <span className="nv-mx-count">
            <b>{pad(hover + 1)}</b>
            <span className="nv-mx-count-total"> / {pad(items.length)}</span>
            <span className="nv-mx-count-dot" aria-hidden="true">·</span>
            <span>{active ? t[active.tKey] : ''}</span>
          </span>
        </div>
      </div>
    );
  }

  /* ---------- Solutions: expanding photo cards */
  if (panel.key === 'solutions') {
    const items = uniqueLinks(panel.links);
    return (
      <div className="nv-mx nv-mx-sol" role="region" aria-label={t[panel.regionKey]} onMouseLeave={() => setHover(-1)}>
        {items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            data-page={pageKey(item.href)}
            className={`nv-mx-card${i === hover ? ' on' : ''}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={onNavLinkClick}
          >
            <img src={src(SOLUTION_IMG[item.href])} alt="" aria-hidden="true" decoding="async" />
            <span className="nv-mx-card-shade" aria-hidden="true" />
            <span className="nv-mx-card-text">
              <b>{t[item.tKey]}</b>
              <span>{t[item.sKey]}</span>
              <em className="nv-mx-card-go">Explore <Arrow /></em>
            </span>
          </a>
        ))}
      </div>
    );
  }

  /* ---------- Resources: compact list of guides */
  const guides = blog.posts.slice(0, 4);
  return (
    <div className="nv-mx nv-mx-res" role="region" aria-label={t[panel.regionKey]}>
      <div className="nv-mx-res-head">
        <span>Latest guides</span>
        <a href="/blog" data-page="blog" onClick={onNavLinkClick}>
          All guides <ArrowUpRight />
        </a>
      </div>
      <ul className="nv-mx-res-list">
        {guides.map((post, i) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`} data-page="blog" className="nv-mx-res-row" onClick={onNavLinkClick}>
              <img src={src(GUIDE_IMG[i % GUIDE_IMG.length])} alt="" aria-hidden="true" decoding="async" />
              <span className="nv-mx-res-text">
                <b>{post.title}</b>
                <span>{post.excerpt}</span>
              </span>
              <span className="nv-mx-res-time">{post.readTime}</span>
              <span className="nv-mx-go" aria-hidden="true"><ArrowUpRight /></span>
            </a>
          </li>
        ))}
      </ul>
      <div className="nv-mx-res-foot">
        {uniqueLinks(panel.links)
          .filter((l) => l.href !== '/blog')
          .map((l) => (
            <a key={l.href} href={l.href} data-page={pageKey(l.href)} onClick={onNavLinkClick}>
              {t[l.tKey]}
            </a>
          ))}
      </div>
    </div>
  );
}
