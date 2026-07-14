# Saved Event Notes, Scores, and Collapsible Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add locally autosaved notes and post-event scores to saved events, reorganize past-event details, make secondary detail cards collapsible, and require confirmation before every unsave.

**Architecture:** Pure utilities transform saved records and determine detail-section state; the existing saved-events hook persists those transformations and owns pending-removal state. Three focused UI components provide collapsible cards, notes/score editing, and an accessible confirmation dialog, while the four page call sites compose those pieces.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 4, browser localStorage, Node.js built-in test runner, ESLint, Vite.

## Global Constraints

- NEVER commit, add, push, or run any Git command.
- Work only on the currently checked-out branch.
- Preserve unrelated existing edits in `client/src/data/venues/cfbBig12.js` and `client/src/data/venues/mls.js`.
- Notes exist only for saved events and auto-save locally on every edit.
- Final score uses separate home and away non-negative whole-number fields and appears only for past saved two-team events.
- Before an event, Game Notes appears between Venue and League Overview; after an event, it replaces Tickets directly below Matchup.
- The hero image and Matchup stay permanently expanded; Tickets, Venue, Game Notes, and League Overview are independently collapsible and open by default.
- Every unsave entry point uses a styled confirmation dialog; past-event copy warns that notes and scores are permanently deleted and the action cannot be undone.

---

### Task 1: Saved-record transformations and hook lifecycle

**Files:**
- Create: `client/src/utils/savedEventRecords.js`
- Create: `client/src/utils/savedEventRecords.test.js`
- Modify: `client/src/hooks/useSavedEvents.js`

**Interfaces:**
- Produces: `normalizeSavedRecords(records)`, `createSavedRecord(event, savedAt)`, `updateSavedMetadata(records, eventId, patch)`, `updateSavedSnapshot(records, freshEvent)`, and `removeSavedRecord(records, eventId)`.
- Produces from `useSavedEvents()`: `{ savedEvents, toggleSave, isSaved, requestRemove, pendingRemoval, cancelRemove, confirmRemove, updateMetadata, updateSnapshot }`.
- `toggleSave(event)` saves immediately when absent and only opens pending removal when present.
- `requestRemove(event)` opens pending removal without deleting.

- [ ] **Step 1: Write failing pure transformation tests**

Create tests with `node:test` and `node:assert/strict` for these exact behaviors:

```js
test('normalizes legacy records with empty notes and scores', () => {
  const [record] = normalizeSavedRecords([{ event, savedAt: '2026-07-01T00:00:00.000Z' }])
  assert.equal(record.notes, '')
  assert.deepEqual(record.score, { home: '', away: '' })
})

test('creates a saved record with empty metadata', () => {
  assert.deepEqual(createSavedRecord(event, '2026-07-01T00:00:00.000Z'), {
    event,
    savedAt: '2026-07-01T00:00:00.000Z',
    notes: '',
    score: { home: '', away: '' },
  })
})

test('updates metadata without replacing the event or timestamp', () => {
  const original = createSavedRecord(event, '2026-07-01T00:00:00.000Z')
  const [updated] = updateSavedMetadata([original], event.id, {
    notes: 'Great atmosphere',
    score: { home: '4' },
  })
  assert.strictEqual(updated.event, original.event)
  assert.equal(updated.savedAt, original.savedAt)
  assert.equal(updated.notes, 'Great atmosphere')
  assert.deepEqual(updated.score, { home: '4', away: '' })
})

test('updates only the targeted saved record', () => {
  const other = { ...event, id: 'other' }
  const records = [createSavedRecord(event, 'a'), createSavedRecord(other, 'b')]
  const updated = updateSavedMetadata(records, event.id, { notes: 'Mine' })
  assert.equal(updated[0].notes, 'Mine')
  assert.strictEqual(updated[1], records[1])
})

test('snapshot refresh preserves saved metadata', () => {
  const record = { ...createSavedRecord(event, 'a'), notes: 'Keep', score: { home: '2', away: '1' } }
  const fresh = { ...event, venue: 'Updated Venue' }
  const [updated] = updateSavedSnapshot([record], fresh)
  assert.strictEqual(updated.event, fresh)
  assert.equal(updated.notes, 'Keep')
  assert.deepEqual(updated.score, { home: '2', away: '1' })
})

test('removes only the confirmed event record', () => {
  const other = { ...event, id: 'other' }
  const remaining = removeSavedRecord(
    [createSavedRecord(event, 'a'), createSavedRecord(other, 'b')],
    event.id,
  )
  assert.deepEqual(remaining.map(record => record.event.id), ['other'])
})
```

