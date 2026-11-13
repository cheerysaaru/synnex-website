/* Per-page SEO: unique title, meta description, Open Graph, JSON-LD. */
import { useEffect } from 'react';

const SITE = 'Synnex Technology';

const setMeta = (key, content, attr = 'name') => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export function useSeo({ title, description, type = 'website', jsonLd, path }) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`;
    document.title = fullTitle;
    const url = window.location.origin + (path || window.location.pathname);
    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:site_name', SITE, 'property');
    setMeta('twitter:card', 'summary_large_image');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    let script = document.getElementById('page-jsonld');
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, type, path, jsonLd]);
}

export function localBusinessJsonLd(company) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ElectricalContractor',
    name: company.name,
    description: company.description,
    url: window.location.origin + '/',
    telephone: company.phoneHref,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.addressLocality,
      addressCountry: company.addressCountry,
    },
    areaServed: company.areaServed,
    openingHours: 'Mo-Fr 10:00-18:00',
  };
}
