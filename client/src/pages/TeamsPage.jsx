import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import { ChevronRightIcon } from '../components/icons.jsx'
import useFavorites from '../hooks/useFavorites.js'
import useGames from '../hooks/useGames.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '../data/teams'
import { getStateName, readStoredStateCode } from '../data/usStates.js'
import { getDayLabel, getTeamShortName, isToday } from '../utils/eventDisplay.js'
import { getNextGameForTeam } from '../utils/feedFilters.js'
import { getOpponentName, groupSavedByTeam } from '../utils/savedHelpers.js'

function nextGameLabel(game, teamName) {
  const day = getDayLabel(game.localDate, { localTime: game.localTime })
  const opponent = getOpponentName(game, teamName)
  if (!opponent) return day
  const side = getCanonicalTeamName(game.homeTeam) === teamName ? 'vs' : 'at'
  return `${day} ${side} ${getTeamShortName(opponent)}`
}

// Followed teams: each one's next game (from the selected state's feed and
// saved games) and how many of its games are saved.
export default function TeamsPage() {
  const { favorites } = useFavorites()
  const { savedEvents } = useSavedEvents()
  const [stateCode] = useState(readStoredStateCode)
  const { events, loading } = useGames(favorites.length > 0 ? stateCode : null)

  const savedByTeam = groupSavedByTeam(savedEvents, favorites)
  const knownGames = useMemo(
    () => [...events, ...savedEvents.map(record => record.event)],
    [events, savedEvents]
  )

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header className="mx-auto max-w-xl px-[18px] pb-3 pt-[18px]">
        <h1 className="font-display text-[30px] uppercase leading-none text-white">Teams</h1>
        <p className="mt-1.5 text-xs text-ink-400">
          {favorites.length} followed{favorites.length > 0 ? ` · schedules for ${getStateName(stateCode)}` : ''}
        </p>
      </header>

      <main className="mx-auto max-w-xl px-[18px] pb-6 pt-1.5">
        {favorites.length === 0 ? (
          <EmptyState title="No teams yet" body="Follow teams on the Discover page to see them here.">
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-xl bg-radar-400 px-5 text-[13px] font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
            >
              Find teams
            </Link>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {favorites.map(team => {
              const nextGame = getNextGameForTeam(knownGames, team)
              const playsToday = Boolean(nextGame) && isToday(nextGame.localDate)
              let label = `No games on the radar in ${getStateName(stateCode)}`
              if (nextGame) label = nextGameLabel(nextGame, team)
              else if (loading) label = 'Checking the schedule...'
              const savedCount = savedByTeam[team]?.length ?? 0

              return (
                <li key={team}>
                  <Link
                    to={`/saved/team/${encodeURIComponent(team)}`}
                    state={{ backTo: '/teams' }}
                    className="press flex items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5"
                  >
                    <TeamLogo name={team} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{team}</div>
                      <div
                        className={`mt-[3px] truncate text-[11px] ${
                          playsToday ? 'font-semibold text-radar-400' : 'text-ink-400'
                        }`}
                      >
                        {label}
                      </div>
                    </div>
                    <div className="flex-none text-right">
                      <div className="font-display text-[17px] leading-none text-ink-200">{savedCount}</div>
                      <div className="mt-[3px] text-[10px] text-ink-500">saved</div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 flex-none text-ink-600" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
