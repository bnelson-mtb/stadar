import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getDefaultDateSegment,
  getNextGameForTeam,
  getSegmentHeading,
  getTeamsInFeed,
  matchesDateSegment,
  pickNextUpEvent,
} from './feedFilters.js'

// Wednesday, Sep 30 2026
const wednesday = new Date(2026, 8, 30, 9, 0)
const saturday = new Date(2026, 9, 3, 9, 0)
const sunday = new Date(2026, 9, 4, 9, 0)

test('today matches only the current calendar day', () => {
  assert.equal(matchesDateSegment('2026-09-30', 'today', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-01', 'today', wednesday), false)
})

test('weekend is the coming Saturday and Sunday', () => {
  assert.equal(matchesDateSegment('2026-10-02', 'weekend', wednesday), false)
  assert.equal(matchesDateSegment('2026-10-03', 'weekend', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-04', 'weekend', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-10', 'weekend', wednesday), false)
})

test('weekend includes today on Saturday and shrinks to Sunday on Sunday', () => {
  assert.equal(matchesDateSegment('2026-10-03', 'weekend', saturday), true)
  assert.equal(matchesDateSegment('2026-10-04', 'weekend', saturday), true)
  assert.equal(matchesDateSegment('2026-10-04', 'weekend', sunday), true)
  assert.equal(matchesDateSegment('2026-10-10', 'weekend', sunday), false)
  assert.equal(matchesDateSegment('2026-10-11', 'weekend', sunday), false)
})

test('week covers today plus six days and later covers the rest', () => {
  assert.equal(matchesDateSegment('2026-09-30', 'week', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-06', 'week', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-07', 'week', wednesday), false)
  assert.equal(matchesDateSegment('2026-10-07', 'later', wednesday), true)
  assert.equal(matchesDateSegment('2026-10-06', 'later', wednesday), false)
})

test('rows without a date only appear under later', () => {
  assert.equal(matchesDateSegment('', 'today', wednesday), false)
  assert.equal(matchesDateSegment(undefined, 'week', wednesday), false)
  assert.equal(matchesDateSegment(undefined, 'later', wednesday), true)
})

test('getDefaultDateSegment opens on the first segment with games', () => {
  assert.equal(getDefaultDateSegment([{ localDate: '2026-09-30' }], wednesday), 'today')
  assert.equal(getDefaultDateSegment([{ localDate: '2026-10-02' }], wednesday), 'week')
  assert.equal(getDefaultDateSegment([{ localDate: '2026-11-02' }], wednesday), 'later')
  assert.equal(getDefaultDateSegment([], wednesday), 'today')
})

test('getSegmentHeading counts games for the chosen segment', () => {
  assert.equal(getSegmentHeading('today', 12), '12 games today')
  assert.equal(getSegmentHeading('weekend', 1), '1 game this weekend')
  assert.equal(getSegmentHeading('later', 3), '3 games coming up')
})

const now = Date.parse('2026-09-30T18:00:00Z')

function game(id, dateTime, homeTeam, awayTeam = '', localTime = '19:00:00') {
  return { id, dateTime, homeTeam, awayTeam, localTime }
}

const events = [
  game('mammoth', '2026-10-03T01:30:00Z', 'Utah Mammoth', 'Colorado Avalanche'),
  game('bees', '2026-10-01T00:05:00Z', 'Salt Lake Bees'),
  game('rsl', '2026-10-01T01:00:00Z', 'Real Salt Lake', 'Austin FC'),
  game('done', '2026-09-30T10:00:00Z', 'Utah Jazz', 'Denver Nuggets'),
]

test('pickNextUpEvent prefers the soonest game for a followed team', () => {
  assert.equal(pickNextUpEvent(events, ['Utah Mammoth'], now).id, 'mammoth')
  assert.equal(pickNextUpEvent(events, ['Colorado Avalanche', 'Austin FC'], now).id, 'rsl')
})

test('pickNextUpEvent falls back to the soonest upcoming game', () => {
  assert.equal(pickNextUpEvent(events, [], now).id, 'bees')
  assert.equal(pickNextUpEvent(events, ['Phoenix Suns'], now).id, 'bees')
  assert.equal(pickNextUpEvent([], [], now), null)
})

test('pickNextUpEvent keeps a live game and drops one past the live window', () => {
  const live = game('live', '2026-09-30T17:00:00Z', 'Utah Royals FC')

  assert.equal(pickNextUpEvent([...events, live], [], now).id, 'live')
  assert.notEqual(pickNextUpEvent(events, ['Utah Jazz'], now)?.id, 'done')
})

test('date-only games stay until their end-of-day timestamp passes', () => {
  const dateOnly = game('tbd', '2026-10-01T05:59:59Z', 'Utah Utes', '', null)

  assert.equal(pickNextUpEvent([dateOnly], [], now).id, 'tbd')
  assert.equal(pickNextUpEvent([dateOnly], [], Date.parse('2026-10-01T06:00:00Z')), null)
})

test('getNextGameForTeam finds the team on either side', () => {
  assert.equal(getNextGameForTeam(events, 'Colorado Avalanche', now).id, 'mammoth')
  assert.equal(getNextGameForTeam(events, 'Salt Lake Bees', now).id, 'bees')
  assert.equal(getNextGameForTeam(events, 'Utah Jazz', now), null)
})

test('getTeamsInFeed lists every team in the feed once, by name', () => {
  assert.deepEqual(getTeamsInFeed(events), [
    'Austin FC',
    'Colorado Avalanche',
    'Denver Nuggets',
    'Real Salt Lake',
    'Salt Lake Bees',
    'Utah Jazz',
    'Utah Mammoth',
  ])
})
