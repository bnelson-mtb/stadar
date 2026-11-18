import { getApiBase } from '@stadar/shared/utils/api.js'

export { fetchAuthState, resolveAuthState, logout } from '@stadar/shared/utils/authApi.js'

// Where sign-in should come back to. With a separately hosted API (local dev:
// Vite on :5173, API on :5068) the path alone would land on the API's origin,
// so the client's own origin is included; the server only accepts origins it
// is configured to allow.
export function returnUrlFor({ origin, pathname, search = '' }, apiBase = getApiBase()) {
  return `${apiBase ? origin : ''}${pathname}${search}`
}

// The login flow is a full-page navigation (OAuth redirect), not a fetch.
export function loginUrl(returnUrl = returnUrlFor(window.location)) {
  return `${getApiBase()}/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
}
