import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import EventRow from '../components/EventRow.jsx'
import FilterBar from '../components/FilterBar.jsx'
import FollowSheet from '../components/FollowSheet.jsx'
import MyTeamsRail from '../components/MyTeamsRail.jsx'
import NextUpHero from '../components/NextUpHero.jsx'
import RadarLogo from '../components/RadarLogo.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import SkeletonCard, { SkeletonHero } from '../components/SkeletonCard.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import TicketSheet from '../components/TicketSheet.jsx'
import UnsaveConfirmDialog from '../components/UnsaveConfirmDialog.jsx'
import { FilterIcon, MapPinIcon, XMarkIcon } from '../components/icons.jsx'
import useFavorites from '../hooks/useFavorites.js'
import useGames from '../hooks/useGames.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '../data/teams'
import {
  LOCATION_STORAGE_KEY,
  US_STATES,
  US_STATE_CODES,
  getStateName,
} from '../data/usStates.js'
import {
  formatShortDate,
  getDayLabel,
  getTeamShortName,
  involvesTeam,
} from '../utils/eventDisplay.js'
import {
  DATE_SEGMENTS,
  getDefaultDateSegment,
  getSegmentHeading,
  getTeamsInFeed,
  matchesDateSegment,
  pickNextUpEvent,
} from '../utils/feedFilters.js'

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

// Consecutive rows sharing a venue-local date (the feed is sorted by date).
function groupByLocalDate(events) {
  const groups = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last && last.date === event.localDate) {
      last.events.push(event)
    } else {
      groups.push({ date: event.localDate, events: [event] })
    }
  }
  return groups
}

function dayHeading(localDate) {
  if (!localDate) return 'Date TBD'
  const relative = getDayLabel(localDate)
  if (relative === 'Today' || relative === 'Tonight') return 'Today'
  if (relative === 'Tomorrow') return `Tomorrow · ${formatShortDate(localDate)}`
  return formatShortDate(localDate)
}

function LocationPill({ stateCode, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/[.07] bg-night-700 px-[11px] py-[7px] text-xs font-medium text-ink-200 transition-colors duration-150 focus-within:ring-2 focus-within:ring-radar-400/60 hover:border-white/15">
      <MapPinIcon className="h-[13px] w-[13px] text-radar-400" />
      {getStateName(stateCode)}
      <select
        value={stateCode ?? ''}
        onChange={e => onChange(e.target.value)}
        aria-label="Select state"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {US_STATES.map(([code, name]) => (
          <option key={code} value={code}>{code} — {name}</option>
        ))}
      </select>
    </label>
  )
}

