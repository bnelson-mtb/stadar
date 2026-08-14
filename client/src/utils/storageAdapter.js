// Storage adapter — the single seam between hooks and persistence.
//
// Option B (cache-first / sync-later):
//   readCache(key, fallback)  sync   — instant first paint from localStorage
//   writeCache(key, value)    sync   — cache-only write, returns { ok }
//   fetchRemote(key, fallback) async — server value, or null = "cache is truth"
//   persist(key, value)       async  — cache + remote write, returns { ok }
//
// Anonymous users get the localStorage adapter (fetchRemote → null, so the
// hydrate path is a no-op). Signed-in users get the API adapter. Hooks never
// touch localStorage directly — always go through an adapter from AuthContext.
// `stadar-location` stays a raw string outside the adapter on purpose.

import { API_BASE } from './api.js'

// Maps a storage key to its server endpoint. Favorites now; saved events in slice 3.
const ENDPOINTS = {
  'stadar-favorites': '/api/me/favorites',
}

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  function readCache(key, fallback) {
    try {
      const raw = storage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }
  function writeCache(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
      return { ok: true }
    } catch (error) {
      return { ok: false, error }
    }
  }
  return {
    readCache,
    writeCache,
    // Anonymous tier: no remote, the cache is the source of truth.
    async fetchRemote() {
      return null
    },
    // Anonymous tier: cache write IS the persist.
    async persist(key, value) {
      return writeCache(key, value)
    },
  }
}

export function createApiAdapter(fetchImpl = fetch, storage = globalThis.localStorage) {
  const local = createLocalStorageAdapter(storage)

  return {
    readCache: local.readCache,
    writeCache: local.writeCache,

    // GET the server set; null on 401/network/parse failure → hook keeps cache.
    async fetchRemote(key) {
      const endpoint = ENDPOINTS[key]
      if (!endpoint) return null
      try {
        const res = await fetchImpl(`${API_BASE}${endpoint}`, { credentials: 'include' })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },

    // PUT first; only mirror into the cache once the server confirms, so a
    // failed write leaves the cache holding the last server-confirmed value.
    async persist(key, value) {
      const endpoint = ENDPOINTS[key]
      if (!endpoint) return local.writeCache(key, value)
      try {
        const res = await fetchImpl(`${API_BASE}${endpoint}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
        if (!res.ok) return { ok: false, error: new Error(`HTTP ${res.status}`) }
        local.writeCache(key, value)
        return { ok: true }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

// Default anonymous adapter (used until AuthContext supplies an API adapter).
export const storageAdapter = createLocalStorageAdapter()
