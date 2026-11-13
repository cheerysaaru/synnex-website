/* ==========================================================================
   ChatAssistant — floating chat on the bottom right of every page.

   Answers from the site's own content (services, FAQ, hours, service area,
   contact) with quick-reply buttons and simple keyword matching, and can take
   a quote request step by step and send it through the normal enquiry API, so
   it lands in the inbox and the owner dashboard like the contact form.
   No outside AI service. All bot text is English; lib/i18n.js translates it
   (see data/translations/t4.js).
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { api } from '../lib/api.js';
import { company, faq } from '../data/site-data.js';

const SERVICES = [
  'Residential wiring',
  'Commercial or industrial',
  'Design and load calculation',
  'Solar PV',
  'Panel boards',
  'Maintenance and inspection',
  'Generator or UPS',
];

const MAIN_CHIPS = ['Our services', 'Get a quote', 'Solar power', 'Opening hours', 'Service area', 'Talk to a person'];

/* ready-made answers -------------------------------------------------------- */
const ANSWERS = {
  greet: {
    text: 'Hello! I can answer questions about our electrical services, or help you request a quote.',
    chips: MAIN_CHIPS,
  },
  services: {
    text: 'We handle residential wiring, commercial and industrial work, design and load calculation, solar PV, panel boards, maintenance and inspections, and generator or UPS setup. Which one do you need?',
    chips: ['Home wiring', 'Business or factory', 'Solar power', 'Backup power', 'Inspection', 'Get a quote'],
  },
  residential: {
    text: 'For homes we do new wiring, full rewires of older houses, lighting and socket layouts, earthing and RCD protection, fault finding and board upgrades. We plan in stages, so you can usually stay at home while we work.',
    chips: ['Get a quote', 'Inspection', 'Talk to a person'],
  },
  commercial: {
    text: 'For offices, shops and factories we plan three-phase distribution, lighting and power circuits, load balancing and maintenance contracts. Work is scheduled around your opening or production hours.',
    chips: ['Get a quote', 'Talk to a person'],
  },
  solar: {
    text: 'We design and install rooftop solar PV, grid-tied or hybrid with batteries. We check your roof and shading, size the system to your bill and handle the net metering paperwork. Note: a standard grid-tied system switches off during a power cut; you need batteries for backup.',
    chips: ['Get a quote', 'Backup power', 'Talk to a person'],
  },
  backup: {
    text: 'We set up generators and UPS systems with automatic changeover, so power switches over by itself when the supply drops. A UPS protects sensitive equipment instantly; a generator runs longer. Many homes and offices use both.',
    chips: ['Get a quote', 'Solar power', 'Talk to a person'],
  },
  inspection: {
    text: 'We inspect wiring, boards, earthing and protection, then give you a clear written report of what is safe and what needs attention. Tripping, buzzing or warm breakers are good reasons to book one.',
    chips: ['Get a quote', 'Talk to a person'],
  },
  hours: {
    text: 'We are open Monday to Friday, 10am to 6pm. You can send a quote request here any time and we will reply on the next working day.',
    chips: ['Get a quote', 'Talk to a person'],
  },
  area: {
    text: 'We are based in Colombo and work island-wide. Tell us your location when you request a quote and we will confirm the best next step.',
    chips: ['Get a quote', 'Talk to a person'],
  },
  contact: {
    text: 'You can reach the team directly:',
    actions: ['call', 'whatsapp', 'email'],
    chips: ['Get a quote'],
  },
  careers: {
    text: 'We are hiring electricians, solar PV technicians and apprentices. See the open roles on our careers page.',
    actions: ['careers'],
  },
  thanks: {
    text: 'You are welcome! Anything else I can help with?',
    chips: MAIN_CHIPS,
  },
  fallback: {
    text: 'Sorry, I am not sure about that one. You can pick a topic below, or talk to the team directly.',
    actions: ['call', 'whatsapp'],
    chips: MAIN_CHIPS,
  },
};