- [ ] **Step 2: Run the new tests and confirm RED**

Run: `node --test src/utils/savedEventRecords.test.js` from `client`.

Expected: FAIL because `savedEventRecords.js` does not exist.

- [ ] **Step 3: Implement the pure saved-record utilities**

Use immutable array/object transformations. Normalize absent metadata with nullish coalescing, merge partial score patches into `{ home, away }`, return unmatched records by identity, and make a missing target a no-op.

```js
const EMPTY_SCORE = Object.freeze({ home: '', away: '' })

export function normalizeSavedRecord(record) {
  return {
    ...record,
    notes: record.notes ?? '',
    score: {
      home: record.score?.home ?? '',
      away: record.score?.away ?? '',
    },
  }
}

export function normalizeSavedRecords(records) {
  return Array.isArray(records) ? records.map(normalizeSavedRecord) : []
}

export function createSavedRecord(event, savedAt = new Date().toISOString()) {
  return { event, savedAt, notes: '', score: { ...EMPTY_SCORE } }
}
```

Implement the three transformations with the exact exported names from the interface.

- [ ] **Step 4: Run transformation tests and confirm GREEN**

Run: `node --test src/utils/savedEventRecords.test.js` from `client`.

Expected: all tests PASS.

- [ ] **Step 5: Refactor `useSavedEvents` around those transformations**

`loadSaved` parses local storage and calls `normalizeSavedRecords`. All writes use one local `persist(next)` helper. `toggleSave` creates a new record when absent and calls `setPendingRemoval(event)` when present. `requestRemove` sets the pending event. `cancelRemove` clears it. `confirmRemove` removes only `pendingRemoval.id`, persists, then clears pending state. `updateMetadata(eventId, patch)` and `updateSnapshot(freshEvent)` use the pure utilities and persist their results.

Do not expose the old immediate `removeSaved` function.

- [ ] **Step 6: Re-run saved-record tests and lint the changed files**

Run from `client`:

```powershell
node --test src/utils/savedEventRecords.test.js
npx eslint src/utils/savedEventRecords.js src/utils/savedEventRecords.test.js src/hooks/useSavedEvents.js
```

Expected: tests PASS and ESLint exits 0.

---

### Task 2: Detail-state utilities and reusable UI components

**Files:**
- Create: `client/src/utils/eventDetailState.js`
- Create: `client/src/utils/eventDetailState.test.js`
- Create: `client/src/components/CollapsibleSection.jsx`
- Create: `client/src/components/GameNotesSection.jsx`
- Create: `client/src/components/UnsaveConfirmDialog.jsx`

**Interfaces:**
- Produces: `isPastEvent(event, now)`, `getDetailSectionOrder({ isPast, isSaved, hasLeagueInfo })`, `shouldShowFinalScore({ isPast, isSaved, hasAwayTeam })`, and `sanitizeScoreInput(value)`.
- Produces: `<CollapsibleSection title subtitle>{children}</CollapsibleSection>`.
- Produces: `<GameNotesSection record homeTeamName awayTeamName showScore onUpdate />`.
- Produces: `<UnsaveConfirmDialog event onCancel onConfirm />`.

- [ ] **Step 1: Write failing detail-state tests**

Cover all four section orders:

