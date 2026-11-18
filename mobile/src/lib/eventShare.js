// Shared links point at the web app, which every recipient can open.
export const SHARE_BASE_URL = 'https://stadar.app'

// The LEAGUE_INFO key for an event: generic "Minor League" rows are told
// apart by sport (same rule as the web detail page).
export function leagueKeyFor(event) {
  if (event.league !== 'Minor League') return event.league
  if (event.sport === 'Hockey') return 'Minor League Hockey'
  if (event.sport === 'Basketball') return 'Minor League Basketball'
  return 'Minor League'
}

// "Utah Jazz vs Denver Nuggets - Friday, November 20, 2026 at Delta Center"
export function shareMessageFor(event, homeTeamName, awayTeamName) {
  const [year, month, day] = (event.localDate || '').split('-').map(Number)
  const date = event.localDate
    ? new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    : ''
  const who = awayTeamName ? `${homeTeamName} vs ${awayTeamName}` : homeTeamName || event.name
  return [who, date].filter(Boolean).join(' - ') + (event.venue ? ` at ${event.venue}` : '')
}
