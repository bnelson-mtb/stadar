import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useCountdown from '@stadar/shared/hooks/useCountdown.js'
import useFavorites from '@stadar/shared/hooks/useFavorites.js'
import useGames from '@stadar/shared/hooks/useGames.js'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { readStoredStateCode } from '@stadar/shared/data/usStates.js'
import { formatCountdown } from '@stadar/shared/utils/countdown.js'
import {
  formatLocalTime,
  formatLongDate,
  getDayLabel,
  getEventStart,
  getTeamContext,
  getTeamHeroColor,
  getTeamShortName,
  involvesTeam,
  splitTeamName,
} from '@stadar/shared/utils/eventDisplay.js'
import { getNextGameForTeam } from '@stadar/shared/utils/feedFilters.js'
import {
  formatWinLoss,
  getOpponentName,
  getScoreOutcome,
  getTeamRecords,
  getTeamStats,
  partitionByTime,
} from '@stadar/shared/utils/savedHelpers.js'
import { EmptyState, GroupHeading, LivePill } from '../components/common.jsx'
import { CornerGlow } from '../components/NextUpHero.jsx'
import { SavedEventRow } from '../components/saved.jsx'
import { TicketSheet } from '../components/sheets.jsx'
import StatusBarScrim from '../components/StatusBarScrim.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import Txt from '../components/Txt.jsx'
import { ChevronLeftIcon, HeartIcon } from '../components/icons.jsx'
import { angle } from '../lib/gradient.js'
import { goBack, openEvent } from '../lib/nav.js'
import { colors } from '../theme.js'

function matchupTitle(event, teamName) {
  const opponent = getOpponentName(event, teamName)
  if (!opponent) return event.name
  const side = getCanonicalTeamName(event.homeTeam) === teamName ? 'vs' : 'at'
  return `${side} ${getTeamShortName(opponent)}`
}

function StatTile({ value, label }) {
  return (
    <View className="flex-1 rounded-[13px] border border-white/[.08] bg-night-950/50 px-[13px] py-[11px]">
      <Txt className="font-display text-[19px] leading-[24px] text-white">{value}</Txt>
      <Txt className="mt-0.5 text-[10px] uppercase tracking-[1px] text-ink-400">{label}</Txt>
    </View>
  )
}

