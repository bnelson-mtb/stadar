import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Share, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getCanonicalTeamName, getTeamData } from '@stadar/shared/data/teams.js'
import { LEAGUE_INFO } from '@stadar/shared/data/leagueInfo.js'
import { getVenueKnowledge } from '@stadar/shared/data/venues/index.js'
import useCountdown from '@stadar/shared/hooks/useCountdown.js'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getApiBase, fetchJsonWithRetry } from '@stadar/shared/utils/api.js'
import {
  getDetailSectionOrder,
  getEventBoundaryDelay,
  isPastEvent,
  shouldShowFinalScore,
} from '@stadar/shared/utils/eventDetailState.js'
import {
  formatLocalTime,
  formatShortDate,
  getEventStart,
  getStartTerm,
  getTeamHeroColor,
  getTeamShortName,
} from '@stadar/shared/utils/eventDisplay.js'
import { getVenueMapUrls } from '@stadar/shared/utils/maps.js'
import { buildTicketLinks } from '@stadar/shared/utils/ticketLinks.js'
import Button from '../components/Button.jsx'
import { CountdownDigits, EmptyState, LivePill, MicroLabel } from '../components/common.jsx'
import { CollapsibleSection, GameNotesSection, VenueKnowledgeCard, VenueTips } from '../components/detail.jsx'
import { TicketSheet, UnsaveConfirmDialog } from '../components/sheets.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import Txt from '../components/Txt.jsx'
import VenueMap from '../components/VenueMap'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  ChevronLeftIcon,
  PaperPlaneIcon,
  ShareIcon,
} from '../components/icons.jsx'
import { addToCalendar } from '../lib/calendar.js'
import { angle } from '../lib/gradient.js'
import { openExternal, openWebPage } from '../lib/links.js'
import { cachedEvent, goBack, openTeam, rememberEvent } from '../lib/nav.js'
import { leagueKeyFor, shareMessageFor, SHARE_BASE_URL } from '../lib/eventShare.js'
import { colors } from '../theme.js'

function GlassButton({ onPress, label, children, active = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      className={`h-9 w-9 items-center justify-center rounded-[11px] ${
        active ? 'bg-radar-400 active:bg-radar-500' : 'border border-white/10 bg-white/[.08] active:bg-white/[.14]'
      }`}
    >
      {children}
    </Pressable>
  )
}

