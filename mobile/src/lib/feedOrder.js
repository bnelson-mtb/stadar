// Display order for Discover's sport and league filter chips (same lists as
// the web Discover page). Anything not listed sorts last.
export const SPORT_ORDER = [
  'Basketball', 'Football', 'Baseball', 'Softball', 'Volleyball', 'Soccer', 'Hockey', 'Lacrosse', 'Other',
]

export const LEAGUE_ORDER = [
  'NBA', 'WNBA', 'NFL', 'MLB', 'NHL', 'MLS', 'USL', 'Liga MX', 'International', 'PWHL', 'PLL',
  'NCAAM', 'NCAAW', 'NCAAF', 'NCAA Baseball', 'NCAA Softball', 'NCAA WVB', 'NCAA MVB', 'NCAA VB',
  "Women's Soccer", "Men's Soccer", 'NCAA Soccer', 'NWSL', 'LOVB', 'AHL', 'ECHL',
  'Triple-A', 'Double-A', 'High-A', 'Single-A', 'Other',
]

// Distinct non-empty values, ordered by `order`.
export function sortByOrder(values, order) {
  const rank = value => order.indexOf(value) + 1 || 99
  return [...new Set(values.filter(Boolean))].sort((a, b) => rank(a) - rank(b))
}

export function toggleArrayItem(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}
