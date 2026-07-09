import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTicketSearchUrl } from './ticketLinks.js'

const event = {
  name: 'Utah Jazz vs. Denver Nuggets',
  venue: 'Delta Center',
  city: 'Salt Lake City',
  state: 'UT',
  localDate: '2026-10-01',
}

test('buildTicketSearchUrl scopes provider searches to the provider site', () => {
  const url = new URL(buildTicketSearchUrl(event, 'seatgeek.com'))

  assert.equal(url.origin, 'https://www.google.com')
  assert.equal(url.pathname, '/search')
  assert.match(url.searchParams.get('q'), /site:seatgeek\.com/)
  assert.match(url.searchParams.get('q'), /Utah Jazz vs\. Denver Nuggets/)
  assert.match(url.searchParams.get('q'), /Delta Center/)
  assert.match(url.searchParams.get('q'), /Salt Lake City UT/)
  assert.match(url.searchParams.get('q'), /tickets/)
})

