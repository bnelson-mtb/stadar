// Serializes whole-set writes for one collection.
//
// The account endpoints replace the entire set on every PUT, so two writes in
// flight at once race on the server and can land out of order. This keeps at
// most one persist in flight, collapses everything queued behind it into the
// newest value, optionally waits for a pause first (typing in a notes field),
// and retries a failed write before giving up on it.
export function createSyncWriter({
  persist, // async value => { ok, status?, error? }
  onConfirmed = () => {}, // value => void: the backing store now holds `value`
  onFailed = () => {}, // (value, result) => void: gave up, and nothing newer is queued
  retryDelaysMs = [],
  setTimer = (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimer = id => globalThis.clearTimeout(id),
}) {
  let pending = null // { value }: the newest value not yet sent
  let debounceTimer = null
  let retryTimer = null
  let inFlight = false
  let cancelled = false
  let idleWaiters = []

  const isBusy = () => inFlight || pending !== null

  function settle() {
    // Send what queued up meanwhile, unless it is still waiting out its pause.
    if (pending !== null && debounceTimer === null) pump()
    if (isBusy()) return
    const waiters = idleWaiters
    idleWaiters = []
    for (const resolve of waiters) resolve()
  }

  function pump() {
    if (cancelled || inFlight || pending === null) return
    const { value } = pending
    pending = null
    inFlight = true
    attempt(value, 0)
  }

  async function attempt(value, attemptIndex) {
    let result
    try {
      result = await persist(value)
    } catch (error) {
      result = { ok: false, error }
    }
    if (cancelled) return

    if (result.ok) {
      inFlight = false
      onConfirmed(value)
      settle()
      return
    }

    // A newer value replaces the whole set anyway, so it covers this failure.
    if (pending !== null) {
      inFlight = false
      settle()
      return
    }

    // 401/403 will not get better by asking again.
    const worthRetrying = result.status !== 401 && result.status !== 403
    if (worthRetrying && attemptIndex < retryDelaysMs.length) {
      retryTimer = setTimer(() => {
        retryTimer = null
        if (!cancelled) attempt(value, attemptIndex + 1)
      }, retryDelaysMs[attemptIndex])
      return
    }

    inFlight = false
    onFailed(value, result)
    settle()
  }

  return {
    isBusy,

    write(value, { delayMs = 0 } = {}) {
      if (cancelled) return
      pending = { value }
      if (retryTimer !== null) {
        // Waiting to retry an older value: this one supersedes it.
        clearTimer(retryTimer)
        retryTimer = null
        inFlight = false
      }
      if (debounceTimer !== null) {
        clearTimer(debounceTimer)
        debounceTimer = null
      }
      if (delayMs > 0) {
        debounceTimer = setTimer(() => {
          debounceTimer = null
          pump()
        }, delayMs)
      } else {
        pump()
      }
    },

    // Send a waiting value now instead of at the end of its pause.
    flush() {
      if (debounceTimer !== null) {
        clearTimer(debounceTimer)
        debounceTimer = null
      }
      pump()
    },

    whenIdle() {
      return isBusy() ? new Promise(resolve => idleWaiters.push(resolve)) : Promise.resolve()
    },

    // Drop everything not yet sent; results of a write already in flight are ignored.
    cancel() {
      cancelled = true
      pending = null
      inFlight = false
      if (debounceTimer !== null) clearTimer(debounceTimer)
      if (retryTimer !== null) clearTimer(retryTimer)
      debounceTimer = null
      retryTimer = null
      settle()
    },
  }
}
