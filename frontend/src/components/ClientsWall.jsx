/* ==========================================================================
   ClientsWall — every client in one list, with category buttons that show
   how many sites each group has. Choosing a category lights up its names and
   dims the rest. English text, translated by lib/i18n.js (client names are
   proper names and stay as written).
   Source: Synnex customer list. Private contact names and phone numbers are
   deliberately not published.
   ========================================================================== */
import { useState } from 'react';

const GROUPS = [
  {
    key: 'health',
    label: 'Hospitals',
    names: [
      'Teaching Hospital Batticaloa',
      'Base Hospital Nindavur',
      'Kytes Hospital',
      'CKD Hospital Mamadu',
      'CKD Hospital Padaviya',
      'CKD Hospital Padaviya Siripura',
      'CKD Hospital Heppitikollawa',
      'CKD Hospital Cheddikulam',
      'CKD Hospital Mallavi',
      'Siddha Medicine Unit, Kaithady',
    ],
  },
  {
    key: 'edu',
    label: 'Schools and universities',
    names: [
      'University of Jaffna, Jaffna hostel',
      'University of Jaffna, Pambaimadu hostel',
      'Eastern University of Sri Lanka',
      'St John’s College, Jaffna',
      'Jaffna Central College',
      'Kopay Christian College',
      'Holy Family Convent, Jaffna',
      'Vivekananda College, Kalladi',
      'Al-Mazhar Girls’ High School, Ninthavur',
      'Al Ameen School, Eravur',
      'Sudaikkadu Tamil Vidyalayam, Trincomalee',
      'Aandaankulam M.V., Mannar',
      'Katchilaimadu M.V., Oddusuddan',
      'GTMS School, Iyakkachchi',
      'Mukkomban Maha Vidyalayam, Kilinochchi',
    ],
  },
  {
    key: 'temple',
    label: 'Temples',
    names: [
      'Rajeswari Amman Temple, Maviddapuram',
      'Puthukkudiyiruppu Kandasamy Kovil',
      'Ponnalai Varatharaja Perumal Temple',
      'Alvai Alaadi Pillaiyar Kovil',
      'Sivan Kovil, Vavuniya',
      'Pootharaayar Temple, Kondavil',
    ],
  },
  {
    key: 'gov',
    label: 'Government',
    names: [
      'District Secretariat, Jaffna',
      'Provincial Council Building, Kaithady',
      'Urban Council Chavakachcheri',
      'Urban Council Valvettithurai',
      'Fire Brigade, Kilinochchi',
    ],
  },
  {
    key: 'apt',
    label: 'Apartments',
    names: [
      'ONEX Apartment, Dehiwala',
      'Orchard Apartment, Colombo 06',
      'Sky City Apartment, Colombo 06',
      'Vivekananda Apartment, Colombo 06',
    ],
  },
  {
    key: 'biz',
    label: 'Hotels and business',
    names: [
      'Yarl Beach Hotel, Nelliyady',
      'Rose Cottage Hotel, Kilinochchi',
      'Honda Motors, Vavuniya',
      'Agash Textiles',
      'Paddy Store, Oddusuddan',
      'VRSDO, Mankulam',
      'Iniya Vaalvu Illam, Vallipunam',
      'Badminton Court, Mullaitivu',
    ],
  },
];

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
      </div>
    </section>
  );
}