/* keyword → intent (English, plus a few Tamil and Sinhala words) */
const INTENTS = [
  ['quote', /quote|price|cost|how much|estimate|book|budget|rate|விலை|மதிப்பீடு|මිල|ගණන/],
  ['solar', /solar|pv|panel on|roof|net meter|inverter|battery|சூரிய|සූර්ය/],
  ['backup', /generator|ups|backup|power cut|outage|blackout|changeover|ஜெனரேட்டர்|மின்வெட்டு|ජනක|විදුලිය කැපීම/],
  ['inspection', /inspect|check|test|report|fault|trip|spark|buzz|smell|burn|ஆய்வு|பழுது|පරීක්ෂා|දෝෂ/],
  ['commercial', /office|shop|business|commercial|industrial|factory|three.?phase|3.?phase|warehouse|வணிக|தொழில்|වාණිජ|කාර්මික/],
  ['residential', /home|house|wiring|rewir|socket|light|villa|apartment|வீடு|வயரிங்|නිවස|වයරින්/],
  ['services', /service|what do you|offer|do you do|help with|சேவை|සේවා/],
  ['hours', /hour|open|close|time|when|weekend|saturday|sunday|நேரம்|වේලාව/],
  ['area', /where|location|area|island|outside|district|kandy|galle|jaffna|negombo|colombo|இடம்|பகுதி|ප්‍රදේශ|ස්ථානය/],
  ['contact', /call|phone|number|whatsapp|email|contact|talk|human|person|someone|அழை|தொடர்பு|අමතන්න|සම්බන්ධ/],
  ['careers', /job|career|hiring|vacanc|work for|apply|வேலை|රැකියා/],
  ['thanks', /thank|thx|ty\b|நன்றி|ස්තූති/],
  ['greet', /^(hi|hello|hey|good (morning|afternoon|evening)|ayubowan|vanakkam)|வணக்கம்|ආයුබෝවන්/],
];

const CHIP_INTENT = {
  'Our services': 'services',
  'Get a quote': 'quote',
  'Solar power': 'solar',
  'Opening hours': 'hours',
  'Service area': 'area',
  'Talk to a person': 'contact',
  'Home wiring': 'residential',
  'Business or factory': 'commercial',
  'Backup power': 'backup',
  Inspection: 'inspection',
};

/* the matching FAQ answer, if a question closely matches one */
function faqAnswer(text) {
  const words = text.toLowerCase().match(/[a-z]{4,}/g) || [];
  if (words.length < 2) return null;
  let best = null;
  let score = 0;
  for (const item of faq.items) {
    const q = item.q.toLowerCase();
    const s = words.filter((w) => q.includes(w)).length / words.length;
    if (s > score) {
      score = s;
      best = item;
    }
  }
  return score >= 0.6 ? best.a : null;
}

