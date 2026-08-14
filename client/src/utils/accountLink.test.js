import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decideInitialLinkMode } from './accountLink.js'

test('anonymous → mode anonymous, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: false, alreadyLinked: false, favoritesCount: 3, savedCount: 2 }),
    { mode: 'anonymous', prompt: false, markLinked: false },
  )
})

test('already linked → adopt, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: true, favoritesCount: 3, savedCount: 2 }),
    { mode: 'adopt', prompt: false, markLinked: false },
  )
})

test('signed in, not linked, no local data → adopt and mark linked, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: false, favoritesCount: 0, savedCount: 0 }),
    { mode: 'adopt', prompt: false, markLinked: true },
  )
})

test('signed in, not linked, has local data → wait and prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: false, favoritesCount: 1, savedCount: 0 }),
    { mode: 'wait', prompt: true, markLinked: false },
  )
})
