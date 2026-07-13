import { useEffect, useRef, useState } from 'react'
import {
  createSavedRecord,
  normalizeSavedRecords,
  persistSavedRecords,
  removeSavedRecord,
  updateSavedMetadata,
  updateSavedSnapshot as replaceSavedSnapshot,
} from '../utils/savedEventRecords.js'

const STORAGE_KEY = 'stadar-saved-events'

function loadSaved() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? normalizeSavedRecords(JSON.parse(stored)) : []
  } catch {
    return []
  }
}

export default function useSavedEvents() {
  const [savedEvents, setSavedEvents] = useState(loadSaved)
  const savedEventsRef = useRef(savedEvents)
  const [persistenceStatus, setPersistenceStatus] = useState('saving')
  const [pendingRemoval, setPendingRemoval] = useState(null)

  useEffect(() => {
    const result = persistSavedRecords(localStorage, STORAGE_KEY, savedEvents)
    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) setPersistenceStatus(result.ok ? 'saved' : 'error')
    })

    return () => {
      cancelled = true
    }
  }, [savedEvents])

  function commitSavedEvents(transform) {
    const current = savedEventsRef.current
    const next = transform(current)
    if (next === current) return

    setPersistenceStatus('saving')
    savedEventsRef.current = next
    setSavedEvents(next)
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
