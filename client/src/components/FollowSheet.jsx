import { useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import TeamLogo from './TeamLogo.jsx'
import { HeartIcon, SearchIcon } from './icons.jsx'

// "+ Follow" from the My Teams rail: every team playing in the current feed,
// each with a follow toggle. Followed teams stay in the list (toggled on) so
// the row doesn't jump away under the user's thumb.
function FollowSheet({ open, onClose, teams, isFavorite, onToggleFavorite, stateName }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visibleTeams = needle ? teams.filter(team => team.toLowerCase().includes(needle)) : teams

  function handleClose() {
    setQuery('')
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="Follow teams"
      subtitle={`Teams with upcoming games in ${stateName}`}
    >
      {teams.length > 8 && (
        <div className="relative mb-3">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Find a team"
            aria-label="Find a team"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/[.08] bg-night-800 pl-10 pr-3 text-base text-ink-100 placeholder:text-ink-500 focus:border-radar-400/50 focus:outline-none sm:text-sm"
          />
        </div>
      )}

      {visibleTeams.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">
          {teams.length === 0 ? 'No upcoming games loaded yet.' : 'No teams match that search.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleTeams.map(team => {
            const following = isFavorite(team)
            return (
              <li key={team}>
                <button
                  type="button"
                  aria-pressed={following}
                  onClick={() => onToggleFavorite(team)}
                  className="press flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-white/[.06] bg-night-800 px-3.5 py-2.5 text-left"
                >
                  <TeamLogo name={team} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{team}</span>
                  <span
                    className={`inline-flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      following
                        ? 'border-radar-400/35 bg-radar-400/[.14] text-radar-400'
                        : 'border-white/10 bg-white/[.06] text-ink-200'
                    }`}
                  >
                    <HeartIcon filled={following} strokeWidth={2} className="h-3.5 w-3.5" />
                    {following ? 'Following' : 'Follow'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </BottomSheet>
  )
}

export default FollowSheet
