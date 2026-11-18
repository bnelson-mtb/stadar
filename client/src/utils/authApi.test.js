import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAuthState, resolveAuthState, logout, returnUrlFor } from './authApi.js'

test('fetchAuthState: 200 with a user is authenticated', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'u1', email: 'a@b.com', displayName: 'A' }) })
  const state = await fetchAuthState(fakeFetch)
  assert.equal(state.status, 'authenticated')
  assert.equal(state.user.id, 'u1')
})

test('fetchAuthState: 401 is anonymous', async () => {
  const state = await fetchAuthState(async () => ({ ok: false, status: 401 }))
  assert.deepEqual(state, { status: 'anonymous' })
})

test('fetchAuthState: a 200 that is not JSON (accounts disabled, SPA fallback) is anonymous', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('<!doctype') } })
  assert.deepEqual(await fetchAuthState(fakeFetch), { status: 'anonymous' })
})

// The point of `unknown`: a server that is waking up, rate limiting or
// unreachable has not said the user is signed out.
test('fetchAuthState: network failure, 429 and 5xx are unknown, not signed out', async () => {
  assert.deepEqual(await fetchAuthState(async () => { throw new Error('offline') }), { status: 'unknown' })
  assert.deepEqual(await fetchAuthState(async () => ({ ok: false, status: 429 })), { status: 'unknown' })
  assert.deepEqual(await fetchAuthState(async () => ({ ok: false, status: 503 })), { status: 'unknown' })
})

test('resolveAuthState retries an unknown answer until the server gives a real one', async () => {
  const answers = [{ status: 'unknown' }, { status: 'unknown' }, { status: 'authenticated', user: { id: 'u1' } }]
  const slept = []
  const state = await resolveAuthState({
    fetchState: async () => answers.shift(),
    sleep: async ms => { slept.push(ms) },
    now: () => 0,
  })
  assert.equal(state.status, 'authenticated')
  assert.deepEqual(slept, [1000, 2000])
})

test('resolveAuthState does not retry a definite answer', async () => {
  let calls = 0
  const state = await resolveAuthState({
    fetchState: async () => { calls += 1; return { status: 'anonymous' } },
    sleep: async () => { throw new Error('should not sleep') },
  })
  assert.equal(state.status, 'anonymous')
  assert.equal(calls, 1)
})

test('resolveAuthState gives up at the deadline and still reports unknown', async () => {
  let time = 0
  let calls = 0
  const state = await resolveAuthState({
    fetchState: async () => { calls += 1; return { status: 'unknown' } },
    sleep: async ms => { time += ms },
    now: () => time,
  })
  assert.equal(state.status, 'unknown')
  assert.ok(calls > 4)
  assert.ok(time <= 75000)
})

test('logout POSTs to the logout endpoint', async () => {
  let calledWith = null
  const fakeFetch = async (url, opts) => { calledWith = { url, opts }; return { ok: true } }
  await logout(fakeFetch)
  assert.match(calledWith.url, /\/api\/auth\/logout$/)
  assert.equal(calledWith.opts.method, 'POST')
})

test('returnUrlFor: same-origin deployments send just the path and query', () => {
  const location = { origin: 'https://stadar.app', pathname: '/saved', search: '?tab=past' }
  assert.equal(returnUrlFor(location, ''), '/saved?tab=past')
})

test('returnUrlFor: a separately hosted API is told which origin to come back to', () => {
  const location = { origin: 'http://localhost:5173', pathname: '/profile', search: '' }
  assert.equal(returnUrlFor(location, 'http://localhost:5068'), 'http://localhost:5173/profile')
})
