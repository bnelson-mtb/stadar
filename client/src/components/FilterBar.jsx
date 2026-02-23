import { SPORT_ICONS, LEAGUE_COLORS } from '../data/teams'

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
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            showFavoritesOnly
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          {showFavoritesOnly ? '\u2665' : '\u2661'} My Teams
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {sports.map(sport => (
          <button
            key={sport}
            onClick={() => onToggleSport(sport)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedSports.includes(sport)
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? `${LEAGUE_COLORS[league] || 'bg-gray-500'} text-white`
                  : 'bg-white text-gray-500 border border-gray-200'
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
