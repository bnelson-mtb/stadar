import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeFavorites, mergeSavedRecords, setFavorite } from './reconcile.js'

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

const rec = (id, notes = '') => ({ event: { id }, notes, savedAt: `t-${id}`, score: { home: '', away: '' } })

test('mergeSavedRecords unions by event.id, local order first', () => {
  const merged = mergeSavedRecords([rec('a'), rec('b')], [rec('b'), rec('c')])
  assert.deepEqual(merged.map(r => r.event.id), ['a', 'b', 'c'])
})

test('mergeSavedRecords keeps the local record on an id collision', () => {
  const merged = mergeSavedRecords([rec('b', 'local note')], [rec('b', 'server note')])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].notes, 'local note')
})

test('mergeSavedRecords handles empty sides', () => {
  assert.deepEqual(mergeSavedRecords([], [rec('a')]).map(r => r.event.id), ['a'])
  assert.deepEqual(mergeSavedRecords([rec('a')], []).map(r => r.event.id), ['a'])
})

test('setFavorite follows and unfollows', () => {
  assert.deepEqual(setFavorite(['Jazz'], 'RSL', true), ['Jazz', 'RSL'])
  assert.deepEqual(setFavorite(['Jazz', 'RSL'], 'Jazz', false), ['RSL'])
})

test('setFavorite returns the same list when there is nothing to change', () => {
  const list = ['Jazz']
  assert.equal(setFavorite(list, 'Jazz', true), list)
  assert.equal(setFavorite(list, 'RSL', false), list)
})
