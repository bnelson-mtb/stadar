import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getDetailSectionOrder,
  getEventBoundaryDelay,
  getFocusRestoreTarget,
  getFocusTrapTarget,
  isPastEvent,
  sanitizeScoreInput,
  shouldShowFinalScore,
} from './eventDetailState.js'

test('getFocusTrapTarget wraps forward focus from the last element to the first', () => {
  const first = { id: 'cancel' }
  const last = { id: 'unsave' }

  assert.equal(getFocusTrapTarget([first, last], last, false), first)
})

test('getFocusTrapTarget wraps backward focus from the first element to the last', () => {
  const first = { id: 'cancel' }
  const last = { id: 'unsave' }

  assert.equal(getFocusTrapTarget([first, last], first, true), last)
})

test('getFocusTrapTarget redirects focus that is outside the dialog', () => {
  const first = { id: 'cancel' }
  const last = { id: 'unsave' }
  const outside = { id: 'page-link' }

  assert.equal(getFocusTrapTarget([first, last], outside, false), first)
  assert.equal(getFocusTrapTarget([first, last], outside, true), last)
})

test('getFocusTrapTarget leaves interior focus to normal tab order', () => {
  const first = { id: 'cancel' }
  const middle = { id: 'details' }
  const last = { id: 'unsave' }

  assert.equal(getFocusTrapTarget([first, middle, last], middle, false), null)
  assert.equal(getFocusTrapTarget([first, middle, last], middle, true), null)
  assert.equal(getFocusTrapTarget([], middle, false), null)
})

test('getFocusRestoreTarget keeps the initiating control when it remains connected', () => {
  const trigger = { isConnected: true }
  const fallback = { isConnected: true }

  assert.equal(getFocusRestoreTarget(trigger, fallback), trigger)
})

test('getFocusRestoreTarget uses a connected fallback after the initiating control is removed', () => {
  const removedTrigger = { isConnected: false }
  const fallback = { isConnected: true }

  assert.equal(getFocusRestoreTarget(removedTrigger, fallback), fallback)
  assert.equal(getFocusRestoreTarget(removedTrigger, { isConnected: false }), null)
  assert.equal(getFocusRestoreTarget(null, null), null)
})

test('isPastEvent treats an event before now as past', () => {
  const event = { dateTime: '2026-07-13T17:59:59.999Z' }

  assert.equal(isPastEvent(event, new Date('2026-07-13T18:00:00.000Z')), true)
})

test('isPastEvent treats the exact time boundary as past', () => {
  const boundary = '2026-07-13T18:00:00.000Z'

  assert.equal(isPastEvent({ dateTime: boundary }, new Date(boundary)), true)
})

test('isPastEvent treats an event after now as upcoming', () => {
  const event = { dateTime: '2026-07-13T18:00:00.001Z' }

  assert.equal(isPastEvent(event, new Date('2026-07-13T18:00:00.000Z')), false)
})

test('getEventBoundaryDelay returns the remaining delay for an upcoming event', () => {
  const event = { dateTime: '2026-07-13T18:00:00.500Z' }

  assert.equal(
    getEventBoundaryDelay(event, new Date('2026-07-13T18:00:00.000Z')),
    500
  )
})

test('getEventBoundaryDelay clamps long waits to the browser timeout maximum', () => {
  const now = new Date('2026-07-13T18:00:00.000Z')
  const event = { dateTime: new Date(now.getTime() + 3_000_000_000).toISOString() }

  assert.equal(getEventBoundaryDelay(event, now), 2_147_483_647)
})

test('getEventBoundaryDelay stops scheduling at or after the boundary and for invalid dates', () => {
  const boundary = new Date('2026-07-13T18:00:00.000Z')

  assert.equal(getEventBoundaryDelay({ dateTime: boundary.toISOString() }, boundary), null)
  assert.equal(
    getEventBoundaryDelay(
      { dateTime: '2026-07-13T17:59:59.999Z' },
      boundary
    ),
    null
  )
  assert.equal(getEventBoundaryDelay({ dateTime: 'not-a-date' }, boundary), null)
})

test('getEventBoundaryDelay never returns a rapid-loop delay below one millisecond', () => {
  const now = new Date('2026-07-13T18:00:00.000Z')
  const event = { dateTime: '2026-07-13T18:00:00.010Z' }

  assert.equal(getEventBoundaryDelay(event, now, 0), 1)
})

test('getDetailSectionOrder orders saved upcoming event sections', () => {
  assert.deepEqual(
    getDetailSectionOrder({ isPast: false, isSaved: true, hasLeagueInfo: true }),
    ['tickets', 'venue', 'notes', 'league']
  )
})

test('getDetailSectionOrder orders unsaved upcoming event sections', () => {
  assert.deepEqual(
    getDetailSectionOrder({ isPast: false, isSaved: false, hasLeagueInfo: true }),
    ['tickets', 'venue', 'league']
  )
})

test('getDetailSectionOrder orders saved past event sections', () => {
  assert.deepEqual(
    getDetailSectionOrder({ isPast: true, isSaved: true, hasLeagueInfo: true }),
    ['notes', 'venue', 'league']
  )
})

test('getDetailSectionOrder orders unsaved past event sections', () => {
  assert.deepEqual(
    getDetailSectionOrder({ isPast: true, isSaved: false, hasLeagueInfo: true }),
    ['venue', 'league']
  )
})

test('getDetailSectionOrder omits unavailable league information', () => {
  assert.deepEqual(
    getDetailSectionOrder({ isPast: false, isSaved: true, hasLeagueInfo: false }),
    ['tickets', 'venue', 'notes']
  )
})

test('shouldShowFinalScore requires past, saved, and away-team state', () => {
  for (const isPast of [false, true]) {
    for (const isSaved of [false, true]) {
      for (const hasAwayTeam of [false, true]) {
        assert.equal(
          shouldShowFinalScore({ isPast, isSaved, hasAwayTeam }),
          isPast && isSaved && hasAwayTeam
        )
      }
    }
  }
})

test('sanitizeScoreInput accepts empty and digit-only strings', () => {
  assert.equal(sanitizeScoreInput(''), '')
  assert.equal(sanitizeScoreInput('0'), '0')
  assert.equal(sanitizeScoreInput('00123'), '00123')
})

test('sanitizeScoreInput rejects non-digit score input', () => {
  assert.equal(sanitizeScoreInput('12.5'), null)
  assert.equal(sanitizeScoreInput('-1'), null)
  assert.equal(sanitizeScoreInput(' 12'), null)
  assert.equal(sanitizeScoreInput('12a'), null)
  assert.equal(sanitizeScoreInput(12), null)
})