function TeamName({ name, children, className }) {
  if (!getTeamData(name)) return <Txt className={className}>{children}</Txt>
  return (
    <Txt className={className} onPress={() => openTeam(name)} accessibilityRole="link" suppressHighlighting>
      {children}
    </Txt>
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
    <View className="overflow-hidden rounded-2xl border border-white/[.07] bg-night-900">
      <VenueMap lat={event.latitude} lng={event.longitude} venue={event.venue} city={event.city} state={event.state} />
      <View className="flex-row items-center justify-between gap-3 px-4 py-3.5">
        <View className="min-w-0 flex-1">
          <Txt numberOfLines={1} className="font-sans-semibold text-sm text-white">{event.venue}</Txt>
          <Txt numberOfLines={1} className="mt-0.5 text-xs text-ink-400">
            {[event.city, event.state].filter(Boolean).join(', ')}
          </Txt>
        </View>
        {mapUrls ? (
          <Pressable
            onPress={() => openExternal(mapUrls.directionsUrl)}
            accessibilityRole="link"
            accessibilityLabel={`Directions to ${event.venue}`}
            className="flex-row items-center gap-1.5 rounded-[11px] border border-radar-400/30 bg-radar-400/[.12] px-[13px] py-[9px] active:bg-radar-400/20"
          >
            <PaperPlaneIcon size={14} color={colors.radar[400]} />
            <Txt className="font-sans-semibold text-xs text-radar-400">Directions</Txt>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

// The web lazy-loads the venue guide to keep its first download small; in
// the app it ships in the bundle, so it also works offline.
function useVenueKnowledge(event) {
  const venue = event?.venue
  const city = event?.city
  const state = event?.state
  return useMemo(() => (venue ? getVenueKnowledge(venue, { city, state }) : null), [venue, city, state])
}

export default function EventDetailScreen({ id }) {
  const insets = useSafeAreaInsets()
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
  const [event, setEvent] = useState(() => cachedEvent(id) ?? savedRecord?.event ?? null)
  const [loading, setLoading] = useState(!event)
  const [seatGeekUrl, setSeatGeekUrl] = useState(null)
  const [reachedEventBoundary, setReachedEventBoundary] = useState(null)
  const [ticketsOpen, setTicketsOpen] = useState(false)
  const eventDateTime = event?.dateTime
  const countdown = useCountdown(getEventStart(event))
  const venueKnowledge = useVenueKnowledge(event)

  // Flip to the "played" layout the moment the start time passes.
  useEffect(() => {
    if (!eventDateTime) return undefined
    let cancelled = false
    let timer
    const timed = { dateTime: eventDateTime }
    function schedule() {
      const delay = getEventBoundaryDelay(timed)
      if (delay === null) return
      timer = setTimeout(() => {
        if (cancelled) return
        if (isPastEvent(timed)) {
          setReachedEventBoundary(eventDateTime)
          return
        }
        schedule()
      }, delay)
    }
    schedule()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [eventDateTime])

  // Fetch unless we already have a usable copy: a non-saved event passed in
  // from a list, or a past saved event (always shown from its snapshot).
  useEffect(() => {
    const isEventSaved = isSaved(id)
    const isPast = event ? isPastEvent(event) : false
    if (event && (!isEventSaved || isPast)) return
    fetchJsonWithRetry(`${getApiBase()}/api/games/${id}`)
      .then(fresh => {
        setEvent(fresh)
        rememberEvent(fresh)
        if (isEventSaved) updateSnapshot(fresh)
      })
      .catch(() => {
        if (!event) setEvent(null)
      })
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Background lookup for a direct SeatGeek event link (404 = keep search link).
  // The screen remounts per event id, so there is no stale link to clear.
  useEffect(() => {
    let cancelled = false
    fetchJsonWithRetry(`${getApiBase()}/api/games/${id}/seatgeek`)
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
      <View className="flex-1 items-center justify-center bg-night-950">
        <Txt className="font-display text-xs uppercase tracking-[2.4px] text-ink-400">Loading...</Txt>
      </View>
    )
  }

  if (!event) {
    return (
      <View className="flex-1 bg-night-950 px-[18px]" style={{ paddingTop: insets.top + 16 }}>
        <GlassButton onPress={() => goBack()} label="Back">
          <ChevronLeftIcon size={17} color={colors.ink[100]} />
        </GlassButton>
        <EmptyState className="mt-6" title="Event not found" body="It may have been removed, or the link is out of date." />
      </View>
    )
  }

  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const hasAwayTeam = Boolean(awayTeamName)
  const leagueInfo = LEAGUE_INFO[leagueKeyFor(event)] ?? null
  const eventSaved = isSaved(event.id)
  const pastEvent = reachedEventBoundary === event.dateTime || isPastEvent(event)
  const sectionOrder = getDetailSectionOrder({ isPast: pastEvent, isSaved: eventSaved, hasLeagueInfo: Boolean(leagueInfo) })
  const showFinalScore = shouldShowFinalScore({ isPast: pastEvent, isSaved: eventSaved, hasAwayTeam })
  const showTicketBar = sectionOrder.includes('tickets')
  const ticketProviderNames = buildTicketLinks(event, seatGeekUrl).map(link => link.name)
  const heroColor = getTeamHeroColor(event.homeTeam)
  const term = getStartTerm(event.sport)
  const time = formatLocalTime(event.localTime)
  const shortDate = formatShortDate(event.localDate)
  const loggedScore = savedRecord?.score?.home && savedRecord?.score?.away
    ? `${savedRecord.score.home}–${savedRecord.score.away}`
    : null

  function handleShare() {
    const url = `${SHARE_BASE_URL}/event/${encodeURIComponent(event.id)}`
    Share.share({ title: event.name, message: `${shareMessageFor(event, homeTeamName, awayTeamName)}\n${url}`, url }).catch(() => {})
  }

  let statusTile = null
  if (countdown?.isLive) {
    statusTile = (
      <View className="flex-1 rounded-[14px] border border-radar-400/[.28] bg-radar-400/10 px-3.5 py-3">
        <MicroLabel className="text-radar-400">Happening now</MicroLabel>
        <View className="mt-[7px]"><LivePill /></View>
      </View>
    )
  } else if (pastEvent) {
    statusTile = (
      <View className="flex-1 rounded-[14px] border border-white/[.08] bg-night-950/50 px-3.5 py-3">
        <MicroLabel>{loggedScore ? 'Final score' : 'Status'}</MicroLabel>
        <Txt className="mt-[5px] font-display text-[19px] leading-[24px] text-white">{loggedScore ?? 'Final'}</Txt>
      </View>
    )
  } else if (countdown) {
    statusTile = (
      <View className="flex-1 rounded-[14px] border border-radar-400/[.28] bg-radar-400/10 px-3.5 py-3">
        <MicroLabel className="text-radar-400">Countdown</MicroLabel>
        <View className="mt-[5px]"><CountdownDigits countdown={countdown} size="tile" /></View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-night-950">
      <ScrollView contentContainerStyle={{ paddingBottom: showTicketBar ? 150 + insets.bottom : 40 + insets.bottom }}>
        <View className="overflow-hidden px-[18px] pb-[26px]" style={{ paddingTop: insets.top + 16 }}>
          <LinearGradient
            colors={[heroColor, '#0a1526', '#07090e']}
            locations={[0, 0.58, 1]}
            {...angle(168)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          />
          <View className="w-full max-w-xl self-center">
            <View className="flex-row items-center justify-between">
              <GlassButton onPress={() => goBack()} label="Back">
                <ChevronLeftIcon size={17} color={colors.ink[100]} />
              </GlassButton>
              <View className="flex-row gap-2">
                <GlassButton onPress={handleShare} label="Share event">
                  <ShareIcon size={17} color={colors.ink[100]} />
                </GlassButton>
                <GlassButton
                  onPress={() => toggleSave(event)}
                  label={eventSaved ? 'Remove from saved' : 'Save event'}
                  active={eventSaved}
                >
                  <BookmarkIcon
                    filled={eventSaved}
                    strokeWidth={1.5}
                    size={17}
                    color={eventSaved ? colors.night[950] : colors.ink[100]}
                  />
                </GlassButton>
              </View>
            </View>

            <View className="mt-[22px] flex-row items-center gap-2.5">
              {event.league ? (
                <View className="rounded bg-radar-400 px-[9px] py-1">
                  <Txt className="font-display text-[11px] uppercase tracking-[2.2px] text-night-950">{event.league}</Txt>
                </View>
              ) : null}
              {event.sport ? (
                <Txt className="font-sans-medium text-[11px] uppercase tracking-[0.9px] text-ink-400">{event.sport}</Txt>
              ) : null}
            </View>

            <View className="mt-4 flex-row items-center gap-[18px]">
              <TeamLogo name={homeTeamName} size={72} />
              <View className="min-w-0 flex-1">
                <TeamName name={homeTeamName} className="font-display text-[34px] uppercase leading-[37px] text-white">
                  {homeTeamName || event.name}
                </TeamName>
                {hasAwayTeam ? (
                  <View className="mt-1.5 min-w-0 flex-row items-center gap-[9px]">
                    <Txt className="font-display text-[13px] uppercase tracking-[2.6px] text-ink-500">vs</Txt>
                    <TeamLogo name={awayTeamName} size={26} />
                    <TeamName name={awayTeamName} className="min-w-0 shrink font-display text-xl uppercase text-ink-200">
                      {getTeamShortName(awayTeamName)}
                    </TeamName>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="mt-[22px] flex-row gap-2.5">
              <View className="flex-1 rounded-[14px] border border-white/[.08] bg-night-950/50 px-3.5 py-3">
                <MicroLabel>{term.label}</MicroLabel>
                <Txt className="mt-[5px] font-display text-[19px] leading-[24px] text-white">{time?.label ?? 'Time TBD'}</Txt>
                {shortDate ? <Txt className="mt-0.5 text-[11px] text-ink-400">{shortDate} · venue time</Txt> : null}
              </View>
              {statusTile}
            </View>
          </View>
        </View>

        <View className="w-full max-w-xl gap-[11px] self-center px-[18px] pt-3.5">
          {sectionOrder.map(section => {
            if (section === 'venue') {
              return (
                <View key={section} className="gap-[11px]">
                  <VenueCard event={event} />
                  <VenueTips venue={venueKnowledge} />
                  {venueKnowledge ? (
                    <CollapsibleSection title="Stadar deep dive" subtitle={event.venue}>
                      <VenueKnowledgeCard venue={venueKnowledge} />
                    </CollapsibleSection>
                  ) : null}
                </View>
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
                  <Txt className="mb-2 font-sans-semibold text-base text-white">{leagueInfo.fullName}</Txt>
                  <View className="mb-3 self-start rounded-full bg-white/[.08] px-2.5 py-1">
                    <Txt className="font-sans-semibold text-[11px] text-ink-200">{leagueInfo.tier}</Txt>
                  </View>
                  <Txt className="mb-4 text-sm leading-[22px] text-ink-400">{leagueInfo.description}</Txt>
                  <Pressable onPress={() => openWebPage(`https://${leagueInfo.website}`)} accessibilityRole="link" hitSlop={6}>
                    <Txt className="font-sans-medium text-[13px] text-radar-400">{leagueInfo.website} →</Txt>
                  </Pressable>
                </CollapsibleSection>
              )
            }
            return null
          })}
        </View>
      </ScrollView>

      {showTicketBar ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-white/[.07] bg-night-950 px-[18px] pt-3.5"
          style={{ paddingBottom: 18 + insets.bottom }}
        >
          <View className="w-full max-w-xl self-center">
            <View className="flex-row items-center gap-2.5">
              <Button onPress={() => setTicketsOpen(true)} className="h-12 flex-1" accessibilityLabel="Get tickets">
                <Txt className="font-sans-bold text-sm text-night-950">Get tickets</Txt>
                <ArrowRightIcon size={16} color={colors.night[950]} />
              </Button>
              <Pressable
                onPress={() => addToCalendar(event)}
                accessibilityRole="button"
                accessibilityLabel="Add to calendar"
                className="h-12 w-12 items-center justify-center rounded-[14px] border border-white/[.09] bg-night-800 active:bg-night-700"
              >
                <CalendarIcon size={19} color={colors.ink[200]} />
              </Pressable>
            </View>
            <Txt numberOfLines={1} className="mt-[9px] text-center text-[11px] text-ink-500">
              {ticketProviderNames.slice(0, 4).join(' · ')}
              {ticketProviderNames.length > 4 ? ` · +${ticketProviderNames.length - 4} more` : ''}
            </Txt>
          </View>
        </View>
      ) : null}

      <TicketSheet event={event} open={ticketsOpen} onClose={() => setTicketsOpen(false)} seatGeekUrl={seatGeekUrl} />
      <UnsaveConfirmDialog event={pendingRemoval} onCancel={cancelRemove} onConfirm={confirmRemove} />
    </View>
  )
}
