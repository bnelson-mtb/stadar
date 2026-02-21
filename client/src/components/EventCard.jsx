function EventCard({ event }) {
  const date = new Date(event.dateTime)

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const sportColors = {
    Basketball: 'bg-orange-500',
    Soccer: 'bg-green-500',
    Hockey: 'bg-blue-500',
    Football: 'bg-red-500',
    Lacrosse: 'bg-purple-500',
  }

  const badgeColor = sportColors[event.sport] || 'bg-gray-500'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {event.league}
            </span>
            <span className="text-xs text-gray-400">{event.sport}</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {event.homeTeam}
            <span className="text-gray-400 font-normal mx-2">vs</span>
            {event.awayTeam}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {event.venue}
            </span>
            <span className="text-gray-300">·</span>
            <span>{event.city}</span>
          </div>
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
