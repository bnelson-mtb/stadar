// API base URL for backend requests. '' means same-origin.
// Each app sets it once at startup with setApiBase(): the web client from
// Vite env (client/src/apiBase.js), the mobile app from EXPO_PUBLIC_API_URL.
// Read it with getApiBase() at call time. It is a function, not an exported
// variable, so nothing depends on how a bundler handles reassigned exports.
let apiBase = ''

export function setApiBase(url) {
  apiBase = (url ?? '').replace(/\/+$/, '')
}

export function getApiBase() {
  return apiBase
}

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000] // last delay repeats
const RETRY_DEADLINE_MS = 75000

// GET JSON with retries. The host scales to zero when idle; a measured cold
// start takes ~20s, during which requests fail fast at the edge. Network
// failures and 5xx responses are retried with backoff until the deadline,
// so a cold start reads as a slow first load instead of an error. Client
// errors (4xx) throw immediately; the thrown error carries .status so
// callers can tell HTTP errors apart from network failures (no .status).
export async function fetchJsonWithRetry(url) {
  const deadline = Date.now() + RETRY_DEADLINE_MS
  for (let attempt = 0; ; attempt++) {
    let lastErr
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      lastErr = Object.assign(new Error(`HTTP ${res.status}`), { status: res.status })
      if (res.status < 500) throw lastErr
    } catch (err) {
      if (err.status && err.status < 500) throw err
      lastErr = err
    }
    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]
    if (Date.now() + delay > deadline) throw lastErr
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}
