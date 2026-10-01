import { useEffect, useState } from 'react'
import { API_BASE, fetchJsonWithRetry } from '../utils/api.js'

// Session cache shared by Discover, Teams and the team page, so switching tabs
// doesn't refetch (and re-skeleton) the same state. Same 5-minute TTL as the
// server-side cache, so it never holds data the API wouldn't.
const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map() // stateCode -> { events, at }

function readCache(stateCode) {
  const hit = cache.get(stateCode)
  return hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.events : null
}

function loadGames(stateCode) {
  const cached = readCache(stateCode)
  if (cached) return Promise.resolve(cached)
  return fetchJsonWithRetry(`${API_BASE}/api/games?stateCode=${stateCode}`).then(events => {
    cache.set(stateCode, { events, at: Date.now() })
    return events
  })
}

// Upcoming games for a state. Pass a falsy stateCode to skip loading.
// `loading` is derived from whether the latest result belongs to the current
// request, so changing state or retrying shows the loading state at once.
export default function useGames(stateCode) {
  const [attempt, setAttempt] = useState(0)
  const requestKey = stateCode ? `${stateCode}#${attempt}` : null
  const [result, setResult] = useState(() => {
    const cached = stateCode ? readCache(stateCode) : null
    return { key: cached ? requestKey : null, events: cached ?? [], error: null }
  })

  useEffect(() => {
    if (!stateCode) return undefined
    // Guard against out-of-order responses: auto-detect can change stateCode
    // while the first fetch is still retrying (up to 75s during a cold
    // start), and the stale response must not clobber the fresh one.
    let ignore = false
    loadGames(stateCode)
      .then(events => {
        if (!ignore) setResult({ key: requestKey, events, error: null })
      })
      .catch(err => {
        // .status = HTTP error from the API; no .status = never got a response
        if (!ignore) setResult({ key: requestKey, events: [], error: err.status ? 'server' : 'network' })
      })
    return () => {
      ignore = true
    }
  }, [stateCode, requestKey])

  const settled = Boolean(requestKey) && result.key === requestKey
  return {
    events: settled ? result.events : [],
    loading: Boolean(requestKey) && !settled,
    error: settled ? result.error : null,
    retry: () => setAttempt(n => n + 1),
  }
}
