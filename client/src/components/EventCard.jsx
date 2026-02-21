const sportIcons = {
  Basketball: '\u{1F3C0}',
  Soccer: '\u26BD',
  Hockey: '\u{1F3D2}',
  Football: '\u{1F3C8}',
  Lacrosse: '\u{1F94D}',
  Volleyball: '\u{1F3D0}',
}

const teamColors = {
  'Utah Jazz':                '#002B5C',
  'Real Salt Lake':           '#B30838',
  "Utah Men's Basketball":    '#CC0000',
  "Utah Women's Basketball":  '#CC0000',
  'Utah Mammoth':             '#1C4F3F',
  'Utah Archers':             '#1C4F3F',
  'Utah Grizzlies':           '#002244',
  'LOVB Salt Lake Volleyball':'#E91E63',
}

function TeamLogo({ name }) {
  if (!name) return null
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 3)
  const bg = teamColors[name] || '#6B7280'

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

const leagueColors = {
  NBA: 'bg-orange-500',
  MLS: 'bg-green-500',
  NHL: 'bg-blue-500',
  NFL: 'bg-red-500',
  College: 'bg-sky-500',
  'Minor League': 'bg-slate-500',
  NLL: 'bg-emerald-600',
}

function EventCard({ event }) {
  const date = new Date(event.dateTime)

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const badgeColor = leagueColors[event.league] || 'bg-gray-500'
  const borderColor = teamColors[event.homeTeam] || '#6B7280'
  const icon = sportIcons[event.sport] || ''

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
