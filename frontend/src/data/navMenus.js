/* --------------------------------------------------------------------------
   Mega-menu panel data — single source of truth for all three panels.
   Translation keys reference NAV_T (en / ta / si). Copy is not changed here.
   hrefs point at the real inner-page routes.
-------------------------------------------------------------------------- */

export const NAV_MENUS = [
  {
    key: 'company',
    id: 'mega-company',
    labelKey: 'nav.company',
    regionKey: 'co.region',
    kickerKey: 'co.kicker',
    headingKey: 'co.h',
    textKey: 'co.p',
    ctaKey: 'co.cta',
    ctaHref: '/about',
    colLabelKey: 'co.label',
    links: [
      { tKey: 'co.d1.t', sKey: 'co.d1.s', href: '/about' },
      { tKey: 'co.d2.t', sKey: 'co.d2.s', href: '/team' },
      { tKey: 'co.d3.t', sKey: 'co.d3.s', href: '/careers' },
      { tKey: 'co.d4.t', sKey: 'co.d4.s', href: '/news' },
      { tKey: 'co.i3.t', sKey: 'co.i3.s', href: '/certifications' },
      { tKey: 'co.i1.t', sKey: 'co.i1.s', href: '/about' },
    ],
    feature: {
      href: '/about',
      tKey: 'co.f.t',
      sKey: 'co.f.s',
      altKey: 'co.f.alt',
      img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=640&h=400&q=70&fm=webp',
    },
  },
  {
    key: 'solutions',
    id: 'mega-solutions',
    labelKey: 'nav.solutions',
    regionKey: 'sol.region',
    kickerKey: 'sol.kicker',
    headingKey: 'sol.h',
    textKey: 'sol.p',
    ctaKey: 'sol.cta',
    ctaHref: '/solutions',
    colLabelKey: 'sol.label',
    links: [
      { tKey: 'sol.d1.t', sKey: 'sol.d1.s', href: '/solutions/residential' },
      { tKey: 'sol.d2.t', sKey: 'sol.d2.s', href: '/solutions/commercial' },
      { tKey: 'sol.d3.t', sKey: 'sol.d3.s', href: '/solutions/industrial' },
      { tKey: 'sol.i4.t', sKey: 'sol.i4.s', href: '/solutions/power-backup' },
      { tKey: 'sol.i5.t', sKey: 'sol.i5.s', href: '/solutions/solar' },
      { tKey: 'sol.i6.t', sKey: 'sol.i6.s', href: '/solutions/testing' },
    ],
    feature: {
      href: '/solutions/solar',
      tKey: 'sol.f.t',
      sKey: 'sol.f.s',
      altKey: 'sol.f.alt',
      img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=640&h=400&q=70&fm=webp',
    },
  },
  {
    key: 'resources',
    id: 'mega-resources',
    labelKey: 'nav.resources',
    regionKey: 'res.region',
    kickerKey: 'res.kicker',
    headingKey: 'res.h',
    textKey: 'res.p',
    ctaKey: 'res.cta',
    ctaHref: '/faq',
    colLabelKey: 'res.label',
    links: [
      { tKey: 'res.d1.t', sKey: 'res.d1.s', href: '/blog' },
      { tKey: 'res.d2.t', sKey: 'res.d2.s', href: '/case-studies' },
      { tKey: 'res.d3.t', sKey: 'res.d3.s', href: '/docs' },
      { tKey: 'res.d4.t', sKey: 'res.d4.s', href: '/faq' },
      { tKey: 'res.i1.t', sKey: 'res.i1.s', href: '/faq' },
      { tKey: 'res.i2.t', sKey: 'res.i2.s', href: '/docs' },
    ],
    feature: {
      href: '/resources/solar-guide',
      tKey: 'res.f.t',
      sKey: 'res.f.s',
      // Image is a consumer unit / distribution board (not a code screen).
      altKey: 'res.f.alt',
      img: 'https://images.unsplash.com/photo-1592676897219-e047395b762f?auto=format&fit=crop&w=640&h=400&q=70&fm=webp',
    },
  },
];
