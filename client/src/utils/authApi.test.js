import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchMe, logout } from './authApi.js'

test('fetchMe returns the user on 200', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'u1', email: 'a@b.com', displayName: 'A' }) })
  const user = await fetchMe(fakeFetch)
  assert.equal(user.id, 'u1')
})

test('fetchMe returns null on 401 (anonymous)', async () => {
  const fakeFetch = async () => ({ ok: false, status: 401 })
  const user = await fetchMe(fakeFetch)
  assert.equal(user, null)
})

test('fetchMe returns null on network error', async () => {
  const fakeFetch = async () => { throw new Error('offline') }
  const user = await fetchMe(fakeFetch)
  assert.equal(user, null)
})

test('logout POSTs to the logout endpoint', async () => {
  let calledWith = null
  const fakeFetch = async (url, opts) => { calledWith = { url, opts }; return { ok: true } }
  await logout(fakeFetch)
  assert.match(calledWith.url, /\/api\/auth\/logout$/)
  assert.equal(calledWith.opts.method, 'POST')
})
