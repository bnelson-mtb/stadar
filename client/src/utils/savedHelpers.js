import { getCanonicalTeamName } from '../data/teams.js'
import { involvesTeam } from './eventDisplay.js'
import { matchesDateSegment } from './feedFilters.js'

export function partitionByTime(savedEvents, now = new Date()) {
  const upcoming = []
  const past = []
  for (const record of savedEvents) {
    if (new Date(record.event.dateTime) > now) {
      upcoming.push(record)
    } else {
      past.push(record)
    }
  }
  upcoming.sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime))
  past.sort((a, b) => new Date(b.event.dateTime) - new Date(a.event.dateTime))
  return { upcoming, past }
}

export function groupSavedByTeam(savedEvents, favoriteTeams) {
  const map = {}
  for (const team of favoriteTeams) {
    map[team] = []
  }
  for (const record of savedEvents) {
    const home = getCanonicalTeamName(record.event.homeTeam)
    const away = record.event.awayTeam
      ? getCanonicalTeamName(record.event.awayTeam)
      : null
    if (favoriteTeams.includes(home) && !map[home].some(r => r.event.id === record.event.id)) {
      map[home].push(record)
    }
    if (away && favoriteTeams.includes(away) && !map[away].some(r => r.event.id === record.event.id)) {
      map[away].push(record)
    }
  }
  for (const team of favoriteTeams) {
    map[team].sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime))
  }
  return map
}

// Upcoming saved games split for the Saved tab: today plus the next six days
// ("This week", same window as Discover's Week segment), then everything else.
export function splitUpcomingByWeek(upcoming, today = new Date()) {
  const thisWeek = []
  const later = []
  for (const record of upcoming) {
    if (matchesDateSegment(record.event.localDate, 'week', today)) {
      thisWeek.push(record)
    } else {
      later.push(record)
    }
  }
  return { thisWeek, later }
}

function parseScore(value) {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return /^\d+$/.test(text) ? Number(text) : null
}

// Which side won a logged final score. Null until both scores are filled in.
export function getWinnerSide(score) {
  const home = parseScore(score?.home)
  const away = parseScore(score?.away)
  if (home === null || away === null) return null
  if (home === away) return 'tie'
  return home > away ? 'home' : 'away'
}

// A logged final score from one team's point of view.
export function getScoreOutcome(record, teamName) {
  const home = parseScore(record?.score?.home)
  const away = parseScore(record?.score?.away)
  if (home === null || away === null || !record?.event) return null

  const isHome = getCanonicalTeamName(record.event.homeTeam) === teamName
  const isAway = !isHome &&
    Boolean(record.event.awayTeam) &&
    getCanonicalTeamName(record.event.awayTeam) === teamName
  if (!isHome && !isAway) return null

  const teamScore = isHome ? home : away
  const opponentScore = isHome ? away : home
  let result = 'T'
  if (teamScore > opponentScore) result = 'W'
  if (teamScore < opponentScore) result = 'L'
  return { teamScore, opponentScore, result, isHome }
}

export function getOpponentName(event, teamName) {
  const home = getCanonicalTeamName(event?.homeTeam)
  const away = getCanonicalTeamName(event?.awayTeam)
  if (home === teamName) return away
  if (away === teamName) return home
  return ''
}

export function getTeamRecords(savedEvents, teamName) {
  return savedEvents.filter(record => involvesTeam(record.event, teamName))
}

// Team page hero tiles: saved games, games attended (saved and already
// played) and the W-L record across attended games with a logged score.
export function getTeamStats(savedEvents, teamName, now = new Date()) {
  const records = getTeamRecords(savedEvents, teamName)
  const { past } = partitionByTime(records, now)
  const tally = { wins: 0, losses: 0, ties: 0 }

  for (const record of past) {
    const outcome = getScoreOutcome(record, teamName)
    if (outcome?.result === 'W') tally.wins++
    if (outcome?.result === 'L') tally.losses++
    if (outcome?.result === 'T') tally.ties++
  }

  return { saved: records.length, attended: past.length, ...tally }
}

export function formatWinLoss({ wins, losses, ties }) {
  if (wins + losses + ties === 0) return '—'
  return ties > 0 ? `${wins}–${losses}–${ties}` : `${wins}–${losses}`
}

// "4 upcoming · 11 games logged"
export function getSavedSummary(upcomingCount, pastCount) {
  return `${upcomingCount} upcoming · ${pastCount} ${pastCount === 1 ? 'game' : 'games'} logged`
}
