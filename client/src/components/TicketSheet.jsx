import { useEffect, useState } from 'react'
import { getCanonicalTeamName } from '../data/teams'
import { API_BASE, fetchJsonWithRetry } from '../utils/api.js'
import { formatLocalTime, formatShortDate } from '../utils/eventDisplay.js'
import { buildTicketLinks } from '../utils/ticketLinks.js'
import BottomSheet from './BottomSheet.jsx'
import { ExternalLinkIcon } from './icons.jsx'

function TicketProviderLogo({ provider }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white text-[0.6rem] font-black text-night-950">
      {provider.logoUrl && !logoFailed ? (
        <img
          src={provider.logoUrl}
          alt=""
          loading="lazy"
          className="h-5 w-5 object-contain"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span>{provider.logoLabel}</span>
      )}
    </span>
  )
}

// Looks up the direct SeatGeek event page while the sheet is open. 404 (no
// match / not configured) fails fast in fetchJsonWithRetry and is swallowed,
// so the Google-search fallback link simply stays.
function useSeatGeekUrl(eventId, enabled) {
  const [found, setFound] = useState({ eventId: null, url: null })

  useEffect(() => {
    if (!enabled || !eventId) return undefined
    let cancelled = false
    fetchJsonWithRetry(`${API_BASE}/api/games/${eventId}/seatgeek`)
      .then(data => {
        if (!cancelled && data?.url) setFound({ eventId, url: data.url })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [eventId, enabled])

  return found.eventId === eventId ? found.url : null
}

// Every ticket provider for one event, in ticketLinks.js order. Pass
// `seatGeekUrl` when the caller already looked it up (the detail page does);
// otherwise the sheet looks it up itself on open.
function TicketSheet({ event, open, onClose, seatGeekUrl }) {
  const lookedUpUrl = useSeatGeekUrl(event?.id, open && seatGeekUrl === undefined)
  if (!event) return null

  const links = buildTicketLinks(event, seatGeekUrl ?? lookedUpUrl)
  const home = getCanonicalTeamName(event.homeTeam)
  const away = getCanonicalTeamName(event.awayTeam)
  const matchup = away ? `${home} vs ${away}` : home || event.name
  const time = formatLocalTime(event.localTime)
  const subtitle = [matchup, formatShortDate(event.localDate), time?.label].filter(Boolean).join(' · ')

  return (
    <BottomSheet open={open} onClose={onClose} title="Get tickets" subtitle={subtitle}>
      <ul className="flex flex-col gap-2">
        {links.map(link => (
          <li key={link.name}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex items-center gap-3 rounded-[14px] border border-white/[.06] bg-night-800 px-3.5 py-3"
            >
              <TicketProviderLogo provider={link} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{link.name}</span>
                <span className="mt-0.5 block text-[11px] text-ink-500">
                  {link.isDirect ? 'Event page' : 'Search listings'}
                </span>
              </span>
              <ExternalLinkIcon className="h-4 w-4 flex-none text-ink-500" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[11px] text-ink-500">
        Prices and fees are set by each seller. Purchases happen on their site.
      </p>
    </BottomSheet>
  )
}

export default TicketSheet
