import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useFavorites from '@stadar/shared/hooks/useFavorites.js'
import useGames from '@stadar/shared/hooks/useGames.js'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { LOCATION_STORAGE_KEY, US_STATE_CODES, getStateName } from '@stadar/shared/data/usStates.js'
import { formatShortDate, getDayLabel, getTeamShortName, involvesTeam } from '@stadar/shared/utils/eventDisplay.js'
import {
  DATE_SEGMENTS,
  getDefaultDateSegment,
  getSegmentHeading,
  getTeamsInFeed,
  matchesDateSegment,
  pickNextUpEvent,
} from '@stadar/shared/utils/feedFilters.js'
import Button from '../components/Button.jsx'
import { EmptyState, SegmentedControl, SkeletonCard, SkeletonHero } from '../components/common.jsx'
import EventRow from '../components/EventRow.jsx'
import FilterBar from '../components/FilterBar.jsx'
import MyTeamsRail from '../components/MyTeamsRail.jsx'
import NextUpHero from '../components/NextUpHero.jsx'
import RadarLogo from '../components/RadarLogo.jsx'
import Sheet from '../components/Sheet.jsx'
import { FollowSheet, StatePickerSheet, TicketSheet, UnsaveConfirmDialog } from '../components/sheets.jsx'
import Txt from '../components/Txt.jsx'
import { FilterIcon, MapPinIcon, XMarkIcon } from '../components/icons.jsx'
import { LEAGUE_ORDER, SPORT_ORDER, sortByOrder, toggleArrayItem } from '../lib/feedOrder.js'
import { colors } from '../theme.js'

// Consecutive rows sharing a venue-local date (the feed is sorted by date).
function groupByLocalDate(events) {
  const groups = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last && last.date === event.localDate) last.events.push(event)
    else groups.push({ date: event.localDate, events: [event] })
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

function readSavedState() {
  try {
    const saved = globalThis.localStorage?.getItem(LOCATION_STORAGE_KEY)
    return saved && US_STATE_CODES.includes(saved) ? saved : null
  } catch {
    return null
  }
}

function writeSavedState(code) {
  try {
    globalThis.localStorage?.setItem(LOCATION_STORAGE_KEY, code)
  } catch {
    // Not fatal: the choice just won't survive a restart.
  }
}

