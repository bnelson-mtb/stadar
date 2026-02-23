import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import useFavorites from '../hooks/useFavorites.js'

function toggleArrayItem(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
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
    if (showFavoritesOnly && !isFavorite(event.homeTeam) && !isFavorite(event.awayTeam)) return false
    return true
  })

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
                  isFavorite={isFavorite(event.homeTeam)}
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
              awayTeam: 'LOVB Nebraska',
              dateTime: '2026-06-01T01:00:00Z',
              venue: 'Buell Arena',
              sport: 'Volleyball',
              league: 'Misc',
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
            key="test123"
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
