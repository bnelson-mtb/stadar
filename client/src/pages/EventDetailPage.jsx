import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { SPORT_ICONS, LEAGUE_COLORS, getCanonicalTeamName } from '../data/teams'
import { LEAGUE_INFO } from '../data/leagueInfo'
import TeamLogo from '../components/TeamLogo'
import VenueMap from '../components/VenueMap'
import CollapsibleSection from '../components/CollapsibleSection.jsx'
import GameNotesSection from '../components/GameNotesSection.jsx'
import UnsaveConfirmDialog from '../components/UnsaveConfirmDialog.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { API_BASE, fetchJsonWithRetry } from '../utils/api.js'
import {
  getDetailSectionOrder,
  getEventBoundaryDelay,
  isPastEvent,
  shouldShowFinalScore,
} from '../utils/eventDetailState.js'
import { TICKETMASTER_PROVIDER, TICKET_SEARCH_PROVIDERS, buildTicketSearchUrl } from '../utils/ticketLinks.js'

function buildIcsContent(event) {
  const dateStr = (event.localDate || '').replace(/-/g, '')
  if (event.localTime) {
    const timeStr = event.localTime.replace(/:/g, '').padEnd(6, '0').slice(0, 6)
    const [hh, mm, ss] = event.localTime.split(':').map(Number)
    const totalMinutes = hh * 60 + mm + 120 // add 2 hours
    const endH = Math.floor(totalMinutes / 60) % 24
    const endM = totalMinutes % 60
    const rollover = totalMinutes >= 1440 // crossed midnight
    let endDateStr = dateStr
    if (rollover) {
      const [y, mo, d] = (event.localDate || '').split('-').map(Number)
      const next = new Date(y, mo - 1, d + 1)
      endDateStr = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`
    }
    const endStr = `${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}${String(ss ?? 0).padStart(2, '0')}`
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stadar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@stadar`,
      `DTSTART:${dateStr}T${timeStr}`,
      `DTEND:${endDateStr}T${endStr}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${event.venue}, ${event.city}, ${event.state}`,
      ...(event.ticketUrl ? [`URL:${event.ticketUrl}`] : []),
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
  } else {
    const [y, mo, d] = (event.localDate || '').split('-').map(Number)
    const next = new Date(y, mo - 1, d + 1)
    const nextDateStr = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stadar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@stadar`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDateStr}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${event.venue}, ${event.city}, ${event.state}`,
      ...(event.ticketUrl ? [`URL:${event.ticketUrl}`] : []),
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
  }
}

function downloadIcs(event) {
  const content = buildIcsContent(event)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function TicketProviderLogo({ provider }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white text-[0.55rem] font-black text-night-950 ring-1 ring-black/5">
      {provider.logoUrl && !logoFailed ? (
        <img
          src={provider.logoUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span>{provider.logoLabel}</span>
      )}
    </span>
  )
}

function TicketProviderButton({ provider, primary = false }) {
  const className = primary
    ? 'inline-flex max-w-full items-center gap-2 rounded-full border-1 border-white bg-night-700/60 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-night-600'
    : 'inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-night-700/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-radar-400/40 hover:text-white'

  return (
    <a
      href={provider.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Open ${provider.name} tickets`}
    >
      <TicketProviderLogo provider={provider} />
      <span className="truncate">{provider.name}</span>
      <span aria-hidden="true">&rarr;</span>
    </a>
  )
}

function compactItems(items) {
  return items.filter(Boolean)
}

function DetailList({ items }) {
  const visibleItems = compactItems(items)
    .map(item => typeof item === 'string' ? { value: item } : item)
    .filter(item => item?.value)
  if (visibleItems.length === 0) return null

  return (
    <ul className="space-y-1.5">
      {visibleItems.map((item) => (
        <li key={`${item.label ?? 'detail'}-${item.value}`} className="flex gap-2 text-sm leading-relaxed text-slate-400">
          <span className="text-radar-400 shrink-0">&middot;</span>
          <span>
            {item.label && (
              <span className="font-semibold text-slate-300">{item.label}: </span>
            )}
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

function KnowledgeBlock({ title, items }) {
  const visibleItems = compactItems(items)
  if (visibleItems.length === 0) return null

  return (
    <div className="rounded-lg border border-white/5 bg-night-900/60 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{title}</p>
      <DetailList items={visibleItems} />
    </div>
  )
}

function linkLabel(key) {
  const labels = {
    website: 'Official Site',
    parking: 'Parking',
    bagPolicy: 'Bag Policy',
    accessibility: 'Accessibility',
  }
  return labels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
}

function venueReviewStamp(confidence) {
  if (!confidence?.lastReviewed) return null

  const prefix = confidence.source === 'generated' ? 'Auto-generated' : 'Fan-reviewed'
  return `${prefix} on ${confidence.lastReviewed}`
}

function VenueKnowledgeCard({ venue }) {
  if (!venue) return null

  const bestFor = venue.bestFor ?? []
  const atmosphere = venue.atmosphere ?? {}
  const arrival = venue.arrival ?? {}
  const seating = venue.seating ?? {}
  const foodAndDrink = venue.foodAndDrink ?? {}
  const officialLinks = Object.entries(venue.officialLinks ?? {}).filter(([, url]) => Boolean(url))
  const atmosphereChips = compactItems([
    atmosphere.indoorOutdoor,
    atmosphere.noiseLevel ? `${atmosphere.noiseLevel} noise` : null,
    atmosphere.familyFriendly ? 'Family friendly' : null,
  ])
  const reviewStamp = venueReviewStamp(venue.confidence)

  return (
    <div className="border-t border-white/10 pt-5 mt-5 space-y-5">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-white">
            Stadar Deep Dive
          </h3>
        </div>

        {venue.summary && (
          <p className="text-sm leading-relaxed text-slate-300">{venue.summary}</p>
        )}
      </div>

      {(bestFor.length > 0 || atmosphereChips.length > 0 || atmosphere.vibe) && (
        <div className="space-y-3">
          {atmosphere.vibe && (
            <p className="rounded-lg border border-radar-400/15 bg-radar-400/5 p-3 text-sm leading-relaxed text-slate-300">
              <b>Overall Vibe:</b> {atmosphere.vibe}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {bestFor.map((item) => (
              <span key={item} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                Best for {item}
              </span>
            ))}
            {atmosphereChips.map((item) => (
              <span key={item} className="rounded-full bg-night-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <KnowledgeBlock
          title="🧭 Getting There"
          items={[
            { label: 'Transit', value: arrival.transit },
            { label: 'Parking', value: arrival.parking },
            { label: 'Rideshare', value: arrival.rideshare },
          ]}
        />

        <KnowledgeBlock
          title="🎟️ Seats"
          items={[
            { label: 'Best value', value: seating.bestValueSections?.length ? seating.bestValueSections.join(', ') : null },
            { label: 'Watch out for', value: seating.avoidIfPossible?.length ? seating.avoidIfPossible.join(', ') : null },
            { label: 'Accessibility', value: seating.accessibilityNote },
          ]}
        />

        <KnowledgeBlock
          title="🍔 Food & Pregame"
          items={[
            { label: 'Inside', value: foodAndDrink.summary },
            { label: 'Nearby', value: foodAndDrink.nearbyPregame?.length ? foodAndDrink.nearbyPregame.join(', ') : null },
          ]}
        />

        <KnowledgeBlock
          title="💡 Fan Tips"
          items={(venue.fanTips ?? []).slice(0, 4).map((tip) => ({
            value: tip,
          }))}
        />
      </div>

      {(officialLinks.length > 0 || reviewStamp) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          {officialLinks.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-radar-400 hover:text-radar-300"
            >
              {linkLabel(key)} &rarr;
            </a>
          ))}

          {reviewStamp && (
            <span className="text-xs text-slate-600">
              {reviewStamp}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    isSaved,
    toggleSave,
    pendingRemoval,
    cancelRemove,
    confirmRemove,
    updateMetadata,
    updateSnapshot,
    persistenceStatus,
    savedEvents,
  } = useSavedEvents()
  const savedRecord = savedEvents.find(r => r.event.id === id)
  const [event, setEvent] = useState(
    () => location.state?.event ?? savedRecord?.event ?? null
  )
  const [loading, setLoading] = useState(!event)
  const [copied, setCopied] = useState(false)
  const [venueKnowledge, setVenueKnowledge] = useState(null)
  const [seatGeekUrl, setSeatGeekUrl] = useState(null)
  const [reachedEventBoundary, setReachedEventBoundary] = useState(null)
  const copiedTimerRef = useRef(null)
  const eventDateTime = event?.dateTime

  useEffect(() => () => clearTimeout(copiedTimerRef.current), [])

  useEffect(() => {
    if (!eventDateTime) return undefined

    let cancelled = false
    let boundaryTimer
    const timedEvent = { dateTime: eventDateTime }

    function scheduleBoundaryCheck() {
      const delay = getEventBoundaryDelay(timedEvent)
      if (delay === null) return

      boundaryTimer = setTimeout(() => {
        if (cancelled) return

        if (isPastEvent(timedEvent)) {
          setReachedEventBoundary(eventDateTime)
          return
        }

        scheduleBoundaryCheck()
      }, delay)
    }

    scheduleBoundaryCheck()

    return () => {
      cancelled = true
      clearTimeout(boundaryTimer)
    }
  }, [eventDateTime])

  useEffect(() => {
    let cancelled = false

    if (!event?.venue) {
      setVenueKnowledge(null)
      return () => {
        cancelled = true
      }
    }

    import('../data/venues/index.js')
      .then(({ getVenueKnowledge }) => {
        if (!cancelled) {
          setVenueKnowledge(getVenueKnowledge(event.venue, { city: event.city, state: event.state }))
        }
      })
      .catch(() => {
        if (!cancelled) setVenueKnowledge(null)
      })

    return () => {
      cancelled = true
    }
  }, [event?.venue, event?.city, event?.state])

  function handleBack() {
    const { backTo, fromStateCode } = location.state ?? {}
    // backTo is set by SavedPage / TeamSavedPage; fromStateCode is set by DiscoverPage.
    if (backTo) {
      navigate(backTo)
      return
    }
    if (fromStateCode) {
      navigate('/', { state: { stateCode: fromStateCode } })
      return
    }
    navigate(-1)
  }

  useEffect(() => {
    const isEventSaved = isSaved(id)
    const isPast = event ? isPastEvent(event) : false

    // Skip fetch for non-saved events that already have router state,
    // and for past saved events (always use snapshot).
    if (event && (!isEventSaved || isPast)) return

    fetchJsonWithRetry(`${API_BASE}/api/games/${id}`)
      .then(fresh => {
        setEvent(fresh)
        if (isEventSaved) updateSnapshot(fresh)
      })
      .catch(() => {
        // Only clear event if there is no snapshot fallback.
        if (!event) setEvent(null)
      })
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Background lookup for a direct SeatGeek event link. 404 (no match /
  // not configured) fails fast in fetchJsonWithRetry and is swallowed, so
  // the Google-search fallback link simply stays.
  useEffect(() => {
    let cancelled = false
    setSeatGeekUrl(null)

    fetchJsonWithRetry(`${API_BASE}/api/games/${id}/seatgeek`)
      .then(data => {
        if (!cancelled && data?.url) setSeatGeekUrl(data.url)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-night-950 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex cursor-pointer items-center rounded-lg border border-white/10 bg-night-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-night-700 hover:text-white mb-6"
          >
            &larr; Back
          </button>
          <div className="bg-night-800 rounded-xl border border-white/5 p-8 text-center">
            <p className="text-slate-400">Event not found</p>
          </div>
        </div>
      </div>
    )
  }

  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const hasAwayTeam = Boolean(awayTeamName)
  const badgeColor = LEAGUE_COLORS[event.league] || 'bg-gray-500'
  const icon = SPORT_ICONS[event.sport] || ''
  const leagueKey = event.league === 'Minor League'
    ? (event.sport === 'Hockey' ? 'Minor League Hockey'
       : event.sport === 'Basketball' ? 'Minor League Basketball'
       : 'Minor League')
    : event.league
  const leagueInfo = LEAGUE_INFO[leagueKey] ?? null
  const eventSaved = isSaved(event.id)
  const pastEvent = reachedEventBoundary === event.dateTime || isPastEvent(event)
  const sectionOrder = getDetailSectionOrder({
    isPast: pastEvent,
    isSaved: eventSaved,
    hasLeagueInfo: Boolean(leagueInfo),
  })
  const showFinalScore = shouldShowFinalScore({
    isPast: pastEvent,
    isSaved: eventSaved,
    hasAwayTeam,
  })

  function handleShare() {
    const shareText = hasAwayTeam
      ? `${homeTeamName} vs ${awayTeamName} - ${dateDisplay} at ${event.venue}`
      : `${homeTeamName} - ${dateDisplay} at ${event.venue}`
    if (navigator.share) {
      navigator.share({ title: event.name, text: shareText, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const [year, month, day] = (event.localDate || '').split('-').map(Number)
  const dateDisplay = event.localDate
    ? new Date(year, month - 1, day).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const timeDisplay = event.localTime
    ? new Date(`1970-01-01T${event.localTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Time TBD'
  const ticketSearchLinks = TICKET_SEARCH_PROVIDERS.map(provider => ({
    ...provider,
    url: provider.name === 'SeatGeek' && seatGeekUrl
      ? seatGeekUrl
      : buildTicketSearchUrl(event, provider.domain),
  }))
  const ticketmasterLink = event.ticketUrl
    ? { ...TICKETMASTER_PROVIDER, url: event.ticketUrl }
    : null

  return (
    <div className="min-h-screen bg-night-950 text-slate-200">
      {/* Header */}
      <div className="bg-night-900/90 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex cursor-pointer items-center rounded-lg border border-white/10 bg-night-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-night-700 hover:text-white"
          >
            &larr; Back
          </button>
          <h1 className="text-lg font-bold text-white">{event.name}</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleSave(event)}
              className={`p-2 cursor-pointer transition-colors ${eventSaved ? 'text-radar-400' : 'text-slate-400 hover:text-slate-200'}`}
              aria-label={eventSaved ? 'Remove from saved' : 'Save event'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={eventSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>
            {copied ? (
              <span className="text-xs font-medium text-radar-400 pr-1">Copied!</span>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="p-2 cursor-pointer text-slate-400 hover:text-white transition-colors"
                aria-label="Share event"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Banner Image */}
        {event.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Matchup */}
        <div className="bg-night-800 rounded-xl border border-white/5 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
              {event.league}
            </span>
            <span className="text-slate-500 text-sm">{icon} {event.sport}</span>
          </div>

          {hasAwayTeam ? (
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex-1 text-center">
                <div className="flex justify-center mb-2">
                  <TeamLogo name={homeTeamName} size="large" />
                </div>
                <p className="text-lg font-bold text-white">{homeTeamName}</p>
              </div>

              <div className="font-display text-2xl font-bold uppercase text-slate-600">vs</div>

              <div className="flex-1 text-center">
                <div className="flex justify-center mb-2">
                  <TeamLogo name={awayTeamName} size="large" />
                </div>
                <p className="text-lg font-bold text-white">{awayTeamName}</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-2 flex justify-center">
                <TeamLogo name={homeTeamName} size="large" />
              </div>
              <p className="text-lg font-bold text-white">{homeTeamName || event.name}</p>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="text-xl font-bold text-white">{dateDisplay}</p>
            <p className="text-slate-400">{timeDisplay}</p>
          </div>
        </div>

        {sectionOrder.map(section => {
          if (section === 'tickets') {
            return (
              <CollapsibleSection key={section} title="Get Tickets">
                <div className="mb-4 flex flex-wrap gap-2">
                  {ticketmasterLink && (
                    <TicketProviderButton provider={ticketmasterLink} primary />
                  )}

                  {ticketSearchLinks.map(provider => (
                    <TicketProviderButton key={provider.domain} provider={provider} />
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => downloadIcs(event)}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    Add to Calendar
                  </button>
                </div>
              </CollapsibleSection>
            )
          }

          if (section === 'venue') {
            return (
              <CollapsibleSection
                key={section}
                title="Venue"
                subtitle={`${event.venue} · ${event.city}, ${event.state}`}
              >
                <VenueMap
                  lat={event.latitude}
                  lng={event.longitude}
                  venue={event.venue}
                  city={event.city}
                  state={event.state}
                />
                <VenueKnowledgeCard venue={venueKnowledge} />
              </CollapsibleSection>
            )
          }

          if (section === 'notes') {
            return (
              <CollapsibleSection key={section} title="Game Notes">
                <GameNotesSection
                  record={savedRecord}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  showScore={showFinalScore}
                  persistenceStatus={persistenceStatus}
                  onUpdate={patch => updateMetadata(event.id, patch)}
                />
              </CollapsibleSection>
            )
          }

          if (section === 'league' && leagueInfo) {
            return (
              <CollapsibleSection key={section} title="League Overview">
                <p className="text-xl font-bold text-white mb-2">{leagueInfo.fullName}</p>
                <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-white/10 text-slate-300 mb-3">
                  {leagueInfo.tier}
                </span>
                <p className="text-slate-400 text-sm mb-4">{leagueInfo.description}</p>
                <a
                  href={`https://${leagueInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-radar-400 hover:text-radar-300"
                >
                  {leagueInfo.website} &rarr;
                </a>
              </CollapsibleSection>
            )
          }

          return null
        })}

      </div>
      <UnsaveConfirmDialog
        event={pendingRemoval}
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

export default EventDetailPage
