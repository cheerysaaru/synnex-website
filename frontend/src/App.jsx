import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MegaMenu from './components/MegaMenu.jsx';
import { useRouter, Link } from './lib/router.jsx';
import { useAuth } from './lib/auth.jsx';
import { PageRoutes } from './pages/PageRoutes.jsx';
import HomePage from './pages/HomePage.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import LoginModal from './components/LoginModal.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';

const PHONE = '0777588128';

/* --------------------------------------------------------------------------
   Navigation — one data object + one translation object drive the whole nav
   -------------------------------------------------------------------------- */

const NAV_SECTIONS = [
  ['about', 'company'],
  ['services', 'solutions'],
  ['work', 'projects'],
  ['faq', 'resources'],
  ['contact', 'contact'],
];

const NAV_LANGS = [
  { code: 'en', key: 'lang.en' },
  { code: 'ta', key: 'lang.ta' },
  { code: 'si', key: 'lang.si' },
];

const NAV_T = {
  en: {
    'nav.company': 'Company',
    'nav.solutions': 'Solutions',
    'nav.projects': 'Projects',
    'nav.resources': 'Resources',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.quote': 'Get a Quote',
    'nav.menu': 'Open menu',
    'nav.close': 'Close menu',
    'nav.lang': 'Select language',
    'nav.langMenu': 'Language',
    'nav.home': 'Synnex Technology — home',

    'lang.en': 'English',
    'lang.ta': 'தமிழ்',
    'lang.si': 'සිංහල',

    'co.kicker': 'Company',
    'co.label': 'Overview',
    'co.h': 'Engineering you can stand behind.',
    'co.p': 'A Colombo-based electrical engineering practice. The engineer you meet is the engineer who plans, installs and tests the job.',
    'co.cta': 'About Synnex',
    'co.region': 'Company menu',
    'co.i1.t': 'About us',
    'co.i1.s': 'Who we are and how we work',
    'co.i2.t': 'Our team',
    'co.i2.s': 'Engineers and technicians behind every job',
    'co.i3.t': 'Certifications',
    'co.i3.s': 'Standards, licences and safety',
    'co.f.t': 'Built on safety and standards',
    'co.f.s': 'Every install planned, installed and tested by our own engineers.',
    'co.f.alt': 'Electrician testing a distribution board',

    'sol.kicker': 'Solutions',
    'sol.label': 'Capabilities',
    'sol.h': 'Explore our solutions',
    'sol.p': 'Electrical work for homes, businesses and industry, planned for the way you actually live and work.',
    'sol.cta': 'All solutions',
    'sol.region': 'Solutions menu',
    'sol.i1.t': 'Residential Electrical',
    'sol.i1.s': 'Wiring, home lighting, repairs',
    'sol.i2.t': 'Commercial Electrical',
    'sol.i2.s': 'Offices, retail and maintenance',
    'sol.i3.t': 'Industrial Electrical',
    'sol.i3.s': 'Installations, machinery, upkeep',
    'sol.i4.t': 'Power & Electrical Systems',
    'sol.i4.s': 'Panels, generators, backup power',
    'sol.i5.t': 'Solar & Renewable Energy',
    'sol.i5.s': 'Solar installation and maintenance',
    'sol.i6.t': 'Security & Networking',
    'sol.i6.s': 'CCTV, security systems, networking',
    'sol.i7.t': 'Engineering & Technical Services',
    'sol.i7.s': 'Consultancy, inspections, testing',
    'sol.f.t': 'Solar power installations',
    'sol.f.s': 'Rooftop PV design and installation, hybrid and grid-tied.',
    'sol.f.alt': 'Solar panels installed on a roof',

    'res.kicker': 'Resources',
    'res.label': 'Library',
    'res.h': 'Know before you wire.',
    'res.p': 'Guides, answers and field notes to help you plan safely and maintain confidently.',
    'res.cta': 'Browse the FAQ',
    'res.region': 'Resources menu',
    'res.i1.t': 'Frequently Asked Questions',
    'res.i1.s': 'Quick answers to the questions we hear most',
    'res.i2.t': 'Technical Guides',
    'res.i2.s': 'Detailed guidance for safer installations',
    'res.i3.t': 'Insights',
    'res.i3.s': 'Field notes from real projects',
    'res.i4.t': 'Maintenance Tips',
    'res.i4.s': 'Keep systems healthy between jobs',
    'res.i5.t': 'Customer Support',
    'res.i5.s': 'Talk to a human when it matters',
    'res.f.t': 'Planning a safe home rewire',
    'res.f.s': 'Before you rewire, get the planning questions answered.',
    'res.f.alt': 'Electrician rewiring a home',

    /* dropdown sub-items */
    'co.d1.t': 'About Us',
    'co.d1.s': 'Company overview and history',
    'co.d2.t': 'Our Team',
    'co.d2.s': 'Meet the engineers behind the work',
    'co.d3.t': 'Careers',
    'co.d3.s': 'Join our team',
    'co.d4.t': 'News',
    'co.d4.s': 'Latest updates and announcements',

    'sol.d1.t': 'Residential Electrical',
    'sol.d1.s': 'Home wiring, lighting and repairs',
    'sol.d2.t': 'Commercial Electrical',
    'sol.d2.s': 'Offices, retail and maintenance',
    'sol.d3.t': 'Industrial Electrical',
    'sol.d3.s': 'Installations, machinery and upkeep',

    'res.d1.t': 'Blog',
    'res.d1.s': 'Articles and electrical insights',
    'res.d2.t': 'Case Studies',
    'res.d2.s': 'Recent project work',
    'res.d3.t': 'Documentation',
    'res.d3.s': 'Technical guides and standards',
    'res.d4.t': 'FAQ',
    'res.d4.s': 'Frequently asked questions',

    'projects.p': 'Selected work across homes, businesses and industrial sites.',
    'footer.slogan': 'Safe, reliable electrical solutions for Sri Lanka',
    'contact.thanks': 'Thank you. We will call you back soon.',
    'contact.p': 'Still not sure where to start? Give us a call and we’ll point you in the right direction.',
    'contact.h2': 'Let’s make your next project safer.',
    'contact.intro': 'Tell us a little about what you need. We’ll get back to you with a clear next step.',
    'contact.base': 'Based in Colombo, working island-wide',
    'faq.h2': 'Questions, answered',
    'work.h2': 'Recent work across Sri Lanka',
    'work.kicker': 'Selected work',

    'pillar.1.t': 'Safety first',
    'pillar.1.s': 'Good work starts with protecting people, property and everything that depends on your power.',
    'pillar.2.t': 'Plain advice',
    'pillar.2.s': 'We explain what matters, what it will cost and what your best options are before work begins.',
    'pillar.3.t': 'Built around your day',
    'pillar.3.s': 'We plan carefully so disruption to your home or business stays as small as possible.',
    'pillar.4.t': 'Support after switch-on',
    'pillar.4.s': 'Questions after handover? Call the same team that planned and installed your system.',

    'step.1.t': 'Consultation',
    'step.1.s': 'We listen first. We look at your space, your needs and your priorities.',
    'step.2.t': 'Design',
    'step.2.s': 'We plan a solution that is safe, efficient and practical for how you use power.',
    'step.3.t': 'Installation',
    'step.3.s': 'Our work is tidy, careful and built to last.',
    'step.4.t': 'Testing',
    'step.4.s': 'We check every detail and test the system before anything is handed over.',
    'step.5.t': 'Handover',
    'step.5.s': 'You get a clear walkthrough and a team you can call.',

    'quote.1.t': 'The work was organised, clearly explained and finished exactly when promised. We finally feel confident about the wiring in our home.',
    'quote.1.a': 'Homeowner, Colombo',
    'quote.2.t': 'They explained every option before touching a wire, and the board is the tidiest we have ever had.',
    'quote.2.a': 'Business owner, Nugegoda',

    'faq.1.q': 'Do you work outside Colombo?',
    'faq.1.a': 'Yes. Synnex Technology serves clients across Sri Lanka. Share your location and project type and we will advise on the best next step.',
    'faq.2.q': 'Can you inspect an existing electrical system?',
    'faq.2.a': 'Yes. We check wiring, boards and earthing, then give you a clear list of what is safe and what needs attention.',
    'faq.3.q': 'Do you install solar panels and backup power?',
    'faq.3.a': 'Yes. We design and install rooftop solar PV, generators and UPS systems.',
    'faq.4.q': 'How do I request a quote?',
    'faq.4.a': 'Use the form below, call us or message us on WhatsApp. Tell us the location and what you need.',

    'service.1': 'Residential wiring',
    'service.2': 'Commercial or industrial',
    'service.3': 'Design and load calculation',
    'service.4': 'Solar PV',
    'service.5': 'Panel boards',
    'service.6': 'Maintenance and inspection',
    'service.7': 'Generator or UPS',

    'project.1.tag': 'Residential',
    'project.1.title': 'Modern residence wiring',
    'project.1.meta': 'Colombo 07, full installation',
    'project.2.tag': 'Commercial',
    'project.2.title': 'Retail distribution upgrade',
    'project.2.meta': 'Nugegoda, panel board rework',
    'project.3.tag': 'Industrial',
    'project.3.title': 'Workshop power planning',
    'project.3.meta': 'Kelaniya, load calculation',
    'project.4.tag': 'Solar',
    'project.4.title': 'Rooftop solar PV system',
    'project.4.meta': 'Nugegoda, 5 kW installation',
    'project.5.tag': 'Residential',
    'project.5.title': 'Villa backup power',
    'project.5.meta': 'Battaramulla, generator setup',

    'home.why.kicker': 'Why Synnex',
    'home.why.h': 'The right way to do electrical work.',
    'home.process.kicker': 'Our process',
    'home.process.h': 'Simple steps, solid results',
    'home.process.p': 'A good result is easier when everyone knows what happens next. Scroll to follow the job from first call to handover.',
    'home.quote.kicker': 'Client notes',
    'quote.aria.prev': 'Previous quote',
    'quote.aria.next': 'Next quote',
    'home.faq.kicker': 'Good to know',
    'home.faq.call': 'Call us',
    'home.contact.kicker': 'Start a conversation',
    'home.contact.phone': 'Call us',
    'form.label.name': 'Your name',
    'form.label.phone': 'Phone number',
    'form.label.service': 'What do you need help with?',
    'form.label.message': 'Tell us a little more',
    'form.label.email': 'Email address',
    'form.placeholder.name': 'e.g. Kasun Perera',
    'form.placeholder.phone': 'e.g. 077 123 4567',
    'form.placeholder.email': 'you@example.com',
    'form.placeholder.message': 'Location, project type, timing',
    'form.submit': 'Send enquiry',
    'form.sending': 'Sending…',
    'form.error': 'Could not send your enquiry. Please call us instead.',
    'whatsapp.aria': 'Chat with Synnex Technology on WhatsApp',
    'whatsapp.text': 'WhatsApp',
'footer.copyright': 'Synnex Technology. All rights reserved.',
    'footer.slogan': 'Safe, reliable electrical solutions for Sri Lanka',

    'hero.h1': 'Electrical engineering you can rely on',
    'hero.p': 'Electrical engineering for homes, businesses and industrial sites across Sri Lanka. Planned properly, installed carefully, built to last.',
    'hero.btn.quote': 'Get a free quote',
    'hero.btn.call': 'Call us',
    'hero.facts.1.n': '20+',
    'hero.facts.1.s': 'years of experience',
    'hero.facts.2.n': '200+',
    'hero.facts.2.s': 'projects finished',
    'hero.facts.3.n': '24/7',
    'hero.facts.3.s': 'island-wide support',

    'about.kicker': 'Who we are',
    'about.h2': 'Good electrical work is the quiet confidence behind a space.',
    'about.lead': 'Synnex Technology is led by K. Arulalagan, an electrical engineer focused on getting the fundamentals right: safe planning, clean installation and advice you can actually use.',
    'about.lead2': 'From a single home circuit to a complete commercial system, every job gets the same care. We listen first, explain the options clearly and leave you with work that is easy to trust, use and maintain.',
    'about.sig.name': 'K. Arulalagan',
    'about.sig.title': 'Owner and electrical engineer, Colombo',

    'services.kicker': 'What we do',
    'services.h2': 'Seven services, one team',
    'services.hint': 'From a single socket to a full commercial system. Pick a service to see what is included.',
    'services.cta': 'Quote this job',

    'faq.intro': 'Still not sure where to start? Give us a call and we’ll point you in the right direction.',
    'work.kicker': 'Selected work',
  },
  ta: {
    'footer.copyright': 'Synnex Technology. அனைத்து உரிமைகளும் நமக்கே.',
    'footer.slogan': 'இலங்கைக்கான பாதுகாப்பான, நம்பகமான மின் தீர்வுகள்',


    'hero.h1': 'நம்பக்கூடிய மின் பொறியியல்.',
    'hero.p': 'இலங்கையின் வீடுகள், வணிகங்கள் மற்றும் தொழிநுட்ப தளங்களுக்கான மின் பொறியியல் சேவைகள். சரியாக திட்டமிடப்பட்டு, கவனமாக நிறுவப்பட்டு, நீண்டகாலம் நீடிக்கும் முறையில்.',
    'hero.btn.quote': 'இலவச விலை கோடு',
    'hero.btn.call': ' அழைக்கவும்',
    'hero.facts.1.n': '20+',
    'hero.facts.1.s': 'ஆண்டு அனுபவம்',
    'hero.facts.2.n': '200+',
    'hero.facts.2.s': 'முடித்த திட்டங்கள்',
    'hero.facts.3.n': '24/7',
    'hero.facts.3.s': 'நாட்டெழு ஆதரவு',

    'about.kicker': 'நாம் யார்',
    'about.h2': 'சரிப்பான மின் பணியே ஒரு இடத்தின் நிம்மதியான நம்பிக்கை.',
    'about.lead': 'Synnex Technology கே. அருளாலகனின் தலைமையில் உள்ளது. அவர் பாதுகாப்பான திட்டமிடல், சுத்தமான நிறுவுதல் மற்றும் நம்பக்கூடிய ஆலோசனை ஆகியவற்றில் கவனம் செலுத்தும் மின் பொறியாளர்.',
    'about.lead2': 'ஒற்றை வீட்டு சுற்று முதல் முழு வணிக அமைப்பு வரை, ஒவ்வொரு வேலையும் ஒரே கவனத்துடன் கையாளப்படுகிறது. முதலில் கேட்கிறோம், விருப்பங்களை தெளிவாக விளக்குகிறோம், நம்பக்கூடிய மற்றும் பயன்படுத்தக்கூடிய பணியை விட்டுச் செல்கிறோம்.',
    'about.sig.name': 'K. Arulalagan',
    'about.sig.title': 'கொழும்பில் உள்ள உரிமையாளர் மற்றும் மின் பொறியாளர்',

    'services.kicker': 'எங்கள் செயல்கள்',
    'services.h2': 'ஒரு பிரேக்கரை தட்டி எங்கள் வயரிங் யைப் பார்க்கவும்.',
    'services.hint': 'ஏழு சுற்றுகள், ஒரு குழு. எந்த பிரேக்கரைத் தட்டியாலும்.',
    'services.cta': 'இத் வேலைக்கு விலை கோடு',

    'faq.intro': 'எங்க இருந்து தொடங்குவது தெரியவில்லையா? எங்களுக்கு அழையுங்கள், சரியான வழிகாட்டுதலை வழங்குவோம்.',
    'work.kicker': 'தேர்ந்தெடுக்கப்பட்ட வேலை',
  },
  si: {
    'nav.company': 'ආයතනය',
    'nav.solutions': 'විසඳුම්',
    'nav.projects': 'ව්‍යාපෘති',
    'nav.resources': 'සම්පත්',
    'nav.contact': 'සම්බන්ධ වන්න',
    'nav.login': 'ඇතුල් වන්න',
    'nav.quote': 'මිල ගණන් ලබාගන්න',
    'nav.menu': 'මෙනුව විවෘත කරන්න',
    'nav.close': 'මෙනුව වසන්න',
    'nav.lang': 'භාෂාව තෝරන්න',
    'nav.langMenu': 'භාෂාව',
    'nav.home': 'Synnex Technology — මුල් පිටුව',

    'lang.en': 'English',
    'lang.ta': 'தமிழ்',
    'lang.si': 'සිංහල',

    'co.kicker': 'ආයතනය',
    'co.label': 'සාරාංශය',
    'co.h': 'ඔබට විශ්වාස කළ හැකි ඉංජිනේරු සේවාව.',
    'co.p': 'කොළඹ පදනම් කරගත් විදුලි ඉංජිනේරු සේවාවක්. ඔබ හමුවන ඉංජිනේරුවාම සැලසුම් කර, සවිකර, පරීක්ෂා කරයි.',
    'co.cta': 'Synnex ගැන',
    'co.region': 'ආයතන මෙනුව',
    'co.i1.t': 'අපි ගැන',
    'co.i1.s': 'අපි කවුරුන්ද, අපි වැඩ කරන ආකාරය',
    'co.i2.t': 'අපගේ කණ්ඩායම',
    'co.i2.s': 'සෑම වැඩකටම පිටුපස සිටින ඉංජිනේරුවන් සහ කාර්මිකයන්',
    'co.i3.t': 'සහතික',
    'co.i3.s': 'ප්‍රමිතීන්, බලපත්‍ර සහ ආරක්ෂාව',
    'co.f.t': 'ආරක්ෂාව සහ ප්‍රමිතීන් මත ගොොඩනැගී ඇත',
    'co.f.s': 'සෑම සවිකිරීමක්ම අපගේම ඉංජිනේරුවන් විසින් සැලසුම් කර, සවිකර, පරීක්ෂා කරයි.',
    'co.f.alt': 'විදුලි බෙදාහැරීමේ පුවරුව පරීක්ෂා කරන විදුලි කාර්මිකයෙක්',

    'sol.kicker': 'විසඳුම්',
    'sol.label': 'හැකියාවන්',
    'sol.h': 'අපගේ විසඳුම් බලන්න',
    'sol.p': 'නිවෙස්, ව්‍යාපාර සහ කර්මාන්ත සඳහා විදුලි වැඩ — ඔබ ජීවත් වන සහ වැඩ කරන ආකාරයට ගැළපෙන පරිදි සැලසුම් කරයි.',
    'sol.cta': 'සියලු විසඳුම්',
    'sol.region': 'විසඳුම් මෙනුව',
    'sol.i1.t': 'නිවාස විදුලි සේවා',
    'sol.i1.s': 'වයරින්, නිවෙස් ආලෝකකරණය, අලුත්වැඩියා',
    'sol.i2.t': 'වාණිජ විදුලි සේවා',
    'sol.i2.s': 'කාර්යාල, වෙළඳසැල් සහ නඩත්තුව',
    'sol.i3.t': 'කාර්මික විදුලි සේවා',
    'sol.i3.s': 'සවිකිරීම්, යන්ත්‍රෝපකරණ, නඩත්තුව',
    'sol.i4.t': 'බලශක්ති පද්ධති',
    'sol.i4.s': 'පැනල, ජෙනරේටර්, උපස්ථ බලශක්තිය',
    'sol.i5.t': 'සූර්ය හා පුනර්ජනනීය බලශක්තිය',
    'sol.i5.s': 'සූර්ය සවිකිරීම් සහ නඩත්තුව',
    'sol.i6.t': 'ආරක්ෂාව සහ ජාලකරණය',
    'sol.i6.s': 'CCTV, ආරක්ෂක පද්ධති, ජාලකරණය',
    'sol.i7.t': 'ඉංජිනේරු හා තාක්ෂණික සේවා',
    'sol.i7.s': 'උපදේශන, පරීක්ෂණ, අත්හදා බැලීම්',
    'sol.f.t': 'සූර්ය බලශක්ති සවිකිරීම්',
    'sol.f.s': 'වහල සූර්ය PV සැලසුම් කිරීම සහ සවිකිරීම, හයිබ්‍රිඩ් සහ ග්‍රිඩ් සම්බන්ධිත.',
    'sol.f.alt': 'වහලක සවිකර ඇති සූර්ය පැනල',

    'res.kicker': 'සම්පත්',
    'res.label': 'පුස්තකාලය',
    'res.h': 'වයරින් කිරීමට පෙර දැනගන්න.',
    'res.p': 'ආරක්ෂිතව සැලසුම් කිරීමට සහ විශ්වාසයෙන් නඩත්තු කිරීමට මාර්ගෝපදේශ, පිළිතුරු සහ ක්ෂේත්‍ර සටහන්.',
    'res.cta': 'නිතර අසන ප්‍රශ්න බලන්න',
    'res.region': 'සම්පත් මෙනුව',
    'res.i1.t': 'නිතර අසන ප්‍රශ්න',
    'res.i1.s': 'වැඩිපුර අසන ප්‍රශ්නවලට ඉක්මන් පිළිතුරු',
    'res.i2.t': 'තාක්ෂණික මාර්ගෝපදේශ',
    'res.i2.s': 'ආරක්ෂිත සවිකිරීම් සඳහා විස්තරාත්මක මාර්ගෝපදේශ',
    'res.i3.t': 'අවබෝධතා',
    'res.i3.s': 'සැබෑ ව්‍යාපෘතිවලින් ක්ෂේත්‍ර සටහන්',
    'res.i4.t': 'නඩත්තු ඉඟි',
    'res.i4.s': 'වැඩ අතර පද්ධති නිරෝගීව තබා ගන්න',
    'res.i5.t': 'පාරිභෝගික සහාය',
    'res.i5.s': 'වැදගත් විට මිනිසෙකු සමඟ කතා කරන්න',
    'res.f.t': 'ආරක්ෂිත නිවෙස් වයරින් සැලසුම් කිරීම',
    'res.f.s': 'නැවත වයරින් කිරීමට පෙර සැලසුම් ප්‍රශ්නවලට පිළිතුරු ලබා ගන්න.',
    'res.f.alt': 'නිවසක වයරින් කරන විදුලි කාර්මිකයෙක්',

    /* dropdown sub-items */
    'co.d1.t': 'අපි නිළියක්',
    'co.d1.s': 'ආයතනය සහ ඉතිහාසය',
    'co.d2.t': 'අපගේ කණ්ඩායම',
    'co.d2.s': 'පළමුවෙන් කරන ඉංජිනේරුවන්',
    'co.d3.t': 'දියත්ව',
    'co.d3.s': 'අපගේ කණ්ඩායමට අයගන්',
    'co.d4.t': 'නවල',
    'co.d4.s': 'අලුත් නවතරක් සහ අත්දැකීම්',

    'sol.d1.t': 'නිවාස විදුලි සේවා',
    'sol.d1.s': 'නිවෙස් වයරින්, ආලෝකකරණය, අලුත්වැඩියා',
    'sol.d2.t': 'වාණිජ විදුලි සේවා',
    'sol.d2.s': 'කාර්යාල, වෙළඳසැල් සහ නඩත්තුව',
    'sol.d3.t': 'කාර්මික විදුලි සේවා',
    'sol.d3.s': 'සවිකිරීම්, යන්ත්‍රෝපකරණ, නඩත්තුව',

    'res.d1.t': 'බ්ලොග්',
    'res.d1.s': 'ලිපියන් සහ විදුලි තේරුම්',
    'res.d2.t': 'ව්‍යාපෘති විස්තර',
    'res.d2.s': 'අලුත් ව්‍යාපෘතියක්',
    'res.d3.t': 'ආකෘති මාර්ගෝපදේශ',
    'res.d3.s': 'තාක්ෂණික මාර්ගෝපදේශ සහ ප්‍රමිතීන්',
    'res.d4.t': 'ප්‍රශ්න ලිපින',
    'res.d4.s': 'සුදුසුකම් ප්‍රශ්න',

    'projects.p': 'නිවාස, ව්‍යාපාර සහ කර්මාන්ත සඳහා විදුලි ව්‍යාපෘති.',
    'footer.slogan': 'ශ්‍රී ලංකාව සඳහා ආරක්ෂිත, විශ්වාසදායක විදුලි විසඳුම්',
    'contact.thanks': 'ස්තූතියි. අපි ඉක්මනින් ඔබව අමතන්නෙමු.',
    'contact.p': 'කොතැනින් පටන් ගත යුතුද කියා තවමත් විශ්වාස නැද්ද? අප අමතන්න, අපි ඔබට නිවැරදි මග පෙන්වන්නෙමු.',
    'contact.h2': 'ඔබේ මීළඟ ව්‍යාපෘතිය වඩාත් ආරක්ෂිත කරමු.',
    'contact.intro': 'ඔබට අවශ්‍ය දේ ගැන අපට ටිකක් පවසන්න. අපි පැහැදිලි ඊළඟ පියවරක් සමඟ ඔබව අමතන්නෙමු.',
    'contact.base': 'කොළඹ පදනම් කරගත්, දිවයින පුරා සේවය සපයන',
    'faq.h2': 'ප්‍රශ්නවලට පිළිතුරු.',
    'work.h2': 'ඔබ ජීවත් වන සහ වැඩ කරන ආකාරය සඳහා නිර්මාණය කර ඇත.',
    'pillar.1.t': 'ආරක්ෂාව මුලා',
    'pillar.1.s': 'හොඳම අඩංගුව ජනතාවට සහ සොරොයුන්ට සහ ඔබේ බලශක්තියට අදාළ සැකසීම් ආරක්ෂා කරන්නෙමි.',
    'pillar.2.t': 'සැලසුම් ප්‍රකාශ',
    'pillar.2.s': 'මේ අදහස්, දක්වා ගැනීම, ඔයාගේ අවස්ථාව සහ ඔයාගේ හැකියාකම් අපි අතර ප්‍රකාශ කරගැනීමට.',
    'pillar.3.t': 'ඔයාගේ දිවයින අතර',
    'pillar.3.s': 'අපි හැමදාම ප්‍රකාශ කර ගැනීම් කර ගැනීමට, ඔයාගේ නිවේ සහ ව්‍යාපාරයට අදාළ අඳුරු අවස්ථාව කොළඹ අඩංගුවක් නොවේ.',
    'pillar.4.t': 'ස්විට්ච් ගන්න තුළ අවශ්‍ය සහන්ද්ධ',
    'pillar.4.s': 'එකක් පර්යේෂණ පසු ඔබට අසන තත්වයක් තිබේද? අපි සහදායක ලබා ගැනීමට.',
    'step.1.t': 'සහන්ද්ධ',
    'step.1.s': 'අපි මුලින් හරහා බැඳීම්. ඔයාගේ අදිමින්, අපේක්ෂා සහ ප්‍රසම්ශානවලට අපි පරීක්ෂා කරගැනීමට.',
    'step.2.t': 'විභාග',
    'step.2.s': 'ඔයාගේ බලශක්ති භාවිත සඳහා අපි ආරක්ෂා, අග්‍රපේක්ෂ සහ අධ්‍යක්ෂ තත්වය එකක් ප්‍රකාශ කරගැනීමට.',
    'step.3.t': 'සාධකය',
    'step.3.s': 'අපේ අඩංගුව සැලසුම් අතර සහ දීර්ඝකාලයට අදාළ කරන ලද්දේ.',
    'step.4.t': 'අත්දැකීම',
    'step.4.s': 'අපි සියල් අරමුදහිම් අතර පරීක්ෂා කර ගැනීමට.',
    'step.5.t': 'එකක් දැන්',
    'step.5.s': 'ඔබට තේරෙන කරගනුල්මක් ලබා ගත්තේ.',
    'quote.1.t': 'අඩංගුව තුළ ස්වාවිවර්ජතා සහ සැලසුම් ප්‍රකාශ කර ගැනීම් අදහස් සහ කරගැනීමේ දැක්වූ අරමුදහිම්. දැන් අපේ නිවේ බලශක්තියට අපි ආදරය ඇත.',
    'quote.1.a': 'නිවේ ගෙවනුණු, කොළඹ',
    'quote.2.t': 'දියරුරු සදහා අරමුදහිම් අපි ප්‍රකාශ කර ගැනීම් අදහස් සහ අරමුදහිම්. පැනල් අපට අදහස් යෙදුණේ.',
    'quote.2.a': 'වණ්ඩාරු ගෙවනුණු, නුවගොඩ',
    'faq.1.q': 'ඔබ කොළඹ අතර සේවා ලබා ගැනීමද?',
    'faq.1.a': 'ඔව්. Synnex Technology ශ්‍රී ලංකාව සඳහයකට සේවා ලබා ගැනීමට. ඔබගේ අදිමින් සහ අඩංගුවේ වාර්තා ගන්න අපට, අපි දැන් ගමනේ අවශ්‍ය ප්‍රතික්ෂේපයක් ලබා ගන්නේ.',
    'faq.2.q': 'ඔබ දැන් අතර විදුලි පද්ධතියක් නිරීක්ෂා කර ගැනීමද?',
    'faq.2.a': 'ඔව්. අපි වයරින්, පැනල් සහ මඟිරුල් අතර නිරීක්ෂා කර ගැනීමට.',
    'faq.3.q': 'අපි සුරයියා පැනල් සහ පැරමින් බලශක්තිය සහකාර කර ගැනීමද?',
    'faq.3.a': 'ඔව්. අපි පැරමින් සුරයියා PV, ජෙනරේටර් සහ UPS පද්ධති වල තහවුරු කිරීම් අදහස් සහ සේවා ලබා ගැනීමට.',
    'faq.4.q': 'කොළඹ අදහස් ලබා ගැනීමද?',
    'faq.4.a': 'අපේ ප්‍රතිසුදුව,  වැඩබහසුම් කරගන්න් නම් WhatsApp සමග අපි අදහස් කර ගන්න්න. අදිමින් සහ අපි අදහස පහත අපට කියා ගන්නේ.',
    'service.1': 'නිවේ අලුත්වැඩියා',
    'service.2': 'වාණිජ අතර කාර්යාල',
    'service.3': 'දිව්විය සහ ප්‍රතික්ෂේප ගණනාවල',
    'service.4': 'සුරයියා PV',
    'service.5': 'පැනල් පත්තර',
    'service.6': 'ප්‍රතිසරක්ෂා සහ අත්දැකීම',
    'service.7': 'ජෙනරේටර් නම් UPS',
    'project.1.tag': 'නිවේ',
    'project.1.title': 'නවරූප නිවේ අලුත්වැඩියා',
    'project.1.meta': 'කොළඹ 07, සම්පුර්ණ සහකාර',
    'project.2.tag': 'වාණිජ',
    'project.2.title': 'කොටස් විතර සංවර්ධනය',
    'project.2.meta': 'නුවගොඩ, පැනල් වලින් තවත් කරගන්න',
    'project.3.tag': 'කාර්මික',
    'project.3.title': 'කාර්මික බලශක්ති ප්‍රකාශ',
    'project.3.meta': 'කෙළැඳිය, කොළඹ ගණනාවල',
    'project.4.tag': 'සුරයියා',
    'project.4.title': 'පැරම් සුරයියා PV පද්ධති',
    'project.4.meta': 'නුවගොඩ, 5 kW සහකාර',
    'project.5.tag': 'විල්ලා',
    'project.5.title': 'පැරම් බලශක්තිය',
    'project.5.meta': 'බත්තරමුල්ල, ජෙනරේටර් සහකාර',
    'home.why.kicker': 'Synnex මගේම?',
    'home.why.h': 'බලශක්ති අඩංගුව කර ගැනීමේ අදහස් වියතර.',
    'home.process.kicker': 'අපේ ප්‍රකාශ',
    'home.process.h': 'සැමට සහතික පහර. ස්වාවිවර්ජතා විවෘතිතා.',
    'home.process.p': 'මුලින් වැඩ වෙන් ඔබට කියා ගන්න යනු නමුත් අපි ප්‍රතිස්ථාපනය දක්වන විට.',
    'home.quote.kicker': 'යෙදුම් අතර.',
    'quote.aria.prev': 'පෙර අරමුණ',
    'quote.aria.next': 'අවස්ථාවක්',
    'home.faq.kicker': 'අපි ජාත්‍යන්තරය ගැන නොදත්.',
    'home.faq.call': ' වැඩබහසුම් කරගන්න',
    'home.contact.kicker': 'අපි කතා කර ගන්න අපේ.',
    'home.contact.phone': 'Call us',
    'form.label.name': 'ඔයාගේ නම',
    'form.label.phone': 'දුරකථන අංක',
    'form.label.service': 'ඔබට අපි කෙසින් සහදායක ලබා ගැනීමද?',
    'form.label.message': 'අපි තේරෙන්න සමග තවත් ප්‍රතික්ෂේප.',
    'form.label.email': 'ඊමේල් ලිපිනය',
    'form.placeholder.name': 'e.g. Kasun Perera',
    'form.placeholder.phone': 'e.g. 077 123 4567',
    'form.placeholder.email': 'you@example.com',
    'form.placeholder.message': 'අදිමින්, අඩංගුවේ වාර්තා, වේලාව',
    'form.submit': 'අරමුණ වැඩබහසුම් කරගන්න',
    'form.sending': 'යවමින්…',
    'form.error': 'ඔබේ විමසුම යැවීමට නොහැකි විය. කරුණාකර අපට අමතන්න.',
    'whatsapp.aria': 'Synnex Technology WhatsApp සමග අපි කතා කර ගන්න',
    'whatsapp.text': 'WhatsApp',
    'footer.copyright': 'Synnex Technology. සියල් අභිරහස් අපි අත්කරවීමි.',
  },
};

