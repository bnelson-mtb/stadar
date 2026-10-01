import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { getCanonicalTeamName, getTeamData } from '../data/teams'
import { LEAGUE_INFO } from '../data/leagueInfo'
import TeamLogo from '../components/TeamLogo'
import VenueMap from '../components/VenueMap'
import CollapsibleSection from '../components/CollapsibleSection.jsx'
import EmptyState from '../components/EmptyState.jsx'
import GameNotesSection from '../components/GameNotesSection.jsx'
import TicketSheet from '../components/TicketSheet.jsx'
import UnsaveConfirmDialog from '../components/UnsaveConfirmDialog.jsx'
import { CountdownDigits, LivePill } from '../components/Countdown.jsx'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  PaperPlaneIcon,
  ShareIcon,
} from '../components/icons.jsx'
import useCountdown from '../hooks/useCountdown.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { API_BASE, fetchJsonWithRetry } from '../utils/api.js'
import {
  getDetailSectionOrder,
  getEventBoundaryDelay,
  isPastEvent,
  shouldShowFinalScore,
} from '../utils/eventDetailState.js'
import {
  formatLocalTime,
  formatShortDate,
  getEventStart,
  getStartTerm,
  getTeamHeroColor,
  getTeamShortName,
} from '../utils/eventDisplay.js'
import { getVenueMapUrls } from '../utils/maps.js'
import { buildTicketLinks } from '../utils/ticketLinks.js'

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

const glassButton =
  'flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-[11px] border border-white/10 bg-white/[.08] text-ink-100 transition-colors duration-150 hover:bg-white/[.14]'