function DiscoverPage() {
  const location = useLocation()
  const [stateCode, setStateCode] = useState(() => {
    const navigationStateCode = location.state?.stateCode
    if (navigationStateCode && US_STATE_CODES.includes(navigationStateCode)) {
      return navigationStateCode
    }
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (saved && US_STATE_CODES.includes(saved)) return saved
    return 'UT'
  })

  const [selectedSports, setSelectedSports] = useState([])
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)
  // null = follow the default (first segment with games); set once the user picks.
  const [dateSegment, setDateSegment] = useState(null)
  const [openSheet, setOpenSheet] = useState(null) // 'filters' | 'follow' | 'tickets'

  const { events, loading, error, retry } = useGames(stateCode)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const {
    toggleSave,
    isSaved,
    pendingRemoval,
    cancelRemove,
    confirmRemove,
  } = useSavedEvents()

  // Auto-detect location on first load; restore from localStorage if available
  useEffect(() => {
    const navigationStateCode = location.state?.stateCode
    if (navigationStateCode && US_STATE_CODES.includes(navigationStateCode)) {
      localStorage.setItem(LOCATION_STORAGE_KEY, navigationStateCode)
      return
    }

    const saved = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (saved && US_STATE_CODES.includes(saved)) return
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = (newState) => {
    setSelectedSports([])
    setSelectedLeagues([])
    setSearchQuery('')
    setSelectedTeam(null)
    setDateSegment(null)
    setStateCode(newState)
    localStorage.setItem(LOCATION_STORAGE_KEY, newState)
  }

  const clearFilters = () => {
    setSelectedSports([])
    setSelectedLeagues([])
    setShowFavoritesOnly(false)
    setSearchQuery('')
    setSelectedTeam(null)
  }

  const handleSelectTeam = team => {
    setSelectedTeam(prev => (prev === team ? null : team))
    setDateSegment(null) // land on the first range where that team plays
  }

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
    if (selectedTeam && !involvesTeam(event, selectedTeam)) return false
    const home = getCanonicalTeamName(event.homeTeam)
    const away = getCanonicalTeamName(event.awayTeam)
    if (showFavoritesOnly &&
      !favorites.includes(home) &&
      !favorites.includes(away)) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTeam = home.toLowerCase().includes(q) || away.toLowerCase().includes(q)
      const matchesPlace = event.city.toLowerCase().includes(q) || event.venue.toLowerCase().includes(q)
      if (!matchesTeam && !matchesPlace) return false
    }
    return true
  }), [events, selectedSports, selectedLeagues, selectedTeam, showFavoritesOnly, favorites, searchQuery])

  const activeSegment = dateSegment ?? getDefaultDateSegment(filteredEvents)
  const segmentEvents = useMemo(
    () => filteredEvents.filter(event => matchesDateSegment(event.localDate, activeSegment)),
    [filteredEvents, activeSegment]
  )
  const dayGroups = activeSegment === 'today'
    ? [{ date: null, events: segmentEvents }]
    : groupByLocalDate(segmentEvents)

  const nextUp = useMemo(() => pickNextUpEvent(events, favorites), [events, favorites])
  const feedTeams = useMemo(() => getTeamsInFeed(events), [events])

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

  const sheetFilterCount = selectedSports.length + selectedLeagues.length +
    (showFavoritesOnly ? 1 : 0) + (searchQuery.trim() ? 1 : 0)
  const hasAnyFilter = sheetFilterCount > 0 || Boolean(selectedTeam)
  const closeSheet = () => setOpenSheet(null)

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header className="mx-auto flex max-w-xl items-center justify-between gap-3 px-[18px] pb-3 pt-4">
        <div className="flex items-center gap-[9px]">
          <RadarLogo className="h-[22px] w-[22px] shrink-0" />
          <h1 className="font-display text-xl uppercase leading-none tracking-[.12em] text-white">Stadar</h1>
        </div>
        <LocationPill stateCode={stateCode} onChange={handleStateChange} />
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-[22px] px-[18px] pb-6">
        {loading && (
          <>
            {slowLoad && (
              <p className="text-center text-sm text-ink-500">
                Fetching events... this can take up to half a minute.
              </p>
            )}
            <SkeletonHero />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {error && (
          <EmptyState
            title="Couldn't load games"
            body={error === 'network'
              ? 'Check your connection and try again.'
              : 'Our event source is having a moment. Try again shortly.'}
          >
            <button
              type="button"
              onClick={retry}
              className="h-10 cursor-pointer rounded-xl bg-radar-400 px-5 text-[13px] font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
            >
              Retry
            </button>
          </EmptyState>
        )}

        {!loading && !error && events.length === 0 && (
          <EmptyState title="Quiet on the radar" body={`No upcoming events found in ${getStateName(stateCode)}.`} />
        )}

        {!loading && !error && events.length > 0 && (
          <>
            {nextUp && (
              <NextUpHero
                event={nextUp}
                stateCode={stateCode}
                isSaved={isSaved(nextUp.id)}
                onToggleSave={toggleSave}
                onOpenTickets={() => setOpenSheet('tickets')}
              />
            )}

            <MyTeamsRail
              favorites={favorites}
              events={events}
              selectedTeam={selectedTeam}
              onSelectTeam={handleSelectTeam}
              onFollow={() => setOpenSheet('follow')}
            />

            <section aria-labelledby="feed-heading">
              <SegmentedControl
                label="When"
                options={DATE_SEGMENTS}
                value={activeSegment}
                onChange={setDateSegment}
              />

              <div className="mb-2.5 mt-4 flex items-center justify-between gap-3">
                <h2 id="feed-heading" className="font-display text-xs uppercase tracking-[.2em] text-ink-400">
                  {getSegmentHeading(activeSegment, segmentEvents.length)}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpenSheet('filters')}
                  className="inline-flex flex-none cursor-pointer items-center gap-[5px] text-[11px] font-semibold text-ink-200 transition-colors duration-150 hover:text-white"
                >
                  <FilterIcon className="h-[13px] w-[13px]" />
                  Filters
                  {sheetFilterCount > 0 && (
                    <span className="ml-0.5 min-w-[18px] rounded-full bg-radar-400 px-1.5 text-center text-[10px] font-bold leading-[18px] text-night-950">
                      {sheetFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {selectedTeam && (
                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="mb-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-radar-400/30 bg-radar-400/10 px-3 py-1 text-[11px] font-semibold text-radar-400 transition-colors duration-150 hover:bg-radar-400/15"
                  aria-label={`Stop showing only ${selectedTeam} games`}
                >
                  {getTeamShortName(selectedTeam)} games only
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}

              {filteredEvents.length === 0 ? (
                <EmptyState title="No matches" body="No events match your filters">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cursor-pointer text-xs font-semibold text-radar-400 hover:text-radar-300"
                  >
                    Clear filters
                  </button>
                </EmptyState>
              ) : segmentEvents.length === 0 ? (
                <EmptyState
                  title={`No games ${DATE_SEGMENTS.find(s => s.value === activeSegment)?.heading ?? ''}`}
                  body="Nothing on the radar in this window. Try another range."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {dayGroups.map(group => (
                    <div key={group.date ?? 'today'}>
                      {group.date !== null && (
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-ink-500">
                          {dayHeading(group.date)}
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        {group.events.map(event => (
                          <EventRow
                            key={event.id}
                            event={event}
                            stateCode={stateCode}
                            isSaved={isSaved(event.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomSheet
        open={openSheet === 'filters'}
        onClose={closeSheet}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasAnyFilter}
              className="h-12 cursor-pointer rounded-[14px] px-4 text-sm font-semibold text-ink-200 transition-colors duration-150 hover:text-white disabled:cursor-default disabled:text-ink-600"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={closeSheet}
              className="h-12 flex-1 cursor-pointer rounded-[14px] bg-radar-400 text-sm font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
            >
              Show {filteredEvents.length} {filteredEvents.length === 1 ? 'game' : 'games'}
            </button>
          </div>
        }
      >
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </BottomSheet>

      <FollowSheet
        open={openSheet === 'follow'}
        onClose={closeSheet}
        teams={feedTeams}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        stateName={getStateName(stateCode)}
      />

      <TicketSheet event={nextUp} open={openSheet === 'tickets'} onClose={closeSheet} />

      <UnsaveConfirmDialog
        event={pendingRemoval}
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

export default DiscoverPage
