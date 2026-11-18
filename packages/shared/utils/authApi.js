// Who is signed in, and signing out, against the Stadar API. Shared by the
// web client and the mobile app (each adds its own sign-in navigation).
import { getApiBase } from './api.js'

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000] // last delay repeats
const RETRY_DEADLINE_MS = 75000 // same budget as fetchJsonWithRetry: covers a cold start

// Asks the server who is signed in.
//   authenticated — 200 with a user
//   anonymous     — the server answered and there is no session (401, or
//                   accounts are not enabled on this deployment)
//   unknown       — no usable answer: network failure, 429 or 5xx, typically
//                   the host still waking from scale-to-zero. This is NOT the
//                   same as signed out, and must not be shown as it.
export async function fetchAuthState(fetchImpl = fetch) {
  let res
  try {
    res = await fetchImpl(`${getApiBase()}/api/me`, { credentials: 'include' })
  } catch {
    return { status: 'unknown' }
  }
  if (res.status === 429 || res.status >= 500) return { status: 'unknown' }
  if (!res.ok) return { status: 'anonymous' }
  try {
    const user = await res.json()
    return user?.id ? { status: 'authenticated', user } : { status: 'anonymous' }
  } catch {
    // A 200 that is not JSON: accounts are off and the SPA fallback answered.
    return { status: 'anonymous' }
  }
}

// fetchAuthState, retried while the answer is `unknown`. Still `unknown` after
// the deadline means the server could not be reached at all.
export async function resolveAuthState({
  fetchState = fetchAuthState,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = () => Date.now(),
} = {}) {
  const deadline = now() + RETRY_DEADLINE_MS
  for (let attempt = 0; ; attempt++) {
    const state = await fetchState()
    if (state.status !== 'unknown') return state
    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]
    if (now() + delay > deadline) return state
    await sleep(delay)
  }
}

export async function logout(fetchImpl = fetch) {
  try {
    await fetchImpl(`${getApiBase()}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
    // best-effort; the client clears local auth state regardless
  }
}
