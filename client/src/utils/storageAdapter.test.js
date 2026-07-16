import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocalStorageAdapter } from './storageAdapter.js'

function makeFakeStorage(overrides = {}) {
  const map = new Map()
  return {
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    ...overrides,
  }
}

test('load returns the parsed value for a stored key', () => {
  const storage = makeFakeStorage()
  storage.setItem('k', JSON.stringify(['Utah Jazz']))
  const adapter = createLocalStorageAdapter(storage)

  assert.deepEqual(adapter.load('k', []), ['Utah Jazz'])
})

test('load returns the fallback for a missing key', () => {
  const adapter = createLocalStorageAdapter(makeFakeStorage())

  assert.deepEqual(adapter.load('missing', []), [])
})

test('load returns the fallback for corrupt JSON', () => {
  const storage = makeFakeStorage()
  storage.setItem('k', '{not json')
  const adapter = createLocalStorageAdapter(storage)

  assert.deepEqual(adapter.load('k', []), [])
})

test('load returns the fallback when storage is unavailable', () => {
  const adapter = createLocalStorageAdapter(undefined)

  assert.deepEqual(adapter.load('k', []), [])
})

test('save round-trips through load', () => {
  const adapter = createLocalStorageAdapter(makeFakeStorage())

  const result = adapter.save('k', [{ id: 'e1' }])

  assert.deepEqual(result, { ok: true })
  assert.deepEqual(adapter.load('k', []), [{ id: 'e1' }])
})

test('save reports a storage write failure without throwing', () => {
  const quotaError = new Error('quota exceeded')
  const adapter = createLocalStorageAdapter(makeFakeStorage({
    setItem() {
      throw quotaError
    },
  }))

  const result = adapter.save('k', [1])

  assert.equal(result.ok, false)
  assert.strictEqual(result.error, quotaError)
})
