import { Platform } from 'react-native'
import * as Calendar from 'expo-calendar'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { buildIcsContent } from '@stadar/shared/utils/ics.js'
import { calendarEventFor } from './calendarEvent.js'

function icsFileName(event) {
  return `${(event.name || 'event').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
}

// Web build: download the .ics file, as the web app does.
function downloadIcs(event) {
  const content = buildIcsContent(event)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = globalThis.document.createElement('a')
  a.href = url
  a.download = icsFileName(event)
  globalThis.document.body.appendChild(a)
  a.click()
  globalThis.document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Fallback: hand the .ics file to whatever app the user picks.
async function shareIcs(event) {
  const file = new File(Paths.cache, icsFileName(event))
  if (file.exists) file.delete()
  file.create()
  file.write(buildIcsContent(event))
  await Sharing.shareAsync(file.uri, { mimeType: 'text/calendar', UTI: 'public.calendar-event', dialogTitle: 'Add to calendar' })
}

// "Add to calendar": the phone's own new-event screen, filled in. No calendar
// permission is needed because the user saves it themselves.
export async function addToCalendar(event) {
  if (Platform.OS === 'web') {
    downloadIcs(event)
    return
  }
  const details = calendarEventFor(event, {
    home: getCanonicalTeamName(event.homeTeam),
    away: getCanonicalTeamName(event.awayTeam),
  })
  try {
    if (typeof Calendar.createEventInCalendarAsync !== 'function') throw new Error('unsupported')
    await Calendar.createEventInCalendarAsync(details)
  } catch {
    await shareIcs(event).catch(() => {})
  }
}
