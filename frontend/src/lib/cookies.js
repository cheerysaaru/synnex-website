/* Cookie consent: the visitor's choice is kept in a first-party cookie for a year.
   'all'       = accepted all cookies
   'essential' = only the cookies the site needs to work (login, security)
   Anything optional added later (analytics etc.) must check hasConsent('all'). */
export const CONSENT_COOKIE = 'synnex_cookies';
export const OPEN_SETTINGS_EVENT = 'synnex:cookie-settings';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function getConsent() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|essential)`));
  return m ? m[1] : null;
}

export function setConsent(choice) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
}

export function hasConsent(level) {
  const c = getConsent();
  return level === 'essential' ? Boolean(c) : c === 'all';
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