function NextGameCard({ event, teamName, onOpenTickets }) {
  const countdown = useCountdown(getEventStart(event))
  const opponent = getOpponentName(event, teamName)
  const isHome = getCanonicalTeamName(event.homeTeam) === teamName
  const title = matchupTitle(event, teamName)
  const when = [getDayLabel(event.localDate, { localTime: event.localTime }), formatLocalTime(event.localTime)?.label]
    .filter(Boolean)
    .join(' ')

  return (
    <View className="overflow-hidden rounded-2xl border border-radar-400/25">
      <LinearGradient
        colors={['rgba(46,211,242,0.12)', '#0d1219']}
        locations={[0, 0.6]}
        {...angle(120)}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />
      <Pressable
        onPress={() => openEvent(event)}
        accessibilityRole="button"
        accessibilityLabel={`Next game: ${title}, ${when}. Open event`}
        className="absolute bottom-0 left-0 right-0 top-0 active:bg-white/[.03]"
      />
      <View pointerEvents="box-none" className="p-4">
        <View pointerEvents="none" className="flex-row items-center justify-between">
          <Txt className="font-display text-[11px] uppercase tracking-[2.2px] text-radar-400">Next game</Txt>
          {opponent ? <Txt className="text-[11px] text-ink-400">{isHome ? 'Home' : 'Away'}</Txt> : null}
        </View>
        <View pointerEvents="none" className="mt-3 flex-row items-center gap-[11px]">
          <Txt numberOfLines={1} className="min-w-0 flex-1 font-display text-[22px] uppercase leading-[27px] text-white">
            {title}
          </Txt>
          {opponent ? <TeamLogo name={opponent} size={28} /> : null}
        </View>
        <View pointerEvents="box-none" className="mt-3.5 flex-row items-end justify-between gap-3">
          <View pointerEvents="none">
            {countdown?.isLive ? (
              <LivePill large />
            ) : (
              <Txt className="font-display text-[26px] leading-[30px] text-white">
                {countdown && !countdown.isPast ? formatCountdown(countdown, { pad: false }) : 'TBD'}
              </Txt>
            )}
            <Txt className="mt-[3px] text-[11px] text-ink-400">{when}</Txt>
          </View>
          <Pressable
            onPress={onOpenTickets}
            accessibilityRole="button"
            className="h-[38px] justify-center rounded-[11px] bg-radar-400 px-[15px] active:bg-radar-500"
          >
            <Txt className="font-sans-bold text-[13px] text-night-950">Tickets</Txt>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const BADGE = {
  W: { box: 'bg-radar-400/[.12]', text: 'text-radar-400', label: 'Win' },
  L: { box: 'bg-white/5', text: 'text-ink-500', label: 'Loss' },
  T: { box: 'bg-white/5', text: 'text-ink-200', label: 'Tie' },
}
const SCORE_COLOR = { W: 'text-white', L: 'text-ink-400', T: 'text-ink-200' }

function HistoryRow({ record, teamName }) {
  const outcome = getScoreOutcome(record, teamName)
  const meta = [formatLongDate(record.event.localDate), record.notes?.trim() ? 'note added' : null].filter(Boolean).join(' · ')
  const badge = outcome ? BADGE[outcome.result] : null
  const title = matchupTitle(record.event, teamName)

  return (
    <Pressable
      onPress={() => openEvent(record.event)}
      accessibilityRole="button"
      accessibilityLabel={[
        badge ? badge.label : 'No score logged',
        title,
        outcome ? `${outcome.teamScore} to ${outcome.opponentScore}` : null,
        meta,
      ].filter(Boolean).join(', ')}
      className="flex-row items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 px-3.5 py-[13px] active:bg-night-800"
    >
      <View className={`h-[34px] w-[34px] items-center justify-center rounded-[10px] ${badge ? badge.box : 'bg-white/5'}`}>
        <Txt className={`font-display text-xs ${badge ? badge.text : 'text-ink-500'}`}>{outcome?.result ?? '—'}</Txt>
      </View>
      <View className="min-w-0 flex-1">
        <Txt numberOfLines={1} className="font-sans-semibold text-[13px] text-white">{title}</Txt>
        <Txt numberOfLines={1} className="mt-0.5 text-[11px] text-ink-500">{meta}</Txt>
      </View>
      {outcome ? (
        <Txt className={`font-display text-lg ${SCORE_COLOR[outcome.result]}`}>
          {outcome.teamScore}—{outcome.opponentScore}
        </Txt>
      ) : null}
    </Pressable>
  )
}

export default function TeamScreen({ teamName }) {
  const insets = useSafeAreaInsets()
  const { savedEvents } = useSavedEvents()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [stateCode] = useState(readStoredStateCode)
  const { events } = useGames(stateCode)
  const [ticketsOpen, setTicketsOpen] = useState(false)

  const teamRecords = getTeamRecords(savedEvents, teamName)
  const { upcoming, past } = partitionByTime(teamRecords)
  const stats = getTeamStats(savedEvents, teamName)
  const feedGames = events.filter(event => involvesTeam(event, teamName))
  const nextGame = getNextGameForTeam([...feedGames, ...upcoming.map(record => record.event)], teamName)
  const otherUpcoming = upcoming.filter(record => record.event.id !== nextGame?.id)
  const context = getTeamContext([...feedGames, ...teamRecords.map(record => record.event)], teamName)
  const nameLines = splitTeamName(teamName)
  const following = isFavorite(teamName)
  const heroColor = getTeamHeroColor(teamName)

  return (
    <View className="flex-1 bg-night-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
        <View className="overflow-hidden px-[18px] pb-[22px]" style={{ paddingTop: insets.top + 16 }}>
          <LinearGradient
            colors={[heroColor, '#0a1526', '#07090e']}
            locations={[0, 0.62, 1]}
            {...angle(168)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          />
          <CornerGlow size={240} offset={-80} opacity={0.12} />
          <View className="w-full max-w-xl self-center">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => goBack('/teams')}
                accessibilityRole="button"
                accessibilityLabel="Back"
                hitSlop={4}
                className="h-9 w-9 items-center justify-center rounded-[11px] border border-white/10 bg-white/[.08] active:bg-white/[.14]"
              >
                <ChevronLeftIcon size={17} color={colors.ink[100]} />
              </Pressable>
              <Pressable
                onPress={() => toggleFavorite(teamName)}
                accessibilityRole="button"
                accessibilityState={{ selected: following }}
                accessibilityLabel={following ? `Unfollow ${teamName}` : `Follow ${teamName}`}
                className={`flex-row items-center gap-[7px] rounded-full border px-3.5 py-[9px] ${
                  following ? 'border-radar-400/35 bg-radar-400/[.14]' : 'border-white/10 bg-white/[.08]'
                }`}
              >
                <HeartIcon filled={following} strokeWidth={2} size={14} color={following ? colors.radar[400] : colors.ink[100]} />
                <Txt className={`font-sans-semibold text-xs ${following ? 'text-radar-400' : 'text-ink-100'}`}>
                  {following ? 'Following' : 'Follow'}
                </Txt>
              </Pressable>
            </View>

            <View className="mt-5 flex-row items-center gap-4">
              <TeamLogo name={teamName} size={76} />
              <View className="min-w-0 flex-1">
                {nameLines.map(line => (
                  <Txt key={line} accessibilityRole="header" className="font-display text-[32px] uppercase leading-[34px] text-white">
                    {line}
                  </Txt>
                ))}
                {context.league || context.homeVenue ? (
                  <Txt className="mt-[7px] font-sans-medium text-[11px] uppercase tracking-[1.3px] text-ink-400">
                    {[context.league, context.homeVenue].filter(Boolean).join(' · ')}
                  </Txt>
                ) : null}
              </View>
            </View>

            <View className="mt-5 flex-row gap-2.5">
              <StatTile value={stats.saved} label="Saved" />
              <StatTile value={stats.attended} label="Attended" />
              <StatTile value={formatWinLoss(stats)} label="When I go" />
            </View>
          </View>
        </View>

        <View className="w-full max-w-xl gap-5 self-center p-[18px]">
          {nextGame ? (
            <NextGameCard event={nextGame} teamName={teamName} onOpenTickets={() => setTicketsOpen(true)} />
          ) : null}

          {otherUpcoming.length > 0 ? (
            <View>
              <GroupHeading>Saved upcoming</GroupHeading>
              <View className="gap-2">
                {otherUpcoming.map(record => <SavedEventRow key={record.event.id} record={record} />)}
              </View>
            </View>
          ) : null}

          <View>
            <GroupHeading>My history</GroupHeading>
            {past.length === 0 ? (
              <EmptyState
                title="No games logged"
                body={teamRecords.length === 0
                  ? `No saved events for ${teamName} yet.`
                  : 'Saved games show up here once they have been played.'}
              />
            ) : (
              <View className="gap-2">
                {past.map(record => <HistoryRow key={record.event.id} record={record} teamName={teamName} />)}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <StatusBarScrim />

      <TicketSheet event={nextGame} open={ticketsOpen} onClose={() => setTicketsOpen(false)} />
    </View>
  )
}
