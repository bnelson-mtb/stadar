import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import useFavorites from '../hooks/useFavorites.js'
import { partitionByTime, groupSavedByTeam } from '../utils/savedHelpers.js'
import { getCanonicalTeamName } from '../data/teams.js'

export default function SavedPage() {
  const { savedEvents, removeSaved } = useSavedEvents()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const navigate = useNavigate()
  const [pastExpanded, setPastExpanded] = useState(false)

  const { upcoming, past } = partitionByTime(savedEvents)
  const teamMap = groupSavedByTeam(savedEvents, favorites)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Saved</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming saved events.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(r => (
                <EventCard
                  key={r.event.id}
                  event={r.event}
                  isFavorite={isFavorite(getCanonicalTeamName(r.event.homeTeam))}
                  onToggleFavorite={toggleFavorite}
                  stateCode={r.event.state}
                  isSavedEvent={true}
                  onToggleSave={() => removeSaved(r.event.id)}
                  backTo="/saved"
                />
              ))}
            </div>
          )}
        </section>

        {/* Past (collapsible) */}
        {past.length > 0 && (
          <section>
            <button
              onClick={() => setPastExpanded(prev => !prev)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3 w-full text-left"
            >
              <span>Past</span>
              <svg
                className={`w-4 h-4 transition-transform ${pastExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {pastExpanded && (
              <div className="flex flex-col gap-3">
                {past.map(r => (
                  <EventCard
                    key={r.event.id}
                    event={r.event}
                    isFavorite={isFavorite(getCanonicalTeamName(r.event.homeTeam))}
                    onToggleFavorite={toggleFavorite}
                    stateCode={r.event.state}
                    isSavedEvent={true}
                    onToggleSave={() => removeSaved(r.event.id)}
                    backTo="/saved"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Your Teams */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Teams</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400 text-sm">Follow teams on the Discover page to see them here.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {favorites.map(team => (
                <button
                  key={team}
                  onClick={() => navigate(`/saved/team/${encodeURIComponent(team)}`)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <TeamLogo name={team} />
                  <span className="font-medium text-gray-800">{team}</span>
                  {teamMap[team]?.length > 0 && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                      {teamMap[team].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
