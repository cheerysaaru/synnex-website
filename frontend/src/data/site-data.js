/* ==========================================================================
   site-data.js — single source of truth for inner-page content.

   NOTE: Company / services / testimonials / pillars / steps / FAQ copy below
   was scaffolded from the existing App.jsx content. Keys that did not exist
   on the current site (team, certifications, careers, news, blog,
   case studies, docs, safety checklist, solar guide) are clearly-marked
   placeholders to be replaced with real content before launch.
   Do not hardcode copy in components — render from this file.
   ========================================================================== */

export const company = {
  name: 'Synnex Technology',
  legalName: 'Synnex Technology',
  owner: 'K. Arulalagan',
  phone: '077 758 8128',
  phoneHref: '+94777588128',
  whatsapp: '94777588128',
  email: 'vkarull@gmail.com',
  emailHref: 'mailto:vkarull@gmail.com',
  addressLocality: 'Colombo',
  addressCountry: 'LK',
  addressCountryName: 'Sri Lanka',
  hours: 'Monday–Friday, 10:00 AM–6:00 PM',
  slogan: 'Safe, reliable electrical solutions for Sri Lanka',
  description:
    'Safe, reliable electrical engineering, solar PV, wiring, installation and maintenance services across Colombo and Sri Lanka.',
  areaServed: 'Sri Lanka',
};

export const about = {
  eyebrow: 'About Synnex',
  title: 'Engineering you can stand behind.',
  intro:
    'A Colombo-based electrical engineering practice. The engineer you meet is the engineer who plans, installs and tests the job.',
  story: [
    'Synnex Technology was built around a simple idea: electrical work should be explained clearly, planned properly and finished exactly as promised.',
    'Every project is led by the same engineer from first site visit to final handover. That means fewer surprises, honest advice and a system you can trust for years.',
    'We work across homes, businesses and industrial sites in Colombo and island-wide — from a single socket repair to complete distribution and solar PV systems.',
  ],
  stats: [
    { value: '12+', label: 'Years of field experience' },
    { value: '850+', label: 'Projects completed' },
    { value: '100%', label: 'Work tested before handover' },
    { value: '24/7', label: 'Support after switch-on' },
  ],
  timeline: [
    { year: '2012', title: 'The first jobs', text: 'Started with residential wiring and maintenance across Colombo.' },
    { year: '2015', title: 'Commercial work', text: 'Grew into offices, retail and small industrial installations.' },
    { year: '2018', title: 'Solar and backup', text: 'Added rooftop solar PV, generators and UPS systems.' },
    { year: '2021', title: 'Design and testing', text: 'Formalised load calculation, inspection and compliance reporting.' },
    { year: 'Today', title: 'Island-wide service', text: 'Serving homes and businesses across Sri Lanka with one accountable team.' },
  ],
  values: [
    { title: 'Safety first', text: 'Good work starts with protecting people, property and everything that depends on your power.' },
    { title: 'Plain advice', text: 'We explain what matters, what it will cost and what your best options are before work begins.' },
    { title: 'Built around your day', text: 'We plan carefully so disruption to your home or business stays as small as possible.' },
    { title: 'Support after switch-on', text: 'Questions after handover? Call the same team that planned and installed your system.' },
  ],
};

export const team = {
  eyebrow: 'Our team',
  title: 'The engineers and technicians behind every job.',
  intro:
    'A small, experienced team that takes ownership from design through to testing and handover.',
  members: [
    {
      name: 'K. Arulalagan',
      role: 'Founder & Lead Engineer',
      bio: 'Leads every project personally, from load calculation and design to final testing and handover.',
      image: null,
    },
    {
      name: 'Placeholder Name',
      role: 'Site Supervisor',
      bio: 'Runs day-to-day installations and keeps every job tidy, safe and on schedule.',
      image: null,
    },
    {
      name: 'Placeholder Name',
      role: 'Solar Technician',
      bio: 'Handles rooftop PV mounting, wiring and commissioning for grid-tied and hybrid systems.',
      image: null,
    },
    {
      name: 'Placeholder Name',
      role: 'Maintenance Electrician',
      bio: 'Carries out inspections, fault finding, thermal checks and preventive maintenance.',
      image: null,
    },
  ],
};

