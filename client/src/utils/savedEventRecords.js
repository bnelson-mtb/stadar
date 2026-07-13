export function normalizeSavedRecords(records) {
  if (!Array.isArray(records)) return []

  return records.map(record => ({
    ...record,
    notes: record.notes ?? '',
    score: {
      home: record.score?.home ?? '',
      away: record.score?.away ?? '',
    },
  }))
}

export function createSavedRecord(event, savedAt = new Date().toISOString()) {
  return {
    event,
    savedAt,
    notes: '',
    score: { home: '', away: '' },
  }
}

export function updateSavedMetadata(records, eventId, patch) {
  const targetIndex = records.findIndex(record => record.event.id === eventId)
  if (targetIndex === -1) return records

  const target = records[targetIndex]
  const next = [...records]
  const updated = { ...target }

  if (Object.hasOwn(patch, 'notes')) updated.notes = patch.notes
  if (Object.hasOwn(patch, 'score')) {
    updated.score = { ...target.score }
    if (Object.hasOwn(patch.score ?? {}, 'home')) updated.score.home = patch.score.home
    if (Object.hasOwn(patch.score ?? {}, 'away')) updated.score.away = patch.score.away
  }

  next[targetIndex] = updated
  return next
}

export function updateSavedSnapshot(records, freshEvent) {
  const targetIndex = records.findIndex(record => record.event.id === freshEvent.id)
  if (targetIndex === -1) return records

  const next = [...records]
  next[targetIndex] = { ...records[targetIndex], event: freshEvent }
  return next
}

export function removeSavedRecord(records, eventId) {
  return records.filter(record => record.event.id !== eventId)
}

export function persistSavedRecords(storage, storageKey, records) {
  try {
    storage.setItem(storageKey, JSON.stringify(records))
    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}
