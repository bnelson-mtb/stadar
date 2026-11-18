// The app's two synced collections. One instance each, shared by every page
// (see syncedCollection.js for why there must be only one copy).
import { createLocalStorageAdapter } from './storageAdapter.js'
import { createSyncedCollection } from './syncedCollection.js'
import { mergeFavorites, mergeSavedRecords } from './reconcile.js'
import { normalizeSavedRecords } from './savedEventRecords.js'

const localAdapter = createLocalStorageAdapter()

export const favoritesStore = createSyncedCollection({
  key: 'stadar-favorites',
  localAdapter,
  merge: mergeFavorites,
})

export const savedEventsStore = createSyncedCollection({
  key: 'stadar-saved-events',
  localAdapter,
  normalize: normalizeSavedRecords,
  merge: mergeSavedRecords,
})

export const collections = [favoritesStore, savedEventsStore]

// Resolves once nothing in either collection is waiting to be saved.
export function flushCollections() {
  return Promise.all(collections.map(store => store.flush()))
}
