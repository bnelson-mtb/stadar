import { Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import useCountdown from '@stadar/shared/hooks/useCountdown.js'
import {
  formatLocalTime,
  getDayLabel,
  getEventStart,
  getStartTerm,
  getTeamHeroColor,
  getTeamShortName,
} from '@stadar/shared/utils/eventDisplay.js'
import { angle } from '../lib/gradient.js'
import { openEvent } from '../lib/nav.js'
import { colors } from '../theme.js'
import Blip from './Blip.jsx'
import { CountdownDigits, LivePill } from './common.jsx'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { BookmarkIcon } from './icons.jsx'

function MicroLabel({ children }) {
  return (
    <Txt className="font-sans-semibold text-[10px] uppercase tracking-[1.8px] text-ink-400">{children}</Txt>
  )
}

function HeroCountdown({ event }) {
  const countdown = useCountdown(getEventStart(event))
  const term = getStartTerm(event.sport)

  if (countdown?.isLive) {
    return (
      <View>
        <MicroLabel>Happening now</MicroLabel>
        <View className="mt-2"><LivePill large /></View>
      </View>
    )
  }
  if (countdown && !countdown.isPast) {
    return (
      <View>
        <MicroLabel>{term.countdown}</MicroLabel>
        <View className="mt-1"><CountdownDigits countdown={countdown} size="hero" /></View>
      </View>
    )
  }
  return (
    <View>
      <MicroLabel>{term.label}</MicroLabel>
      <Txt className="mt-1 font-display text-[26px] leading-[30px] text-ink-200">
        {formatLocalTime(event.localTime)?.label ?? 'Time TBD'}
      </Txt>
    </View>
  )
}

// A soft cyan glow in the top-right corner of a card.
export function CornerGlow({ size = 170, offset = -42, opacity = 0.16 }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: offset, top: offset, width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#2ed3f2" stopOpacity={opacity} />
            <Stop offset="0.7" stopColor="#2ed3f2" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill="url(#glow)" />
      </Svg>
    </View>
  )
}

// Discover's lead card: the next game (followed teams first) with a live
// countdown. The card opens the event; save and tickets are separate buttons.
export default function NextUpHero({ event, isSaved, onToggleSave, onOpenTickets }) {
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  const awayLabel = getTeamShortName(awayTeamName)
  const dayLabel = getDayLabel(event.localDate, { localTime: event.localTime })
  const eyebrow = dayLabel === 'Tonight' || dayLabel === 'Today' ? `Next up ${dayLabel}` : `Next up · ${dayLabel}`
  const meta = [event.league, event.venue].filter(Boolean).join(' · ')
  const heroColor = getTeamHeroColor(event.homeTeam)

  return (
    <View className="overflow-hidden rounded-[18px] border border-radar-400/[.18]">
      <LinearGradient
        colors={[heroColor, '#101722', '#0b0f16']}
        locations={[0, 0.62, 1]}
        {...angle(155)}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />
      <CornerGlow />
      {/* The whole card opens the event; save and tickets sit above it as
          separate buttons (nesting them would hide them from TalkBack). */}
      <Pressable
        onPress={() => openEvent(event)}
        accessibilityRole="button"
        accessibilityLabel={`${awayLabel ? `${homeLabel} vs ${awayLabel}` : homeLabel}, ${dayLabel}. Open event`}
        className="absolute bottom-0 left-0 right-0 top-0 active:bg-white/[.03]"
      />
      <View pointerEvents="box-none" className="p-[18px]">
        <View pointerEvents="none" className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-1.5">
            <Blip size={6} />
            <Txt className="font-display text-[11px] uppercase tracking-[2.2px] text-radar-400">{eyebrow}</Txt>
          </View>
          <Txt numberOfLines={1} className="min-w-0 shrink font-sans-medium text-[11px] tracking-[0.6px] text-ink-400">
            {meta}
          </Txt>
        </View>

        <View pointerEvents="none" className="mt-4 flex-row items-center gap-3.5">
          <TeamLogo name={homeTeamName} size={56} />
          <View className="min-w-0 flex-1">
            <Txt className="font-display text-[30px] uppercase leading-[33px] text-white">{homeLabel}</Txt>
            {awayLabel ? (
              <Txt className="font-display text-[30px] uppercase leading-[33px] text-ink-500">vs {awayLabel}</Txt>
            ) : null}
          </View>
          {awayTeamName ? <TeamLogo name={awayTeamName} size={40} style={{ opacity: 0.85 }} /> : null}
        </View>

        <View pointerEvents="box-none" className="mt-[18px] flex-row items-end justify-between gap-3">
          <View pointerEvents="none">
            <HeroCountdown event={event} />
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onToggleSave(event)}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save event'}
              accessibilityState={{ selected: isSaved }}
              hitSlop={4}
              className="h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.06] active:bg-white/10"
            >
              <BookmarkIcon
                filled={isSaved}
                strokeWidth={1.5}
                size={18}
                color={isSaved ? colors.radar[400] : colors.ink[100]}
              />
            </Pressable>
            <Pressable
              onPress={onOpenTickets}
              accessibilityRole="button"
              className="h-10 justify-center rounded-xl bg-radar-400 px-4 active:bg-radar-500"
            >
              <Txt className="font-sans-bold text-[13px] tracking-[0.3px] text-night-950">Tickets</Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
