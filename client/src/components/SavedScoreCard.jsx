import { Link } from 'react-router-dom'
import { getCanonicalTeamName } from '../data/teams'
import { formatLongDate, getTeamShortName } from '../utils/eventDisplay.js'
import { getWinnerSide } from '../utils/savedHelpers.js'
import TeamLogo from './TeamLogo.jsx'
import { PencilIcon } from './icons.jsx'

// A played saved game: the logged final score (winner in white), the note if
// there is one, and a way into the notes editor if there isn't.
function SavedScoreCard({ record, onEditNotes, backTo = '/saved?tab=past' }) {
  const { event, score, notes } = record
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)
  const winner = getWinnerSide(score)
  const hasScore = winner !== null
  const scoreColor = side => (winner === 'tie' || winner === side ? 'text-white' : 'text-ink-500')
  const footer = [formatLongDate(event.localDate), event.venue].filter(Boolean).join(' · ')
  const note = notes?.trim()
  const addLabel = awayTeamName && !hasScore ? '+ Add score & note' : '+ Add a note'

  return (
    <article className="rounded-[14px] border border-white/5 bg-night-900 p-3.5">
      <Link
        to={`/event/${event.id}`}
        state={{ event, backTo }}
        className="flex min-w-0 items-center gap-2.5 transition-opacity duration-150 hover:opacity-85"
      >
        <TeamLogo name={homeTeamName} size={26} />
        <span className="min-w-0 truncate text-[13px] font-semibold text-white">
          {getTeamShortName(homeTeamName) || event.name}
        </span>
        {awayTeamName && (hasScore ? (
          <span className="ml-auto flex flex-none items-center gap-2">
            <span className={`font-display text-[22px] leading-none ${scoreColor('home')}`}>{score.home}</span>
            <span className="text-xs text-ink-600" aria-hidden="true">—</span>
            <span className="sr-only">to</span>
            <span className={`font-display text-[22px] leading-none ${scoreColor('away')}`}>{score.away}</span>
            <TeamLogo name={awayTeamName} size={22} className="opacity-80" />
          </span>
        ) : (
          <span className="ml-auto flex min-w-0 items-center gap-2">
            <span className="flex-none text-[11px] text-ink-500">vs</span>
            <span className="min-w-0 truncate text-xs text-ink-400">{getTeamShortName(awayTeamName)}</span>
            <TeamLogo name={awayTeamName} size={22} className="opacity-80" />
          </span>
        ))}
      </Link>

      {note ? (
        <>
          <button
            type="button"
            onClick={onEditNotes}
            aria-label="Edit note"
            className="mt-2.5 flex w-full cursor-pointer gap-[9px] border-t border-white/[.06] pt-2.5 text-left"
          >
            <PencilIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-radar-400" />
            <span className="line-clamp-4 whitespace-pre-line text-xs leading-[1.55] text-ink-200 [text-wrap:pretty]">
              {note}
            </span>
          </button>
          <div className="mt-[9px] truncate text-[10px] uppercase tracking-[.08em] text-ink-500">{footer}</div>
        </>
      ) : (
        <div className="mt-[9px] flex min-w-0 items-center gap-[7px] text-[11px] text-ink-500">
          <button
            type="button"
            onClick={onEditNotes}
            className="inline-flex flex-none cursor-pointer items-center rounded-lg bg-white/5 px-2 py-1 text-ink-400 transition-colors duration-150 hover:text-ink-200"
          >
            {addLabel}
          </button>
          <span className="min-w-0 truncate">{footer}</span>
        </div>
      )}
    </article>
  )
}

export default SavedScoreCard
