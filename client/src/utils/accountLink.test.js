import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decideInitialLinkMode, effectiveLinkMode } from './accountLink.js'

test('anonymous → mode anonymous, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: false, favoritesCount: 3, savedCount: 2 }),
    { mode: 'anonymous', prompt: false },
  )
})

test('signed in, no local data → adopt, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, favoritesCount: 0, savedCount: 0 }),
    { mode: 'adopt', prompt: false },
  )
})

// Local data at sign-in was made while signed out. It is never discarded
// silently, including on a browser that has signed in before.
test('signed in with local data → wait and prompt, every time', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, favoritesCount: 1, savedCount: 0 }),
    { mode: 'wait', prompt: true },
  )
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, favoritesCount: 0, savedCount: 2 }),
    { mode: 'wait', prompt: true },
  )
})

test('effectiveLinkMode: anything but a signed-in session runs on the local cache', () => {
  assert.equal(effectiveLinkMode('anonymous', 'anonymous'), 'anonymous')
  assert.equal(effectiveLinkMode('anonymous', 'adopt'), 'anonymous')
  assert.equal(effectiveLinkMode('loading', 'merge'), 'anonymous')
})

test('effectiveLinkMode: signed in before the link decision catches up holds instead of writing', () => {
  assert.equal(effectiveLinkMode('authenticated', 'anonymous'), 'wait')
})

test('effectiveLinkMode: signed in follows the link decision', () => {
  assert.equal(effectiveLinkMode('authenticated', 'wait'), 'wait')
  assert.equal(effectiveLinkMode('authenticated', 'merge'), 'merge')
  assert.equal(effectiveLinkMode('authenticated', 'adopt'), 'adopt')
})
