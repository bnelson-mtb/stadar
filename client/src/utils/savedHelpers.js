import { getCanonicalTeamName } from '../data/teams'

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