let idSeq = 0;
const nextId = () => {
  idSeq += 1;
  return idSeq;
};

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [flow, setFlow] = useState(null); // quote request: { step, data }
  const [unread, setUnread] = useState(true);
  /* on the home page the button waits until the visitor scrolls down */
  const { isFront } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  const fabShown = open || !isFront || scrolled;
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* first open: greet */
  useEffect(() => {
    if (open && messages.length === 0) botSay(ANSWERS.greet, 300);
    if (open) {
      setUnread(false);
      window.setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* keep the newest message in view */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /* Escape closes */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function botSay(msg, delay = 650) {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), from: 'bot', ...msg }]);
    }, delay);
    timers.current.push(t);
  }

  const userSay = (text) => setMessages((m) => [...m, { id: nextId(), from: 'user', text }]);

  /* ---------- quote request, one question at a time */
  const startQuote = () => {
    setFlow({ step: 'service', data: {} });
    botSay({ text: 'Great, I will take a few details and pass them to the engineer. What do you need help with?', chips: [...SERVICES, 'Cancel'] });
  };

  const cancelQuote = () => {
    setFlow(null);
    botSay({ text: 'No problem, I have cancelled that. Anything else?', chips: MAIN_CHIPS });
  };

  const continueQuote = async (text) => {
    const value = text.trim();
    const data = { ...flow.data };

    if (flow.step === 'service') {
      data.service = value;
      setFlow({ step: 'name', data });
      botSay({ text: 'Thanks. What is your name?', chips: ['Cancel'] });
      return;
    }
    if (flow.step === 'name') {
      if (value.length < 2) {
        botSay({ text: 'Please type your name.', chips: ['Cancel'] });
        return;
      }
      data.name = value.slice(0, 120);
      setFlow({ step: 'phone', data });
      botSay({ text: 'What is the best phone number to reach you?', chips: ['Cancel'] });
      return;
    }
    if (flow.step === 'phone') {
      if ((value.match(/\d/g) || []).length < 9) {
        botSay({ text: 'That does not look like a full phone number. Please try again, for example 077 123 4567.', chips: ['Cancel'] });
        return;
      }
      data.phone = value.slice(0, 40);
      setFlow({ step: 'email', data });
      botSay({ text: 'And your email address?', chips: ['Cancel'] });
      return;
    }
    if (flow.step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        botSay({ text: 'That email address does not look right. Please check it and try again.', chips: ['Cancel'] });
        return;
      }
      data.email = value.slice(0, 160);
      setFlow({ step: 'details', data });
      botSay({ text: 'Last one: tell us a little about the job, such as the location, the size of the property and any timing.', chips: ['Cancel'] });
      return;
    }
    if (flow.step === 'details') {
      data.message = `${value}\n\n(Sent from the website chat assistant)`.slice(0, 2000);
      setFlow({ step: 'sending', data });
      setTyping(true);
      try {
        await api.submitEnquiry(data);
        setTyping(false);
        setFlow(null);
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            from: 'bot',
            text: 'Thank you! Your request has been sent. An engineer will call you back, usually within one working day.',
            chips: ['Our services', 'Opening hours'],
          },
        ]);
      } catch (error) {
        setTyping(false);
        setFlow(null);
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            from: 'bot',
            text: 'Sorry, I could not send your request just now. Please call or message the team directly.',
            actions: ['call', 'whatsapp', 'email'],
          },
        ]);
      }
    }
  };

  /* ---------- handle anything the visitor sends */
  const handle = (raw, { fromChip = false } = {}) => {
    const text = raw.trim();
    if (!text || flow?.step === 'sending') return;
    userSay(text);
    setInput('');

    if (text === 'Cancel') {
      cancelQuote();
      return;
    }
    if (flow) {
      continueQuote(text);
      return;
    }

    let intent = fromChip ? CHIP_INTENT[text] : null;
    if (!intent) {
      const lower = text.toLowerCase();
      const hit = INTENTS.find(([, re]) => re.test(lower));
      intent = hit ? hit[0] : null;
    }

    if (intent === 'quote') {
      startQuote();
      return;
    }
    if (intent) {
      botSay(ANSWERS[intent]);
      return;
    }
    const fromFaq = faqAnswer(text);
    if (fromFaq) {
      botSay({ text: fromFaq, chips: ['Get a quote', 'Talk to a person'] });
      return;
    }
    botSay(ANSWERS.fallback);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handle(input);
  };

  const last = messages[messages.length - 1];
  const showChips = !typing && last?.from === 'bot' && last.chips?.length;

  const action = (kind) => {
    if (kind === 'call') return <a className="ca-act" href={`tel:${company.phoneHref}`} key={kind}>Call us</a>;
    if (kind === 'whatsapp') return <a className="ca-act" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer" key={kind}>WhatsApp</a>;
    if (kind === 'email') return <a className="ca-act" href={company.emailHref} key={kind}>Email us</a>;
    if (kind === 'careers') return <Link className="ca-act" to="/careers" key={kind} onClick={() => setOpen(false)}>Careers</Link>;
    return null;
  };

  return (
    <>
      <div className={`ca-panel${open ? ' open' : ''}`} role="dialog" aria-label="Chat with Synnex Assistant" aria-hidden={!open}>
        <div className="ca-head">
          <span className="ca-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" /></svg>
          </span>
          <div className="ca-title">
            <b>Synnex Assistant</b>
            <span><i aria-hidden="true" /> Usually replies instantly</span>
          </div>
          <button type="button" className="ca-x" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="ca-list" ref={listRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`ca-msg ${m.from}`} translate={m.from === 'user' ? 'no' : undefined}>
              <p>{m.text}</p>
              {m.actions ? <div className="ca-acts">{m.actions.map(action)}</div> : null}
            </div>
          ))}
          {typing ? (
            <div className="ca-msg bot ca-typing" aria-label="Assistant is typing">
              <span /><span /><span />
            </div>
          ) : null}
        </div>

        {showChips ? (
          <div className="ca-chips">
            {last.chips.map((c) => (
              <button type="button" key={c} className={`ca-chip${c === 'Cancel' ? ' ghost' : ''}`} onClick={() => handle(c, { fromChip: true })}>
                {c}
              </button>
            ))}
          </div>
        ) : null}

        <form className="ca-form" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={flow ? 'Type your answer…' : 'Ask about our services…'}
            aria-label="Message"
            maxLength={500}
            disabled={flow?.step === 'sending'}
          />
          <button type="submit" className="ca-send" aria-label="Send" disabled={!input.trim()}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12 20 4l-6 16-2.5-6.5L4 12z" fill="currentColor" /></svg>
          </button>
        </form>
      </div>

      <button
        type="button"
        className={`ca-fab${open ? ' open' : ''}${fabShown ? '' : ' ca-hidden'}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        aria-expanded={open}
      >
        <svg className="ca-ico-chat" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M12.5 7.5 10 11.5h2.5l-1 3 3-4.5H12l.5-2.5z" fill="currentColor" />
        </svg>
        <svg className="ca-ico-x" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        {unread && !open ? <span className="ca-dot" aria-hidden="true" /> : null}
      </button>
    </>
  );
}
