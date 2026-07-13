import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createSavedRecord,
  normalizeSavedRecords,
  persistSavedRecords,
  removeSavedRecord,
  updateSavedMetadata,
  updateSavedSnapshot,
} from './savedEventRecords.js'

const event = { id: 'event-1', name: 'First event' }
const otherEvent = { id: 'event-2', name: 'Second event' }

function record(overrides = {}) {
  return {
    event,
    savedAt: '2026-07-13T12:00:00.000Z',
    notes: 'Bring water',
    score: { home: '2', away: '1' },
    ...overrides,
  }
}

test('normalizeSavedRecords returns an empty array for non-arrays', () => {
  assert.deepEqual(normalizeSavedRecords(null), [])
  assert.deepEqual(normalizeSavedRecords({ event }), [])
})

test('normalizeSavedRecords adds empty metadata to legacy records', () => {
  const legacy = { event, savedAt: '2026-07-13T12:00:00.000Z' }

  assert.deepEqual(normalizeSavedRecords([legacy]), [
    {
      ...legacy,
      notes: '',
      score: { home: '', away: '' },
    },
  ])
})

test('normalizeSavedRecords preserves existing metadata', () => {
  const existing = record()

  assert.deepEqual(normalizeSavedRecords([existing]), [existing])
})

test('createSavedRecord creates a complete saved record', () => {
  const savedAt = '2026-07-13T15:30:00.000Z'

  assert.deepEqual(createSavedRecord(event, savedAt), {
    event,
    savedAt,
    notes: '',
    score: { home: '', away: '' },
  })
})

test('createSavedRecord defaults savedAt to a current valid ISO timestamp', () => {
  const before = Date.now()

  const savedAt = createSavedRecord(event).savedAt

  const after = Date.now()
  const timestamp = Date.parse(savedAt)
  assert.equal(new Date(timestamp).toISOString(), savedAt)
  assert.ok(timestamp >= before)
  assert.ok(timestamp <= after)
})

test('updateSavedMetadata changes only target metadata and cannot replace its snapshot fields', () => {
  const target = record()
  const unmatched = record({ event: otherEvent })
  const records = [target, unmatched]
  const replacementEvent = { id: event.id, name: 'Wrong replacement' }

  const result = updateSavedMetadata(records, event.id, {
    notes: 'Updated note',
    event: replacementEvent,
    savedAt: '2099-01-01T00:00:00.000Z',
    arbitrary: 'must not be stored',
  })

  assert.deepEqual(result[0], {
    ...target,
    notes: 'Updated note',
  })
  assert.strictEqual(result[0].event, target.event)
  assert.equal(result[0].savedAt, target.savedAt)
  assert.equal(Object.hasOwn(result[0], 'arbitrary'), false)
  assert.strictEqual(result[1], unmatched)
  assert.equal(target.notes, 'Bring water')
})

test('updateSavedMetadata merges partial home and away score patches', () => {
  const original = record()

  const withHome = updateSavedMetadata([original], event.id, {
    score: { home: '3' },
  })[0]
  const withAway = updateSavedMetadata([withHome], event.id, {
    score: { away: '4' },
  })[0]

  assert.deepEqual(withHome.score, { home: '3', away: '1' })
  assert.deepEqual(withAway.score, { home: '3', away: '4' })
  assert.deepEqual(original.score, { home: '2', away: '1' })
})

test('updateSavedMetadata is a no-op when the event ID is missing', () => {
  const original = record()
  const records = [original]

  const result = updateSavedMetadata(records, 'missing', { notes: 'No change' })

  assert.strictEqual(result, records)
  assert.strictEqual(result[0], original)
})

test('updateSavedSnapshot replaces only the target event and preserves saved metadata', () => {
  const target = record()
  const unmatched = record({ event: otherEvent })
  const freshEvent = { id: event.id, name: 'Refreshed event', status: 'live' }

  const result = updateSavedSnapshot([target, unmatched], freshEvent)

  assert.strictEqual(result[0].event, freshEvent)
  assert.equal(result[0].savedAt, target.savedAt)
  assert.equal(result[0].notes, target.notes)
  assert.strictEqual(result[0].score, target.score)
  assert.strictEqual(result[1], unmatched)
})

test('removeSavedRecord removes only the target record', () => {
  const target = record()
  const unmatched = record({ event: otherEvent })

  const result = removeSavedRecord([target, unmatched], event.id)

  assert.deepEqual(result, [unmatched])
  assert.strictEqual(result[0], unmatched)
})

test('persistSavedRecords serializes records to the requested storage key', () => {
  const calls = []
  const storage = {
    setItem(key, value) {
      calls.push([key, value])
    },
  }
  const records = [record()]

  const result = persistSavedRecords(storage, 'saved-events', records)

  assert.deepEqual(result, { ok: true })
  assert.deepEqual(calls, [['saved-events', JSON.stringify(records)]])
})

test('persistSavedRecords reports a storage write failure without throwing', () => {
  const quotaError = new Error('quota exceeded')
  const storage = {
    setItem() {
      throw quotaError
    },
  }

  const result = persistSavedRecords(storage, 'saved-events', [record()])

  assert.equal(result.ok, false)
  assert.strictEqual(result.error, quotaError)
})
