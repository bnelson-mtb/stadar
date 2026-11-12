import test from 'node:test'
import assert from 'node:assert/strict'
import { TICKETMASTER_PROVIDER, TICKET_SEARCH_PROVIDERS, buildTicketLinks, buildTicketSearchUrl } from './ticketLinks.js'

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
    'site:seatgeek.com Utah Jazz vs. Denver Nuggets Delta Center Salt Lake City UT October 2026'
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

test('buildTicketLinks lists Ticketmaster first, then every marketplace in order', () => {
  const links = buildTicketLinks({ ...event, ticketUrl: 'https://www.ticketmaster.com/event/abc' })

  assert.deepEqual(
    links.map(link => link.name),
    ['Ticketmaster', 'SeatGeek', 'TickPick', 'Gametime', 'StubHub', 'Vivid Seats']
  )
  assert.equal(links[0].url, 'https://www.ticketmaster.com/event/abc')
  assert.equal(links[0].isDirect, true)
  assert.equal(links[1].url, buildTicketSearchUrl(event, 'seatgeek.com'))
  assert.equal(links[1].isDirect, false)
})

test('buildTicketLinks skips Ticketmaster without a ticket URL', () => {
  assert.equal(buildTicketLinks(event)[0].name, 'SeatGeek')
})

test('buildTicketLinks prefers the direct SeatGeek event page when one was found', () => {
  const seatGeek = buildTicketLinks(event, 'https://seatgeek.com/jazz-tickets/123').find(link => link.name === 'SeatGeek')

  assert.equal(seatGeek.url, 'https://seatgeek.com/jazz-tickets/123')
  assert.equal(seatGeek.isDirect, true)
})
