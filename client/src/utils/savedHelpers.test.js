import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatWinLoss,
  getOpponentName,
  getSavedSummary,
  getScoreOutcome,
  getTeamStats,
  getWinnerSide,
  partitionByTime,
  splitUpcomingByWeek,
} from './savedHelpers.js'

const now = new Date('2026-09-30T18:00:00Z')

function record(id, dateTime, homeTeam, awayTeam, score = { home: '', away: '' }, localDate = dateTime.slice(0, 10)) {
  return {
    event: { id, dateTime, localDate, homeTeam, awayTeam },
    savedAt: '2026-01-01T00:00:00.000Z',
    notes: '',
    score,
  }
}

const history = [
  record('win-home', '2025-04-04T01:00:00Z', 'Utah Jazz', 'Phoenix Suns', { home: '119', away: '112' }),
  record('loss-home', '2025-03-03T01:00:00Z', 'Utah Jazz', 'Oklahoma City Thunder', { home: '108', away: '121' }),
  record('win-away', '2025-01-19T01:00:00Z', 'Memphis Grizzlies', 'Utah Jazz', { home: '99', away: '104' }),
  record('unscored', '2025-01-02T01:00:00Z', 'Utah Jazz', 'Denver Nuggets'),
  record('upcoming', '2026-10-10T01:00:00Z', 'Utah Jazz', 'Denver Nuggets'),
  record('other-team', '2025-02-01T01:00:00Z', 'Utah Mammoth', 'Colorado Avalanche', { home: '3', away: '2' }),
]

test('getWinnerSide compares logged scores numerically', () => {
  assert.equal(getWinnerSide({ home: '31', away: '24' }), 'home')
  assert.equal(getWinnerSide({ home: '9', away: '10' }), 'away')
  assert.equal(getWinnerSide({ home: '2', away: '2' }), 'tie')
  assert.equal(getWinnerSide({ home: '2', away: '' }), null)
  assert.equal(getWinnerSide(undefined), null)
})

test('getScoreOutcome reads the score from the given team’s side', () => {
  assert.deepEqual(getScoreOutcome(history[0], 'Utah Jazz'), { teamScore: 119, opponentScore: 112, result: 'W', isHome: true })
  assert.deepEqual(getScoreOutcome(history[2], 'Utah Jazz'), { teamScore: 104, opponentScore: 99, result: 'W', isHome: false })
  assert.equal(getScoreOutcome(history[1], 'Utah Jazz').result, 'L')
  assert.equal(getScoreOutcome(history[3], 'Utah Jazz'), null)
  assert.equal(getScoreOutcome(history[0], 'Utah Mammoth'), null)
})

test('getOpponentName returns the other side of the matchup', () => {
  assert.equal(getOpponentName(history[0].event, 'Utah Jazz'), 'Phoenix Suns')
  assert.equal(getOpponentName(history[2].event, 'Utah Jazz'), 'Memphis Grizzlies')
  assert.equal(getOpponentName(history[0].event, 'Utah Mammoth'), '')
})

test('getTeamStats counts saved, attended and the W-L record for one team', () => {
  assert.deepEqual(getTeamStats(history, 'Utah Jazz', now), {
    saved: 5,
    attended: 4,
    wins: 2,
    losses: 1,
    ties: 0,
  })
})

test('formatWinLoss shows ties only when there are any', () => {
  assert.equal(formatWinLoss({ wins: 5, losses: 2, ties: 0 }), '5–2')
  assert.equal(formatWinLoss({ wins: 1, losses: 1, ties: 1 }), '1–1–1')
  assert.equal(formatWinLoss({ wins: 0, losses: 0, ties: 0 }), '—')
})

test('splitUpcomingByWeek keeps the next seven calendar days together', () => {
  const today = new Date(2026, 8, 30, 9, 0)
  const { upcoming } = partitionByTime([
    record('tonight', '2026-10-01T01:00:00Z', 'Utah Jazz', '', undefined, '2026-09-30'),
    record('tuesday', '2026-10-07T01:00:00Z', 'Utah Jazz', '', undefined, '2026-10-06'),
    record('next-week', '2026-10-08T01:00:00Z', 'Utah Jazz', '', undefined, '2026-10-07'),
  ], now)

  const { thisWeek, later } = splitUpcomingByWeek(upcoming, today)
  assert.deepEqual(thisWeek.map(r => r.event.id), ['tonight', 'tuesday'])
  assert.deepEqual(later.map(r => r.event.id), ['next-week'])
})

test('getSavedSummary pluralizes logged games', () => {
  assert.equal(getSavedSummary(4, 11), '4 upcoming · 11 games logged')
  assert.equal(getSavedSummary(0, 1), '0 upcoming · 1 game logged')
})
