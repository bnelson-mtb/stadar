// If the SQLite-backed localStorage can't write (its native library missing
// from a build, a full or corrupt database), every save would fail silently.
// Fall back to an in-memory store so the app keeps working for this session,
// and say so loudly in the logs.
export function createMemoryStorage() {
  const data = new Map()
  return {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value))
    },
    removeItem: key => {
      data.delete(key)
    },
    clear: () => data.clear(),
    key: index => [...data.keys()][index] ?? null,
    get length() {
      return data.size
    },
  }
}

export function ensureWorkingStorage(target, { warn = console.warn } = {}) {
  const probe = '__stadar_storage_check__'
  try {
    target.localStorage.setItem(probe, '1')
    const ok = target.localStorage.getItem(probe) === '1'
    target.localStorage.removeItem(probe)
    if (ok) return 'persistent'
  } catch {
    // fall through
  }
  warn('Stadar: device storage unavailable; saved games and teams will not survive a restart.')
  target.localStorage = createMemoryStorage()
  return 'memory'
}