export const safety = {
  eyebrow: 'Safety',
  title: 'Safety is the first thing we plan for.',
  intro:
    'Every installation is designed, tested and documented with the same discipline, whether it is a single socket or a full distribution board.',
  pillars: [
    { title: 'Safety first', text: 'Good work starts with protecting people, property and everything that depends on your power.' },
    { title: 'Testing before handover', text: 'We check every connection and test the system before you ever use it.' },
    { title: 'Correct protection', text: 'Breakers, RCDs and earthing sized to your actual load, not guesswork.' },
    { title: 'Clear documentation', text: 'You receive a written summary of what was done and what to watch for.' },
  ],
  process: [
    { title: 'Assess', text: 'We inspect the site, existing wiring and loads before planning anything.' },
    { title: 'Plan', text: 'We size cables, protection and layout to the real load and future needs.' },
    { title: 'Isolate', text: 'Power is safely isolated and the work area secured before starting.' },
    { title: 'Install', text: 'Tidy, compliant installation with every connection torqued and labelled.' },
    { title: 'Test & hand over', text: 'We test, document and walk you through the finished system.' },
  ],
};

export const certifications = {
  eyebrow: 'Certifications',
  title: 'Standards, licences and safety.',
  // Placeholder data: replace before launch.
  intro:
    'The credentials and standards that guide our work. Items marked as placeholder are awaiting verified details.',
  items: [
    { name: 'Electrical Contractor Licence', body: 'Placeholder issuing body', reference: 'PLACEHOLDER-0001', status: 'Placeholder' },
    { name: 'Wireman Certification', body: 'Placeholder issuing body', reference: 'PLACEHOLDER-0002', status: 'Placeholder' },
    { name: 'Solar PV Installer Accreditation', body: 'Placeholder issuing body', reference: 'PLACEHOLDER-0003', status: 'Placeholder' },
    { name: 'Electrical Safety Compliance', body: 'Placeholder issuing body', reference: 'PLACEHOLDER-0004', status: 'Placeholder' },
  ],
};

export const careers = {
  eyebrow: 'Careers',
  title: 'Build a career where the work speaks for itself.',
  intro:
    'We are a small team that values careful work, clear communication and people who take pride in doing it right.',
  perks: [
    'Fair pay and on-time payment',
    'Training and hands-on mentoring',
    'Modern tools and safe equipment',
    'Varied residential, commercial and solar work',
    'A team that plans properly instead of rushing',
  ],
  openings: [
    {
      title: 'Electrician',
      type: 'Full-time',
      location: 'Colombo',
      summary: 'Installation, maintenance and inspection across residential and commercial sites.',
    },
    {
      title: 'Solar PV Technician',
      type: 'Full-time',
      location: 'Colombo / island-wide',
      summary: 'Rooftop mounting, wiring and commissioning of grid-tied and hybrid systems.',
    },
    {
      title: 'Apprentice Electrician',
      type: 'Full-time',
      location: 'Colombo',
      summary: 'Learn on real projects with mentoring from experienced engineers.',
    },
  ],
  applyNote:
    'To apply, send your name, experience and contact number to vkarull@gmail.com or call us. We reply to every application.',
};

export const news = {
  eyebrow: 'News',
  title: 'Latest updates and announcements.',
  intro: 'Company news, project milestones and practical updates from the field.',
  posts: [
    {
      slug: 'new-solar-installations',
      title: 'Expanding our rooftop solar service',
      date: '2026-08-14',
      tag: 'Company',
      readTime: '3 min read',
      excerpt: 'We have added dedicated equipment and a second crew for grid-tied and hybrid rooftop solar installations.',
    },
    {
      slug: 'safety-inspection-season',
      title: 'Why this is the season to book a safety inspection',
      date: '2026-07-02',
      tag: 'Safety',
      readTime: '4 min read',
      excerpt: 'Small issues in boards and earthing are easy to miss until something fails. Here is what we check.',
    },
    {
      slug: 'colombo-office-move',
      title: 'A bigger workshop for a growing team',
      date: '2026-05-20',
      tag: 'Company',
      readTime: '2 min read',
      excerpt: 'Our new Colombo workshop gives us room to prepare boards and store materials before site work.',
    },
  ],
};

