import { useState, useSyncExternalStore } from 'react'
import {
  addSavedRecord,
  createSavedRecord,
  removeSavedRecord,
  updateSavedMetadata,
  updateSavedSnapshot as replaceSavedSnapshot,
} from '../utils/savedEventRecords.js'
import { savedEventsStore } from '../utils/collections.js'

// Notes and scores are edited a keystroke at a time. For a signed-in user each
// save replaces the whole set on the server, so it waits for a pause in typing.
const METADATA_SAVE_DELAY_MS = 800

// Saved events. Every caller reads the same app-wide collection; only the
// "remove this?" confirmation is per page.
export default function useSavedEvents() {
  const { items: savedEvents, status } = useSyncExternalStore(
    savedEventsStore.subscribe,
    savedEventsStore.getSnapshot,
  )
  const [pendingRemoval, setPendingRemoval] = useState(null)

  // 'saved' = nothing pending (kept for GameNotesSection's existing copy map).
  const persistenceStatus = status === 'error' ? 'error' : status === 'syncing' ? 'saving' : 'saved'

  function isSaved(id) {
    return savedEvents.some(r => r.event.id === id)
  }

  function toggleSave(event) {
    if (isSaved(event.id)) {
      setPendingRemoval(event)
      return
    }
    const record = createSavedRecord(event)
    savedEventsStore.mutate(records => addSavedRecord(records, record))
  }

  function requestRemove(event) {
    setPendingRemoval(event)
  }

  function cancelRemove() {
    setPendingRemoval(null)
  }

  function confirmRemove() {
    if (!pendingRemoval) return
    const { id } = pendingRemoval
    savedEventsStore.mutate(records =>
      records.some(r => r.event.id === id) ? removeSavedRecord(records, id) : records)
    setPendingRemoval(null)
  }

  function updateMetadata(eventId, patch) {
    savedEventsStore.mutate(
      records => updateSavedMetadata(records, eventId, patch),
      { delayMs: METADATA_SAVE_DELAY_MS },
    )
  }

  function updateSnapshot(freshEvent) {
    if (!freshEvent) return
    savedEventsStore.mutate(records => replaceSavedSnapshot(records, freshEvent))
  }

  return {
    savedEvents,
    toggleSave,
    isSaved,
    requestRemove,
    pendingRemoval,
    cancelRemove,
    confirmRemove,
    updateMetadata,
    updateSnapshot,
    persistenceStatus,
  }
}
