import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import useFavorites from '../hooks/useFavorites.js'
import { getCanonicalTeamName } from '../data/teams'

function toggleArrayItem(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

const SPORT_ORDER = [
  'Basketball',
  'Football',
  'Baseball',
  'Softball',
  'Volleyball',
  "Women's Volleyball",
  'Soccer',
  'Hockey',
  'Lacrosse',
  'Misc',
]
const LEAGUE_ORDER = [
  'NBA',
  'NFL',
  'MLB',
  'NHL',
  'MLS',
  'PLL',
  'NCAAM',
  'NCAAW',
  'NCAAF',
  'NCAA Baseball',
  'NCAA Softball',
  "Men's VB",
  "Women's VB",
  'NWSL',
  "Women's Soccer",
  "Men's Soccer",
  'LOVB',
  'Minor League',
  'Misc',
]

const DEFAULT_SPORTS = ['Football', 'Baseball', 'Softball', "Women's Volleyball"]
const DEFAULT_LEAGUES = ['NCAAF', 'MLB', "Women's VB", 'NCAA Baseball', 'NCAA Softball']

function orderedUnique(values, order) {
  const unique = [...new Set(values.filter(Boolean))]
  return unique.sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

function DiscoverPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSports, setSelectedSports] = useState([])
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    fetch('http://localhost:5068/api/events')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch events')
        return res.json()
      })
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredEvents = events.filter(event => {
    if (selectedSports.length > 0 && !selectedSports.includes(event.sport)) return false
    if (selectedLeagues.length > 0 && !selectedLeagues.includes(event.league)) return false
    if (
      showFavoritesOnly &&
      !isFavorite(getCanonicalTeamName(event.homeTeam)) &&
      !isFavorite(getCanonicalTeamName(event.awayTeam))
    ) return false
    return true
  })

  const sports = orderedUnique([...events.map(e => e.sport), ...DEFAULT_SPORTS], SPORT_ORDER)
  const leagues = orderedUnique([...events.map(e => e.league), ...DEFAULT_LEAGUES], LEAGUE_ORDER)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            stadar
          </h1>
          <p className="text-gray-500 mt-1">Live sports near you</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12 text-gray-400">No upcoming events found</div>
        )}

        {!loading && !error && events.length > 0 && (
          <>
            <FilterBar
              sports={sports}
              leagues={leagues}
              selectedSports={selectedSports}
              onToggleSport={s => setSelectedSports(prev => toggleArrayItem(prev, s))}
              selectedLeagues={selectedLeagues}
              onToggleLeague={l => setSelectedLeagues(prev => toggleArrayItem(prev, l))}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={() => setShowFavoritesOnly(prev => !prev)}
              hasFavorites={favorites.length > 0}
            />

            <div className="space-y-3">
              <p className="text-sm text-gray-400 font-medium">
                {filteredEvents.length === events.length
                  ? `${events.length} upcoming events`
                  : `${filteredEvents.length} of ${events.length} events`}
              </p>
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={isFavorite(getCanonicalTeamName(event.homeTeam))}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No events match your filters
                </div>
              )}
            </div>
          </>
        )}

        {/* Hardcoded event cards for testing */}
        <div className="mt-4 space-y-3">
          <EventCard
            key="test123"
            event={{
              id: 'test123',
              homeTeam: 'LOVB Salt Lake Volleyball',
              awayTeam: 'LOVB Austin',
              dateTime: '2026-06-01T01:00:00Z',
              venue: 'Lifetime Activities Center',
              sport: 'Volleyball',
              league: 'LOVB',
              city: 'Herriman',
              state: 'UT',
              ticketUrl: '',
            }}
            isFavorite={isFavorite('Utah Archers')}
            onToggleFavorite={toggleFavorite}
          />
        </div>
                <div className="mt-4 space-y-3">
          <EventCard
            key="test1234"
            event={{
              id: 'den',
              homeTeam: 'Denver Broncos',
              awayTeam: 'Seattle Seahawks',
              dateTime: '2026-06-01T01:00:00Z',
              venue: 'Mile High Stadium',
              sport: 'Football',
              league: 'NFL',
              city: 'Denver',
              state: 'CO',
              ticketUrl: '',
            }}
            isFavorite={isFavorite('Denver Broncos')}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </main>
    </div>
  )
}

export default DiscoverPage