export const solutions = {
  eyebrow: 'Solutions',
  title: 'Explore our solutions.',
  intro:
    'Electrical work for homes, businesses and industry, planned for the way you actually live and work.',
  items: {
    residential: {
      slug: 'residential',
      title: 'Residential Electrical',
      eyebrow: 'Solutions',
      intro: 'Safe, tidy wiring and installation for new homes, renovations and extensions.',
      services: [
        'New builds and rewiring',
        'Lighting and socket layouts',
        'Earthing and protection',
        'Fault finding and repairs',
        'Consumer unit upgrades',
        'Safety inspections for homes',
      ],
      process: [
        { title: 'Visit', text: 'We look at the property and understand how you use power.' },
        { title: 'Design', text: 'We plan circuits, protection and cable routes before touching a wire.' },
        { title: 'Install', text: 'Tidy, careful work with minimal disruption to your household.' },
        { title: 'Test', text: 'Every circuit is tested and labelled before handover.' },
      ],
      faqs: [
        { q: 'Do you rewire older homes?', a: 'Yes. We assess the existing wiring and recommend the safest, most practical path.' },
        { q: 'Can you work while we stay in the house?', a: 'In most cases yes. We plan the work in stages and keep disruptions small.' },
      ],
    },
    commercial: {
      slug: 'commercial',
      title: 'Commercial Electrical',
      eyebrow: 'Solutions',
      intro: 'Dependable electrical systems designed around your site, schedule and operating needs.',
      services: [
        'Offices, shops and plant rooms',
        'Three-phase distribution',
        'Lighting and power circuits',
        'Maintenance contracts',
        'Compliance inspections',
        'Planned around your hours',
      ],
      process: [
        { title: 'Survey', text: 'We review your site, schedule and operating needs.' },
        { title: 'Plan', text: 'We design around downtime and business continuity.' },
        { title: 'Deliver', text: 'Works phased around your opening hours.' },
        { title: 'Verify', text: 'Testing and documentation before sign-off.' },
      ],
      faqs: [
        { q: 'Can you work outside business hours?', a: 'Yes. We plan around your operating hours to keep disruption to a minimum.' },
        { q: 'Do you offer maintenance contracts?', a: 'Yes. Preventive maintenance keeps systems safe and reduces surprises.' },
      ],
    },
    industrial: {
      slug: 'industrial',
      title: 'Industrial Electrical',
      eyebrow: 'Solutions',
      intro: 'Robust installation, machinery power and upkeep for industrial sites.',
      services: [
        'Installations and machinery power',
        'Load calculation and balancing',
        'Cable sizing and routing',
        'Control and protection',
        'Preventive maintenance',
        'Safety and thermal checks',
      ],
      process: [
        { title: 'Assess', text: 'We review loads, machinery and existing infrastructure.' },
        { title: 'Engineer', text: 'We size cables and protection to the real demand.' },
        { title: 'Install', text: 'Heavy-duty installation built for daily operation.' },
        { title: 'Prove', text: 'Load testing and thermal checks before handover.' },
      ],
      faqs: [
        { q: 'Do you handle three-phase systems?', a: 'Yes. We plan, install and balance three-phase loads.' },
        { q: 'Can you work around production?', a: 'Yes. We phase work around your production schedule where possible.' },
      ],
    },
    solar: {
      slug: 'solar',
      title: 'Solar & Renewable Energy',
      eyebrow: 'Solutions',
      intro: 'Smarter solar installations that help you take control of energy costs.',
      services: [
        'Rooftop assessment',
        'Grid-tied and hybrid systems',
        'Clean, safe cable runs',
        'Inverter and battery setup',
        'Commissioning and monitoring',
        'Solar maintenance',
      ],
      process: [
        { title: 'Assess', text: 'We evaluate roof, shading and your energy use.' },
        { title: 'Design', text: 'We size the array, inverter and battery to your needs.' },
        { title: 'Install', text: 'Safe mounting and tidy cable runs.' },
        { title: 'Commission', text: 'Testing, monitoring setup and a full walkthrough.' },
      ],
      faqs: [
        { q: 'Grid-tied or hybrid — which is better?', a: 'It depends on your backup needs and budget. We explain both before you decide.' },
        { q: 'Will solar work during a power cut?', a: 'Only with battery backup and the right inverter setup. We design for that if you need it.' },
      ],
    },
    testing: {
      slug: 'testing',
      title: 'Testing & Inspection',
      eyebrow: 'Solutions',
      intro: 'Clear findings and written reports that tell you exactly what is safe and what needs attention.',
      services: [
        'Fault finding',
        'Thermal and safety checks',
        'Earthing and protection testing',
        'Board and circuit inspection',
        'Written findings',
        'Compliance reviews',
      ],
      process: [
        { title: 'Inspect', text: 'We examine boards, wiring, earthing and protection.' },
        { title: 'Test', text: 'We measure and test the system under real conditions.' },
        { title: 'Report', text: 'You get a clear written list of findings and priorities.' },
        { title: 'Advise', text: 'We explain what must be fixed and what can wait.' },
      ],
      faqs: [
        { q: 'Do I get a written report?', a: 'Yes. You receive clear written findings you can act on.' },
        { q: 'Can you inspect before we buy a property?', a: 'Yes. A pre-purchase electrical inspection can save costly surprises.' },
      ],
    },
    'power-backup': {
      slug: 'power-backup',
      title: 'Power Backup',
      eyebrow: 'Solutions',
      intro: 'Resilient backup power for the moments when continuity matters most.',
      services: [
        'Generator changeover',
        'UPS for critical loads',
        'Villa and office setups',
        'Load prioritisation',
        'Automatic transfer',
        'Testing and maintenance',
      ],
      process: [
        { title: 'Review', text: 'We identify what must stay running during an outage.' },
        { title: 'Design', text: 'We size generator or UPS capacity to critical loads.' },
        { title: 'Install', text: 'Safe changeover and clean, labelled wiring.' },
        { title: 'Test', text: 'We simulate outages and verify the switchover.' },
      ],
      faqs: [
        { q: 'Generator or UPS?', a: 'UPS protects sensitive equipment instantly; generators run longer. Many sites use both.' },
        { q: 'Can you maintain existing backup systems?', a: 'Yes. We service and test existing generators and UPS systems.' },
      ],
    },
  },
};

