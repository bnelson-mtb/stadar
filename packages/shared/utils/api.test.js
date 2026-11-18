import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getApiBase, setApiBase } from './api.js'
import { createApiAdapter } from './storageAdapter.js'

test('getApiBase defaults to same-origin', () => {
  assert.equal(getApiBase(), '')
})

test('setApiBase changes what getApiBase returns', t => {
  t.after(() => setApiBase(''))
  setApiBase('https://example.test')
  assert.equal(getApiBase(), 'https://example.test')
})

test('setApiBase strips trailing slashes and treats undefined as same-origin', t => {
  t.after(() => setApiBase(''))
  setApiBase('https://example.test/')
  assert.equal(getApiBase(), 'https://example.test')
  setApiBase(undefined)
  assert.equal(getApiBase(), '')
})

test('consumers read the base at call time, not at import time', async t => {
  t.after(() => setApiBase(''))
  const urls = []
  const fakeFetch = async url => {
    urls.push(url)
    return { ok: true, json: async () => [] }
  }
  const storage = { getItem: () => null, setItem() {}, removeItem() {} }
  const adapter = createApiAdapter(fakeFetch, storage)
  setApiBase('https://example.test')
  await adapter.fetchRemote('stadar-favorites')
  assert.deepEqual(urls, ['https://example.test/api/me/favorites'])
})
