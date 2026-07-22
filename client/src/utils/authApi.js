import { API_BASE } from './api.js'

// Returns the signed-in user object, or null when anonymous (401) or on any
// network/parse failure — callers treat null as "anonymous tier".
export async function fetchMe(fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`${API_BASE}/api/me`, { credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function logout(fetchImpl = fetch) {
  try {
    await fetchImpl(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
    // best-effort; the client clears local auth state regardless
  }
}

// The login flow is a full-page navigation (OAuth redirect), not a fetch.
export function loginUrl(returnUrl = window.location.pathname) {
  return `${API_BASE}/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
}
