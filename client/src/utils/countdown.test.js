import test from 'node:test'
import assert from 'node:assert/strict'

import {
  LIVE_WINDOW_MS,
  formatCountdown,
  getCountdown,
  getCountdownParts,
} from './countdown.js'

const now = new Date('2026-09-30T18:00:00Z')
const at = offsetMs => new Date(now.getTime() + offsetMs)
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

test('getCountdown splits the remaining time into days, hours and minutes', () => {
  assert.deepEqual(getCountdown(at(2 * DAY + 4 * HOUR + 30 * MINUTE), now), {
    days: 2,
    hours: 4,
    minutes: 30,
    isLive: false,
    isPast: false,
  })
})

test('getCountdown accepts ISO strings and rounds partial minutes down', () => {
  const target = new Date(now.getTime() + 6 * HOUR + 12 * MINUTE + 59_000).toISOString()

  assert.deepEqual(getCountdown(target, now.getTime()), {
    days: 0,
    hours: 6,
    minutes: 12,
    isLive: false,
    isPast: false,
  })
})

test('getCountdown is live from the start until the live window closes', () => {
  assert.equal(getCountdown(now, now).isLive, true)
  assert.equal(getCountdown(at(-LIVE_WINDOW_MS + MINUTE), now).isLive, true)

  const over = getCountdown(at(-LIVE_WINDOW_MS), now)
  assert.equal(over.isLive, false)
  assert.equal(over.isPast, true)
})

test('getCountdown returns null for missing or invalid dates', () => {
  assert.equal(getCountdown(null, now), null)
  assert.equal(getCountdown('', now), null)
  assert.equal(getCountdown('not a date', now), null)
})

test('getCountdownParts pads hours under a day and switches to days past 24h', () => {
  assert.deepEqual(getCountdownParts(getCountdown(at(6 * HOUR + 12 * MINUTE), now)), [
    { value: '06', unit: 'h' },
    { value: '12', unit: 'm' },
  ])
  assert.deepEqual(getCountdownParts(getCountdown(at(2 * DAY + 4 * HOUR), now)), [
    { value: '2', unit: 'd' },
    { value: '04', unit: 'h' },
  ])
})

test('getCountdownParts has no parts when live, past or missing', () => {
  assert.deepEqual(getCountdownParts(getCountdown(now, now)), [])
  assert.deepEqual(getCountdownParts(getCountdown(at(-DAY), now)), [])
  assert.deepEqual(getCountdownParts(null), [])
})

test('formatCountdown joins parts and can drop the leading hour zero', () => {
  const countdown = getCountdown(at(6 * HOUR + 12 * MINUTE), now)

  assert.equal(formatCountdown(countdown), '06h 12m')
  assert.equal(formatCountdown(countdown, { pad: false }), '6h 12m')
  assert.equal(formatCountdown(getCountdown(at(DAY + 5 * MINUTE), now), { pad: false }), '1d 00h')
})
