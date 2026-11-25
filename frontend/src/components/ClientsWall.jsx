/* ==========================================================================
   ClientsWall — every client in one list, with category buttons that show
   how many sites each group has. Choosing a category lights up its names and
   dims the rest. English text, translated by lib/i18n.js (client names are
   proper names and stay as written).
   Source: Synnex customer list. Private contact names and phone numbers are
   deliberately not published.
   ========================================================================== */
import { useState } from 'react';
import { Link } from '../lib/router.jsx';
import { CLIENTS, CLIENT_GROUPS } from '../data/clients.js';

const GROUPS = CLIENT_GROUPS.map((g) => ({ ...g, names: CLIENTS.filter((c) => c.group === g.key).map((c) => c.name) }));
const ALL = GROUPS.flatMap((g) => g.names.map((name) => ({ name, key: g.key })));

export default function ClientsWall() {
  const [active, setActive] = useState('all');
  const tabs = [{ key: 'all', label: 'All clients', count: ALL.length }, ...GROUPS.map((g) => ({ key: g.key, label: g.label, count: g.names.length }))];
  const current = tabs.find((t) => t.key === active);

  return (
    <section className="cw" id="clients" aria-labelledby="cw-title">
      <div className="cw-w">
        <div className="cw-top">
          <h2 id="cw-title">{`Trusted by ${ALL.length} sites across Sri Lanka.`}</h2>
          <p>Hospitals, universities, councils, temples and apartments, from Jaffna and Batticaloa to Colombo.</p>
        </div>

        <div className="cw-tabs" role="group" aria-label="Show clients by type">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={active === t.key}
              onClick={() => setActive(t.key)}
            >
              <span>{t.label}</span>
              <b>{t.count}</b>
            </button>
          ))}
        </div>

        <p className="cw-wall">
          {ALL.map((c, i) => (
            <span key={c.name} className="cw-item">
              <span className={active === 'all' || active === c.key ? 'cw-name' : 'cw-name is-dim'}>{c.name}</span>
              {i < ALL.length - 1 ? <i aria-hidden="true">/</i> : null}
            </span>
          ))}
        </p>
        <p className="cw-live" aria-live="polite">
          <span>Showing</span> <b>{current.count}</b> <span>{current.label}</span>
        </p>
        <Link className="cw-areas" to="/areas">See our work by district</Link>
      </div>
    </section>
  );
}
