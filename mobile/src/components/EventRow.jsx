import { Pressable, View } from 'react-native'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { formatLocalTime, getTeamShortName, getTimeZoneLabel } from '@stadar/shared/utils/eventDisplay.js'
import { openEvent } from '../lib/nav.js'
import { colors } from '../theme.js'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { BookmarkIcon, ChevronRightIcon } from './icons.jsx'

// Compact feed row: venue-local time, matchup, league and venue. A saved
// event shows a cyan bookmark where the chevron would be.
export default function EventRow({ event, isSaved = false }) {
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const time = formatLocalTime(event.localTime)
  const zone = getTimeZoneLabel(event)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  const awayLabel = getTeamShortName(awayTeamName)
  // Nicknames are short and never give up space; long unrecognized names
  // (raw Ticketmaster strings) share it with the away side instead.
  const homeKeepsWidth = Boolean(awayTeamName) && homeLabel.length <= 12
  const a11y = [
    awayTeamName ? `${homeLabel} vs ${awayLabel}` : homeLabel,
    time ? `${time.label}${zone ? ` ${zone}` : ''}` : 'time to be announced',
    event.league,
    event.venue,
    isSaved ? 'saved' : null,
  ].filter(Boolean).join(', ')

  return (
    <Pressable
      onPress={() => openEvent(event)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      className="flex-row items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5 active:bg-night-800"
    >
      <View className="w-11 items-center">
        <Txt className="font-display text-[11px] uppercase tracking-[1.1px] text-radar-400">
          {time ? time.time : 'TBD'}
        </Txt>
        <Txt className="mt-0.5 font-sans-semibold text-[9px] tracking-[0.7px] text-ink-500">
          {time ? [time.period, zone].filter(Boolean).join(' ') : 'TIME'}
        </Txt>
      </View>

      <View className="w-px self-stretch bg-white/[.07]" />

      <View className="min-w-0 flex-1">
        <View className="min-w-0 flex-row items-center gap-[7px]">
          <TeamLogo name={homeTeamName} size={22} />
          <Txt
            numberOfLines={1}
            className={`font-sans-semibold text-sm text-white ${homeKeepsWidth ? 'shrink-0' : 'min-w-0 shrink'}`}
          >
            {homeLabel}
          </Txt>
          {awayTeamName ? (
            <>
              <Txt className="text-[11px] text-ink-500">vs</Txt>
              <TeamLogo name={awayTeamName} size={18} style={{ opacity: 0.8 }} />
              <Txt numberOfLines={1} className="min-w-0 shrink text-xs text-ink-400">{awayLabel}</Txt>
            </>
          ) : null}
        </View>
        <View className="mt-[5px] min-w-0 flex-row items-center gap-[7px]">
          {event.league ? (
            <Txt className="font-display text-[11px] uppercase tracking-[1.5px] text-ink-400">{event.league}</Txt>
          ) : null}
          <Txt numberOfLines={1} className="min-w-0 shrink text-[11px] text-ink-500">{event.venue}</Txt>
        </View>
      </View>

      {isSaved ? (
        <BookmarkIcon filled strokeWidth={1.5} size={16} color={colors.radar[400]} />
      ) : (
        <ChevronRightIcon size={16} color={colors.ink[600]} />
      )}
    </Pressable>
  )
}
