const TWO_HOURS = 2 * 60 * 60 * 1000

function localMidnight(localDate) {
  const [y, m, d] = String(localDate ?? '').split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// The fields for the phone's "new calendar event" screen. A timed event starts
// at its real instant (dateTime) and runs two hours, like the .ics export; an
// event with no start time is an all-day entry on its venue-local date.
export function calendarEventFor(event, { home, away } = {}) {
  const title = away ? `${home} vs ${away}` : home || event.name
  const location = [event.venue, event.city, event.state].filter(Boolean).join(', ')
  const base = { title, location, url: event.ticketUrl || undefined, notes: event.ticketUrl || undefined }

  if (event.localTime && event.dateTime) {
    const start = new Date(event.dateTime)
    if (!Number.isNaN(start.getTime())) {
      return { ...base, startDate: start, endDate: new Date(start.getTime() + TWO_HOURS), allDay: false }
    }
  }

  const day = localMidnight(event.localDate)
  if (!day) return { ...base, allDay: true }
  const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
  return { ...base, startDate: day, endDate: next, allDay: true }
}
