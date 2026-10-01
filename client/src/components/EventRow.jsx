import { Link } from 'react-router-dom'
import { getCanonicalTeamName } from '../data/teams'
import { formatLocalTime, getTeamShortName, getTimeZoneLabel } from '../utils/eventDisplay.js'
import TeamLogo from './TeamLogo.jsx'
import { BookmarkIcon, ChevronRightIcon } from './icons.jsx'

// Compact feed row: venue-local time, matchup, league and venue. A saved
// event shows a cyan bookmark where the chevron would be.
function EventRow({ event, isSaved = false, stateCode, backTo }) {
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const time = formatLocalTime(event.localTime)
  const zone = getTimeZoneLabel(event)
  const homeLabel = getTeamShortName(homeTeamName) || event.name
  // Nicknames are short and never give up space; long unrecognized names
  // (raw Ticketmaster strings) share it with the away side instead.
  const homeKeepsWidth = Boolean(awayTeamName) && homeLabel.length <= 12

  return (
    <Link
      to={`/event/${event.id}`}
      state={{ event, fromStateCode: stateCode, backTo }}
      className="press flex items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5"
    >
      <div className="w-11 flex-none text-center">
        <div className="font-display text-[11px] uppercase tracking-[.1em] text-radar-400">
          {time ? time.time : 'TBD'}
        </div>
        <div className="mt-0.5 text-[9px] font-semibold tracking-[.08em] text-ink-500">
          {time ? [time.period, zone].filter(Boolean).join(' ') : 'TIME'}
        </div>
      </div>

      <div className="w-px self-stretch bg-white/[.07]" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-[7px]">
          <TeamLogo name={homeTeamName} size={22} />
          <span className={`truncate text-sm font-semibold text-white ${homeKeepsWidth ? 'shrink-0' : 'min-w-0'}`}>
            {homeLabel}
          </span>
          {awayTeamName && (
            <>
              <span className="flex-none text-[11px] text-ink-500">vs</span>
              <TeamLogo name={awayTeamName} size={18} className="opacity-80" />
              <span className="min-w-0 truncate text-xs text-ink-400">{getTeamShortName(awayTeamName)}</span>
            </>
          )}
        </div>
        <div className="mt-[5px] flex min-w-0 items-center gap-[7px] text-[11px] text-ink-500">
          {event.league && (
            <span className="flex-none font-display uppercase tracking-[.14em] text-ink-400">{event.league}</span>
          )}
          <span className="min-w-0 truncate">{event.venue}</span>
        </div>
      </div>

      {isSaved ? (
        <BookmarkIcon filled strokeWidth={1.5} className="h-4 w-4 flex-none text-radar-400" />
      ) : (
        <ChevronRightIcon className="h-4 w-4 flex-none text-ink-600" />
      )}
      {isSaved && <span className="sr-only">Saved</span>}
    </Link>
  )
}

export default EventRow
