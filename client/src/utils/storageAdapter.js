// Storage adapter — the single seam between hooks and persistence.
//
// Option B (cache-first / sync-later):
//   readCache(key, fallback)  sync   — instant first paint from localStorage
//   writeCache(key, value)    sync   — cache-only write, returns { ok }
//   fetchRemote(key, fallback) async — server value, or null = "cache is truth"
//   persist(key, value)       async  — writes to the backing store, returns { ok }
//
// Anonymous users get the localStorage adapter: the cache IS the data, so
// persist writes localStorage and fetchRemote returns null (hydrate no-op).
// Signed-in users get the API adapter: the account is the source of truth, so
// persist PUTs the server and keeps NO local copy — favorites never linger in
// localStorage once transferred to an account. Hooks never touch localStorage
// directly except to clear the anonymous key on transfer (see useFavorites).
// `stadar-location` stays a raw string outside the adapter on purpose.

import { API_BASE } from './api.js'

// Maps a storage key to its server endpoint. Favorites now; saved events in slice 3.
const ENDPOINTS = {
  'stadar-favorites': '/api/me/favorites',
  'stadar-saved-events': '/api/me/saved',
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

    // PUT to the server only — the account is the source of truth for signed-in
    // users, so no local copy is kept (favorites don't linger in localStorage).
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
        return res.ok ? { ok: true } : { ok: false, error: new Error(`HTTP ${res.status}`) }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

// Default anonymous adapter (used until AuthContext supplies an API adapter).
export const storageAdapter = createLocalStorageAdapter()