export const blog = {
  eyebrow: 'Blog',
  title: 'Guides, answers and field notes.',
  intro: 'Practical electrical guidance to help you plan safely and maintain confidently.',
  posts: [
    {
      slug: 'signs-your-board-needs-attention',
      title: 'Five signs your distribution board needs attention',
      date: '2026-09-01',
      tag: 'Safety',
      readTime: '5 min read',
      excerpt: 'Buzzing, warm breakers and tripping circuits are warnings. Here is what they usually mean.',
    },
    {
      slug: 'solar-payback-explained',
      title: 'Solar payback, explained simply',
      date: '2026-08-10',
      tag: 'Solar',
      readTime: '6 min read',
      excerpt: 'How to think about upfront cost, savings and the realistic payback period for rooftop solar.',
    },
    {
      slug: 'choosing-cable-size',
      title: 'Why cable size matters more than you think',
      date: '2026-07-18',
      tag: 'Technical',
      readTime: '4 min read',
      excerpt: 'Undersized cables waste energy and create fire risk. We explain how proper sizing works.',
    },
    {
      slug: 'generator-or-ups',
      title: 'Generator or UPS: what does your site actually need?',
      date: '2026-06-22',
      tag: 'Backup power',
      readTime: '5 min read',
      excerpt: 'The right backup depends on what you cannot afford to lose, and for how long.',
    },
  ],
};

