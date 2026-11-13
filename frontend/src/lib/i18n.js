/* ==========================================================================
   Site-wide translation layer (English → Tamil / Sinhala).

   Every page is written in English. When the visitor picks Tamil or Sinhala,
   this module swaps visible English text, placeholders, aria-labels, alt text
   and the page title for the matching entry in data/translations/*.js.
   It keeps the original English so switching back is instant, and it watches
   the page so content that React adds or changes later is translated too.

   To add or fix a translation, edit data/translations/*.js:
     ["English text", "Tamil", "Sinhala"]
   ========================================================================== */
import t1 from '../data/translations/t1.js';
import t2 from '../data/translations/t2.js';
import t3 from '../data/translations/t3.js';
import t4 from '../data/translations/t4.js';
import t6 from '../data/translations/t6.js';
import t7 from '../data/translations/t7.js';
import t8 from '../data/translations/t8.js';

const LANGS = ['ta', 'si'];
const STORAGE_KEY = 'synnext_lang';
const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'TITLE']); // <title> is handled by applyTitle()
const SEPARATORS = [' | ', ' — ', ' · ', ' – '];

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/* ---------- dictionary */
const DICT = { ta: new Map(), si: new Map() };
for (const [en, ta, si] of [...t1, ...t2, ...t3, ...t4, ...t6, ...t7, ...t8]) {
  const key = norm(en);
  if (ta) DICT.ta.set(key, ta);
  if (si) DICT.si.set(key, si);
}

const MONTHS = {
  ta: { Jan: 'ஜன.', Feb: 'பிப்.', Mar: 'மார்.', Apr: 'ஏப்.', May: 'மே', Jun: 'ஜூன்', Jul: 'ஜூலை', Aug: 'ஆக.', Sep: 'செப்.', Sept: 'செப்.', Oct: 'அக்.', Nov: 'நவ.', Dec: 'டிச.' },
  si: { Jan: 'ජන.', Feb: 'පෙබ.', Mar: 'මාර්.', Apr: 'අප්‍රේ.', May: 'මැයි', Jun: 'ජූනි', Jul: 'ජූලි', Aug: 'අගෝ.', Sep: 'සැප්.', Sept: 'සැප්.', Oct: 'ඔක්.', Nov: 'නොවැ.', Dec: 'දෙසැ.' },
};

/* patterns for text that contains numbers */
const PATTERNS = [
  [/^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec) (\d{4})$/, (m, lang) => `${MONTHS[lang][m[2]]} ${m[1]}, ${m[3]}`],
  [/^(\d+) min read$/, (m, lang) => (lang === 'ta' ? `${m[1]} நிமிட வாசிப்பு` : `මිනිත්තු ${m[1]} කියවීම`)],
  [/^© (\d{4})$/, (m) => m[0]],
];

export function translate(text, lang) {
  if (!LANGS.includes(lang) || !text) return null;
  const key = norm(text);
  if (!key || !/[A-Za-z]/.test(key)) return null;

  const hit = DICT[lang].get(key);
  if (hit) return hit;

  for (const [re, fn] of PATTERNS) {
    const m = key.match(re);
    if (m) return fn(m, lang);
  }

  /* "Page title | Synnex Technology", "Name — Role", "Solar · Nugegoda" */
  for (const sep of SEPARATORS) {
    if (key.includes(sep)) {
      const parts = key.split(sep);
      const out = parts.map((p) => translate(p, lang) ?? p);
      if (out.some((p, i) => p !== parts[i])) return out.join(sep);
    }
  }
  return null;
}

/* ---------- DOM application */
const textOrig = new WeakMap(); // text node -> { en, shown }
const attrOrig = new WeakMap(); // element -> { attr: { en, shown } }
let current = 'en';
let observer = null;
let busy = false;

const blocked = (el) => el.closest?.('[translate="no"], .notranslate');
const skip = (el) => !el || SKIP_TAGS.has(el.tagName) || blocked(el);
/* placeholders etc. on form fields are still translated */
const skipAttrs = (el) => !el || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || blocked(el);

function applyText(node) {
  if (skip(node.parentElement)) return;
  const value = node.nodeValue;
  let rec = textOrig.get(node);
  /* React (or anything else) changed the text since we last touched it */
  if (!rec || value !== rec.shown) {
    rec = { en: value, shown: value };
    textOrig.set(node, rec);
  }
  const translated = current === 'en' ? null : translate(rec.en, current);
  let next = rec.en;
  if (translated) {
    const lead = rec.en.match(/^\s*/)[0];
    const trail = rec.en.match(/\s*$/)[0];
    next = lead + translated + trail;
  }
  if (next !== value) node.nodeValue = next;
  rec.shown = next;
}

function applyAttrs(el) {
  if (skipAttrs(el)) return;
  let recs = attrOrig.get(el);
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    const value = el.getAttribute(attr);
    if (!recs) {
      recs = {};
      attrOrig.set(el, recs);
    }
    let rec = recs[attr];
    if (!rec || value !== rec.shown) rec = recs[attr] = { en: value, shown: value };
    const next = current === 'en' ? rec.en : translate(rec.en, current) ?? rec.en;
    if (next !== value) el.setAttribute(attr, next);
    rec.shown = next;
  }
}

function walk(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    applyText(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  applyAttrs(root);
  if (skip(root)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) applyText(n);
    else applyAttrs(n);
    n = tw.nextNode();
  }
}

let titleEn = null;
let titleShown = null;
function applyTitle() {
  if (document.title !== titleShown) titleEn = document.title;
  const next = current === 'en' ? titleEn : translate(titleEn, current) ?? titleEn;
  if (next && next !== document.title) document.title = next;
  titleShown = document.title;
}

function run(fn) {
  if (busy) return;
  busy = true;
  try {
    fn();
  } finally {
    busy = false;
  }
}

function start() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    run(() => {
      for (const m of mutations) {
        if (m.type === 'characterData') applyText(m.target);
        else if (m.type === 'attributes') applyAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
      applyTitle();
    });
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });
}

export function setLanguage(lang) {
  current = LANGS.includes(lang) ? lang : 'en';
  document.documentElement.lang = current;
  document.documentElement.dataset.lang = current;
  run(() => {
    walk(document.body);
    applyTitle();
  });
  start();
}

/* ---------- boot: follow the language switcher in the nav */
if (typeof window !== 'undefined') {
  let initial = 'en';
  try {
    initial = window.localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    /* storage unavailable */
  }
  const boot = () => setLanguage(initial);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.addEventListener('synnext-lang', (e) => setLanguage(e.detail));
}
