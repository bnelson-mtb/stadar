# Inline Final Score Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the past-event final-score editor as a compact inline scoreboard with miniature team logos and prominent centered score inputs.

**Architecture:** Keep the existing Game Notes data flow, sanitization, autosave, and visibility rules unchanged. Add one server-rendered component test, then replace only the final-score fieldset markup in `GameNotesSection` using the existing `TeamLogo` component and responsive Tailwind classes.

**Tech Stack:** React 19, React DOM server rendering, Vite SSR module loading, Tailwind CSS 4, Node.js built-in test runner.

## Global Constraints

- NEVER commit, add, push, or run any Git command.
- Work only on the currently checked-out branch.
- Only `GameNotesSection` changes visually.
- Home remains on the left and away remains on the right.
- Reuse the existing small `TeamLogo`; do not create another logo implementation.
- Preserve score sanitization, persistence status, autosave, notes, storage shape, section ordering, and postgame gating.
- Score inputs retain explicit accessible labels using canonical team names.
- The scoreboard must not cause horizontal overflow at a 320-pixel viewport.
- Do not add dependencies.

---

### Task 1: Compact inline final-score editor

**Files:**
- Create: `client/src/components/GameNotesSection.test.js`
- Modify: `client/src/components/GameNotesSection.jsx`

**Interfaces:**
- Consumes: existing `TeamLogo({ name, size: 'small' })` from `client/src/components/TeamLogo.jsx`.
- Preserves: `GameNotesSection({ record, homeTeamName, awayTeamName, showScore, persistenceStatus, onUpdate })`.
- Produces no new runtime API.

- [ ] **Step 1: Write the failing rendered-component test**

Create `GameNotesSection.test.js` with Vite SSR loading so JSX is tested without adding a DOM dependency:

```js
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

  const homeLogo = html.indexOf('title="Utah Great 8s"')
  const homeScore = html.indexOf('aria-label="Utah Great 8s score"')
  const awayScore = html.indexOf('aria-label="Las Vegas Rockers score"')
  const awayLogo = html.indexOf('title="Las Vegas Rockers"')

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
```

- [ ] **Step 2: Run the test and verify RED**

Run from `client`:

```powershell
node --test src/components/GameNotesSection.test.js
```

Expected: FAIL because the current component has no miniature logos or explicit score-input labels.

- [ ] **Step 3: Implement the inline scoreboard markup**

Import `TeamLogo` and replace only the current two-column score grid. Keep `updateScore`, values, IDs, and handlers unchanged. The fieldset body should follow this structure and sizing:

```jsx
<fieldset>
  <legend className="mb-3 text-sm font-semibold text-slate-300">Final score</legend>
  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-3">
    <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
      <TeamLogo name={homeTeamName} />
      <span className="min-w-0 break-words text-center text-[10px] font-semibold leading-tight text-slate-300 sm:text-left sm:text-sm">
        {homeTeamName || 'Home team'}
      </span>
    </div>

    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <label htmlFor={homeScoreId} className="sr-only">
        {homeTeamName || 'Home team'} score
      </label>
      <input
        id={homeScoreId}
        aria-label={`${homeTeamName || 'Home team'} score`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={homeScore}
        onChange={event => updateScore('home', event.target.value)}
        className="h-11 w-10 rounded-lg border border-white/10 bg-night-900 px-1 text-center text-xl font-bold text-white outline-none transition-colors focus:border-radar-400 sm:h-12 sm:w-16 sm:text-2xl md:w-20"
      />
      <span aria-hidden="true" className="text-lg font-bold text-slate-500">&ndash;</span>
      <label htmlFor={awayScoreId} className="sr-only">
        {awayTeamName || 'Away team'} score
      </label>
      <input
        id={awayScoreId}
        aria-label={`${awayTeamName || 'Away team'} score`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={awayScore}
        onChange={event => updateScore('away', event.target.value)}
        className="h-11 w-10 rounded-lg border border-white/10 bg-night-900 px-1 text-center text-xl font-bold text-white outline-none transition-colors focus:border-radar-400 sm:h-12 sm:w-16 sm:text-2xl md:w-20"
      />
    </div>

    <div className="flex min-w-0 flex-col-reverse items-center gap-1.5 text-right sm:flex-row sm:justify-end sm:gap-2">
      <span className="min-w-0 break-words text-center text-[10px] font-semibold leading-tight text-slate-300 sm:text-right sm:text-sm">
        {awayTeamName || 'Away team'}
      </span>
      <TeamLogo name={awayTeamName} />
    </div>
  </div>
</fieldset>
```

- [ ] **Step 4: Run component and existing feature tests**

Run from `client`:

```powershell
node --test src/components/GameNotesSection.test.js src/utils/eventDetailState.test.js src/utils/savedEventRecords.test.js
```

Expected: all tests PASS, including the new inline-order assertions and existing score/storage behavior.

- [ ] **Step 5: Run focused lint and production build**

Run from `client`:

```powershell
npx eslint src/components/GameNotesSection.jsx src/components/GameNotesSection.test.js
npm run build
```

Expected: ESLint exits 0 and Vite completes the production build.

- [ ] **Step 6: Verify the rendered layout**

Open a past saved two-team event and confirm at desktop and a 320-pixel viewport:

- home logo/name remain left of both score inputs;
- away logo/name remain right of both score inputs;
- score inputs are centered, visually prominent, and shorter than ordinary form fields;
- long names wrap without horizontal page overflow;
- score editing still autosaves and rejects non-digit input.