// Guesses the state from the IP address (same service as the web app).
async function detectState() {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 5000)
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(id)
    if (res.ok) {
      const data = await res.json()
      const state = data.region_code?.toUpperCase()
      if (state && US_STATE_CODES.includes(state)) return state
    }
  } catch {
    // Silent: fall back to Utah.
  }
  return 'UT'
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets()
  const [stateCode, setStateCode] = useState(() => readSavedState() ?? 'UT')
  const [selectedSports, setSelectedSports] = useState([])
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)
  // null = follow the default (first segment with games); set once the user picks.
  const [dateSegment, setDateSegment] = useState(null)
  const [openSheet, setOpenSheet] = useState(null) // 'filters' | 'follow' | 'tickets' | 'state'

  const { events, loading, error, retry } = useGames(stateCode)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { toggleSave, isSaved, pendingRemoval, cancelRemove, confirmRemove } = useSavedEvents()

  // First launch: guess the state from the IP; afterwards keep the last choice.
  useEffect(() => {
    if (readSavedState()) return
    let cancelled = false
    detectState().then(state => {
      if (!cancelled) setStateCode(state)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleStateChange = newState => {
    setSelectedSports([])
    setSelectedLeagues([])
    setSearchQuery('')
    setSelectedTeam(null)
    setDateSegment(null)
    setStateCode(newState)
    writeSavedState(newState)
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

  // Surface a hint when the first load drags (server waking from idle).
  const [slowLoad, setSlowLoad] = useState(false)
  useEffect(() => {
    if (!loading) return undefined
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
    if (showFavoritesOnly && !favorites.includes(home) && !favorites.includes(away)) return false
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
    [filteredEvents, activeSegment],
  )
  const dayGroups = activeSegment === 'today' ? [{ date: null, events: segmentEvents }] : groupByLocalDate(segmentEvents)

  const nextUp = useMemo(() => pickNextUpEvent(events, favorites), [events, favorites])
  const feedTeams = useMemo(() => getTeamsInFeed(events), [events])
  const availableSports = useMemo(() => sortByOrder(events.map(e => e.sport), SPORT_ORDER), [events])
  const availableLeagues = useMemo(() => sortByOrder(events.map(e => e.league), LEAGUE_ORDER), [events])

  const sheetFilterCount = selectedSports.length + selectedLeagues.length +
    (showFavoritesOnly ? 1 : 0) + (searchQuery.trim() ? 1 : 0)
  const hasAnyFilter = sheetFilterCount > 0 || Boolean(selectedTeam)
  const closeSheet = () => setOpenSheet(null)

  return (
    <View className="flex-1 bg-night-950" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-xl self-center flex-row items-center justify-between gap-3 px-[18px] pb-3 pt-4">
        <View className="flex-row items-center gap-[9px]">
          <RadarLogo size={22} />
          <Txt accessibilityRole="header" className="font-display text-xl uppercase leading-[24px] tracking-[2.4px] text-white">
            Stadar
          </Txt>
        </View>
        <Pressable
          onPress={() => setOpenSheet('state')}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${getStateName(stateCode)}. Change state`}
          className="flex-row items-center gap-1.5 rounded-full border border-white/[.07] bg-night-700 px-[11px] py-[7px] active:border-white/15"
        >
          <MapPinIcon size={13} color={colors.radar[400]} />
          <Txt className="font-sans-medium text-xs text-ink-200">{getStateName(stateCode)}</Txt>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 576, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 24, gap: 22 }}>
        {loading ? (
          <>
            {slowLoad ? (
              <Txt className="text-center text-sm text-ink-500">Fetching events... this can take up to half a minute.</Txt>
            ) : null}
            <SkeletonHero />
            <View className="gap-2">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </View>
          </>
        ) : null}

        {error ? (
          <EmptyState
            title="Couldn't load games"
            body={error === 'network'
              ? 'Check your connection and try again.'
              : 'Our event source is having a moment. Try again shortly.'}
          >
            <Button label="Retry" onPress={retry} className="h-10" boxClassName="rounded-xl px-5" textClassName="text-[13px]" />
          </EmptyState>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <EmptyState title="Quiet on the radar" body={`No upcoming events found in ${getStateName(stateCode)}.`} />
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <>
            {nextUp ? (
              <NextUpHero
                event={nextUp}
                isSaved={isSaved(nextUp.id)}
                onToggleSave={toggleSave}
                onOpenTickets={() => setOpenSheet('tickets')}
              />
            ) : null}

            <MyTeamsRail
              favorites={favorites}
              events={events}
              selectedTeam={selectedTeam}
              onSelectTeam={handleSelectTeam}
              onFollow={() => setOpenSheet('follow')}
            />

            <View>
              <SegmentedControl label="When" options={DATE_SEGMENTS} value={activeSegment} onChange={setDateSegment} />

              <View className="mb-2.5 mt-4 flex-row items-center justify-between gap-3">
                <Txt accessibilityRole="header" className="font-display text-xs uppercase tracking-[2.4px] text-ink-400">
                  {getSegmentHeading(activeSegment, segmentEvents.length)}
                </Txt>
                <Pressable
                  onPress={() => setOpenSheet('filters')}
                  accessibilityRole="button"
                  accessibilityLabel={sheetFilterCount > 0 ? `Filters, ${sheetFilterCount} active` : 'Filters'}
                  hitSlop={8}
                  className="flex-row items-center gap-[5px]"
                >
                  <FilterIcon size={13} color={colors.ink[200]} />
                  <Txt className="font-sans-semibold text-[11px] text-ink-200">Filters</Txt>
                  {sheetFilterCount > 0 ? (
                    <View className="ml-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-radar-400 px-1.5">
                      <Txt className="font-sans-bold text-[10px] text-night-950">{sheetFilterCount}</Txt>
                    </View>
                  ) : null}
                </Pressable>
              </View>

              {selectedTeam ? (
                <Pressable
                  onPress={() => setSelectedTeam(null)}
                  accessibilityRole="button"
                  accessibilityLabel={`Stop showing only ${selectedTeam} games`}
                  className="mb-2.5 flex-row items-center gap-1.5 self-start rounded-full border border-radar-400/30 bg-radar-400/10 px-3 py-1 active:bg-radar-400/15"
                >
                  <Txt className="font-sans-semibold text-[11px] text-radar-400">
                    {getTeamShortName(selectedTeam)} games only
                  </Txt>
                  <XMarkIcon size={12} color={colors.radar[400]} />
                </Pressable>
              ) : null}

              {filteredEvents.length === 0 ? (
                <EmptyState title="No matches" body="No events match your filters">
                  <Pressable onPress={clearFilters} accessibilityRole="button" hitSlop={8}>
                    <Txt className="font-sans-semibold text-xs text-radar-400">Clear filters</Txt>
                  </Pressable>
                </EmptyState>
              ) : segmentEvents.length === 0 ? (
                <EmptyState
                  title={`No games ${DATE_SEGMENTS.find(s => s.value === activeSegment)?.heading ?? ''}`}
                  body="Nothing on the radar in this window. Try another range."
                />
              ) : (
                <View className="gap-4">
                  {dayGroups.map(group => (
                    <View key={group.date ?? 'today'}>
                      {group.date !== null ? (
                        <Txt className="mb-2 font-sans-semibold text-[10px] uppercase tracking-[1.6px] text-ink-500">
                          {dayHeading(group.date)}
                        </Txt>
                      ) : null}
                      <View className="gap-2">
                        {group.events.map(event => (
                          <EventRow key={event.id} event={event} isSaved={isSaved(event.id)} />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <Sheet
        open={openSheet === 'filters'}
        onClose={closeSheet}
        title="Filters"
        footer={
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={clearFilters}
              disabled={!hasAnyFilter}
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasAnyFilter }}
              className="h-12 justify-center px-4"
            >
              <Txt className={`font-sans-semibold text-sm ${hasAnyFilter ? 'text-ink-200' : 'text-ink-600'}`}>Clear all</Txt>
            </Pressable>
            <Button
              label={`Show ${filteredEvents.length} ${filteredEvents.length === 1 ? 'game' : 'games'}`}
              onPress={closeSheet}
              className="h-12 flex-1"
            />
          </View>
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
      </Sheet>

      <FollowSheet
        open={openSheet === 'follow'}
        onClose={closeSheet}
        teams={feedTeams}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        stateName={getStateName(stateCode)}
      />

      <StatePickerSheet
        open={openSheet === 'state'}
        onClose={closeSheet}
        value={stateCode}
        onChange={handleStateChange}
      />

      <TicketSheet event={nextUp} open={openSheet === 'tickets'} onClose={closeSheet} />

      <UnsaveConfirmDialog event={pendingRemoval} onCancel={cancelRemove} onConfirm={confirmRemove} />
    </View>
  )
}
