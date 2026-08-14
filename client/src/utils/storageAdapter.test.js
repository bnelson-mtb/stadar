import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLocalStorageAdapter, createApiAdapter } from './storageAdapter.js'

function fakeStorage() {
  const map = new Map()
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  }
}

test('local adapter: readCache/writeCache round-trip', () => {
  const a = createLocalStorageAdapter(fakeStorage())
  a.writeCache('stadar-favorites', ['A'])
  assert.deepEqual(a.readCache('stadar-favorites', []), ['A'])
})

test('local adapter: fetchRemote is always null (cache is truth)', async () => {
  const a = createLocalStorageAdapter(fakeStorage())
  assert.equal(await a.fetchRemote('stadar-favorites', []), null)
})

test('local adapter: persist writes cache and returns ok', async () => {
  const store = fakeStorage()
  const a = createLocalStorageAdapter(store)
  const res = await a.persist('stadar-favorites', ['A'])
  assert.deepEqual(res, { ok: true })
  assert.equal(store.getItem('stadar-favorites'), JSON.stringify(['A']))
})

test('api adapter: fetchRemote returns server value on 200', async () => {
  const fake = async () => ({ ok: true, json: async () => ['Jazz'] })
  const a = createApiAdapter(fake, fakeStorage())
  assert.deepEqual(await a.fetchRemote('stadar-favorites', []), ['Jazz'])
})

test('api adapter: fetchRemote returns null on 401', async () => {
  const fake = async () => ({ ok: false, status: 401 })
  const a = createApiAdapter(fake, fakeStorage())
  assert.equal(await a.fetchRemote('stadar-favorites', []), null)
})

test('api adapter: persist PUTs to the server and keeps no local copy', async () => {
  let method = null
  const store = fakeStorage()
  const fake = async (_url, opts) => { method = opts.method; return { ok: true } }
  const a = createApiAdapter(fake, store)
  const res = await a.persist('stadar-favorites', ['Jazz'])
  assert.equal(method, 'PUT')
  assert.deepEqual(res, { ok: true })
  // Signed-in favorites live in the account, not localStorage.
  assert.equal(store.getItem('stadar-favorites'), null)
})

test('api adapter: persist failure never writes local', async () => {
  const store = fakeStorage()
  const fake = async () => ({ ok: false, status: 500 })
  const a = createApiAdapter(fake, store)
  const res = await a.persist('stadar-favorites', ['new'])
  assert.equal(res.ok, false)
  assert.equal(store.getItem('stadar-favorites'), null)
})
