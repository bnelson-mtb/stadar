import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildIcsContent } from './ics.js'

const base = {
  id: 'evt1',
  name: 'Utah Jazz vs. Denver Nuggets',
  venue: 'Delta Center',
  city: 'Salt Lake City',
  state: 'UT',
  localDate: '2026-11-20',
}

test('timed event: starts at the venue-local time and runs two hours', () => {
  const lines = buildIcsContent({ ...base, localTime: '19:00:00' }).split('\r\n')
  assert.ok(lines.includes('DTSTART:20261120T190000'))
  assert.ok(lines.includes('DTEND:20261120T210000'))
  assert.ok(lines.includes('UID:evt1@stadar'))
  assert.ok(lines.includes('SUMMARY:Utah Jazz vs. Denver Nuggets'))
  assert.ok(lines.includes('LOCATION:Delta Center, Salt Lake City, UT'))
  assert.equal(lines[0], 'BEGIN:VCALENDAR')
  assert.equal(lines.at(-1), 'END:VCALENDAR')
})

test('timed event crossing midnight ends on the next day', () => {
  const lines = buildIcsContent({ ...base, localDate: '2026-11-30', localTime: '23:00:00' }).split('\r\n')
  assert.ok(lines.includes('DTSTART:20261130T230000'))
  assert.ok(lines.includes('DTEND:20261201T010000'))
})

test('date-only event is an all-day entry ending the next day', () => {
  const lines = buildIcsContent(base).split('\r\n')
  assert.ok(lines.includes('DTSTART;VALUE=DATE:20261120'))
  assert.ok(lines.includes('DTEND;VALUE=DATE:20261121'))
})

test('ticket URL is included only when present', () => {
  const withUrl = buildIcsContent({ ...base, ticketUrl: 'https://tickets.example/evt1' })
  assert.ok(withUrl.includes('URL:https://tickets.example/evt1'))
  assert.ok(!buildIcsContent(base).includes('URL:'))
})