```js
assert.deepEqual(getDetailSectionOrder({ isPast: false, isSaved: true, hasLeagueInfo: true }), ['tickets', 'venue', 'notes', 'league'])
assert.deepEqual(getDetailSectionOrder({ isPast: false, isSaved: false, hasLeagueInfo: true }), ['tickets', 'venue', 'league'])
assert.deepEqual(getDetailSectionOrder({ isPast: true, isSaved: true, hasLeagueInfo: true }), ['notes', 'venue', 'league'])
assert.deepEqual(getDetailSectionOrder({ isPast: true, isSaved: false, hasLeagueInfo: true }), ['venue', 'league'])
```

Also assert that league is omitted when unavailable, final score requires all three booleans, the boundary `dateTime === now` is past, and score sanitization returns the input for `''`, `'0'`, and `'123'` but returns `null` for `'-1'`, `'1.5'`, and `'abc'`.

- [ ] **Step 2: Run detail-state tests and confirm RED**

Run: `node --test src/utils/eventDetailState.test.js` from `client`.

Expected: FAIL because `eventDetailState.js` does not exist.

- [ ] **Step 3: Implement the pure detail-state utilities**

```js
export function isPastEvent(event, now = new Date()) {
  return new Date(event.dateTime) <= now
}

export function getDetailSectionOrder({ isPast, isSaved, hasLeagueInfo }) {
  const order = isPast
    ? (isSaved ? ['notes', 'venue'] : ['venue'])
    : (isSaved ? ['tickets', 'venue', 'notes'] : ['tickets', 'venue'])
  return hasLeagueInfo ? [...order, 'league'] : order
}

export function shouldShowFinalScore({ isPast, isSaved, hasAwayTeam }) {
  return isPast && isSaved && hasAwayTeam
}

export function sanitizeScoreInput(value) {
  return /^\d*$/.test(value) ? value : null
}
```

- [ ] **Step 4: Run detail-state tests and confirm GREEN**

Run: `node --test src/utils/eventDetailState.test.js` from `client`.

Expected: all tests PASS.

- [ ] **Step 5: Implement `CollapsibleSection`**

Use `useId` and `useState(true)`. Render the existing night card styling, a full-width `type="button"` header with title, optional subtitle, chevron rotation, `aria-expanded`, and `aria-controls`. Keep the child region mounted and toggle its `hidden` attribute so form values and the venue map are not recreated on every collapse.

- [ ] **Step 6: Implement `GameNotesSection`**

Render score controls above the textarea only when `showScore` is true. Use `type="text"`, `inputMode="numeric"`, and `pattern="[0-9]*"`. Call `sanitizeScoreInput`; ignore the change when it returns `null`, otherwise call `onUpdate({ score: { ...record.score, [side]: value } })`. Notes call `onUpdate({ notes: event.target.value })`. Default missing record metadata to empty values and show the text `Autosaved locally`.

- [ ] **Step 7: Implement `UnsaveConfirmDialog`**

Return `null` without an event. Otherwise render a fixed backdrop and centered dialog with `role="dialog"`, `aria-modal="true"`, title `Unsave this event?`, Cancel, and destructive Unsave buttons. Use `isPastEvent(event)` to select copy. Past copy must say that notes and the final score will be permanently deleted and this cannot be undone. On mount, remember `document.activeElement`, focus Cancel, and add an Escape listener. On cleanup, remove the listener and restore focus when the saved initiating element is still connected. A click on the backdrop itself cancels; a click inside does not.

- [ ] **Step 8: Verify the utilities and components**

Run from `client`:

```powershell
node --test src/utils/eventDetailState.test.js
npx eslint src/utils/eventDetailState.js src/utils/eventDetailState.test.js src/components/CollapsibleSection.jsx src/components/GameNotesSection.jsx src/components/UnsaveConfirmDialog.jsx
```

Expected: tests PASS and ESLint exits 0.

---

### Task 3: Integrate confirmation and state-driven detail sections

