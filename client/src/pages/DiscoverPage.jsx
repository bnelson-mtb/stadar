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
  'Soccer',
  'Hockey',
  'Lacrosse',
]
const LEAGUE_ORDER = [
  'NBA',
  'WNBA',
  'NFL',
  'MLB',
  'NHL',
  'MLS',
  'USL',
  'Liga MX',
  'World Cup',
  'International',
  'PWHL',
  'PLL',
  'NCAAM',
  'NCAAW',
  'NCAAF',
  'NCAA Baseball',
  'NCAA Softball',
  'NCAA WVB',
  'NCAA MVB',
  'NCAA VB',
  "Women's Soccer",
  "Men's Soccer",
  'NCAA Soccer',
  'NWSL',
  'LOVB',
  'AHL',
  'ECHL',
  'Minor League',
]

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

const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','Washington DC'],['FL','Florida'],
  ['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],
  ['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],
  ['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],
  ['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],
  ['WY','Wyoming'],
]
const US_STATE_CODES = US_STATES.map(([code]) => code)

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function groupEventsByDate(events) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(today)

  // Compute this ISO week's Saturday and Sunday
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  const dayOfWeek = today.getDay()
  // Days since Monday (ISO week start): Mon=0, Tue=1, ..., Sun=6
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - daysSinceMonday)
  const thisSaturday = new Date(thisMonday)
  thisSaturday.setDate(thisMonday.getDate() + 5)
  const thisSunday = new Date(thisMonday)
  thisSunday.setDate(thisMonday.getDate() + 6)
  const thisSaturdayStr = toDateStr(thisSaturday)
  const thisSundayStr = toDateStr(thisSunday)

  // Mon–Fri of this ISO week
  const weekdayStrs = new Set()
  for (let i = 0; i < 5; i++) {
    const d = new Date(thisMonday)
    d.setDate(thisMonday.getDate() + i)
    weekdayStrs.add(toDateStr(d))
  }
  // End of this ISO week (Sunday)
  const endOfWeekStr = thisSundayStr

  const groups = [
    { label: 'Today', events: [] },
    { label: 'This Weekend', events: [] },
    { label: 'This Week', events: [] },
    { label: 'Later', events: [] },
  ]

  for (const event of events) {
    const d = event.localDate
    if (!d) { groups[3].events.push(event); continue }
    if (d === todayStr) {
      groups[0].events.push(event)
    } else if (d === thisSaturdayStr || d === thisSundayStr) {
      groups[1].events.push(event)
    } else if (weekdayStrs.has(d)) {
      groups[2].events.push(event)
    } else {
      groups[3].events.push(event)
    }
  }

  return groups.filter(g => g.events.length > 0)
}

function DiscoverPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stateCode, setStateCode] = useState(null)

  const [selectedSports, setSelectedSports] = useState([])
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  // Auto-detect location on first load; restore from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('stadar-location')
    if (saved && US_STATE_CODES.includes(saved)) {
      setStateCode(saved)
      return
    }
    const detect = async () => {
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 5000)
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
        clearTimeout(id)
        if (res.ok) {
          const data = await res.json()
          const state = data.region_code?.toUpperCase()
          if (state && US_STATE_CODES.includes(state)) { setStateCode(state); return }
        }
      } catch { /* silent fail */ }
      setStateCode('UT')
    }
    detect()
  }, [])

  const handleStateChange = (newState) => {
    setStateCode(newState)
    localStorage.setItem('stadar-location', newState)
  }

  useEffect(() => {
    if (!stateCode) return
    setLoading(true)
    setError(null)
    setSelectedSports([])
    setSelectedLeagues([])
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5068'
    fetch(`${apiBase}/api/events?stateCode=${stateCode}`)
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
  }, [stateCode])

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

  const availableSports = [...new Set(events.map(e => e.sport).filter(Boolean))]
    .sort((a, b) => (SPORT_ORDER.indexOf(a) + 1 || 99) - (SPORT_ORDER.indexOf(b) + 1 || 99))

  const availableLeagues = [...new Set(events.map(e => e.league).filter(Boolean))]
    .sort((a, b) => (LEAGUE_ORDER.indexOf(a) + 1 || 99) - (LEAGUE_ORDER.indexOf(b) + 1 || 99))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                stadar
              </h1>
              <p className="text-gray-500 mt-1">Live sports near you</p>
            </div>
            <select
              value={stateCode ?? ''}
              onChange={e => handleStateChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>{code} — {name}</option>
              ))}
            </select>
          </div>
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
              sports={availableSports}
              leagues={availableLeagues}
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
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No events match your filters
                </div>
              ) : (
                groupEventsByDate(filteredEvents).map(group => (
                  <div key={group.label}>
                    <div className="sticky top-0 z-10 bg-gray-50 py-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {group.label}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {group.events.map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          isFavorite={isFavorite(getCanonicalTeamName(event.homeTeam))}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Hardcoded event cards for testing */}
                {/* <div className="mt-4 space-y-3">
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
        </div> */}
      </main>
    </div>
  )
}

export default DiscoverPage
