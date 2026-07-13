import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let vite

test.before(async () => {
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
})

test.after(async () => {
  await vite?.close()
})

test('renders an inline home-score-away scoreboard with miniature team logos', async () => {
  const { default: GameNotesSection } = await vite.ssrLoadModule('/src/components/GameNotesSection.jsx')
  const html = renderToStaticMarkup(React.createElement(GameNotesSection, {
    record: { notes: '', score: { home: '27', away: '24' } },
    homeTeamName: 'Utah Great 8s',
    awayTeamName: 'Las Vegas Rockers',
    showScore: true,
    persistenceStatus: 'saved',
    onUpdate: () => {},
  }))

  const homeLogo = Math.max(
    html.indexOf('alt="Utah Great 8s"'),
    html.indexOf('title="Utah Great 8s"'),
  )
  const homeScore = html.indexOf('aria-label="Utah Great 8s score"')
  const awayScore = html.indexOf('aria-label="Las Vegas Rockers score"')
  const awayLogo = Math.max(
    html.indexOf('alt="Las Vegas Rockers"'),
    html.indexOf('title="Las Vegas Rockers"'),
  )

  assert.ok(homeLogo >= 0, 'renders the miniature home logo')
  assert.ok(awayLogo >= 0, 'renders the miniature away logo')
  assert.ok(homeScore >= 0, 'labels the home score input')
  assert.ok(awayScore >= 0, 'labels the away score input')
  assert.ok(homeLogo < homeScore, 'places home identity before the scores')
  assert.ok(homeScore < awayScore, 'places home score before away score')
  assert.ok(awayScore < awayLogo, 'places away identity after the scores')
  assert.match(html, /value="27"/)
  assert.match(html, /value="24"/)
})
