import { Link } from 'react-router-dom'
import { getCanonicalTeamName } from '../data/teams'
import useCountdown from '../hooks/useCountdown.js'
import { formatCountdown } from '../utils/countdown.js'
import {
  formatLocalTime,
  getDayLabel,
  getEventStart,
  getStartTerm,
  getTeamShortName,
} from '../utils/eventDisplay.js'
import { LivePill } from './Countdown.jsx'
import TeamLogo from './TeamLogo.jsx'

// An upcoming saved game with a live countdown on the right. `highlight`
// marks the soonest one with the cyan wash.
function SavedEventRow({ record, highlight = false, backTo = '/saved' }) {
  const { event } = record
  const countdown = useCountdown(getEventStart(event))
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  const title = awayTeamName ? `${homeLabel} vs ${getTeamShortName(awayTeamName)}` : homeLabel
  const when = [
    getDayLabel(event.localDate, { localTime: event.localTime }),
    formatLocalTime(event.localTime)?.label,
  ].filter(Boolean).join(' ')
  const meta = [when, event.venue].filter(Boolean).join(' · ')

  let right
  if (countdown?.isLive) {
    right = <LivePill />
  } else if (countdown && !countdown.isPast) {
    right = (
      <>
        <div className={`font-display text-[17px] leading-none ${highlight ? 'text-radar-400' : 'text-ink-200'}`}>
          {formatCountdown(countdown, { pad: false })}
        </div>
        <div className="mt-[3px] text-[10px] text-ink-500">{getStartTerm(event.sport).caption}</div>
      </>
    )
  } else {
    right = (
      <>
        <div className="font-display text-[17px] leading-none text-ink-200">TBD</div>
        <div className="mt-[3px] text-[10px] text-ink-500">start time</div>
      </>
    )
  }

  return (
    <Link
      to={`/event/${event.id}`}
      state={{ event, backTo }}
      className={`press flex items-center gap-3 rounded-[14px] border p-3.5 ${
        highlight
          ? 'border-radar-400/[.22] bg-[linear-gradient(120deg,rgba(46,211,242,.1),#0d1219_55%)]'
          : 'border-white/5 bg-night-900'
      }`}
    >
      <TeamLogo name={homeTeamName} size={34} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{title}</div>
        <div className="mt-[3px] truncate text-[11px] text-ink-400">{meta}</div>
      </div>
      <div className="flex-none text-right">{right}</div>
    </Link>
  )
}

export default SavedEventRow
