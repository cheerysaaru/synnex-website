/* Remember where to send someone after they log in (e.g. back to /track). */
const KEY = 'synnex_after_login';

export function rememberReturn(path) {
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable: they land on the home page instead */
  }
}

export function takeReturn(fallback = '/') {
  try {
    const path = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (path && path.startsWith('/') && !path.startsWith('//')) return path;
  } catch {
    /* ignore */
  }
  return fallback;
}
