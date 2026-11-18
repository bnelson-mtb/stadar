import { Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import useCountdown from '@stadar/shared/hooks/useCountdown.js'
import { formatCountdown } from '@stadar/shared/utils/countdown.js'
import {
  formatLocalTime,
  formatLongDate,
  getDayLabel,
  getEventStart,
  getStartTerm,
  getTeamShortName,
} from '@stadar/shared/utils/eventDisplay.js'
import { getWinnerSide } from '@stadar/shared/utils/savedHelpers.js'
import { angle } from '../lib/gradient.js'
import { openEvent } from '../lib/nav.js'
import { colors } from '../theme.js'
import { LivePill } from './common.jsx'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { PencilIcon } from './icons.jsx'

// An upcoming saved game with a live countdown on the right. `highlight`
// marks the soonest one with the cyan wash.
export function SavedEventRow({ record, highlight = false }) {
  const { event } = record
  const countdown = useCountdown(getEventStart(event))
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  const title = awayTeamName ? `${homeLabel} vs ${getTeamShortName(awayTeamName)}` : homeLabel
  const when = [getDayLabel(event.localDate, { localTime: event.localTime }), formatLocalTime(event.localTime)?.label]
    .filter(Boolean)
    .join(' ')
  const meta = [when, event.venue].filter(Boolean).join(' · ')

  let right
  let rightLabel
  if (countdown?.isLive) {
    right = <LivePill />
    rightLabel = 'live now'
  } else if (countdown && !countdown.isPast) {
    const value = formatCountdown(countdown, { pad: false })
    const caption = getStartTerm(event.sport).caption
    rightLabel = `${value} ${caption}`
    right = (
      <>
        <Txt className={`text-right font-display text-[17px] leading-[20px] ${highlight ? 'text-radar-400' : 'text-ink-200'}`}>
          {value}
        </Txt>
        <Txt className="mt-[3px] text-right text-[10px] text-ink-500">{caption}</Txt>
      </>
    )
  } else {
    rightLabel = 'start time to be announced'
    right = (
      <>
        <Txt className="text-right font-display text-[17px] leading-[20px] text-ink-200">TBD</Txt>
        <Txt className="mt-[3px] text-right text-[10px] text-ink-500">start time</Txt>
      </>
    )
  }

  return (
    <Pressable
      onPress={() => openEvent(event)}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${meta}, ${rightLabel}`}
      className={`overflow-hidden rounded-[14px] border active:opacity-90 ${
        highlight ? 'border-radar-400/[.22]' : 'border-white/5 bg-night-900'
      }`}
    >
      {highlight ? (
        <LinearGradient
          colors={['rgba(46,211,242,0.1)', '#0d1219']}
          locations={[0, 0.55]}
          {...angle(120)}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        />
      ) : null}
      <View className="flex-row items-center gap-3 p-3.5">
        <TeamLogo name={homeTeamName} size={34} />
        <View className="min-w-0 flex-1">
          <Txt numberOfLines={1} className="font-sans-semibold text-sm text-white">{title}</Txt>
          <Txt numberOfLines={1} className="mt-[3px] text-[11px] text-ink-400">{meta}</Txt>
        </View>
        <View className="items-end">{right}</View>
      </View>
    </Pressable>
  )
}

// A played saved game: the logged final score (winner in white), the note if
// there is one, and a way into the notes editor if there isn't.
export function SavedScoreCard({ record, onEditNotes }) {
  const { event, score, notes } = record
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const winner = getWinnerSide(score)
  const hasScore = winner !== null
  const scoreColor = side => (winner === 'tie' || winner === side ? 'text-white' : 'text-ink-500')
  const footer = [formatLongDate(event.localDate), event.venue].filter(Boolean).join(' · ')
  const note = notes?.trim()
  const addLabel = awayTeamName && !hasScore ? '+ Add score & note' : '+ Add a note'
  const homeLabel = getTeamShortName(homeTeamName) || event.name

  return (
    <View className="rounded-[14px] border border-white/5 bg-night-900 p-3.5">
      <Pressable
        onPress={() => openEvent(event)}
        accessibilityRole="button"
        accessibilityLabel={
          hasScore && awayTeamName
            ? `${homeLabel} ${score.home} to ${score.away} ${getTeamShortName(awayTeamName)}`
            : awayTeamName ? `${homeLabel} vs ${getTeamShortName(awayTeamName)}` : homeLabel
        }
        className="min-w-0 flex-row items-center gap-2.5 active:opacity-85"
      >
        <TeamLogo name={homeTeamName} size={26} />
        <Txt numberOfLines={1} className="min-w-0 shrink font-sans-semibold text-[13px] text-white">{homeLabel}</Txt>
        {awayTeamName ? (hasScore ? (
          <View className="ml-auto flex-row items-center gap-2">
            <Txt className={`font-display text-[22px] leading-[26px] ${scoreColor('home')}`}>{score.home}</Txt>
            <Txt className="text-xs text-ink-600">—</Txt>
            <Txt className={`font-display text-[22px] leading-[26px] ${scoreColor('away')}`}>{score.away}</Txt>
            <TeamLogo name={awayTeamName} size={22} style={{ opacity: 0.8 }} />
          </View>
        ) : (
          <View className="ml-auto min-w-0 shrink flex-row items-center gap-2">
            <Txt className="text-[11px] text-ink-500">vs</Txt>
            <Txt numberOfLines={1} className="min-w-0 shrink text-xs text-ink-400">{getTeamShortName(awayTeamName)}</Txt>
            <TeamLogo name={awayTeamName} size={22} style={{ opacity: 0.8 }} />
          </View>
        )) : null}
      </Pressable>

      {note ? (
        <>
          <Pressable
            onPress={onEditNotes}
            accessibilityRole="button"
            accessibilityLabel="Edit note"
            className="mt-2.5 flex-row gap-[9px] border-t border-white/[.06] pt-2.5"
          >
            <PencilIcon size={14} color={colors.radar[400]} style={{ marginTop: 2 }} />
            <Txt numberOfLines={4} className="flex-1 text-xs leading-[19px] text-ink-200">{note}</Txt>
          </Pressable>
          <Txt numberOfLines={1} className="mt-[9px] text-[10px] uppercase tracking-[0.8px] text-ink-500">{footer}</Txt>
        </>
      ) : (
        <View className="mt-[9px] min-w-0 flex-row items-center gap-[7px]">
          <Pressable onPress={onEditNotes} accessibilityRole="button" className="rounded-lg bg-white/5 px-2 py-1 active:bg-white/10">
            <Txt className="text-[11px] text-ink-400">{addLabel}</Txt>
          </Pressable>
          <Txt numberOfLines={1} className="min-w-0 shrink text-[11px] text-ink-500">{footer}</Txt>
        </View>
      )}
    </View>
  )
}
