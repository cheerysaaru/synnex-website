/* /cookies — what the site stores in the visitor's browser, and their choice. */
import { useEffect, useState } from 'react';
import { PageHero } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { getConsent, setConsent, OPEN_SETTINGS_EVENT } from '../lib/cookies.js';
import { company } from '../data/site-data.js';

const ROWS = [
  ['Login session', 'Keeps you logged in to your account and Track my job.', 'Essential', '2 hours'],
  ['synnex_cookies', 'Remembers your cookie choice so we do not ask again.', 'Essential', '1 year'],
  ['synnext_lang', 'Remembers your language (English, Tamil or Sinhala). Saved in your browser, not sent to us.', 'Essential', 'Until you clear it'],
];

export function CookiesPage() {
  const [choice, setChoice] = useState(getConsent());

  useSeo({
    title: 'Cookie policy',
    description: 'Which cookies Synnex Technology uses and how to change your choice.',
    path: '/cookies',
  });

  useEffect(() => {
    // the banner may change the choice while this page is open
    const sync = () => setTimeout(() => setChoice(getConsent()), 0);
    window.addEventListener(OPEN_SETTINGS_EVENT, sync);
    document.addEventListener('click', sync);
    return () => { window.removeEventListener(OPEN_SETTINGS_EVENT, sync); document.removeEventListener('click', sync); };
  }, []);

  const choose = (c) => { setConsent(c); setChoice(c); };

  return (
    <>
      <PageHero eyebrow="Cookie policy" title="How we use cookies." intro="Cookies are small files a website saves in your browser. Here is every one we use." />
      <section className="sec">
        <div className="w ckp">
          <h2>Cookies we use</h2>
          <div className="sckp-table-wrap">
            <table className="sckp-table">
              <thead><tr><th>Name</th><th>What it does</th><th>Type</th><th>How long</th></tr></thead>
              <tbody>
                {ROWS.map(([name, what, type, time]) => (
                  <tr key={name}><td><code>{name}</code></td><td>{what}</td><td>{type}</td><td>{time}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>We do not use advertising cookies and we do not sell your data. Our enquiry form does not add any cookies.</p>

          <h2>Your choice</h2>
          <p>Essential cookies are needed for logging in and for the site to work safely. You can change your choice at any time.</p>
          <div className="sckp-choice">
            <span className="sckp-current">
              Your choice: <b>{choice === 'all' ? 'Accept all' : choice === 'essential' ? 'Essential only' : 'Not chosen yet'}</b>
            </span>
            <button type="button" className="sck-btn sck-btn-primary" style={{ flex: 'none' }} onClick={() => choose('all')}>Accept all</button>
            <button type="button" className="sck-btn sck-btn-ghost" style={{ flex: 'none' }} onClick={() => choose('essential')}>Essential only</button>
          </div>

          <h2>Questions</h2>
          <p>Questions about cookies or your data? Get in touch.</p>
          <div className="sckp-choice">
            <Link className="btn" to="/contact">Contact us</Link>
            <a className="sck-link" style={{ marginTop: 0 }} href={company.emailHref}>{company.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
