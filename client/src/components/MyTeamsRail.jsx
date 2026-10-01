import { Link } from 'react-router-dom'
import { getDayLabel, getTeamShortName, isToday } from '../utils/eventDisplay.js'
import { getNextGameForTeam } from '../utils/feedFilters.js'
import TeamLogo from './TeamLogo.jsx'
import { PlusIcon } from './icons.jsx'

function TeamTile({ team, nextGame, selected, onSelect }) {
  const playsToday = Boolean(nextGame) && isToday(nextGame.localDate)
  const label = nextGame
    ? getDayLabel(nextGame.localDate, { localTime: nextGame.localTime })
    : 'No games'

  let tileStyle = 'border-white/[.06] bg-night-900'
  if (playsToday) tileStyle = 'border-radar-400/30 bg-night-800'
  if (selected) tileStyle = 'border-radar-400 bg-radar-400/10'

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(team)}
      title={selected ? 'Show all games' : `Show ${team} games`}
      className={`press flex w-[76px] flex-none cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border px-2 py-[11px] ${tileStyle}`}
    >
      <TeamLogo name={team} size={30} />
      <span className="w-full truncate text-center text-[10px] font-semibold text-ink-100">
        {getTeamShortName(team)}
      </span>
      <span
        className={
          playsToday
            ? 'text-[9px] font-semibold uppercase tracking-[.08em] text-radar-400'
            : 'text-[9px] font-medium tracking-[.06em] text-ink-500'
        }
      >
        {label}
      </span>
    </button>
  )
}

// Followed teams with each one's next game in the feed. Tapping a tile filters
// the list to that team; tapping it again clears the filter.
function MyTeamsRail({ favorites, events, selectedTeam, onSelectTeam, onFollow }) {
  return (
    <section aria-labelledby="my-teams-heading">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 id="my-teams-heading" className="font-display text-xs uppercase tracking-[.2em] text-ink-400">
          My teams
        </h2>
        <Link to="/teams" className="text-[11px] font-medium text-radar-400 hover:text-radar-300">
          Manage
        </Link>
      </div>

      <div className="no-scrollbar -mx-[18px] flex gap-2.5 overflow-x-auto px-[18px]">
        {favorites.map(team => (
          <TeamTile
            key={team}
            team={team}
            nextGame={getNextGameForTeam(events, team)}
            selected={selectedTeam === team}
            onSelect={onSelectTeam}
          />
        ))}

        <button
          type="button"
          onClick={onFollow}
          className="flex min-h-[86px] w-[76px] flex-none cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[14px] border border-dashed border-white/[.12] text-ink-500 transition-colors duration-150 hover:border-white/25 hover:text-ink-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-[.06em]">Follow</span>
        </button>

        {favorites.length === 0 && (
          <p className="max-w-[210px] self-center text-xs leading-relaxed text-ink-500">
            Follow teams to see their next game here.
          </p>
        )}
      </div>
    </section>
  )
}

export default MyTeamsRail