export const caseStudies = {
  eyebrow: 'Case studies',
  title: 'Recent project work.',
  intro: 'A closer look at projects across homes, businesses and industrial sites.',
  items: [
    {
      slug: 'modern-residence-wiring',
      title: 'Modern residence wiring',
      date: '2026-06-12',
      tag: 'Residential',
      sector: 'Residential',
      location: 'Colombo 07',
      image: null,
      excerpt: 'Full rewiring and a new distribution board for a family home.',
      challenge: 'The existing wiring was old, unlabelled and could not safely carry the modern load.',
      solution: 'We rewired circuit by circuit, installed a new labelled board and sized protection to the real load.',
      result: 'A safer, tidier system with clear labelling and headroom for future additions.',
    },
    {
      slug: 'retail-distribution-upgrade',
      title: 'Retail distribution upgrade',
      date: '2026-05-03',
      tag: 'Commercial',
      sector: 'Commercial',
      location: 'Nugegoda',
      image: null,
      excerpt: 'Panel board rework and three-phase balancing for a busy retail space.',
      challenge: 'Frequent tripping and an overloaded board were disrupting trading hours.',
      solution: 'We rebalanced the phases, replaced the board and planned works around opening hours.',
      result: 'Stable supply, no nuisance tripping and a properly documented installation.',
    },
    {
      slug: 'workshop-power-planning',
      title: 'Workshop power planning',
      date: '2026-03-19',
      tag: 'Industrial',
      sector: 'Industrial',
      location: 'Kelaniya',
      image: null,
      excerpt: 'Load calculation and machinery power for a growing workshop.',
      challenge: 'New machinery pushed demand beyond the existing supply and cable capacity.',
      solution: 'We calculated loads, resized cables and added correctly rated protection.',
      result: 'Machinery runs reliably with safe, balanced distribution.',
    },
    {
      slug: 'rooftop-solar-pv',
      title: 'Rooftop solar PV system',
      date: '2026-02-08',
      tag: 'Solar',
      sector: 'Solar',
      location: 'Nugegoda',
      image: null,
      excerpt: 'A 5 kW grid-tied rooftop system with clean, safe cable runs.',
      challenge: 'The owner wanted to reduce daytime energy costs without compromising roof integrity.',
      solution: 'We assessed shading, sized a 5 kW array and installed tidy, protected cable runs.',
      result: 'Lower daytime bills and a monitored system the owner can see at a glance.',
    },
  ],
};

export const docs = {
  eyebrow: 'Documentation',
  title: 'Technical guides and standards.',
  intro: 'Reference material and practical guides for safer electrical installations.',
  categories: [
    {
      category: 'Installation guides',
      items: [
        { title: 'Consumer unit labelling guide', desc: 'How to label circuits clearly for safe maintenance.' },
        { title: 'Cable routing best practices', desc: 'Keeping runs tidy, protected and accessible.' },
        { title: 'Earthing and bonding basics', desc: 'Why earthing matters and how it is tested.' },
      ],
    },
    {
      category: 'Solar',
      items: [
        { title: 'Rooftop PV commissioning checklist', desc: 'Steps to verify a solar installation before handover.' },
        { title: 'Inverter sizing notes', desc: 'Matching inverter capacity to array and load.' },
      ],
    },
    {
      category: 'Safety',
      items: [
        { title: 'Isolation and lock-off procedure', desc: 'Safe isolation before any work begins.' },
        { title: 'Thermal inspection guide', desc: 'Using thermal checks to catch hidden faults.' },
        { title: 'RCD testing intervals', desc: 'How often protection devices should be tested.' },
      ],
    },
  ],
};

