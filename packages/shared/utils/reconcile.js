// Union of two favorite-team lists, preserving local order first. Favorites
// are a set of canonical team names, so a plain de-duplicated union is correct.
export function mergeFavorites(local, remote) {
  return [...new Set([...local, ...remote])]
}

// Follow or unfollow one team. Returns the same list when it already is that
// way, so it is safe to replay on a list other than the one the tap was made on.
export function setFavorite(list, teamName, follow) {
  if (list.includes(teamName) === follow) return list
  return follow ? [...list, teamName] : list.filter(team => team !== teamName)
}

// Union of two saved-record lists by event.id, keeping the LOCAL record on a
// collision (import intent is to bring local data into a fresh account). Local
// order first, then remote-only records appended.
export function mergeSavedRecords(local, remote) {
  const localIds = new Set(local.map(r => r.event.id))
  return [...local, ...remote.filter(r => !localIds.has(r.event.id))]
}
