import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import UnsaveConfirmDialog from '../components/UnsaveConfirmDialog.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import useFavorites from '../hooks/useFavorites.js'
import { partitionByTime, groupSavedByTeam } from '../utils/savedHelpers.js'
import { getCanonicalTeamName } from '../data/teams.js'

export default function SavedPage() {
  const {
    savedEvents,
    requestRemove,
    pendingRemoval,
    cancelRemove,
    confirmRemove,
  } = useSavedEvents()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const navigate = useNavigate()
  const [pastExpanded, setPastExpanded] = useState(false)
  const mainRef = useRef(null)

  const { upcoming, past } = partitionByTime(savedEvents)
  const teamMap = groupSavedByTeam(savedEvents, favorites)

  return (
    <div className="min-h-screen bg-night-950 text-slate-200">
      <header className="relative overflow-hidden bg-night-900 border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_140%_at_50%_-20%,rgba(163,230,53,0.12),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-4 py-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.18em] text-white leading-none">Saved</h1>
        </div>
      </header>

      <main ref={mainRef} tabIndex={-1} className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-radar-400 uppercase tracking-[0.2em] mb-3">
            Upcoming
            <span className="flex-1 h-px bg-white/10" />
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-slate-500 text-sm">No upcoming saved events.</p>
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
                  onToggleSave={() => requestRemove(r.event)}
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
              className="flex items-center gap-2 font-display text-sm font-semibold text-radar-400 uppercase tracking-[0.2em] mb-3 w-full text-left cursor-pointer"
            >
              <span>Past</span>
              <svg
                className={`w-4 h-4 transition-transform ${pastExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              <span className="flex-1 h-px bg-white/10" />
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
                    onToggleSave={() => requestRemove(r.event)}
                    backTo="/saved"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Your Teams */}
        <section>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-radar-400 uppercase tracking-[0.2em] mb-3">
            Your Teams
            <span className="flex-1 h-px bg-white/10" />
          </h2>
          {favorites.length === 0 ? (
            <p className="text-slate-500 text-sm">Follow teams on the Discover page to see them here.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {favorites.map(team => (
                <button
                  key={team}
                  onClick={() => navigate(`/saved/team/${encodeURIComponent(team)}`)}
                  className="flex items-center gap-2 bg-night-800 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-radar-400/30 hover:bg-night-700/70 transition-colors"
                >
                  <TeamLogo name={team} />
                  <span className="font-medium text-slate-200">{team}</span>
                  {teamMap[team]?.length > 0 && (
                    <span className="ml-1 text-xs bg-radar-400/15 text-radar-300 rounded-full px-2 py-0.5">
                      {teamMap[team].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <UnsaveConfirmDialog
        event={pendingRemoval}
        focusFallbackRef={mainRef}
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  )
}
