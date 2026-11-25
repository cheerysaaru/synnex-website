/* /areas (every district) and /areas/:district (districts with real work).
   Each district page lists the actual clients there, so the pages are not
   copies of each other with only the place name changed. */
import { PageHero, SectionHeading, Card, CTABand } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';
import { useSeo, SITE_URL } from '../lib/seo.js';
import { company, solutions } from '../data/site-data.js';
import { CLIENT_GROUPS, DISTRICTS, PROVINCES, AREA_PAGES, clientsIn } from '../data/clients.js';
import { NotFoundPage } from './MiscPages.jsx';

const SERVICE_ORDER = ['lightning-protection', 'residential', 'commercial', 'industrial', 'solar', 'testing', 'power-backup'];
const hasPage = (slug) => AREA_PAGES.some((d) => d.slug === slug);

function businessJsonLd(areas) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ElectricalContractor',
    name: company.name,
    url: `${SITE_URL}/`,
    telephone: company.phoneHref,
    email: company.email,
    address: { '@type': 'PostalAddress', addressLocality: company.addressLocality, addressCountry: company.addressCountry },
    areaServed: areas.map((d) => ({ '@type': 'AdministrativeArea', name: `${d.name} District, Sri Lanka` })),
    knowsAbout: ['Lightning protection', 'Lightning arrester installation', 'Earthing', 'Surge protection', 'Electrical installation', 'Solar PV'],
  };
}

export function AreasPage() {
  useSeo({
    title: 'Areas we serve: lightning protection and electrical work across Sri Lanka',
    description: 'Synnex Technology works in all 25 districts of Sri Lanka: lightning arresters, earthing, wiring and solar, with past work in Jaffna, Vavuniya, Batticaloa, Colombo and more.',
    path: '/areas',
    jsonLd: businessJsonLd(DISTRICTS),
  });

  return (
    <>
      <PageHero
        eyebrow="Areas we serve"
        title="Lightning protection and electrical work in every district."
        intro="We travel island-wide. Below are all 25 districts of Sri Lanka, with the places we have already worked."
      />

      <section className="sec">
        <div className="w areas">
          {PROVINCES.map((prov) => (
            <div className="areas-prov" key={prov.key}>
              <h2 className="areas-prov-title">{prov.name}</h2>
              <ul className="areas-list">
                {DISTRICTS.filter((d) => d.province === prov.key).map((d) => {
                  const n = clientsIn(d.slug).length;
                  return (
                    <li key={d.slug}>
                      {hasPage(d.slug) ? (
                        <Link to={`/areas/${d.slug}`} className="areas-item has-work">
                          <span className="areas-name">{d.name}</span>
                          <span className="areas-count"><b>{n}</b> <span>{n === 1 ? 'site' : 'sites'}</span></span>
                        </Link>
                      ) : (
                        <span className="areas-item">
                          <span className="areas-name">{d.name}</span>
                          <span className="areas-count">Available</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <CTABand intro="Your district is not listed with past work? We still come to you. Tell us about the site." />
    </>
  );
}

export function AreaPage({ slug }) {
  const district = DISTRICTS.find((d) => d.slug === slug);
  const clients = district ? clientsIn(slug) : [];
  const n = clients.length;

  useSeo({
    title: district ? `Lightning protection and electrical engineer in ${district.name} district` : 'Area not found',
    description: district
      ? `Lightning arresters, earthing, wiring and solar for homes, hospitals, schools and temples in ${district.name} district. ${n} sites served by Synnex Technology.`
      : 'This area page could not be found.',
    path: `/areas/${slug}`,
    jsonLd: district ? businessJsonLd([district]) : undefined,
  });

  if (!district || !n) return <NotFoundPage />;

  const province = PROVINCES.find((p) => p.key === district.province);
  const neighbours = DISTRICTS.filter((d) => d.province === district.province && d.slug !== slug);
  const groups = CLIENT_GROUPS.map((g) => ({ ...g, items: clients.filter((c) => c.group === g.key) })).filter((g) => g.items.length);
  const services = SERVICE_ORDER.map((k) => solutions.items[k]).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={province.name}
        title={`Lightning protection and electrical engineering in ${district.name} district`}
        intro={`${n} sites in ${district.name} district have trusted Synnex with their electrical work.`}
      />

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Clients" title={`Our clients in ${district.name} district`} />
          <div className="area-clients">
            {groups.map((g) => (
              <div className="area-group" key={g.key}>
                <h3>{g.label}</h3>
                <ul>
                  {g.items.map((c) => (
                    <li key={c.name}>{c.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Services" title="Services available in this district" />
          <div className="grid grid-3">
            {services.map((s) => (
              <Card key={s.slug} href={`/solutions/${s.slug}`} className="solution-card">
                <h3>{s.title}</h3>
                <p>{s.intro}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Nearby" title={`Also in the ${province.name}`} />
          <ul className="areas-list">
            {neighbours.map((d) => (
              <li key={d.slug}>
                {hasPage(d.slug) ? (
                  <Link to={`/areas/${d.slug}`} className="areas-item has-work">
                    <span className="areas-name">{d.name}</span>
                    <span className="areas-count"><b>{clientsIn(d.slug).length}</b> <span>{clientsIn(d.slug).length === 1 ? 'site' : 'sites'}</span></span>
                  </Link>
                ) : (
                  <span className="areas-item">
                    <span className="areas-name">{d.name}</span>
                    <span className="areas-count">Available</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="area-all"><Link to="/areas">All districts we serve</Link></p>
        </div>
      </section>

      <CTABand intro="Planning lightning protection or electrical work here? Tell us about the site." />
    </>
  );
}
