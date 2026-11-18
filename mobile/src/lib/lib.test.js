import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { buildMobileLoginUrl, parseAuthRedirect, toBase64Url } from './signInFlow.js'
import { calendarEventFor } from './calendarEvent.js'
import { leagueKeyFor, shareMessageFor } from './eventShare.js'
import { LEAGUE_ORDER, SPORT_ORDER, sortByOrder, toggleArrayItem } from './feedOrder.js'
import { angle } from './gradient.js'

test('toBase64Url matches Node for every length remainder', () => {
  for (const length of [0, 1, 2, 3, 31, 32, 33]) {
    const bytes = Uint8Array.from({ length }, (_, i) => (i * 37 + 11) % 256)
    assert.equal(toBase64Url(bytes), Buffer.from(bytes).toString('base64url'))
  }
})

test('the app challenge matches the RFC 7636 example (same digest the API checks)', () => {
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
  const digest = new Uint8Array(createHash('sha256').update(verifier).digest())
  assert.equal(toBase64Url(digest), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
})

test('buildMobileLoginUrl encodes the challenge and redirect', () => {
  assert.equal(
    buildMobileLoginUrl('https://stadar.app', { challenge: 'abc_-', redirectUri: 'stadar://auth' }),
    'https://stadar.app/api/auth/mobile/login?challenge=abc_-&redirect=stadar%3A%2F%2Fauth',
  )
})

test('parseAuthRedirect reads the code or the error', () => {
  assert.deepEqual(parseAuthRedirect('stadar://auth?code=a%2Bb'), { code: 'a+b', error: null })
  assert.deepEqual(parseAuthRedirect('stadar://auth/?error=failed'), { code: null, error: 'failed' })
  assert.deepEqual(parseAuthRedirect('stadar://auth'), { code: null, error: null })
  assert.deepEqual(parseAuthRedirect(undefined), { code: null, error: null })
})

const timed = {
  id: 'e1',
  name: 'Utah Jazz vs. Denver Nuggets',
  venue: 'Delta Center',
  city: 'Salt Lake City',
  state: 'UT',
  localDate: '2026-11-20',
  localTime: '19:00:00',
  dateTime: '2026-11-21T02:00:00Z',
  ticketUrl: 'https://tickets.example/e1',
}

test('calendarEventFor: a timed game starts at its real instant and runs two hours', () => {
  const details = calendarEventFor(timed, { home: 'Utah Jazz', away: 'Denver Nuggets' })
  assert.equal(details.title, 'Utah Jazz vs Denver Nuggets')
  assert.equal(details.location, 'Delta Center, Salt Lake City, UT')
  assert.equal(details.allDay, false)
  assert.equal(details.startDate.toISOString(), '2026-11-21T02:00:00.000Z')
  assert.equal(details.endDate.toISOString(), '2026-11-21T04:00:00.000Z')
  assert.equal(details.url, 'https://tickets.example/e1')
})

test('calendarEventFor: no start time means an all-day entry on the venue date', () => {
  const details = calendarEventFor({ ...timed, localTime: null, ticketUrl: '' }, { home: 'Utah Jazz' })
  assert.equal(details.title, 'Utah Jazz')
  assert.equal(details.allDay, true)
  assert.deepEqual(
    [details.startDate.getFullYear(), details.startDate.getMonth(), details.startDate.getDate()],
    [2026, 10, 20],
  )
  assert.equal(details.endDate.getDate(), 21)
  assert.equal(details.url, undefined)
})

test('calendarEventFor: missing venue parts are left out', () => {
  const details = calendarEventFor({ ...timed, city: '', state: undefined }, { home: 'Utah Jazz' })
  assert.equal(details.location, 'Delta Center')
})

test('shareMessageFor names the matchup, date and venue', () => {
  assert.equal(
    shareMessageFor(timed, 'Utah Jazz', 'Denver Nuggets'),
    'Utah Jazz vs Denver Nuggets - Friday, November 20, 2026 at Delta Center',
  )
  assert.equal(shareMessageFor({ name: 'Rodeo', localDate: '' }, '', ''), 'Rodeo')
})

test('leagueKeyFor splits generic minor-league rows by sport', () => {
  assert.equal(leagueKeyFor({ league: 'NBA' }), 'NBA')
  assert.equal(leagueKeyFor({ league: 'Minor League', sport: 'Hockey' }), 'Minor League Hockey')
  assert.equal(leagueKeyFor({ league: 'Minor League', sport: 'Basketball' }), 'Minor League Basketball')
  assert.equal(leagueKeyFor({ league: 'Minor League', sport: 'Baseball' }), 'Minor League')
})

test('sortByOrder dedupes, drops blanks and puts unknowns last', () => {
  assert.deepEqual(sortByOrder(['Hockey', '', 'Basketball', 'Curling', 'Hockey'], SPORT_ORDER), ['Basketball', 'Hockey', 'Curling'])
  assert.deepEqual(sortByOrder(['NCAAM', 'NBA', null], LEAGUE_ORDER), ['NBA', 'NCAAM'])
})

test('toggleArrayItem adds and removes', () => {
  assert.deepEqual(toggleArrayItem(['a'], 'b'), ['a', 'b'])
  assert.deepEqual(toggleArrayItem(['a', 'b'], 'a'), ['b'])
})

test('angle maps CSS gradient angles to start/end points', () => {
  const round = p => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 })
  assert.deepEqual(round(angle(180).start), { x: 0.5, y: 0 })
  assert.deepEqual(round(angle(180).end), { x: 0.5, y: 1 })
  assert.deepEqual(round(angle(90).end), { x: 1, y: 0.5 })
})

test('app data-usage copy replaces the browser-storage wording and adds permissions', async () => {
  const { appDataUsageSections } = await import('./dataUsage.js')
  const sections = appDataUsageSections()
  const text = sections.map(s => s.body).join(' ')
  assert.ok(!/browser/i.test(text), 'no mention of browser storage in the app')
  assert.ok(sections.some(s => s.heading === 'Phone permissions'))
  assert.equal(sections.find(s => s.heading === 'Browsing without an account').body.includes('this phone'), true)
})
