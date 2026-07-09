import { SPORT_ICONS, LEAGUE_COLORS } from '../data/teams'

const idleChip =
  'bg-night-800 text-slate-400 border-white/10 hover:border-white/25 hover:text-slate-200'

export default function FilterBar({
  sports = [],
  leagues = [],
  selectedSports,
  onToggleSport,
  selectedLeagues,
  onToggleLeague,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  hasFavorites,
}) {
  return (
    <div className="space-y-3 mb-4">
      {hasFavorites && (
        <button
          onClick={onToggleFavoritesOnly}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border cursor-pointer ${
            showFavoritesOnly
              ? 'bg-rose-500 text-white border-transparent'
              : 'bg-night-800 text-slate-300 border-white/10 hover:border-white/25'
          }`}
        >
          {showFavoritesOnly ? '♥' : '♡'} My Teams
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {sports.map(sport => (
          <button
            key={sport}
            onClick={() => onToggleSport(sport)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
              selectedSports.includes(sport)
                ? 'bg-radar-400 text-night-950 border-transparent font-semibold'
                : idleChip
            }`}
          >
            {SPORT_ICONS[sport]} {sport}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {leagues.map(league => {
          const isSelected = selectedLeagues.includes(league)
          return (
            <button
              key={league}
              onClick={() => onToggleLeague(league)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                isSelected
                  ? `${LEAGUE_COLORS[league] || 'bg-gray-500'} text-white border-transparent`
                  : idleChip
              }`}
            >
              {league}
            </button>
          )
        })}
      </div>
    </div>
  )
}
