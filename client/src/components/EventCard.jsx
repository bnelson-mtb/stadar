import { useState } from 'react'
import TEAMS, { SPORT_ICONS, LEAGUE_COLORS } from '../data/teams'

function TeamLogo({ name }) {
  const [imgError, setImgError] = useState(false)
  if (!name) return null

  const team = TEAMS[name]
  const bg = team?.color || '#6B7280'
  const logoUrl = team?.logo

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 3)
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  )
}

function EventCard({ event, isFavorite, onToggleFavorite }) {
  const date = new Date(event.dateTime)

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const badgeColor = LEAGUE_COLORS[event.league] || 'bg-gray-500'
  const borderColor = TEAMS[event.homeTeam]?.color || '#6B7280'
  const icon = SPORT_ICONS[event.sport] || ''

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {event.league}
            </span>
            <span className="text-sm">{icon}</span>
            <span className="text-xs text-gray-400">{event.sport}</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <TeamLogo name={event.homeTeam} />
            <span className="text-lg font-bold text-gray-900">{event.homeTeam}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(event.homeTeam) }}
              className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
              title={isFavorite ? `Unfollow ${event.homeTeam}` : `Follow ${event.homeTeam}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
          </div>
          {event.awayTeam && (
            <div className="flex items-center gap-2">
              <TeamLogo name={event.awayTeam} />
              <span className="text-base text-gray-600">{event.awayTeam}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {event.venue}
            </span>
            <span className="text-gray-300">&middot;</span>
            <span>{event.city}, {event.state}</span>
          </div>

          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Get Tickets &rarr;
            </a>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-medium text-gray-400 uppercase">{dayOfWeek}</div>
          <div className="text-lg font-bold text-gray-900">{monthDay}</div>
          <div className="text-sm text-gray-500">{time}</div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
