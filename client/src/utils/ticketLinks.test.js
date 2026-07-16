import test from 'node:test'
import assert from 'node:assert/strict'
import { TICKETMASTER_PROVIDER, TICKET_SEARCH_PROVIDERS, buildTicketSearchUrl } from './ticketLinks.js'

const event = {
  name: 'Utah Jazz vs. Denver Nuggets',
  venue: 'Delta Center',
  city: 'Salt Lake City',
  state: 'UT',
  localDate: '2026-10-01',
}

test('buildTicketSearchUrl opens the top scoped provider result when Google redirects it', () => {
  const url = new URL(buildTicketSearchUrl(event, 'seatgeek.com'))
  const query = url.searchParams.get('q')

  assert.equal(url.origin, 'https://www.google.com')
  assert.equal(url.pathname, '/search')
  assert.equal(url.searchParams.get('btnI'), '1')
  assert.equal(
    query,
    'site:seatgeek.com Utah Jazz vs. Denver Nuggets Delta Center Salt Lake City UT 2026 10 01'
  )
  assert.doesNotMatch(query, /tickets/)
  assert.doesNotMatch(query, /2026-10-01/)
})

test('TICKET_SEARCH_PROVIDERS includes supported secondary marketplaces', () => {
  assert.deepEqual(
    TICKET_SEARCH_PROVIDERS.map(provider => provider.name),
    ['SeatGeek', 'TickPick', 'Gametime', 'StubHub', 'Vivid Seats']
  )
})

test('ticket providers include compact logo metadata', () => {
  assert.deepEqual(
    TICKET_SEARCH_PROVIDERS.map(provider => provider.logoLabel),
    ['SG', 'TP', 'GT', 'SH', 'VS']
  )

  assert.equal(TICKETMASTER_PROVIDER.logoLabel, 'TM')
  assert.equal(
    TICKETMASTER_PROVIDER.logoUrl,
    'https://www.google.com/s2/favicons?domain=ticketmaster.com&sz=64'
  )

  for (const provider of TICKET_SEARCH_PROVIDERS) {
    assert.equal(
      provider.logoUrl,
      `https://www.google.com/s2/favicons?domain=${provider.domain}&sz=64`
    )
  }
})