const NAV_ITEMS = [
  { type: 'mega', key: 'company' },
  { type: 'mega', key: 'solutions' },
  { type: 'link', key: 'projects', href: '/projects', label: 'nav.projects' },
  { type: 'mega', key: 'resources' },
  { type: 'link', key: 'contact', href: '/contact', label: 'nav.contact' },
];

const NV_CHEV = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function avatarInitials(user) {
  const source = (user?.fullName || user?.username || '').trim();
  if (!source) return 'S';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function NavAuth({ label }) {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onDocumentClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) {
    return <Link className="nv-login" to="/login">{label}</Link>;
  }

  const onSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="nv-auth" ref={wrapRef}>
      <button
        className="nv-avatar"
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.fullName || user.username}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {avatarInitials(user)}
      </button>
      {open ? (
        <div className="nv-auth-drop" role="menu">
          <div className="nv-auth-id">
            <strong>{user.fullName}</strong>
            <span>@{user.username}</span>
          </div>
          <button type="button" role="menuitem" className="nv-auth-signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SiteNav({ scrolled, hidden, menuOpen, setMenuOpen }) {
  const navRef = useRef(null);
  const langWrapRef = useRef(null);
  const langBtnRef = useRef(null);
  const burgerRef = useRef(null);
  const triggerRefs = useRef({});
  const hoverTimer = useRef(0);
  const closeTimer = useRef(0);

  const [openKey, setOpenKey] = useState(null);

  /* Morphing navbar (desktop): one frosted shape behind the bar that grows to
     wrap the open panel and shrinks back to the bar. Sizes go into CSS vars;
     nav-morph.css animates them. */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const desktop = window.matchMedia('(min-width: 1025px)');
    const measure = () => {
      if (!desktop.matches) return;
      const bar = nav.querySelector('.nv-bar');
      if (!bar) return;
      const bw = bar.offsetWidth;
      const bh = bar.offsetHeight;
      let w = bw;
      let h = bh;
      if (openKey) {
        const panel = nav.querySelector(`.nv-item[data-key="${openKey}"] .nv-mx`);
        if (panel) {
          w = Math.max(bw, panel.offsetWidth + 20);
          h = bh + panel.offsetHeight + 10;
        }
      }
      nav.style.setProperty('--mw', `${w}px`);
      nav.style.setProperty('--mh', `${h}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    nav.querySelectorAll('.nv-bar, .nv-mx').forEach((el) => ro.observe(el));
    desktop.addEventListener('change', measure);
    return () => {
      ro.disconnect();
      desktop.removeEventListener('change', measure);
    };
  }, [openKey]);
  const [langOpen, setLangOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const { path, navigate } = useRouter();
  const [lang, setLang] = useState(() => {
    try {
      const saved = window.localStorage.getItem('synnext_lang');
      if (saved && NAV_T[saved]) return saved;
    } catch (err) {
      /* storage unavailable */
    }
    return 'en';
  });

  // All text is written in English; lib/i18n.js translates the page to Tamil/Sinhala.
  const t = NAV_T.en;

  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const clearTimers = () => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const closeAll = () => {
    clearTimers();
    setOpenKey(null);
    setLangOpen(false);
  };

  /* language: document lang + persistence */
  useEffect(() => {
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('synnext-lang', { detail: lang }));
    try {
      window.localStorage.setItem('synnext_lang', lang);
    } catch (err) {
      /* storage unavailable */
    }
  }, [lang]);

  /* outside click */
  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!navRef.current || navRef.current.contains(event.target)) return;
      setOpenKey(null);
      setLangOpen(false);
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  /* escape */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (langOpen) {
        setLangOpen(false);
        langBtnRef.current?.focus();
        return;
      }
      if (menuOpen) {
        setMenuOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (openKey) {
        const trigger = triggerRefs.current[openKey];
        setOpenKey(null);
        trigger?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [langOpen, menuOpen, openKey, setMenuOpen]);

  /* scroll spy */
  useEffect(() => {
    const update = () => {
      const mark = window.innerHeight * 0.4;
      let current = null;
      NAV_SECTIONS.forEach(([id, key]) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top < mark) current = key;
      });
      setActiveKey(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  /* closing the drawer should also close any open panel */
  useEffect(() => {
    if (!menuOpen) setOpenKey(null);
  }, [menuOpen]);

  useEffect(() => clearTimers, []);

  const onItemEnter = (key) => {
    if (isMobile() || !canHover()) return;
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(key), 90);
  };

  const onItemLeave = () => {
    if (isMobile() || !canHover()) return;
    window.clearTimeout(hoverTimer.current);
  };

  const onNavEnter = () => {
    window.clearTimeout(closeTimer.current);
  };

  const onNavLeave = () => {
    if (isMobile() || langOpen || !canHover()) return;
    window.clearTimeout(hoverTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 200);
  };

  /* hovering a plain link closes any open panel */
  const onPlainLinkEnter = () => {
    if (isMobile() || !canHover()) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(null), 120);
  };

  const chooseLang = (code) => {
    setLang(code);
    setLangOpen(false);
    langBtnRef.current?.focus();
  };

  const onLangButtonClick = (event) => {
    event.stopPropagation();
    setOpenKey(null);
    setLangOpen((prev) => !prev);
  };

  const onLangKeyDown = (event) => {
    const buttons = Array.from(langWrapRef.current?.querySelectorAll('[role="menuitemradio"]') || []);
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(index + 1) % buttons.length].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length].focus();
    }
  };

  const onMenuKeyDown = (event) => {
    if (isMobile()) return;
    const tops = Array.from(
      event.currentTarget.querySelectorAll(':scope > .nv-item > .nv-tr, :scope > .nv-link'),
    );
    if (!tops.length) return;
    const index = tops.indexOf(document.activeElement);

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if (index < 0) return;
      event.preventDefault();
      const dir = event.key === 'ArrowRight' ? 1 : -1;
      tops[(index + dir + tops.length) % tops.length].focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      const item = document.activeElement?.closest?.('.nv-item');
      if (!item) return;
      const key = item.getAttribute('data-key');
      event.preventDefault();
      setOpenKey(key);
      window.setTimeout(() => {
        item.querySelector('.nv-mx a[href], .nv-mega a[href], .nv-mega button')?.focus();
      }, 30);
    }
  };

  const onNavLinkClick = (event) => {
    const href = event?.currentTarget?.getAttribute('href');
    // Same-page anchors (#contact, #top) stay in-app: scroll + set page.
    if (href && href.startsWith('#')) {
      clearTimers();
      setOpenKey(null);
      setLangOpen(false);
      if (isMobile()) setMenuOpen(false);
      event.preventDefault();
      if (path !== '/') {
        navigate('/');
        window.setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo(0, 0);
      }
      return;
    }
    // Internal routes: client-side navigation (no full reload).
    if (href && href.startsWith('/')) {
      clearTimers();
      setOpenKey(null);
      setLangOpen(false);
      if (isMobile()) setMenuOpen(false);
      event.preventDefault();
      navigate(href);
      return;
    }
    // Real hrefs (external links etc.): let the browser handle them.
    // navigate. index.html loads and initialPage() maps the pathname to
    // a route, so each nav item opens its own page with a real URL change.
  };

  const toggleDrawer = () => {
    setLangOpen(false);
    setMenuOpen((prev) => !prev);
  };

  const className = ['nv', scrolled ? 'sc' : '', hidden ? 'hd' : '', menuOpen ? 'mopen' : '', openKey ? 'om' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={className} ref={navRef} aria-label="Primary" onMouseEnter={onNavEnter} onMouseLeave={onNavLeave}>
      <span className="nv-morph-bg" aria-hidden="true" />
      <div className="nv-bar">
        <a className="nv-logo" href="#top" data-page="home" aria-label={t['nav.home']} onClick={onNavLinkClick}>
          <span>Synnex</span>
        </a>

        <button
          className="nv-burger"
          ref={burgerRef}
          type="button"
          aria-label={menuOpen ? t['nav.close'] : t['nav.menu']}
          aria-expanded={menuOpen}
          aria-controls="nvMenu"
          onClick={toggleDrawer}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="nv-menu" id="nvMenu" onKeyDown={onMenuKeyDown}>
          {NAV_ITEMS.map((item) =>
            item.type === 'link' ? (
              <a
                key={item.key}
                className={`nv-link${activeKey === item.key ? ' active' : ''}`}
                href={item.href}
                data-page={item.key}
                onMouseEnter={onPlainLinkEnter}
                onClick={onNavLinkClick}
              >
                {t[item.label]}
              </a>
            ) : (
              <MegaMenu
                key={item.key}
                panelKey={item.key}
                t={t}
                openKey={openKey}
                setOpenKey={setOpenKey}
                triggerRefs={triggerRefs}
                onItemEnter={onItemEnter}
                onItemLeave={onItemLeave}
                onNavLinkClick={onNavLinkClick}
                isMobile={isMobile}
                menuOpen={menuOpen}
              />
            ),
          )}

          <div className="nv-drawer-foot">
            <NavAuth label={t['nav.login']} />
            <div className="nv-lang-row" role="group" aria-label={t['nav.langMenu']}>
              {NAV_LANGS.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  aria-pressed={lang === entry.code}
                  onClick={() => chooseLang(entry.code)}
                >
                  {entry.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nv-actions">
          <div className="nv-lang-wrap" ref={langWrapRef} onKeyDown={onLangKeyDown}>
            <button
              className="nv-lang"
              ref={langBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-controls="nvLangDrop"
              aria-label={t['nav.lang']}
              onClick={onLangButtonClick}
            >
              <span>{lang.toUpperCase()}</span>
              <span className="chev" aria-hidden="true">
                {NV_CHEV}
              </span>
            </button>
            <div className={`nv-lang-drop${langOpen ? ' open' : ''}`} id="nvLangDrop" role="menu" aria-label={t['nav.langMenu']}>
              {NAV_LANGS.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={lang === entry.code}
                  onClick={() => chooseLang(entry.code)}
                >
                  <span>{t[entry.key]}</span>
                  <span className="ck" aria-hidden="true">
                    ✓
                  </span>
                </button>
              ))}
            </div>
          </div>

          <NavAuth label={t['nav.login']} />
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { path, navigate } = useRouter();
  const isLoginPath = path === '/login' || path === '/register';

  /* Small screens sign in through a pop-up; large screens use the /login page. */
  const SMALL = '(max-width: 819px)';
  const [small, setSmall] = useState(() => window.matchMedia(SMALL).matches);
  useEffect(() => {
    const mq = window.matchMedia(SMALL);
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const [loginPopup, setLoginPopup] = useState(null); // null | 'login' | 'signup'
  const popupRoute = small && isLoginPath; // landed on /login on a phone
  const isLogin = isLoginPath && !small;

  /* on small screens, links to /login or /register open the pop-up instead */
  useEffect(() => {
    if (!small) return undefined;
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const a = event.target.closest?.('a[href]');
      if (!a) return;
      const url = new URL(a.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== '/login' && url.pathname !== '/register') return;
      event.preventDefault();
      setMenuOpen(false); // close the mobile drawer if Login was tapped inside it
      setLoginPopup(url.pathname === '/register' ? 'signup' : 'login');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [small]);

  const closeLogin = useCallback(() => {
    setLoginPopup(null);
    if (popupRoute) navigate('/', { replace: true });
  }, [popupRoute, navigate]);

  const loginDone = useCallback(() => {
    setLoginPopup(null);
    if (popupRoute) navigate('/', { replace: true });
  }, [popupRoute, navigate]);

  const [lang, setLang] = useState(() => {
    try {
      const saved = window.localStorage.getItem('synnext_lang');
      if (saved && NAV_T[saved]) return saved;
    } catch (err) {
      /* storage unavailable */
    }
    return 'en';
  });
  // All text is written in English; lib/i18n.js translates the page to Tamil/Sinhala.
  const t = NAV_T.en;

  /* the nav owns the language picker; follow it so page text switches too */
  useEffect(() => {
    const onLang = (event) => setLang(event.detail);
    window.addEventListener('synnext-lang', onLang);
    return () => window.removeEventListener('synnext-lang', onLang);
  }, []);

  const progressRef = useRef(null);
  const railRef = useRef(null);
  const menuRef = useRef(false);

  useEffect(() => {
    menuRef.current = menuOpen;
    if (menuOpen) setHidden(false);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    /* runs at most once per animation frame, so scrolling stays smooth */
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? y / max : 0;

      if (progressRef.current) progressRef.current.style.width = `${ratio * 100}%`;
      if (railRef.current) railRef.current.style.top = `${ratio * 100}%`;

      const isScrolled = y > 24;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));

      /* ignore tiny wobbles (trackpads, momentum) so the bar doesn't flicker */
      const delta = y - lastY;
      if (Math.abs(delta) < 8 && y > 0) return;
      const isHidden = delta > 0 && y > 320 && !menuRef.current;
      setHidden((prev) => (prev === isHidden ? prev : isHidden));
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`site${isLogin ? ' login-mode' : ' is-home'}`}>
      {!isLogin ? <a className="skip-link" href="#main">Skip to content</a> : null}
      {!isLogin ? <div id="pw" ref={progressRef} aria-hidden="true" /> : null}
      {!isLogin ? <div id="rail" aria-hidden="true"><i ref={railRef} /></div> : null}

      {!isLogin ? <SiteNav scrolled={scrolled} hidden={hidden} menuOpen={menuOpen} setMenuOpen={setMenuOpen} /> : null}

      <main id="main">
        {path === '/' || popupRoute ? <HomePage t={t} en={NAV_T.en} phone={PHONE} /> : null}
        {path !== '/' && !popupRoute ? <PageRoutes /> : null}
      </main>

      {!isLogin ? (
        <SiteFooter t={t} en={NAV_T.en} />
      ) : null}

      {!isLogin ? <ChatAssistant /> : null}

      <LoginModal
        open={Boolean(loginPopup) || popupRoute}
        initialMode={loginPopup || (path === '/register' ? 'signup' : 'login')}
        onClose={closeLogin}
        onSuccess={loginDone}
      />
    </div>
  );
}

export default App;
