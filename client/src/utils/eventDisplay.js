// Pure presentation helpers shared by the overhauled pages: short team names,
// hero tints, venue-local time labels and day labels. No React, no DOM, so
// node:test covers them directly.

import { getCanonicalTeamName, getTeamData } from '../data/teams.js'

export const FALLBACK_TEAM_COLOR = '#0d2a4a'

// Nickname for tight matchup lines: "Jazz", "Utes", "Cougars". Rows always
// show the logo beside it, which tells same-named mascots apart; pages with
// room (team page, Teams tab) use the full canonical name instead.
export function getTeamShortName(name) {
  if (!name) return ''
  const team = getTeamData(name)
  if (!team) return name.trim()
  return team.shortName || getCanonicalTeamName(name)
}

export function involvesTeam(event, teamName) {
  if (!event || !teamName) return false
  return getCanonicalTeamName(event.homeTeam) === teamName ||
    (Boolean(event.awayTeam) && getCanonicalTeamName(event.awayTeam) === teamName)
}

function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? '').trim())
  if (!match) return null
  const n = parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance([r, g, b]) {
  const channel = value => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const NIGHT_RGB = [7, 9, 14]

function toHex(rgb) {
  return `#${rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

// Starting color for the hero gradients. Dark brand colors pass through; bright
// ones (gold, orange, red) are pulled toward the night background so white
// display type stays legible; near-black falls back to the default navy so
// the hero still reads as tinted.
export function getHeroColor(teamColor) {
  const rgb = hexToRgb(teamColor)
  if (!rgb) return FALLBACK_TEAM_COLOR

  const luminance = relativeLuminance(rgb)
  if (luminance < 0.01) return FALLBACK_TEAM_COLOR
  if (luminance <= 0.08) return toHex(rgb)

  const t = Math.min(0.75, 0.35 + luminance)
  return toHex(rgb.map((v, i) => v + (NIGHT_RGB[i] - v) * t))
}

export function getTeamHeroColor(name) {
  return getHeroColor(getTeamData(name)?.color)
}

// "19:30:00" -> { time: '7:30', period: 'PM', label: '7:30 PM' }
export function formatLocalTime(localTime) {
  const match = /^(\d{1,2}):(\d{2})/.exec(localTime ?? '')
  if (!match) return null
  const hours = Number(match[1])
  const period = hours >= 12 ? 'PM' : 'AM'
  const time = `${hours % 12 || 12}:${match[2]}`
  return { time, period, label: `${time} ${period}` }
}

// Generic US zone labels. The event only carries a UTC instant plus the venue
// wall-clock time, so the zone is whichever candidate turns one into the
// other. The state's usual zone is tried first, which settles the summer tie
// between Arizona (MST) and the Pacific coast (PDT).
const ZONE_LABELS = {
  'America/New_York': 'ET',
  'America/Chicago': 'CT',
  'America/Denver': 'MT',
  'America/Los_Angeles': 'PT',
  'America/Phoenix': 'MT',
  'America/Anchorage': 'AKT',
  'Pacific/Honolulu': 'HT',
}

const STATE_ZONES = {
  'America/Chicago': ['AL', 'AR', 'IA', 'IL', 'KS', 'LA', 'MN', 'MO', 'MS', 'ND', 'NE', 'OK', 'SD', 'TN', 'TX', 'WI'],
  'America/Denver': ['CO', 'ID', 'MT', 'NM', 'UT', 'WY'],
  'America/Phoenix': ['AZ'],
  'America/Los_Angeles': ['CA', 'NV', 'OR', 'WA'],
  'America/Anchorage': ['AK'],
  'Pacific/Honolulu': ['HI'],
}

const ZONE_BY_STATE = Object.fromEntries(
  Object.entries(STATE_ZONES).flatMap(([zone, states]) => states.map(state => [state, zone]))
)

const zoneFormatters = new Map()

function zonedStamp(ms, timeZone) {
  let formatter = zoneFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    zoneFormatters.set(timeZone, formatter)
  }
  const parts = Object.fromEntries(formatter.formatToParts(ms).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

export function getTimeZoneLabel(event) {
  const ms = new Date(event?.dateTime).getTime()
  if (!event?.localDate || !event?.localTime || !Number.isFinite(ms)) return ''

  const expected = `${event.localDate} ${event.localTime.slice(0, 5)}`
  const preferred = ZONE_BY_STATE[event.state] ?? 'America/New_York'
  const candidates = [preferred, ...Object.keys(ZONE_LABELS).filter(zone => zone !== preferred)]
  const zone = candidates.find(candidate => zonedStamp(ms, candidate) === expected)
  return zone ? ZONE_LABELS[zone] : ''
}

// Parse "YYYY-MM-DD" as a plain calendar date (no timezone conversion).
export function parseLocalDate(localDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(localDate ?? '')
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function daysFromToday(date, today) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  // Round, not floor: a DST shift makes some calendar days 23 or 25 hours long.
  return Math.round((date - start) / 86_400_000)
}

// "Tonight" / "Today" / "Tomorrow" / "Fri" / "Oct 12"
export function getDayLabel(localDate, { localTime = null, today = new Date() } = {}) {
  const date = parseLocalDate(localDate)
  if (!date) return ''

  const diff = daysFromToday(date, today)
  if (diff === 0) return localTime && localTime >= '17:00' ? 'Tonight' : 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff > 1 && diff < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function isToday(localDate, today = new Date()) {
  const date = parseLocalDate(localDate)
  return Boolean(date) && daysFromToday(date, today) === 0
}

// "Wed, Aug 12"
export function formatShortDate(localDate) {
  const date = parseLocalDate(localDate)
  return date
    ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : ''
}

// "Nov 15, 2025"
export function formatLongDate(localDate) {
  const date = parseLocalDate(localDate)
  return date
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
}

// The countdown target, or null when the event has no announced start time
// (date-only events carry an end-of-day dateTime, which would mislead).
export function getEventStart(event) {
  return event?.localTime && event?.dateTime ? event.dateTime : null
}

const KICKOFF = { label: 'Kickoff', countdown: 'Kicks off in', caption: 'to kickoff' }
const FIRST_PITCH = { label: 'First pitch', countdown: 'First pitch in', caption: 'to first pitch' }

const START_TERMS = {
  Basketball: { label: 'Tip-off', countdown: 'Tips off in', caption: 'to tip-off' },
  Hockey: { label: 'Puck drop', countdown: 'Puck drops in', caption: 'to puck drop' },
  Football: KICKOFF,
  Soccer: KICKOFF,
  Baseball: FIRST_PITCH,
  Softball: FIRST_PITCH,
}

const DEFAULT_START_TERM = { label: 'Start', countdown: 'Starts in', caption: 'to start' }

export function getStartTerm(sport) {
  return START_TERMS[sport] ?? DEFAULT_START_TERM
}

// Team-page hero lines: "Utah" / "Jazz". Teams whose nickname is the whole
// name stay on one line.
export function splitTeamName(name) {
  const fullName = getCanonicalTeamName(name)
  const nickname = getTeamData(name)?.shortName
  if (nickname && fullName.endsWith(` ${nickname}`)) {
    return [fullName.slice(0, -nickname.length - 1), nickname]
  }
  return [fullName]
}

// League and home venue for a team, read off any of its games:
// "NBA · Delta Center".
export function getTeamContext(events, teamName) {
  const games = events.filter(event => involvesTeam(event, teamName))
  const homeGame = games.find(event => getCanonicalTeamName(event.homeTeam) === teamName)
  return {
    league: games.find(event => event.league)?.league ?? '',
    homeVenue: homeGame?.venue ?? '',
  }
}
