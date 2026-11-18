import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSyncedCollection } from './syncedCollection.js'
import { createLocalStorageAdapter } from './storageAdapter.js'
import { mergeFavorites, setFavorite } from './reconcile.js'
import { createTestClock, deferred } from './testClock.js'

const KEY = 'stadar-favorites'
const follow = team => list => setFavorite(list, team, true)
const unfollow = team => list => setFavorite(list, team, false)

function memoryStorage(initial) {
  const map = new Map()
  if (initial) map.set(KEY, JSON.stringify(initial))
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: k => map.delete(k),
    read: () => (map.has(KEY) ? JSON.parse(map.get(KEY)) : null),
  }
}

// Stands in for the signed-in API adapter. Requests stay open until the test
// answers them, unless `respondGet` is set (then every GET answers at once).
function fakeAccount(storage, server = []) {
  const local = createLocalStorageAdapter(storage)
  const account = {
    server,
    gets: [],
    puts: [],
    respondGet: null,
    readCache: local.readCache,
    writeCache: local.writeCache,
    clearCache: local.clearCache,
    fetchRemoteResult() {
      const call = deferred()
      account.gets.push(call)
      if (account.respondGet) call.resolve(account.respondGet())
      return call.promise
    },
    persist(_key, value) {
      const call = { value, ...deferred() }
      account.puts.push(call)
      return call.promise
    },
    answerGet(result = { ok: true, value: account.server }) {
      account.gets.at(-1).resolve(result)
    },
    answerPut(result = { ok: true }) {
      const call = account.puts.at(-1)
      if (result.ok) account.server = call.value
      call.resolve(result)
    },
  }
  return account
}

function setup({ local, server } = {}) {
  const clock = createTestClock()
  const storage = memoryStorage(local)
  const localAdapter = createLocalStorageAdapter(storage)
  const account = fakeAccount(storage, server)
  const store = createSyncedCollection({ key: KEY, localAdapter, merge: mergeFavorites, ...clock })
  const unauthorized = []
  const signIn = mode =>
    store.configure({ adapter: account, mode, onUnauthorized: () => unauthorized.push(true) })
  const items = () => store.getSnapshot().items
  const status = () => store.getSnapshot().status
  return { clock, storage, localAdapter, account, store, signIn, items, status, unauthorized }
}

test('signed out: starts from the local cache and saves changes to it', async () => {
  const { store, storage, items, status, clock } = setup({ local: ['Jazz'] })
  assert.deepEqual(items(), ['Jazz'])

  store.mutate(follow('RSL'))
  await clock.settle()
  assert.deepEqual(items(), ['Jazz', 'RSL'])
  assert.deepEqual(storage.read(), ['Jazz', 'RSL'])
  assert.equal(status(), 'synced')
})

test('signed in: shows the account set and writes nothing just for loading it', async () => {
  const { signIn, account, items, status, clock } = setup({ server: ['Jazz', 'RSL'] })
  signIn('adopt')
  assert.equal(status(), 'syncing')
  account.answerGet()
  await clock.settle()

  assert.deepEqual(items(), ['Jazz', 'RSL'])
  assert.equal(status(), 'synced')
  assert.equal(account.puts.length, 0)
})

test('a change made before the account set has loaded is added to it, not written over it', async () => {
  const { store, signIn, account, items, clock } = setup({ server: ['Jazz', 'RSL'] })
  signIn('adopt')

  store.mutate(follow('Royals'))
  await clock.settle()
  assert.deepEqual(items(), ['Royals'], 'shown right away')
  assert.equal(account.puts.length, 0, 'but not written while the account set is unknown')

  account.answerGet()
  await clock.settle()
  assert.deepEqual(items(), ['Jazz', 'RSL', 'Royals'])
  assert.deepEqual(account.puts.map(p => p.value), [['Jazz', 'RSL', 'Royals']])
})

