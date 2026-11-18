import { useSyncExternalStore } from 'react'
import { favoritesStore } from '../utils/collections.js'
import { setFavorite } from '../utils/reconcile.js'

// Followed teams. Every caller reads the same app-wide collection, so pages
// never disagree and nothing is refetched on navigation.
export default function useFavorites() {
  const { items: favorites, status: syncStatus } = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
  )

  function toggleFavorite(teamName) {
    // Follow vs unfollow is decided from what is on screen at the tap, so a
    // tap made before the account's teams have loaded still means what the
    // user saw (replaying a plain "toggle" on the loaded set could invert it).
    const follow = !favoritesStore.getSnapshot().items.includes(teamName)
    favoritesStore.mutate(list => setFavorite(list, teamName, follow))
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite, syncStatus }
}