function MicroLabel({ children, className = 'text-ink-400' }) {
  return (
    <div className={`text-[9px] font-bold uppercase tracking-[.18em] ${className}`}>{children}</div>
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
        <li key={`${item.label ?? 'detail'}-${item.value}`} className="flex gap-2 text-[13px] leading-relaxed text-ink-400">
          <span className="text-radar-400 shrink-0">&middot;</span>
          <span>
            {item.label && (
              <span className="font-semibold text-ink-200">{item.label}: </span>
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
    <div className="rounded-xl border border-white/5 bg-night-800 p-3.5">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-ink-500">{title}</p>
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
    <div className="space-y-4">
      {venue.summary && (
        <p className="text-sm leading-relaxed text-ink-200">{venue.summary}</p>
      )}

      {(bestFor.length > 0 || atmosphereChips.length > 0 || atmosphere.vibe) && (
        <div className="space-y-3">
          {atmosphere.vibe && (
            <p className="rounded-xl border border-radar-400/15 bg-radar-400/[.06] p-3 text-[13px] leading-relaxed text-ink-200">
              <span className="font-semibold text-white">Overall vibe:</span> {atmosphere.vibe}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {bestFor.map((item) => (
              <span key={item} className="rounded-full bg-white/[.08] px-2.5 py-1 text-[11px] font-semibold text-ink-200">
                Best for {item}
              </span>
            ))}
            {atmosphereChips.map((item) => (
              <span key={item} className="rounded-full bg-white/[.05] px-2.5 py-1 text-[11px] font-semibold text-ink-400">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2.5 md:grid-cols-2">
        <KnowledgeBlock
          title="Getting there"
          items={[
            { label: 'Transit', value: arrival.transit },
            { label: 'Parking', value: arrival.parking },
            { label: 'Rideshare', value: arrival.rideshare },
          ]}
        />

        <KnowledgeBlock
          title="Seats"
          items={[
            { label: 'Best value', value: seating.bestValueSections?.length ? seating.bestValueSections.join(', ') : null },
            { label: 'Watch out for', value: seating.avoidIfPossible?.length ? seating.avoidIfPossible.join(', ') : null },
            { label: 'Accessibility', value: seating.accessibilityNote },
          ]}
        />

        <KnowledgeBlock
          title="Food & pregame"
          items={[
            { label: 'Inside', value: foodAndDrink.summary },
            { label: 'Nearby', value: foodAndDrink.nearbyPregame?.length ? foodAndDrink.nearbyPregame.join(', ') : null },
          ]}
        />

        <KnowledgeBlock
          title="Fan tips"
          items={(venue.fanTips ?? []).slice(0, 4).map((tip) => ({
            value: tip,
          }))}
        />
      </div>

      {(officialLinks.length > 0 || reviewStamp) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/[.06] pt-3.5">
          {officialLinks.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-radar-400 hover:text-radar-300"
            >
              {linkLabel(key)} &rarr;
            </a>
          ))}

          {reviewStamp && (
            <span className="text-[11px] text-ink-500">
              {reviewStamp}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function VenueCard({ event }) {
  const mapUrls = getVenueMapUrls({
    venue: event.venue,
    city: event.city,
    state: event.state,
    lat: event.latitude,
    lng: event.longitude,
  })
  if (!event.venue && !mapUrls) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[.07] bg-night-900">
      <VenueMap
        lat={event.latitude}
        lng={event.longitude}
        venue={event.venue}
        city={event.city}
        state={event.state}
      />
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{event.venue}</div>
          <div className="mt-0.5 truncate text-xs text-ink-400">
            {[event.city, event.state].filter(Boolean).join(', ')}
          </div>
        </div>
        {mapUrls && (
          <a
            href={mapUrls.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-none items-center gap-1.5 rounded-[11px] border border-radar-400/30 bg-radar-400/[.12] px-[13px] py-[9px] text-xs font-semibold text-radar-400 transition-colors duration-150 hover:bg-radar-400/20"
          >
            <PaperPlaneIcon className="h-3.5 w-3.5" />
            Directions
          </a>
        )}
      </div>
    </section>
  )
}

// The two most-asked venue facts, pulled forward from the deep dive.
function VenueTips({ venue }) {
  if (!venue) return null

  const tips = [
    { label: 'Getting there', text: venue.arrival?.transit || venue.arrival?.parking || venue.arrival?.rideshare },
    { label: 'Best value seats', text: venue.seating?.bestValueSections?.join(', ') },
  ].filter(tip => tip.text)
  if (tips.length === 0) return null

  return (
    <div className="flex gap-2.5">
      {tips.map(tip => (
        <div key={tip.label} className="min-w-0 flex-1 rounded-[14px] border border-white/[.06] bg-night-900 px-3.5 py-[13px]">
          <MicroLabel className="text-ink-500">{tip.label}</MicroLabel>
          <p className="mt-1.5 line-clamp-4 text-xs leading-normal text-ink-200">{tip.text}</p>
        </div>
      ))}
    </div>
  )
}

function TeamName({ name, children, className = '' }) {
  if (!getTeamData(name)) return <span className={className}>{children}</span>
  return (
    <Link
      to={`/saved/team/${encodeURIComponent(name)}`}
      className={`${className} transition-colors duration-150 hover:text-radar-300`}
    >
      {children}
    </Link>
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
  const [ticketsOpen, setTicketsOpen] = useState(false)
  const copiedTimerRef = useRef(null)
  const eventDateTime = event?.dateTime
  const countdown = useCountdown(getEventStart(event))

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
      <div className="flex min-h-screen items-center justify-center bg-night-950">
        <div className="font-display text-xs uppercase tracking-[.2em] text-ink-400">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-night-950 px-[18px] pt-4">
        <div className="mx-auto max-w-xl">
          <button type="button" onClick={handleBack} className={glassButton} aria-label="Back">
            <ChevronLeftIcon className="h-[17px] w-[17px]" />
          </button>
          <EmptyState className="mt-6" title="Event not found" body="It may have been removed, or the link is out of date." />
        </div>
      </div>
    )
  }

  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const hasAwayTeam = Boolean(awayTeamName)
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
  const showTicketBar = sectionOrder.includes('tickets')
  const ticketProviderNames = buildTicketLinks(event, seatGeekUrl).map(link => link.name)
  const heroColor = getTeamHeroColor(event.homeTeam)
  const term = getStartTerm(event.sport)
  const time = formatLocalTime(event.localTime)
  const shortDate = formatShortDate(event.localDate)
  const loggedScore = savedRecord?.score?.home && savedRecord?.score?.away
    ? `${savedRecord.score.home}–${savedRecord.score.away}`
    : null

  const [year, month, day] = (event.localDate || '').split('-').map(Number)
  const dateDisplay = event.localDate
    ? new Date(year, month - 1, day).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : ''

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

  let statusTile = null
  if (countdown?.isLive) {
    statusTile = (
      <div className="flex-1 rounded-[14px] border border-radar-400/[.28] bg-radar-400/10 px-3.5 py-3">
        <MicroLabel className="text-radar-400">Happening now</MicroLabel>
        <div className="mt-[7px]"><LivePill /></div>
      </div>
    )
  } else if (pastEvent) {
    statusTile = (
      <div className="flex-1 rounded-[14px] border border-white/[.08] bg-[rgba(7,9,14,.5)] px-3.5 py-3">
        <MicroLabel>{loggedScore ? 'Final score' : 'Status'}</MicroLabel>
        <div className="mt-[5px] font-display text-[19px] leading-tight text-white">{loggedScore ?? 'Final'}</div>
      </div>
    )
  } else if (countdown) {
    statusTile = (
      <div className="flex-1 rounded-[14px] border border-radar-400/[.28] bg-radar-400/10 px-3.5 py-3">
        <MicroLabel className="text-radar-400">Countdown</MicroLabel>
        <div className="mt-[5px]"><CountdownDigits countdown={countdown} size="tile" /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header
        className="relative overflow-hidden px-[18px] pb-[26px] pt-4"
        style={{ background: `linear-gradient(168deg, ${heroColor} 0%, #0a1526 58%, #07090e 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_120%_at_80%_-10%,rgba(46,211,242,.18),transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl">
          <div className="flex items-center justify-between">
            <button type="button" onClick={handleBack} className={glassButton} aria-label="Back">
              <ChevronLeftIcon className="h-[17px] w-[17px]" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className={glassButton}
                aria-label={copied ? 'Link copied' : 'Share event'}
              >
                {copied
                  ? <CheckIcon className="h-[17px] w-[17px] text-radar-400" />
                  : <ShareIcon className="h-[17px] w-[17px]" />}
              </button>
              <button
                type="button"
                onClick={() => toggleSave(event)}
                aria-label={eventSaved ? 'Remove from saved' : 'Save event'}
                aria-pressed={eventSaved}
                className={eventSaved
                  ? 'flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-[11px] bg-radar-400 text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500'
                  : glassButton}
              >
                <BookmarkIcon filled={eventSaved} strokeWidth={1.5} className="h-[17px] w-[17px]" />
              </button>
            </div>
          </div>
          <p aria-live="polite" className="sr-only">{copied ? 'Link copied' : ''}</p>

          <div className="mt-[22px] flex items-center gap-2.5">
            {event.league && (
              <span className="rounded bg-radar-400 px-[9px] py-1 font-display text-[11px] uppercase leading-none tracking-[.2em] text-night-950">
                {event.league}
              </span>
            )}
            {event.sport && (
              <span className="text-[11px] font-medium uppercase tracking-[.08em] text-ink-400">{event.sport}</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-[18px]">
            <TeamLogo name={homeTeamName} size={72} />
            <div className="min-w-0">
              <h1 className="font-display text-[34px] uppercase leading-[.92] text-white [overflow-wrap:anywhere]">
                <TeamName name={homeTeamName}>{homeTeamName || event.name}</TeamName>
              </h1>
              {hasAwayTeam && (
                <div className="mt-1.5 flex items-center gap-[9px]">
                  <span className="font-display text-[13px] uppercase tracking-[.2em] text-ink-500">vs</span>
                  <TeamLogo name={awayTeamName} size={26} />
                  <TeamName
                    name={awayTeamName}
                    className="min-w-0 truncate font-display text-xl uppercase text-ink-200"
                  >
                    {getTeamShortName(awayTeamName)}
                  </TeamName>
                </div>
              )}
            </div>
          </div>

          <div className="mt-[22px] flex gap-2.5">
            <div className="flex-1 rounded-[14px] border border-white/[.08] bg-[rgba(7,9,14,.5)] px-3.5 py-3">
              <MicroLabel>{term.label}</MicroLabel>
              <div className="mt-[5px] font-display text-[19px] leading-tight text-white">{time?.label ?? 'Time TBD'}</div>
              {shortDate && <div className="mt-0.5 text-[11px] text-ink-400">{shortDate} · venue time</div>}
            </div>
            {statusTile}
          </div>
        </div>
      </header>

      <main className={`mx-auto flex max-w-xl flex-col gap-[11px] px-[18px] pt-3.5 ${showTicketBar ? 'pb-[150px]' : 'pb-10'}`}>
        {sectionOrder.map(section => {
          if (section === 'venue') {
            return (
              <div key={section} className="flex flex-col gap-[11px]">
                <VenueCard event={event} />
                <VenueTips venue={venueKnowledge} />
                {venueKnowledge && (
                  <CollapsibleSection title="Stadar deep dive" subtitle={event.venue}>
                    <VenueKnowledgeCard venue={venueKnowledge} />
                  </CollapsibleSection>
                )}
              </div>
            )
          }

          if (section === 'notes') {
            return (
              <CollapsibleSection key={section} title="Game notes">
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
              <CollapsibleSection key={section} title="League overview" defaultOpen={false}>
                <p className="mb-2 text-base font-semibold text-white">{leagueInfo.fullName}</p>
                <span className="mb-3 inline-block rounded-full bg-white/[.08] px-2.5 py-1 text-[11px] font-semibold text-ink-200">
                  {leagueInfo.tier}
                </span>
                <p className="mb-4 text-sm leading-relaxed text-ink-400">{leagueInfo.description}</p>
                <a
                  href={`https://${leagueInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-radar-400 hover:text-radar-300"
                >
                  {leagueInfo.website} &rarr;
                </a>
              </CollapsibleSection>
            )
          }

          // 'tickets' lives in the sticky bar below.
          return null
        })}
      </main>

      {showTicketBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[.07] bg-[linear-gradient(to_top,#07090e_70%,rgba(7,9,14,.9))] px-[18px] pb-[18px] pt-3.5">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTicketsOpen(true)}
                className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-radar-400 text-sm font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
              >
                Get tickets
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => downloadIcs(event)}
                aria-label="Add to calendar"
                title="Add to calendar"
                className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-[14px] border border-white/[.09] bg-night-800 text-ink-200 transition-colors duration-150 hover:text-white"
              >
                <CalendarIcon className="h-[19px] w-[19px]" />
              </button>
            </div>
            <p className="mt-[9px] truncate text-center text-[11px] text-ink-500">
              {ticketProviderNames.slice(0, 4).join(' · ')}
              {ticketProviderNames.length > 4 && ` · +${ticketProviderNames.length - 4} more`}
            </p>
          </div>
        </div>
      )}

      <TicketSheet
        event={event}
        open={ticketsOpen}
        onClose={() => setTicketsOpen(false)}
        seatGeekUrl={seatGeekUrl}
      />
      <UnsaveConfirmDialog
        event={pendingRemoval}
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

export default EventDetailPage
