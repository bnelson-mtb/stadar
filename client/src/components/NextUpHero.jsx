import { Link } from 'react-router-dom'
import { getCanonicalTeamName } from '../data/teams'
import useCountdown from '../hooks/useCountdown.js'
import {
  formatLocalTime,
  getDayLabel,
  getEventStart,
  getStartTerm,
  getTeamHeroColor,
  getTeamShortName,
} from '../utils/eventDisplay.js'
import { CountdownDigits, LivePill } from './Countdown.jsx'
import TeamLogo from './TeamLogo.jsx'
import { BookmarkIcon } from './icons.jsx'

function MicroLabel({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-ink-400">{children}</div>
  )
}

function HeroCountdown({ event }) {
  const countdown = useCountdown(getEventStart(event))
  const term = getStartTerm(event.sport)

  if (countdown?.isLive) {
    return (
      <div>
        <MicroLabel>Happening now</MicroLabel>
        <div className="mt-2"><LivePill large /></div>
      </div>
    )
  }

  if (countdown && !countdown.isPast) {
    return (
      <div>
        <MicroLabel>{term.countdown}</MicroLabel>
        <div className="mt-1"><CountdownDigits countdown={countdown} size="hero" /></div>
      </div>
    )
  }

  return (
    <div>
      <MicroLabel>{term.label}</MicroLabel>
      <div className="mt-1 font-display text-[26px] leading-none text-ink-200">
        {formatLocalTime(event.localTime)?.label ?? 'Time TBD'}
      </div>
    </div>
  )
}

// Discover's lead card: the next game (followed teams first) with a live
// countdown. The whole card opens the event; save and tickets sit above the
// stretched link so they stay separately clickable.
function NextUpHero({ event, stateCode, isSaved, onToggleSave, onOpenTickets }) {
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  const awayLabel = getTeamShortName(awayTeamName)
  const dayLabel = getDayLabel(event.localDate, { localTime: event.localTime })
  const eyebrow = dayLabel === 'Tonight' || dayLabel === 'Today'
    ? `Next up ${dayLabel}`
    : `Next up · ${dayLabel}`
  const meta = [event.league, event.venue].filter(Boolean).join(' · ')
  const heroColor = getTeamHeroColor(event.homeTeam)

  return (
    <article
      className="press relative overflow-hidden rounded-[18px] border border-radar-400/[.18] p-[18px]"
      style={{ background: `linear-gradient(155deg, ${heroColor} 0%, #101722 62%, #0b0f16 100%)` }}
    >
      <div
        className="pointer-events-none absolute -right-[42px] -top-[42px] h-[170px] w-[170px] rounded-full bg-[radial-gradient(circle,rgba(46,211,242,.16),transparent_70%)]"
        aria-hidden="true"
      />
      <Link
        to={`/event/${event.id}`}
        state={{ event, fromStateCode: stateCode }}
        className="absolute inset-0 z-[1] rounded-[18px] focus-visible:outline-2 focus-visible:outline-radar-400"
        aria-label={`${awayLabel ? `${homeLabel} vs ${awayLabel}` : homeLabel}, ${dayLabel}. Open event`}
      />

      <div className="pointer-events-none relative z-[2]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex flex-none items-center gap-1.5 font-display text-[11px] uppercase tracking-[.2em] text-radar-400">
            <span className="radar-blip h-1.5 w-1.5 rounded-full bg-radar-400" aria-hidden="true" />
            {eyebrow}
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium tracking-[.06em] text-ink-400">{meta}</span>
        </div>

        <div className="mt-4 flex items-center gap-3.5">
          <TeamLogo name={homeTeamName} size={56} />
          <div className="min-w-0 font-display text-[30px] uppercase leading-[.94] [overflow-wrap:anywhere]">
            <div className="text-white">{homeLabel}</div>
            {awayLabel && <div className="text-ink-500">vs {awayLabel}</div>}
          </div>
          {awayTeamName && (
            <TeamLogo name={awayTeamName} size={40} className="ml-auto opacity-85" />
          )}
        </div>

        <div className="mt-[18px] flex items-end justify-between gap-3">
          <HeroCountdown event={event} />
          <div className="pointer-events-auto flex flex-none gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(event)}
              aria-label={isSaved ? 'Remove from saved' : 'Save event'}
              aria-pressed={isSaved}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/[.08] bg-white/[.06] transition-colors duration-150 hover:bg-white/10 ${
                isSaved ? 'text-radar-400' : 'text-ink-100'
              }`}
            >
              <BookmarkIcon filled={isSaved} strokeWidth={1.5} className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={onOpenTickets}
              className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-radar-400 px-4 text-[13px] font-bold tracking-[.02em] text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
            >
              Tickets
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default NextUpHero
