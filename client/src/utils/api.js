// API base URL for backend requests.
// - Set VITE_API_URL to point at a separately hosted API.
// - In production builds it defaults to '' (same-origin), for the
//   single-container deployment where the API serves the built client.
// - In dev it defaults to the local API from launchSettings.json.
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:5068' : '')

const RETRY_DELAYS_MS = [2000, 5000, 10000]

// GET JSON with retries. The host scales to zero when idle and the first
// request can get its connection reset while a replica wakes up, so network
// failures and 5xx responses are retried with backoff (~17s worst case)
// instead of surfacing an error. Client errors (4xx) throw immediately;
// the thrown error carries .status so callers can tell them apart from
// network failures (no .status).
export async function fetchJsonWithRetry(url) {
  let lastErr
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]))
    }
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      lastErr = Object.assign(new Error(`HTTP ${res.status}`), { status: res.status })
      if (res.status < 500) break
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}
