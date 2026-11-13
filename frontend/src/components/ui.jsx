/* Shared page building blocks — one source for markup used across routes. */
import { useState } from 'react';
import { Link } from '../lib/router.jsx';
import { company } from '../data/site-data.js';

export function PageHero({ eyebrow, title, intro, children }) {
  return (
    <header className="page-hero">
      <div className="w">
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h1 className="page-title">{title}</h1>
        {intro ? <p className="page-intro">{intro}</p> : null}
        {children ? <div className="page-hero-actions">{children}</div> : null}
      </div>
    </header>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = 'left', as: Tag = 'h2' }) {
  return (
    <div className={`sec-head ${align}`.trim()}>
      {eyebrow ? <span className="k">{eyebrow}</span> : null}
      <Tag className="sec-title">{title}</Tag>
      {intro ? <p className="sec-intro">{intro}</p> : null}
    </div>
  );
}

export function Card({ href, children, className = '', ...rest }) {
  const cls = `ui-card ${className}`.trim();
  if (href) {
    return (
      <Link to={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`.trim()}>{children}</span>;
}

export function Placeholder({ label = 'Image', className = '', ratio, children }) {
  return (
    <div
      className={`ph ${className}`.trim()}
      style={ratio ? { aspectRatio: ratio } : undefined}
      role="img"
      aria-label={label}
    >
      <span>{children || label}</span>
    </div>
  );
}

export function Prose({ children }) {
  return <div className="prose">{children}</div>;
}

export function CTABand({ title = 'Talk to an engineer', intro }) {
  return (
    <section className="cta-band" aria-labelledby="cta-band-title">
      <div className="w cta-band-in">
        <div className="cta-band-copy">
          <span className="page-eyebrow">Get in touch</span>
          <h2 id="cta-band-title" className="cta-band-title">{title}</h2>
          {intro ? <p className="cta-band-intro">{intro}</p> : null}
        </div>
        <div className="cta-band-actions">
          <a className="btn" href={`tel:${company.phoneHref}`}>Call us</a>
          <a className="btn ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="btn ghost" href={company.emailHref}>Email us</a>
        </div>
      </div>
    </section>
  );
}

export function Accordion({ items, idPrefix = 'acc', defaultOpen = -1, multiple = false }) {
  const [open, setOpen] = useState(defaultOpen >= 0 ? [defaultOpen] : []);

  const toggle = (index) => {
    setOpen((prev) => {
      if (prev.includes(index)) return prev.filter((x) => x !== index);
      return multiple ? [...prev, index] : [index];
    });
  };

  return (
    <div className="acc">
      {items.map((item, index) => {
        const id = `${idPrefix}-${index}`;
        const isOpen = open.includes(index);
        const title = item.title ?? item.q;
        const body = item.content ?? item.a;
        return (
          <div className={`acc-item${isOpen ? ' open' : ''}`} key={id}>
            <h3 className="acc-h">
              <button
                type="button"
                className="acc-trigger"
                id={`${id}-trigger`}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => toggle(index)}
              >
                <span>{title}</span>
                <span className="acc-icon" aria-hidden="true" />
              </button>
            </h3>
            <div
              className="acc-panel"
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-trigger`}
              hidden={!isOpen}
            >
              <div className="acc-panel-in">{body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
