import { Link } from '../lib/router.jsx';
import { NAV_MENUS } from '../data/navMenus.js';
import { company } from '../data/site-data.js';
import '../footer.css';

/* Full site footer: call-to-action strip, brand, link columns built from the
   same data as the mega menus, contact details, and a bottom bar. */
export default function SiteFooter({ t, en = {} }) {
  const tr = (key, fallback) => t?.[key] ?? en[key] ?? fallback;
  const year = new Date().getFullYear();

  const columns = NAV_MENUS.map((menu) => {
    const seen = new Set();
    const links = menu.links.filter((link) => !seen.has(link.href) && seen.add(link.href)).slice(0, 5);
    return { key: menu.key, label: tr(menu.labelKey, menu.key), links };
  });

  return (
    <footer className="ft">
      <div className="ft-in">
        {/* call-to-action strip */}
        <div className="ft-cta">
          <h2 className="ft-cta-h">{tr('footer.cta', 'Have a project in mind? Let’s talk.')}</h2>
          <div className="ft-cta-actions">
            <a className="hm-pill hm-pill-light" href={`tel:${company.phoneHref}`}>{tr('btn.callUs', 'Call us')}</a>
            <Link className="hm-pill ft-pill-ghost" to="/contact">{tr('nav.contact', 'Contact')}</Link>
          </div>
        </div>

        {/* brand + columns */}
        <div className="ft-grid">
          <div className="ft-brand">
            <Link className="ft-logo" to="/">Synnex</Link>
            <p>{tr('footer.slogan', company.slogan)}</p>
            <p className="ft-owner">{company.owner} · {company.addressLocality}, {company.addressCountryName}</p>
          </div>

          {columns.map((col) => (
            <nav className="ft-col" key={col.key} aria-label={col.label}>
              <h3>{col.label}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href}>{tr(link.tKey, link.href)}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="ft-col ft-contact">
            <h3>{tr('nav.contact', 'Contact')}</h3>
            <ul>
              <li><a className="ft-call" href={`tel:${company.phoneHref}`}>{tr('btn.callUs', 'Call us')}</a></li>
              <li><a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></li>
              <li><a href={company.emailHref}>{company.email}</a></li>
              <li className="ft-muted">{company.hours}</li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="ft-bottom">
          <span>&copy; {year} {tr('footer.copyright', 'Synnex Technology. All rights reserved.')}</span>
          <span className="ft-bottom-links">
            <Link to="/projects">{tr('nav.projects', 'Projects')}</Link>
            <Link to="/faq">FAQ</Link>
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {tr('footer.top', 'Back to top')} ↑
            </a>
          </span>
        </div>
      </div>

      <div className="ft-wordmark" aria-hidden="true">SYNNEX</div>
    </footer>
  );
}
