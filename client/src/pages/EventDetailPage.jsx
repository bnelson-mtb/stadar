import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { SPORT_ICONS, LEAGUE_COLORS, getCanonicalTeamName } from '../data/teams'
import { LEAGUE_INFO } from '../data/leagueInfo'
import TeamLogo from '../components/TeamLogo'
import VenueMap from '../components/VenueMap'

function buildIcsContent(event) {
  const dateStr = (event.localDate || '').replace(/-/g, '')
  if (event.localTime) {
    const timeStr = event.localTime.replace(/:/g, '').padEnd(6, '0').slice(0, 6)
    const [hh, mm, ss] = event.localTime.split(':').map(Number)
    const totalMinutes = hh * 60 + mm + 120  // add 2 hours
    const endH = Math.floor(totalMinutes / 60) % 24
    const endM = totalMinutes % 60
    const rollover = totalMinutes >= 1440  // crossed midnight
    let endDateStr = dateStr
    if (rollover) {
      const [y, mo, d] = (event.localDate || '').split('-').map(Number)
      const next = new Date(y, mo - 1, d + 1)
      endDateStr = `${next.getFullYear()}${String(next.getMonth()+1).padStart(2,'0')}${String(next.getDate()).padStart(2,'0')}`
    }
    const endStr = `${String(endH).padStart(2,'0')}${String(endM).padStart(2,'0')}${String(ss ?? 0).padStart(2,'0')}`
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
    const nextDateStr = `${next.getFullYear()}${String(next.getMonth()+1).padStart(2,'0')}${String(next.getDate()).padStart(2,'0')}`
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

function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState(location.state?.event ?? null)
  const [loading, setLoading] = useState(!event)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(copiedTimerRef.current), [])

  useEffect(() => {
    if (event) return

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5068'
    fetch(`${apiBase}/api/events/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Not found')))
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id, event])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-6"
          >
            ← Back
          </button>
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">Event not found</p>
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

  function handleShare() {
    const shareText = hasAwayTeam
      ? `${homeTeamName} vs ${awayTeamName} — ${dateDisplay} at ${event.venue}`
      : `${homeTeamName} — ${dateDisplay} at ${event.venue}`
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">{event.name}</h1>
          <div className="w-20 flex justify-end">
            {copied ? (
              <span className="text-xs font-medium text-green-600 pr-1">Copied!</span>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
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
          <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Matchup */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
              {event.league}
            </span>
            <span className="text-gray-400 text-sm">{icon} {event.sport}</span>
          </div>

          {hasAwayTeam ? (
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex-1 text-center">
                <div className="flex justify-center mb-2">
                  <TeamLogo name={homeTeamName} size="large" />
                </div>
                <p className="text-lg font-bold text-gray-900">{homeTeamName}</p>
              </div>

              <div className="text-2xl font-bold text-gray-300">vs</div>

              <div className="flex-1 text-center">
                <div className="flex justify-center mb-2">
                  <TeamLogo name={awayTeamName} size="large" />
                </div>
                <p className="text-lg font-bold text-gray-900">{awayTeamName}</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-2 flex justify-center">
                <TeamLogo name={homeTeamName} size="large" />
              </div>
              <p className="text-lg font-bold text-gray-900">{homeTeamName || event.name}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xl font-bold text-gray-900">{dateDisplay}</p>
            <p className="text-gray-500">{timeDisplay}</p>
          </div>
        </div>

        {/* Venue Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="mb-4">
            <p className="font-semibold text-gray-900">About the Venue</p>
            <p className="text-sm text-gray-500">{event.venue} · {event.city}, {event.state}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <VenueMap lat={event.latitude} lng={event.longitude} venue={event.venue} />
          </div>
        </div>

        {/* About the League */}
        {leagueInfo && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">About the League</h2>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xl font-bold text-gray-900 mb-2">{leagueInfo.fullName}</p>
              <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700 mb-3">
                {leagueInfo.tier}
              </span>
              <p className="text-gray-600 text-sm mb-4">{leagueInfo.description}</p>
              <a
                href={`https://${leagueInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {leagueInfo.website} →
              </a>
            </div>
          </div>
        )}

        {/* Tickets Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Tickets</h2>

          <div className="mb-4">
            {event.priceMin && event.priceMax ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Price Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${event.priceMin.toFixed(2)} — ${event.priceMax.toFixed(2)}
                </p>
                {event.currency && (
                  <p className="text-sm text-gray-500">{event.currency}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Pricing unavailable</p>
            )}

            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition-colors"
              >
                Buy Tickets on Ticketmaster →
              </a>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
