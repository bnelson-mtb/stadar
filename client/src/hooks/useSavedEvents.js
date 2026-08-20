import { useEffect, useRef, useState } from 'react'
import {
  createSavedRecord,
  normalizeSavedRecords,
  removeSavedRecord,
  updateSavedMetadata,
  updateSavedSnapshot as replaceSavedSnapshot,
} from '../utils/savedEventRecords.js'
import { mergeSavedRecords } from '../utils/reconcile.js'
import useAuth from './useAuth.js'
import useAccountLink from './useAccountLink.js'

const STORAGE_KEY = 'stadar-saved-events'

export default function useSavedEvents() {
  const { status, storageAdapter } = useAuth()
  const { mode } = useAccountLink()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [savedEvents, setSavedEvents] = useState(() =>
    normalizeSavedRecords(storageAdapter.readCache(STORAGE_KEY, [])))
  const savedEventsRef = useRef(savedEvents)
  // 'saved' = nothing pending (kept for GameNotesSection's existing copy map).
  const [persistenceStatus, setPersistenceStatus] = useState('saved')
  const [pendingRemoval, setPendingRemoval] = useState(null)

  const commit = next => {
    savedEventsRef.current = next
    setSavedEvents(next)
  }

  // Reconcile with the shared link mode (same shape as useFavorites).
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    if (mode === 'anonymous') {
      queueMicrotask(() => {
        if (!cancelled) commit(normalizeSavedRecords(storageAdapter.readCache(STORAGE_KEY, [])))
      })
      return () => { cancelled = true }
    }

    if (mode === 'wait') return () => { cancelled = true }

    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setPersistenceStatus('saved'); return }

      const remoteRecords = normalizeSavedRecords(remote)
      if (mode === 'merge') {
        const merged = mergeSavedRecords(savedEventsRef.current, remoteRecords)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          if (res.ok) {
            globalThis.localStorage.removeItem(STORAGE_KEY) // transfer = move
            setPersistenceStatus('saved')
          } else {
            setPersistenceStatus('error')
          }
        })
      } else {
        commit(remoteRecords)
        globalThis.localStorage.removeItem(STORAGE_KEY)
        setPersistenceStatus('saved')
      }
    })
    return () => { cancelled = true }
  }, [mode, status, storageAdapter])

  // Single choke point for every mutation: optimistic set, persist, roll back
  // on a failed remote write. persist targets localStorage (anonymous) or the
  // account (signed in) depending on the active adapter.
  function commitSavedEvents(transform) {
    const prev = savedEventsRef.current
    const next = transform(prev)
    if (next === prev) return

    setPersistenceStatus('saving')
    commit(next)
    storageAdapter.persist(STORAGE_KEY, next).then(res => {
      if (res.ok) {
        setPersistenceStatus('saved')
      } else {
        commit(prev) // roll back to the last confirmed set
        setPersistenceStatus('error')
      }
    })
  }

  function toggleSave(event) {
    if (isSaved(event.id)) {
      setPendingRemoval(event)
      return
    }
    commitSavedEvents(records => [...records, createSavedRecord(event)])
  }

  function isSaved(id) {
    return savedEvents.some(r => r.event.id === id)
  }

  function requestRemove(event) {
    setPendingRemoval(event)
  }

  function cancelRemove() {
    setPendingRemoval(null)
  }

  function confirmRemove() {
    if (!pendingRemoval) return
    commitSavedEvents(records => removeSavedRecord(records, pendingRemoval.id))
    setPendingRemoval(null)
  }

  function updateMetadata(eventId, patch) {
    commitSavedEvents(records => updateSavedMetadata(records, eventId, patch))
  }

  function updateSnapshot(freshEvent) {
    if (!freshEvent) return
    commitSavedEvents(records => replaceSavedSnapshot(records, freshEvent))
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
