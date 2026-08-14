import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeFavorites } from './reconcile.js'

test('mergeFavorites unions without duplicates, local order first', () => {
  assert.deepEqual(
    mergeFavorites(['Jazz', 'RSL'], ['RSL', 'Royals']),
    ['Jazz', 'RSL', 'Royals'],
  )
})

test('mergeFavorites handles empty sides', () => {
  assert.deepEqual(mergeFavorites([], ['A']), ['A'])
  assert.deepEqual(mergeFavorites(['A'], []), ['A'])
})
