/* Cookie banner: shown to every visitor until they choose, and again from
   "Cookie settings" in the footer. */
import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { getConsent, setConsent, OPEN_SETTINGS_EVENT } from '../lib/cookies.js';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('cookie-open', open);
    return () => document.body.classList.remove('cookie-open');
  }, [open]);

  const choose = (choice) => { setConsent(choice); setOpen(false); };

  if (!open) return null;
  return (
    <section className="sck" role="dialog" aria-modal="false" aria-labelledby="sck-title" aria-describedby="sck-text">
      <div className="sck-head">
        <span className="sck-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z" />
            <circle cx="8.5" cy="11.5" r="1" fill="currentColor" /><circle cx="12" cy="16" r="1" fill="currentColor" /><circle cx="15.5" cy="13" r="1" fill="currentColor" />
          </svg>
        </span>
        <h2 id="sck-title" className="sck-title">We use cookies</h2>
      </div>
      <p id="sck-text" className="sck-text">
        We use cookies to keep you logged in, keep the site secure and remember your language. We do not use advertising cookies.
      </p>
      <div className="sck-actions">
        <button type="button" className="sck-btn sck-btn-primary" onClick={() => choose('all')}>Accept all</button>
        <button type="button" className="sck-btn sck-btn-ghost" onClick={() => choose('essential')}>Essential only</button>
      </div>
      <Link className="sck-link" to="/cookies">Cookie policy</Link>
    </section>
  );
}
