import { useParams, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import useFavorites from '../hooks/useFavorites.js'
import { getCanonicalTeamName } from '../data/teams.js'

export default function TeamSavedPage() {
  const { teamName } = useParams()
  const decodedTeam = decodeURIComponent(teamName)
  const navigate = useNavigate()
  const { savedEvents, removeSaved } = useSavedEvents()
  const { toggleFavorite, isFavorite } = useFavorites()

  const teamEvents = savedEvents
    .filter(r => {
      const home = getCanonicalTeamName(r.event.homeTeam)
      const away = r.event.awayTeam ? getCanonicalTeamName(r.event.awayTeam) : null
      return home === decodedTeam || away === decodedTeam
    })
    .sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime))

  return (
    <div className="min-h-screen bg-night-950 text-slate-200">
      <div className="bg-night-900/90 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/saved')}
            className="inline-flex cursor-pointer items-center rounded-lg border border-white/10 bg-night-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-night-700 hover:text-white"
          >
            ← Saved
          </button>
          <div className="flex items-center gap-2">
            <TeamLogo name={decodedTeam} size="large" />
            <h1 className="text-xl font-bold text-white">{decodedTeam}</h1>
          </div>
          <button
            onClick={() => toggleFavorite(decodedTeam)}
            className={`ml-auto cursor-pointer transition-colors ${isFavorite(decodedTeam) ? 'text-rose-500' : 'text-slate-600 hover:text-rose-400'}`}
            title={isFavorite(decodedTeam) ? `Unfollow ${decodedTeam}` : `Follow ${decodedTeam}`}
            aria-label={isFavorite(decodedTeam) ? `Unfollow ${decodedTeam}` : `Follow ${decodedTeam}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isFavorite(decodedTeam) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {teamEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">No saved events for {decodedTeam} yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teamEvents.map(r => (
              <EventCard
                key={r.event.id}
                event={r.event}
                isFavorite={isFavorite(getCanonicalTeamName(r.event.homeTeam))}
                onToggleFavorite={toggleFavorite}
                stateCode={r.event.state}
                isSavedEvent={true}
                onToggleSave={() => removeSaved(r.event.id)}
                backTo={`/saved/team/${encodeURIComponent(decodedTeam)}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
