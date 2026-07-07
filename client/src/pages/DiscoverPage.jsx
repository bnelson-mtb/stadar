import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import useFavorites from '../hooks/useFavorites.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '../data/teams'
import { API_BASE, fetchJsonWithRetry } from '../utils/api.js'

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
  'Other',
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
  'Triple-A',
  'Double-A',
  'High-A',
  'Single-A',
  'Other',
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
  const location = useLocation()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stateCode, setStateCode] = useState(() => {
    const navigationStateCode = location.state?.stateCode
    if (navigationStateCode && US_STATE_CODES.includes(navigationStateCode)) {
      return navigationStateCode
    }
    return 'UT'
  })

  const [selectedSports, setSelectedSports] = useState([])
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { toggleSave, isSaved } = useSavedEvents()

  // Auto-detect location on first load; restore from localStorage if available
  useEffect(() => {
    const navigationStateCode = location.state?.stateCode
    if (navigationStateCode && US_STATE_CODES.includes(navigationStateCode)) {
      setStateCode(navigationStateCode)
      localStorage.setItem('stadar-location', navigationStateCode)
      return
    }

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

  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    if (!stateCode) return
    setLoading(true)
    setError(null)
    setSelectedSports([])
    setSelectedLeagues([])
    setSearchQuery('')
    fetchJsonWithRetry(`${API_BASE}/api/games?stateCode=${stateCode}`)
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        // .status = HTTP error from the API; no .status = never got a response
        setError(err.status ? 'server' : 'network')
        setLoading(false)
      })
  }, [stateCode, retryToken])

  // Surface a hint when the first load drags (server waking from idle)
  const [slowLoad, setSlowLoad] = useState(false)
  useEffect(() => {
    if (!loading) return
    const id = setTimeout(() => setSlowLoad(true), 3000)
    return () => {
      clearTimeout(id)
      setSlowLoad(false)
    }
  }, [loading])

  const filteredEvents = useMemo(() => events.filter(event => {
    if (selectedSports.length > 0 && !selectedSports.includes(event.sport)) return false
    if (selectedLeagues.length > 0 && !selectedLeagues.includes(event.league)) return false
    const home = getCanonicalTeamName(event.homeTeam)
    const away = getCanonicalTeamName(event.awayTeam)
    if (showFavoritesOnly &&
      !isFavorite(home) &&
      !isFavorite(away)) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTeam = home.toLowerCase().includes(q) || away.toLowerCase().includes(q)
      const matchesPlace = event.city.toLowerCase().includes(q) || event.venue.toLowerCase().includes(q)
      if (!matchesTeam && !matchesPlace) return false
    }
    return true
  }), [events, selectedSports, selectedLeagues, showFavoritesOnly, isFavorite, searchQuery])

  const groupedEvents = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents])

  const availableSports = useMemo(() =>
    [...new Set(events.map(e => e.sport).filter(Boolean))]
      .sort((a, b) => (SPORT_ORDER.indexOf(a) + 1 || 99) - (SPORT_ORDER.indexOf(b) + 1 || 99)),
    [events]
  )

  const availableLeagues = useMemo(() =>
    [...new Set(events.map(e => e.league).filter(Boolean))]
      .sort((a, b) => (LEAGUE_ORDER.indexOf(a) + 1 || 99) - (LEAGUE_ORDER.indexOf(b) + 1 || 99)),
    [events]
  )

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
          <div className="space-y-3">
            {slowLoad && (
              <p className="text-center text-sm text-gray-400">
                Waking up the server — the first load can take up to half a minute…
              </p>
            )}
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="font-medium text-red-500">Couldn't load games</p>
            <p className="text-sm mt-1 text-gray-500">
              {error === 'network'
                ? 'Check your connection and try again.'
                : 'Our event source is having a moment. Try again shortly.'}
            </p>
            <button
              onClick={() => setRetryToken(t => t + 1)}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12 text-gray-400">No upcoming events found</div>
        )}

        {!loading && !error && events.length > 0 && (
          <>
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search teams, cities, venues..."
                aria-label="Search teams, cities, or venues"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

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
                groupedEvents.map(group => (
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
                          stateCode={stateCode}
                          isSavedEvent={isSaved(event.id)}
                          onToggleSave={toggleSave}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}


      </main>
    </div>
  )
}

export default DiscoverPage
