import { useState } from 'react'

const STORAGE_KEY = 'stadar-saved-events'

function loadSaved() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function useSavedEvents() {
  const [savedEvents, setSavedEvents] = useState(loadSaved)

  function toggleSave(event) {
    setSavedEvents(prev => {
      const exists = prev.some(r => r.event.id === event.id)
      const next = exists
        ? prev.filter(r => r.event.id !== event.id)
        : [...prev, { event, savedAt: new Date().toISOString() }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function isSaved(id) {
    return savedEvents.some(r => r.event.id === id)
  }

  function removeSaved(id) {
    setSavedEvents(prev => {
      const next = prev.filter(r => r.event.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function updateSnapshot(freshEvent) {
    setSavedEvents(prev => {
      const next = prev.map(r =>
        r.event.id === freshEvent.id ? { ...r, event: freshEvent } : r
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { savedEvents, toggleSave, isSaved, removeSaved, updateSnapshot }
}