export const faq = {
  eyebrow: 'FAQ',
  title: 'Questions, answered.',
  intro: 'Quick answers to the questions we hear most. Still unsure? Talk to an engineer.',
  items: [
    { q: 'Do you work outside Colombo?', a: 'Yes. Synnex Technology serves clients across Sri Lanka. Share your location and project type and we will advise on the best next step.' },
    { q: 'Can you inspect an existing electrical system?', a: 'Yes. We check wiring, boards and earthing, then give you a clear list of what is safe and what needs attention.' },
    { q: 'Do you install solar panels and backup power?', a: 'Yes. We design and install rooftop solar PV, generators and UPS systems.' },
    { q: 'How do I request a quote?', a: 'Use the contact options below, call us or message us on WhatsApp. Tell us the location and what you need.' },
    { q: 'How long does a typical installation take?', a: 'It depends on scope. A simple job may take a day; a full rewire or solar install is planned in stages with a clear timeline.' },
    { q: 'Do you provide written reports?', a: 'Yes. Inspections and testing come with written findings you can act on.' },
    { q: 'Are your installations tested before handover?', a: 'Every installation is tested and labelled before we hand it over.' },
    { q: 'Can you work around my business hours?', a: 'Yes. We plan commercial work around your operating hours to keep disruption to a minimum.' },
    { q: 'Do you offer maintenance after installation?', a: 'Yes. Preventive maintenance and aftercare are available for homes, businesses and solar systems.' },
    { q: 'What areas do you cover?', a: 'Colombo and island-wide. Tell us your location and we will confirm the best next step.' },
  ],
};

export const safetyChecklist = {
  eyebrow: 'Safety checklist',
  title: 'Home electrical safety checklist.',
  intro:
    'Work through these eight checks. Nothing is stored or sent — this is a quick self-assessment you can use before booking an inspection.',
  items: [
    'Consumer unit / board is clearly labelled',
    'No scorch marks, buzzing or warmth at breakers',
    'RCD / earth-leakage protection trips when tested',
    'Sockets and switches are free of cracks or looseness',
    'No overloaded multi-adaptors or daisy-chained extensions',
    'Earthing is present and intact at main points',
    'Outdoor and wet-area circuits are properly protected',
    'No exposed or damaged wiring anywhere visible',
  ],
  note: 'If any box is unchecked, book an inspection. A short visit can catch issues before they become costly or dangerous.',
};

export const solarGuide = {
  eyebrow: 'Solar guide',
  title: 'A practical guide to rooftop solar.',
  intro:
    'What to know before you invest in solar PV in Sri Lanka — sizing, costs, backup and maintenance.',
  sections: [
    {
      id: 'how-solar-works',
      title: 'How rooftop solar works',
      body: [
        'Solar panels convert daylight into direct current, which an inverter turns into usable electricity for your home or business.',
        'In a grid-tied system, surplus power can be exported; in a hybrid system, batteries store energy for evening use or outages.',
      ],
    },
    {
      id: 'sizing-a-system',
      title: 'Sizing a system',
      body: [
        'System size depends on your daytime consumption, available roof area and budget. A site visit and a look at past bills give the most reliable estimate.',
        'We size the array, inverter and battery together so the components work as one system rather than against each other.',
      ],
    },
    {
      id: 'costs-and-payback',
      title: 'Costs and payback',
      body: [
        'Upfront cost depends on system size, panel type and whether batteries are included. Payback is driven by how much of the generated power you use yourself.',
        'Using more of your own solar during the day shortens payback. We help you plan usage to get the most from the investment.',
      ],
    },
    {
      id: 'backup-and-batteries',
      title: 'Backup and batteries',
      body: [
        'A standard grid-tied system shuts down during an outage for safety. If you need power during cuts, you need a hybrid inverter and battery storage.',
        'We design backup around the loads that matter most, so you are not paying to back up everything.',
      ],
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      body: [
        'Solar systems are low-maintenance but not maintenance-free. Panels need occasional cleaning, and inverters and connections should be checked periodically.',
        'We offer scheduled checks to keep output healthy and catch small issues early.',
      ],
    },
  ],
  note: 'Figures and recommendations vary by property. A short site survey gives you accurate sizing and a clear quote.',
};

export const testimonials = [
  {
    text: 'The work was organised, clearly explained and finished exactly when promised. We finally feel confident about the wiring in our home.',
    author: 'Homeowner, Colombo',
  },
  {
    text: 'They explained every option before touching a wire, and the board is the tidiest we have ever had.',
    author: 'Business owner, Nugegoda',
  },
  {
    text: 'The solar install was clean and the handover walkthrough made everything easy to understand.',
    author: 'Villa owner, Battaramulla',
  },
];
