// Storage adapter — the single seam between hooks and persistence.
//
// Option B (cache-first / sync-later):
//   readCache(key, fallback)  sync   — instant first paint from localStorage
//   writeCache(key, value)    sync   — cache-only write, returns { ok }
//   clearCache(key)           sync   — drops the local copy (after a transfer)
//   fetchRemote(key, fallback) async — server value, or null = "cache is truth"
//   fetchRemoteResult(key)    async  — API adapter only: { ok, value } or { ok: false, status? }
//   persist(key, value)       async  — writes to the backing store, returns { ok, status? }
//
// Anonymous users get the localStorage adapter: the cache IS the data, so
// persist writes localStorage and fetchRemote returns null (hydrate no-op).
// Signed-in users get the API adapter: the account is the source of truth, so
// persist PUTs the server and keeps NO local copy — favorites never linger in
// localStorage once transferred to an account. The collections (see
// syncedCollection.js) only ever reach localStorage through an adapter.
// `stadar-location` stays a raw string outside the adapter on purpose.

import { getApiBase } from './api.js'

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
  function clearCache(key) {
    try {
      storage.removeItem(key)
    } catch {
      // nothing to clear (storage unavailable)
    }
  }
  return {
    readCache,
    writeCache,
    clearCache,
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

  // GET the server set. A failure carries the HTTP status when there was a
  // response, so callers can tell "signed out" (401) and "try again" (network,
  // 429, 5xx: no status or a transient one) apart from each other.
  async function fetchRemoteResult(key) {
    const endpoint = ENDPOINTS[key]
    if (!endpoint) return { ok: false, status: 404 }
    try {
      const res = await fetchImpl(`${getApiBase()}${endpoint}`, { credentials: 'include' })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, value: await res.json() }
    } catch (error) {
      return { ok: false, error }
    }
  }

  return {
    readCache: local.readCache,
    writeCache: local.writeCache,
    clearCache: local.clearCache,
    fetchRemoteResult,

    // The server set, or null on any failure.
    async fetchRemote(key) {
      const result = await fetchRemoteResult(key)
      return result.ok ? result.value : null
    },

    // PUT to the server only — the account is the source of truth for signed-in
    // users, so no local copy is kept (favorites don't linger in localStorage).
    async persist(key, value) {
      const endpoint = ENDPOINTS[key]
      if (!endpoint) return local.writeCache(key, value)
      try {
        const res = await fetchImpl(`${getApiBase()}${endpoint}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
        return res.ok
          ? { ok: true }
          : { ok: false, status: res.status, error: new Error(`HTTP ${res.status}`) }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

// Default anonymous adapter (used until AuthContext supplies an API adapter).
export const storageAdapter = createLocalStorageAdapter()
