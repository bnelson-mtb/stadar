// Storage adapter — the single seam between hooks and persistence.
//
// Today there is one backend: browser localStorage (the anonymous tier).
// When accounts land, an API-backed adapter implements this same interface
// and the hooks switch on auth state; the React Native port swaps in an
// AsyncStorage-backed adapter. Hooks must never touch localStorage
// directly — always go through this module.
//
// Scope: user data destined for account sync (favorites, saved events).
// `stadar-location` stays a raw string outside the adapter on purpose —
// it is device-local and not JSON-encoded in existing clients.

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  return {
    // Returns the parsed value, or `fallback` on a missing key, corrupt
    // JSON, or unavailable storage.
    load(key, fallback) {
      try {
        const raw = storage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch {
        return fallback
      }
    },
    // Returns { ok: true } or { ok: false, error } — callers surface
    // failures (quota, private mode) instead of throwing mid-render.
    save(key, value) {
      try {
        storage.setItem(key, JSON.stringify(value))
        return { ok: true }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

export const storageAdapter = createLocalStorageAdapter()
