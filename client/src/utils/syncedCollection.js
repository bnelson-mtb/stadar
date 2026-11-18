// One shared, app-wide copy of a collection (followed teams, saved events).
//
// Anonymous visitors: the localStorage cache is the data.
// Signed-in users: the account is the data. Its set is loaded once per sign-in
// and every write replaces the whole set on the server, which is why three
// rules hold here:
//   1. Nothing is written until the account's set has loaded. Changes made
//      before that are remembered and replayed on top of it. Writing an
//      unloaded (empty) set would erase the account.
//   2. Writes go out one at a time, newest value wins (see syncWriter).
//   3. There is a single copy for the whole app, so pages cannot hold
//      different versions and overwrite each other.
//
// `mode` follows the account-link decision (see accountLink.js):
//   anonymous | wait (import prompt is up) | merge (import local) | adopt.
import { createSyncWriter } from './syncWriter.js'

const HYDRATE_RETRY_MS = [1000, 2000, 4000, 8000] // last delay repeats
const HYDRATE_DEADLINE_MS = 75000 // same budget as fetchJsonWithRetry: covers a cold start
const WRITE_RETRY_MS = [1500, 4000]
const REFRESH_MIN_INTERVAL_MS = 30000

export function createSyncedCollection({
  key,
  localAdapter,
  normalize = value => (Array.isArray(value) ? value : []),
  merge = (local, remote) => [...local, ...remote],
  setTimer = (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimer = id => globalThis.clearTimeout(id),
  now = () => Date.now(),
}) {
  let adapter = localAdapter
  let mode = 'anonymous'
  let onUnauthorized = () => {}

  let items = normalize(localAdapter.readCache(key, []))
  let confirmed = items // last set known to be in the backing store
  let status = 'idle' // idle | syncing | synced | error
  let ready = true // false until the account's set has loaded
  let queue = [] // changes made before `ready`
  let generation = 0 // bumps on configure(); async work from an older one is dropped
  let hydrating = false
  let clearLocalOnConfirm = false
  let writeCount = 0
  let lastLoadedAt = 0
  let writer = makeWriter()

  let snapshot = { items, status }
  const listeners = new Set()

  function emit() {
    snapshot = { items, status }
    for (const listener of listeners) listener()
  }

  function makeWriter() {
    const gen = generation
    const target = adapter
    return createSyncWriter({
      persist: value => target.persist(key, value),
      retryDelaysMs: mode === 'anonymous' ? [] : WRITE_RETRY_MS,
      setTimer,
      clearTimer,
      onConfirmed(value) {
        if (gen !== generation) return
        confirmed = value
        if (clearLocalOnConfirm) {
          clearLocalOnConfirm = false
          target.clearCache(key)
        }
        if (!writer.isBusy()) status = 'synced'
        emit()
      },
      onFailed(_value, result) {
        if (gen !== generation) return
        if (result.status === 401) onUnauthorized()
        items = confirmed // back to what is actually stored
        status = 'error'
        emit()
      },
    })
  }

  async function fetchWithRetry(gen) {
    const source = adapter
    const deadline = now() + HYDRATE_DEADLINE_MS
    for (let attempt = 0; ; attempt++) {
      const result = await source.fetchRemoteResult(key)
      if (gen !== generation || result.ok) return result
      const transient = result.status === undefined || result.status === 429 || result.status >= 500
      const delay = HYDRATE_RETRY_MS[Math.min(attempt, HYDRATE_RETRY_MS.length - 1)]
      if (!transient || now() + delay > deadline) return result
      await new Promise(resolve => setTimer(resolve, delay))
      if (gen !== generation) return result
    }
  }

  async function hydrate() {
    const gen = generation
    hydrating = true
    status = 'syncing'
    emit()

    const result = await fetchWithRetry(gen)
    if (gen !== generation) return
    hydrating = false

    if (!result.ok) {
      if (result.status === 401) onUnauthorized()
      // Nothing loaded, so nothing may be written: drop the pending changes
      // rather than replace the account's set with a partial one.
      queue = []
      items = confirmed
      status = 'error'
      emit()
      return
    }

    const remote = normalize(result.value)
    const base = mode === 'merge' ? merge(normalize(adapter.readCache(key, [])), remote) : remote
    const next = queue.reduce((acc, change) => change(acc), base)
    queue = []
    confirmed = remote
    items = next
    ready = true
    lastLoadedAt = now()

    if (mode === 'merge') {
      // Import is a move: the local copy goes once the account has it.
      clearLocalOnConfirm = true
    } else {
      adapter.clearCache(key)
    }

    if (mode === 'merge' || next !== remote) {
      status = 'syncing'
      writeCount += 1
      writer.write(next)
    } else {
      status = 'synced'
    }
    emit()
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // Point the collection at a backing store. Called whenever sign-in state
    // or the account-link mode changes; a repeat call with the same pair is a no-op.
    configure({ adapter: nextAdapter, mode: nextMode, onUnauthorized: handler }) {
      if (handler) onUnauthorized = handler
      if (nextAdapter === adapter && nextMode === mode) return

      generation += 1
      writer.cancel()
      queue = []
      clearLocalOnConfirm = false
      hydrating = false
      adapter = nextAdapter
      mode = nextMode
      writer = makeWriter()

      if (mode === 'anonymous') {
        // The cache is the data (this is also the reset after signing out).
        items = confirmed = normalize(adapter.readCache(key, []))
        ready = true
        status = 'idle'
        emit()
        return
      }

      ready = false
      if (mode === 'wait') {
        // Import prompt is up: hold what is on screen until the user chooses.
        status = 'idle'
        emit()
        return
      }
      hydrate()
    },

    // `change` must be a pure list => list function that returns the same
    // list when it has nothing to do; it may be replayed on the server's set.
    mutate(change, { delayMs = 0 } = {}) {
      const next = change(items)
      if (next === items) return
      items = next
      status = 'syncing'

      if (!ready) {
        queue.push(change)
        // An earlier load gave up; try again now that there is something to save.
        if (mode !== 'wait' && !hydrating) hydrate()
        else emit()
        return
      }

      writeCount += 1
      emit()
      writer.write(next, { delayMs: mode === 'anonymous' ? 0 : delayMs })
    },

    // Pick up changes made on another device. Skipped while anything is
    // unsaved, and dropped if a write happens while the request is out.
    async refresh() {
      if (mode === 'anonymous' || mode === 'wait') return
      if (!ready) {
        // The first load gave up (server unreachable); try it again.
        if (!hydrating) hydrate()
        return
      }
      if (writer.isBusy()) return
      if (now() - lastLoadedAt < REFRESH_MIN_INTERVAL_MS) return
      lastLoadedAt = now()

      const gen = generation
      const writesBefore = writeCount
      const result = await adapter.fetchRemoteResult(key)
      if (gen !== generation || writeCount !== writesBefore || writer.isBusy()) return
      if (!result.ok) {
        if (result.status === 401) onUnauthorized()
        return
      }
      items = confirmed = normalize(result.value)
      emit()
    },

    // Send anything still waiting out a typing pause; resolves once nothing is unsaved.
    flush() {
      writer.flush()
      return writer.whenIdle()
    },
  }
}
