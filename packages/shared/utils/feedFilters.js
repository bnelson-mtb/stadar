// Discover feed logic: the date segments, the "next up" hero pick and each
// followed team's next game. Pure, so node:test covers it.

import { getCanonicalTeamName } from '../data/teams.js'
import { LIVE_WINDOW_MS } from './countdown.js'
import { addDays, involvesTeam, toDateStr } from './eventDisplay.js'

export const DATE_SEGMENTS = [
  { value: 'today', label: 'Today', heading: 'today' },
  { value: 'weekend', label: 'Weekend', heading: 'this weekend' },
  { value: 'week', label: 'Week', heading: 'this week' },
  { value: 'later', label: 'Later', heading: 'coming up' },
]

// today:   the current calendar day
// weekend: this week's Saturday and Sunday (just Sunday once it's Sunday)
// week:    today plus the next six days, so it always holds the weekend
// later:   everything after that, plus rows with no date
function getSegmentBounds(today) {
  const day = today.getDay() // 0 = Sun ... 6 = Sat
  const daysUntilSaturday = day === 0 ? -1 : 6 - day
  return {
    todayStr: toDateStr(today),
    saturdayStr: toDateStr(addDays(today, daysUntilSaturday)),
    sundayStr: toDateStr(addDays(today, daysUntilSaturday + 1)),
    weekEndStr: toDateStr(addDays(today, 6)),
  }
}

export function matchesDateSegment(localDate, segment, today = new Date()) {
  const { todayStr, saturdayStr, sundayStr, weekEndStr } = getSegmentBounds(today)

  if (!localDate) return segment === 'later'
  switch (segment) {
    case 'today':
      return localDate === todayStr
    case 'weekend':
      return localDate >= todayStr && (localDate === saturdayStr || localDate === sundayStr)
    case 'week':
      return localDate >= todayStr && localDate <= weekEndStr
    case 'later':
      return localDate > weekEndStr
    default:
      return true
  }
}

// Land on the first segment that has games, so a late-night visit doesn't open
// on an empty "Today" list.
export function getDefaultDateSegment(events, today = new Date()) {
  const segment = ['today', 'week', 'later'].find(candidate =>
    events.some(event => matchesDateSegment(event.localDate, candidate, today)))
  return segment ?? 'today'
}

export function getSegmentHeading(segment, count) {
  const heading = DATE_SEGMENTS.find(option => option.value === segment)?.heading ?? ''
  return `${count} ${count === 1 ? 'game' : 'games'} ${heading}`.trim()
}

function startMs(event) {
  return new Date(event?.dateTime).getTime()
}

// Still worth showing: not started, or started within the live window. Date-
// only events carry an end-of-day dateTime, so they stay until it passes.
function isStillOn(event, now) {
  const ms = startMs(event)
  if (!Number.isFinite(ms)) return false
  return ms + (event.localTime ? LIVE_WINDOW_MS : 0) > now
}

function byStart(a, b) {
  return startMs(a) - startMs(b)
}

// The hero: soonest game for a followed team, else the soonest game in the
// feed (which is already scoped to the selected state).
export function pickNextUpEvent(events, favorites = [], now = Date.now()) {
  const upcoming = events.filter(event => isStillOn(event, now)).sort(byStart)
  const followed = new Set(favorites)
  const isFollowed = event =>
    followed.has(getCanonicalTeamName(event.homeTeam)) ||
    (Boolean(event.awayTeam) && followed.has(getCanonicalTeamName(event.awayTeam)))

  return upcoming.find(isFollowed) ?? upcoming[0] ?? null
}

export function getNextGameForTeam(events, teamName, now = Date.now()) {
  return events
    .filter(event => involvesTeam(event, teamName) && isStillOn(event, now))
    .sort(byStart)[0] ?? null
}

// Every team playing in the feed, by canonical name: what the "+ Follow"
// sheet offers. Sorted by name for a stable list.
export function getTeamsInFeed(events) {
  const names = new Set()
  for (const event of events) {
    for (const raw of [event.homeTeam, event.awayTeam]) {
      const name = getCanonicalTeamName(raw)
      if (name) names.add(name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}
