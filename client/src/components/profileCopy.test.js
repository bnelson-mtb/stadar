import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DATA_USAGE_SECTIONS,
  GITHUB_URL,
  SIGN_IN_PITCH,
  getFollowStats,
  getProfileIdentity,
} from './profileCopy.js'

test('anonymous profile invites the user to sign in for cross-device sync', () => {
  const identity = getProfileIdentity('anonymous', null)

  assert.equal(identity.signedIn, false)
  assert.equal(identity.heading, 'Not signed in')
  assert.equal(identity.subheading, SIGN_IN_PITCH)
})

test('loading state is presented as signed out rather than as an account', () => {
  // ProfilePage skips the card entirely while loading, but the helper must not
  // invent an identity if it is ever called with an unresolved status.
  assert.equal(getProfileIdentity('loading', null).signedIn, false)
})

test('authenticated profile shows the display name, email, and initial', () => {
  const identity = getProfileIdentity('authenticated', {
    displayName: 'brady nelson',
    email: 'someone@example.com',
  })

  assert.equal(identity.signedIn, true)
  assert.equal(identity.heading, 'brady nelson')
  assert.equal(identity.subheading, 'someone@example.com')
  assert.equal(identity.initial, 'B')
})

test('authenticated profile stays renderable when Google omits the display name', () => {
  const identity = getProfileIdentity('authenticated', { email: 'x@example.com' })

  assert.equal(identity.heading, 'Signed in')
  assert.equal(identity.initial, 'S')
  assert.equal(identity.subheading, 'x@example.com')
})

test('follow stats use singular forms at exactly one', () => {
  assert.equal(getFollowStats(1, 1), '1 team · 1 event saved')
})

test('follow stats pluralize zero and many', () => {
  assert.equal(getFollowStats(0, 0), '0 teams · 0 events saved')
  assert.equal(getFollowStats(3, 7), '3 teams · 7 events saved')
})

test('follow stats never render a negative or non-numeric count', () => {
  assert.equal(getFollowStats(undefined, null), '0 teams · 0 events saved')
  assert.equal(getFollowStats(-4, Number.NaN), '0 teams · 0 events saved')
})

test('data usage sections are non-empty and fully populated', () => {
  assert.ok(DATA_USAGE_SECTIONS.length > 0)
  for (const section of DATA_USAGE_SECTIONS) {
    assert.equal(typeof section.heading, 'string')
    assert.ok(section.heading.length > 0)
    assert.equal(typeof section.body, 'string')
    assert.ok(section.body.length > 0)
  }
})

test('data usage disclosure names the third party that sees the user IP', () => {
  // ipapi.co receives the visitor's IP for state detection; if that call is ever
  // removed or swapped, this disclosure has to change with it.
  const combined = DATA_USAGE_SECTIONS.map(s => s.body).join(' ')
  assert.match(combined, /ipapi\.co/)
})

test('data usage disclosure states that passwords are never collected', () => {
  const combined = DATA_USAGE_SECTIONS.map(s => s.body).join(' ')
  assert.match(combined, /password/i)
})

test('github url points at the public repository', () => {
  assert.match(GITHUB_URL, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/)
})
