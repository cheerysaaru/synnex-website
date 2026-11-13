/* Thin same-origin API client for the Laravel backend.
 *
 * Auth uses an httpOnly session cookie (credentials: "include") and a CSRF
 * token that is held in memory only — never in localStorage. In dev the Vite
 * proxy forwards /api to the Laravel server so cookies stay same-origin.
 */

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

let csrfToken = null;
let csrfRequest = null;

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function fetchCsrf() {
  let response;
  try {
    response = await fetch(`${BASE}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the API is running.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Could not start a secure session.', response.status);
  }

  csrfToken = data.token || null;
  return csrfToken;
}

function ensureCsrf() {
  if (csrfToken) return Promise.resolve(csrfToken);
  if (!csrfRequest) {
    csrfRequest = fetchCsrf().finally(() => {
      csrfRequest = null;
    });
  }
  return csrfRequest;
}

async function request(path, { method = 'GET', body, csrf = false, retryOn419 = true } = {}) {
  if (csrf) await ensureCsrf();

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (csrf && csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the API is running.', 0);
  }

  if (response.status === 419 && csrf && retryOn419) {
    // Expired session/token: fetch a fresh token and retry once.
    csrfToken = null;
    await fetchCsrf();
    return request(path, { method, body, csrf, retryOn419: false });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong. Please try again.',
      response.status,
      data.errors || null,
    );
  }

  // Refresh the in-memory token whenever the server rotates it.
  if (data.csrfToken) csrfToken = data.csrfToken;

  return data;
}

export const api = {
  csrf: () => ensureCsrf(),
  me: () => request('/auth/me'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, csrf: true }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, csrf: true }),
  logout: () => request('/auth/logout', { method: 'POST', csrf: true }),
  myEnquiries: () => request('/my/enquiries'),
  adminOverview: () => request('/admin/overview'),
  submitEnquiry: (payload) => request('/contact-submissions', { method: 'POST', body: payload, csrf: true }),
};
