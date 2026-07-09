function buildProviderLogoUrl(domain) {
  const params = new URLSearchParams({ domain, sz: '64' })
  return `https://www.google.com/s2/favicons?${params.toString()}`
}

function ticketProvider(name, domain, logoLabel) {
  return {
    name,
    domain,
    logoLabel,
    logoUrl: buildProviderLogoUrl(domain),
  }
}

export const TICKETMASTER_PROVIDER = ticketProvider('Ticketmaster', 'ticketmaster.com', 'TM')

export const TICKET_SEARCH_PROVIDERS = [
  ticketProvider('SeatGeek', 'seatgeek.com', 'SG'),
  ticketProvider('TickPick', 'tickpick.com', 'TP'),
  ticketProvider('Gametime', 'gametime.co', 'GT'),
  ticketProvider('StubHub', 'stubhub.com', 'SH'),
  ticketProvider('Vivid Seats', 'vividseats.com', 'VS'),
]

function compact(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function formatDateForSearch(value) {
  return compact(value).replace(/[-/]+/g, ' ')
}

export function buildTicketSearchUrl(event, domain) {
  const queryParts = [
    `site:${domain}`,
    compact(event.name),
    compact(event.venue),
    compact([event.city, event.state].filter(Boolean).join(' ')),
    formatDateForSearch(event.localDate),
  ].filter(Boolean)

  const params = new URLSearchParams({ q: queryParts.join(' '), btnI: '1' })
  return `https://www.google.com/search?${params.toString()}`
}
