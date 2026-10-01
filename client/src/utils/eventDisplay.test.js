import test from 'node:test'
import assert from 'node:assert/strict'

import {
  FALLBACK_TEAM_COLOR,
  formatLocalTime,
  formatLongDate,
  formatShortDate,
  getDayLabel,
  getEventStart,
  getHeroColor,
  getStartTerm,
  getTeamShortName,
  getTimeZoneLabel,
  involvesTeam,
  isToday,
} from './eventDisplay.js'

// Wednesday, Sep 30 2026 (local calendar date)
const today = new Date(2026, 8, 30, 9, 15)

test('getTeamShortName uses the pro nickname and the college school name', () => {
  assert.equal(getTeamShortName('Utah Jazz'), 'Jazz')
  assert.equal(getTeamShortName('Denver Nuggets'), 'Nuggets')
  assert.equal(getTeamShortName('Utah Utes'), 'Utah')
  assert.equal(getTeamShortName("Utah Men's Basketball"), 'Utah')
  assert.equal(getTeamShortName('BYU Cougars'), 'BYU')
})

test('getTeamShortName falls back to the given name for unknown teams', () => {
  assert.equal(getTeamShortName('Some Touring Exhibition '), 'Some Touring Exhibition')
  assert.equal(getTeamShortName(''), '')
  assert.equal(getTeamShortName(null), '')
})

test('involvesTeam matches either side by canonical name', () => {
  const event = { homeTeam: 'Utah Jazz', awayTeam: 'Denver Nuggets' }

  assert.equal(involvesTeam(event, 'Utah Jazz'), true)
  assert.equal(involvesTeam(event, 'Denver Nuggets'), true)
  assert.equal(involvesTeam(event, 'Phoenix Suns'), false)
  assert.equal(involvesTeam({ homeTeam: 'Utah Jazz', awayTeam: '' }, ''), false)
})

test('getHeroColor keeps dark brand colors and falls back for missing ones', () => {
  assert.equal(getHeroColor('#002B5C'), '#002b5c')
  assert.equal(getHeroColor(undefined), FALLBACK_TEAM_COLOR)
  assert.equal(getHeroColor('red'), FALLBACK_TEAM_COLOR)
  assert.equal(getHeroColor('#000000'), FALLBACK_TEAM_COLOR)
})

test('getHeroColor darkens bright brand colors', () => {
  const hex = getHeroColor('#FFB81C')
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

  assert.match(hex, /^#[0-9a-f]{6}$/)
  assert.ok(r < 0x80 && g < 0x80 && b < 0x80, `${hex} should be dark`)
})

test('formatLocalTime renders a 12-hour clock with its period', () => {
  assert.deepEqual(formatLocalTime('19:30:00'), { time: '7:30', period: 'PM', label: '7:30 PM' })
  assert.deepEqual(formatLocalTime('00:05:00'), { time: '12:05', period: 'AM', label: '12:05 AM' })
  assert.deepEqual(formatLocalTime('12:00'), { time: '12:00', period: 'PM', label: '12:00 PM' })
  assert.equal(formatLocalTime(null), null)
  assert.equal(formatLocalTime(''), null)
})

test('getTimeZoneLabel derives the venue zone from the UTC instant and local time', () => {
  // 7:00 PM MDT in Salt Lake City
  assert.equal(getTimeZoneLabel({ dateTime: '2026-10-01T01:00:00Z', localDate: '2026-09-30', localTime: '19:00:00', state: 'UT' }), 'MT')
  // 7:30 PM EDT in New York
  assert.equal(getTimeZoneLabel({ dateTime: '2026-09-30T23:30:00Z', localDate: '2026-09-30', localTime: '19:30:00', state: 'NY' }), 'ET')
  // 7:00 PM CST in Dallas (winter)
  assert.equal(getTimeZoneLabel({ dateTime: '2026-01-15T01:00:00Z', localDate: '2026-01-14', localTime: '19:00:00', state: 'TX' }), 'CT')
})

test('getTimeZoneLabel uses the state to settle the Arizona / Pacific summer tie', () => {
  const instant = { dateTime: '2026-07-01T02:00:00Z', localDate: '2026-06-30', localTime: '19:00:00' }

  assert.equal(getTimeZoneLabel({ ...instant, state: 'AZ' }), 'MT')
  assert.equal(getTimeZoneLabel({ ...instant, state: 'CA' }), 'PT')
})

test('getTimeZoneLabel finds the zone when a state spans two (El Paso is Mountain)', () => {
  assert.equal(getTimeZoneLabel({ dateTime: '2026-10-01T01:00:00Z', localDate: '2026-09-30', localTime: '19:00:00', state: 'TX' }), 'MT')
})

test('getTimeZoneLabel is empty without a start time or a matching zone', () => {
  assert.equal(getTimeZoneLabel({ dateTime: '2026-10-01T05:59:59Z', localDate: '2026-09-30', localTime: null, state: 'UT' }), '')
  assert.equal(getTimeZoneLabel({ dateTime: '2026-10-01T01:00:00Z', localDate: '2026-09-30', localTime: '03:17:00', state: 'UT' }), '')
  assert.equal(getTimeZoneLabel(null), '')
})

test('getDayLabel names today, tonight, tomorrow, this week and later', () => {
  assert.equal(getDayLabel('2026-09-30', { today }), 'Today')
  assert.equal(getDayLabel('2026-09-30', { today, localTime: '13:05:00' }), 'Today')
  assert.equal(getDayLabel('2026-09-30', { today, localTime: '19:00:00' }), 'Tonight')
  assert.equal(getDayLabel('2026-10-01', { today }), 'Tomorrow')
  assert.equal(getDayLabel('2026-10-02', { today }), 'Fri')
  assert.equal(getDayLabel('2026-10-06', { today }), 'Tue')
  assert.equal(getDayLabel('2026-10-07', { today }), 'Oct 7')
  assert.equal(getDayLabel('', { today }), '')
})

test('isToday compares calendar dates', () => {
  assert.equal(isToday('2026-09-30', today), true)
  assert.equal(isToday('2026-10-01', today), false)
  assert.equal(isToday(undefined, today), false)
})

test('date formatters render short and long calendar dates', () => {
  assert.equal(formatShortDate('2026-08-12'), 'Wed, Aug 12')
  assert.equal(formatLongDate('2025-11-15'), 'Nov 15, 2025')
  assert.equal(formatShortDate(''), '')
  assert.equal(formatLongDate(null), '')
})

test('getEventStart only returns a target when the start time is announced', () => {
  assert.equal(getEventStart({ dateTime: '2026-10-01T01:00:00Z', localTime: '19:00:00' }), '2026-10-01T01:00:00Z')
  assert.equal(getEventStart({ dateTime: '2026-10-01T05:59:59Z', localTime: null }), null)
  assert.equal(getEventStart(null), null)
})

test('getStartTerm speaks each sport and falls back to "start"', () => {
  assert.equal(getStartTerm('Basketball').caption, 'to tip-off')
  assert.equal(getStartTerm('Hockey').caption, 'to puck drop')
  assert.equal(getStartTerm('Football').caption, 'to kickoff')
  assert.equal(getStartTerm('Soccer').countdown, 'Kicks off in')
  assert.equal(getStartTerm('Baseball').label, 'First pitch')
  assert.equal(getStartTerm('Softball').caption, 'to first pitch')
  assert.deepEqual(getStartTerm('Lacrosse'), { label: 'Start', countdown: 'Starts in', caption: 'to start' })
})
