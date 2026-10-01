import { SearchIcon, XMarkIcon } from './icons.jsx'

function GroupLabel({ children }) {
  return (
    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-ink-500">{children}</p>
  )
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ${
        selected
          ? 'border-transparent bg-radar-400 font-semibold text-night-950'
          : 'border-white/[.08] bg-night-800 font-medium text-ink-200 hover:border-white/20 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

// Search, "my teams only" and the sport/league chips. Lives in Discover's
// filter sheet, out of the main scroll.
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
  searchQuery,
  onSearchChange,
}) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search teams, cities, venues..."
          aria-label="Search teams, cities, or venues"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-white/[.08] bg-night-800 pl-10 pr-10 text-base text-ink-100 placeholder:text-ink-500 focus:border-radar-400/50 focus:outline-none sm:text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center text-ink-500 hover:text-ink-200"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasFavorites && (
        <div>
          <GroupLabel>My teams</GroupLabel>
          <button
            type="button"
            role="switch"
            aria-checked={showFavoritesOnly}
            onClick={onToggleFavoritesOnly}
            className="press flex w-full cursor-pointer items-center justify-between gap-4 rounded-[14px] border border-white/[.06] bg-night-800 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-ink-100">Only games with teams I follow</span>
            <span
              aria-hidden="true"
              className={`relative h-6 w-10 flex-none rounded-full transition-colors duration-150 ${
                showFavoritesOnly ? 'bg-radar-400' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-150 ${
                  showFavoritesOnly ? 'left-5 bg-night-950' : 'left-1 bg-ink-400'
                }`}
              />
            </span>
          </button>
        </div>
      )}

      {sports.length > 0 && (
        <div>
          <GroupLabel>Sport</GroupLabel>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => (
              <Chip key={sport} selected={selectedSports.includes(sport)} onClick={() => onToggleSport(sport)}>
                {sport}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {leagues.length > 0 && (
        <div>
          <GroupLabel>League</GroupLabel>
          <div className="flex flex-wrap gap-2">
            {leagues.map(league => (
              <Chip key={league} selected={selectedLeagues.includes(league)} onClick={() => onToggleLeague(league)}>
                {league}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
