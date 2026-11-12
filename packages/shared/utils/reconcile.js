// Union of two favorite-team lists, preserving local order first. Favorites
// are a set of canonical team names, so a plain de-duplicated union is correct.
export function mergeFavorites(local, remote) {
  return [...new Set([...local, ...remote])]
}

// Union of two saved-record lists by event.id, keeping the LOCAL record on a
// collision (import intent is to bring local data into a fresh account). Local
// order first, then remote-only records appended.
export function mergeSavedRecords(local, remote) {
  const localIds = new Set(local.map(r => r.event.id))
  return [...local, ...remote.filter(r => !localIds.has(r.event.id))]
}
