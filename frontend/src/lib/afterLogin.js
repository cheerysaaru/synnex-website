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

/* Pages that are separate apps (the admin quotation tool) need a full page
   load; everything else stays inside this app's router. */
const SEPARATE_APPS = ['/admin/quotation'];
const isSeparate = (path) => SEPARATE_APPS.some((p) => path === p || path.startsWith(`${p}/`));

export function goAfterLogin(navigate, fallback = '/') {
  const path = takeReturn(fallback);
  if (isSeparate(path)) window.location.assign(path);
  else navigate(path, { replace: true });
}

/* Leaving the login screen without logging in: never bounce into a separate app. */
export function leaveLogin(navigate, fallback = '/') {
  const path = takeReturn(fallback);
  navigate(isSeparate(path) ? fallback : path, { replace: true });
}