test('following a team that turns out to be followed already changes nothing', async () => {
  const { store, signIn, account, items, status, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  store.mutate(follow('Jazz'))
  account.answerGet()
  await clock.settle()

  assert.deepEqual(items(), ['Jazz'])
  assert.equal(account.puts.length, 0)
  assert.equal(status(), 'synced')
})

test('a load that keeps failing never writes, and the next change retries the load first', async () => {
  const { store, signIn, account, items, status, clock } = setup({ server: ['Jazz', 'RSL'] })
  account.respondGet = () => ({ ok: false, status: 503 })
  signIn('adopt')
  store.mutate(follow('Royals'))
  await clock.advance(80000)

  assert.equal(status(), 'error')
  assert.deepEqual(items(), [], 'the unsaved change is dropped rather than left looking saved')
  assert.equal(account.puts.length, 0)
  assert.ok(account.gets.length > 3, 'kept retrying until the deadline')

  account.respondGet = () => ({ ok: true, value: account.server })
  store.mutate(follow('Royals'))
  await clock.settle()
  assert.deepEqual(items(), ['Jazz', 'RSL', 'Royals'])
  assert.deepEqual(account.puts.map(p => p.value), [['Jazz', 'RSL', 'Royals']])
})

test('a brief server hiccup during load is retried and recovers', async () => {
  const { signIn, account, items, status, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet({ ok: false, status: 503 })
  await clock.advance(1000)
  assert.equal(account.gets.length, 2)
  account.answerGet()
  await clock.settle()

  assert.deepEqual(items(), ['Jazz'])
  assert.equal(status(), 'synced')
})

test('401 while loading reports the dead session and is not retried', async () => {
  const { signIn, account, unauthorized, status, clock } = setup()
  signIn('adopt')
  account.answerGet({ ok: false, status: 401 })
  await clock.advance(60000)

  assert.equal(account.gets.length, 1)
  assert.equal(unauthorized.length, 1)
  assert.equal(status(), 'error')
})

test('import: local and account sets are merged, and the local copy goes only once the account has it', async () => {
  const { signIn, account, storage, items, status, clock } = setup({ local: ['Royals'], server: ['Jazz'] })
  signIn('wait')
  assert.equal(account.gets.length, 0, 'nothing is loaded while the prompt is up')
  assert.deepEqual(items(), ['Royals'])

  signIn('merge')
  account.answerGet()
  await clock.settle()
  assert.deepEqual(items(), ['Royals', 'Jazz'])
  assert.deepEqual(storage.read(), ['Royals'], 'still local until the write lands')

  account.answerPut()
  await clock.settle()
  assert.deepEqual(account.server, ['Royals', 'Jazz'])
  assert.equal(storage.read(), null)
  assert.equal(status(), 'synced')
})

test('import that fails to save leaves the local data in place for another try', async () => {
  const { signIn, account, storage, status, clock } = setup({ local: ['Royals'], server: ['Jazz'] })
  signIn('merge')
  account.answerGet()
  await clock.settle()
  for (let i = 0; i < 3; i++) {
    account.answerPut({ ok: false, status: 500 })
    await clock.advance(4000)
  }

  assert.equal(status(), 'error')
  assert.deepEqual(storage.read(), ['Royals'])
  assert.deepEqual(account.server, ['Jazz'])
})

test('start fresh: takes the account set and discards the local copy', async () => {
  const { signIn, account, storage, items, clock } = setup({ local: ['Royals'], server: ['Jazz'] })
  signIn('wait')
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  assert.deepEqual(items(), ['Jazz'])
  assert.equal(storage.read(), null)
  assert.equal(account.puts.length, 0)
})

test('a write that fails for good goes back to what the account actually holds', async () => {
  const { store, signIn, account, items, status, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  store.mutate(follow('RSL'))
  for (let i = 0; i < 3; i++) {
    await clock.settle()
    account.answerPut({ ok: false, status: 500 })
    await clock.advance(4000)
  }

  assert.deepEqual(items(), ['Jazz'])
  assert.equal(status(), 'error')
})

test('a write refused with 401 reports the dead session', async () => {
  const { store, signIn, account, unauthorized, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  store.mutate(follow('RSL'))
  await clock.settle()
  account.answerPut({ ok: false, status: 401 })
  await clock.settle()

  assert.equal(unauthorized.length, 1)
  assert.equal(account.puts.length, 1, 'not retried')
})

test('a burst of delayed edits reaches the account as one write of the final value', async () => {
  const { store, signIn, account, status, clock } = setup({ server: [] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  for (const team of ['A', 'B', 'C', 'D']) {
    store.mutate(follow(team), { delayMs: 800 })
    await clock.advance(200)
  }
  assert.equal(account.puts.length, 0)
  assert.equal(status(), 'syncing')

  await clock.advance(800)
  assert.deepEqual(account.puts.map(p => p.value), [['A', 'B', 'C', 'D']])
})

test('signed-out edits are saved immediately even when a delay is asked for', async () => {
  const { store, storage, clock } = setup()
  store.mutate(follow('Jazz'), { delayMs: 800 })
  await clock.settle()
  assert.deepEqual(storage.read(), ['Jazz'])
})

test('flush sends a delayed edit now and resolves when it is saved', async () => {
  const { store, signIn, account, clock } = setup({ server: [] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  store.mutate(follow('Jazz'), { delayMs: 800 })
  let flushed = false
  store.flush().then(() => { flushed = true })
  await clock.settle()
  assert.equal(account.puts.length, 1)
  assert.equal(flushed, false)

  account.answerPut()
  await clock.settle()
  assert.equal(flushed, true)
})

test('signing out switches back to the local cache and ignores account replies still in flight', async () => {
  const { store, signIn, account, localAdapter, items, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()
  store.mutate(follow('RSL'))
  await clock.settle()

  store.configure({ adapter: localAdapter, mode: 'anonymous' })
  assert.deepEqual(items(), [])
  account.answerPut({ ok: false, status: 500 })
  await clock.advance(10000)
  assert.deepEqual(items(), [])
  assert.equal(store.getSnapshot().status, 'idle')
})

test('refresh picks up a change made on another device', async () => {
  const { store, signIn, account, items, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.advance(31000)

  account.server = ['Jazz', 'Royals']
  store.refresh()
  account.answerGet()
  await clock.settle()
  assert.deepEqual(items(), ['Jazz', 'Royals'])
})

test('refresh is skipped right after a load and while a write is pending', async () => {
  const { store, signIn, account, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.settle()

  store.refresh()
  assert.equal(account.gets.length, 1, 'too soon after the load')

  await clock.advance(31000)
  store.mutate(follow('RSL'))
  store.refresh()
  assert.equal(account.gets.length, 1, 'unsaved change pending')
})

test('a refresh reply that raced a write is discarded', async () => {
  const { store, signIn, account, items, clock } = setup({ server: ['Jazz'] })
  signIn('adopt')
  account.answerGet()
  await clock.advance(31000)

  store.refresh() // request leaves with the old set...
  store.mutate(unfollow('Jazz'))
  await clock.settle()
  account.answerPut() // ...the write lands first...
  await clock.settle()
  account.gets.at(-1).resolve({ ok: true, value: ['Jazz'] }) // ...then the stale reply arrives
  await clock.settle()

  assert.deepEqual(items(), [])
})

test('subscribers are told about changes and can unsubscribe', async () => {
  const { store, clock } = setup()
  let calls = 0
  const unsubscribe = store.subscribe(() => { calls += 1 })
  store.mutate(follow('Jazz'))
  await clock.settle()
  const seen = calls
  assert.ok(seen >= 1)

  unsubscribe()
  store.mutate(follow('RSL'))
  await clock.settle()
  assert.equal(calls, seen)
})
