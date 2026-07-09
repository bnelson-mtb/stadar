export const TICKET_SEARCH_PROVIDERS = [
  { name: 'SeatGeek', domain: 'seatgeek.com' },
  { name: 'TickPick', domain: 'tickpick.com' },
]

function compact(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function buildTicketSearchUrl(event, domain) {
  const queryParts = [
    `site:${domain}`,
    compact(event.name),
    compact(event.venue),
    compact([event.city, event.state].filter(Boolean).join(' ')),
    compact(event.localDate),
    'tickets',
  ].filter(Boolean)

  const params = new URLSearchParams({ q: queryParts.join(' ') })
  return `https://www.google.com/search?${params.toString()}`
}

