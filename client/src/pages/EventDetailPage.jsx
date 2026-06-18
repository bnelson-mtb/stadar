import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { SPORT_ICONS, LEAGUE_COLORS, getCanonicalTeamName, getTeamData } from '../data/teams'
import { LEAGUE_INFO } from '../data/leagueInfo'
import TeamLogo from '../components/TeamLogo'
import VenueMap from '../components/VenueMap'

function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState(location.state?.event ?? null)
  const [loading, setLoading] = useState(!event)
  const [venueExpanded, setVenueExpanded] = useState(false)
  const [leagueExpanded, setLeagueExpanded] = useState(false)

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

  const date = new Date(event.dateTime)
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const badgeColor = LEAGUE_COLORS[event.league] || 'bg-gray-500'
  const icon = SPORT_ICONS[event.sport] || ''
  const MINOR_BADGE_LEAGUES = new Set(['AHL', 'ECHL', 'Minor League'])
  const badgeLabel = MINOR_BADGE_LEAGUES.has(event.league) ? 'Minor League' : event.league
  const leagueKey = event.league === 'Minor League'
    ? (event.sport === 'Hockey' ? 'Minor League Hockey'
       : event.sport === 'Basketball' ? 'Minor League Basketball'
       : 'Minor League')
    : event.league
  const leagueInfo = LEAGUE_INFO[leagueKey] ?? null

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

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
          <div className="w-20"></div>
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
              {badgeLabel}
            </span>
            <span className="text-gray-400 text-sm">{icon} {event.sport}</span>
          </div>

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

          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm mb-1">{dayOfWeek}</p>
            <p className="text-xl font-bold text-gray-900">{monthDay}</p>
            <p className="text-gray-500">{time}</p>
          </div>
        </div>

        {/* Venue Section */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <button
            onClick={() => setVenueExpanded(!venueExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-900">About the Venue</p>
              <p className="text-sm text-gray-500">{event.venue} · {event.city}, {event.state}</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${venueExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {venueExpanded && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <VenueMap lat={event.latitude} lng={event.longitude} venue={event.venue} />
            </div>
          )}
        </div>

        {/* About the League */}
        {leagueInfo && (
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <button
              onClick={() => setLeagueExpanded(!leagueExpanded)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">About the League</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${leagueExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {leagueExpanded && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
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
            )}
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
            <p className="text-sm text-gray-600 font-semibold mb-2">Compare prices</p>
            <p className="text-sm text-gray-400">Multi-site price comparison coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
