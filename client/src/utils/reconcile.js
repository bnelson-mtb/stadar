// Union of two favorite-team lists, preserving local order first. Favorites
// are a set of canonical team names, so a plain de-duplicated union is correct.
export function mergeFavorites(local, remote) {
  return [...new Set([...local, ...remote])]
}