**Files:**
- Modify: `client/src/pages/DiscoverPage.jsx`
- Modify: `client/src/pages/SavedPage.jsx`
- Modify: `client/src/pages/TeamSavedPage.jsx`
- Modify: `client/src/pages/EventDetailPage.jsx`

**Interfaces consumed:**
- Consume the exact `useSavedEvents`, component, and utility exports defined in Tasks 1 and 2.
- `EventCard` calls `onToggleSave(event)`; page hooks decide whether that means immediate save or pending removal.

- [ ] **Step 1: Integrate the shared unsave dialog on every page**

In Discover and Event Detail, destructure `pendingRemoval`, `cancelRemove`, and `confirmRemove` along with `toggleSave`, then render:

```jsx
<UnsaveConfirmDialog
  event={pendingRemoval}
  onCancel={cancelRemove}
  onConfirm={confirmRemove}
/>
```

In Saved and Team Saved, replace `removeSaved` with `requestRemove`, pass the event into `requestRemove`, and render the same dialog. Keep `EventCard` propagation behavior unchanged so clicking the bookmark does not navigate.

- [ ] **Step 2: Compute detail-page lifecycle state**

After resolving canonical team names, compute:

```js
const eventIsSaved = isSaved(event.id)
const eventIsPast = isPastEvent(event)
const showFinalScore = shouldShowFinalScore({
  isPast: eventIsPast,
  isSaved: eventIsSaved,
  hasAwayTeam,
})
const sectionOrder = getDetailSectionOrder({
  isPast: eventIsPast,
  isSaved: eventIsSaved,
  hasLeagueInfo: Boolean(leagueInfo),
})
```

Use `isPastEvent(event)` in the fetch effect's existing snapshot decision, preserving current semantics while keeping the loading path safe.

- [ ] **Step 3: Convert all secondary cards to collapsible sections**

Define `tickets`, `venue`, `notes`, and `league` JSX entries. Each entry uses `CollapsibleSection`; the image and Matchup markup remain untouched. Preserve all existing ticket, calendar, map, venue-knowledge, and league content inside the corresponding wrapper.

The notes entry renders only from `savedRecord`:

```jsx
<CollapsibleSection title="Game Notes">
  <GameNotesSection
    record={savedRecord}
    homeTeamName={homeTeamName}
    awayTeamName={awayTeamName}
    showScore={showFinalScore}
    onUpdate={patch => updateMetadata(event.id, patch)}
  />
</CollapsibleSection>
```

Render `sectionOrder.map(key => <Fragment key={key}>{sections[key]}</Fragment>)`. This enforces the approved upcoming and past order and prevents ticket content from rendering after the event.

- [ ] **Step 4: Verify lint and production compilation**

Run from `client`:

```powershell
npx eslint src/pages/DiscoverPage.jsx src/pages/SavedPage.jsx src/pages/TeamSavedPage.jsx src/pages/EventDetailPage.jsx
npm run build
```

Expected: ESLint exits 0 and Vite build succeeds.

---

### Task 4: Integrated verification and focused manual QA

**Files:**
- Modify only files from Tasks 1-3 when verification identifies a defect.

- [ ] **Step 1: Run the complete automated verification set**

Run from `client`:

```powershell
node --test
npm run lint
npm run build
```

Expected: all tests pass, ESLint exits 0, and Vite build succeeds without errors.

- [ ] **Step 2: Inspect the integrated implementation against the spec**

Confirm by code inspection that all four page routes render `UnsaveConfirmDialog`, no page imports or calls `removeSaved`, all secondary detail cards use `CollapsibleSection`, and `sectionOrder` controls card placement.

- [ ] **Step 3: Run manual browser QA if a local browser session is available**

Verify an upcoming saved event, an upcoming unsaved event, and a stored past event. Check collapse/open defaults, notes persistence after reload, blank and zero scores, rejection of invalid scores, ticket disappearance, past notes placement, confirmation cancel/confirm, Escape/backdrop behavior, and keyboard focus. If browser control is unavailable, report these exact checks as not manually exercised rather than claiming them.
