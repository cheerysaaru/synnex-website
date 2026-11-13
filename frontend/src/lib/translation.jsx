/* Translation context — provides English translation keys to components.
   The i18n system (lib/i18n.js) handles runtime translation of DOM text.
   This context provides the raw English strings for use in components. */
import { createContext, useContext, useMemo } from 'react';
import t1 from '../data/translations/t1.js';
import t2 from '../data/translations/t2.js';
import t3 from '../data/translations/t3.js';
import t4 from '../data/translations/t4.js';
import t6 from '../data/translations/t6.js';

const TranslationContext = createContext({});

/* Build a flat object of English keys -> English values for easy lookup */
const buildTranslationMap = () => {
  const map = {};
  for (const [en, ta, si] of [...t1, ...t2, ...t3, ...t4, ...t6]) {
    const key = en.replace(/\s+/g, ' ').trim();
    if (key && /[A-Za-z]/.test(key)) {
      map[key] = en;
    }
  }
  return map;
};

const EN_TRANSLATIONS = buildTranslationMap();

/* Also provide a lookup by the shorthand keys used in navMenus.js (e.g., 'nav.company') */
const buildShorthandMap = () => {
  const map = {};
  for (const [en, ta, si] of [...t1, ...t2, ...t3, ...t4, ...t6]) {
    const key = en.replace(/\s+/g, ' ').trim();
    if (key && /[A-Za-z]/.test(key)) {
      /* Create shorthand keys from common patterns */
      if (key.startsWith('nav.')) {
        map[key] = en;
      }
      if (key.startsWith('lang.')) {
        map[key] = en;
      }
      if (key.startsWith('co.')) {
        map[key] = en;
      }
      if (key.startsWith('sol.')) {
        map[key] = en;
      }
      if (key.startsWith('res.')) {
        map[key] = en;
      }
    }
  }
  return map;
};

const SHORTHAND_TRANSLATIONS = buildShorthandMap();

export function TranslationProvider({ children }) {
  const value = useMemo(() => ({
    t: { ...EN_TRANSLATIONS, ...SHORTHAND_TRANSLATIONS },
    en: EN_TRANSLATIONS,
  }), []);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    /* Fallback for components used outside provider */
    return { t: { ...EN_TRANSLATIONS, ...SHORTHAND_TRANSLATIONS }, en: EN_TRANSLATIONS };
  }
  return ctx;
}