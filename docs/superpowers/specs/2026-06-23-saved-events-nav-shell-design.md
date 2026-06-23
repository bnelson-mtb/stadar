# Design: Saved Events & Navigation Shell

**Date:** 2026-06-23
**Status:** Approved

## Summary

Complete the Stadar web MVP by adding persistent saved events, a bottom navigation bar, a Saved page, and per-team saved-event pages. The feature closes the last MVP gap: turning the app from a browse-only discovery tool into something you return to and plan with.

No auth or database is introduced. Persistence is localStorage, with the event snapshot shape intentionally matching what a future DB row / API payload would carry (DB-ready data model).

---

## 1. Persistence & Data Model

### localStorage key
`stadar-saved-events`

### Record shape
Each saved entry wraps a full SportEvent snapshot plus a `savedAt` timestamp:

```js
{
  event: {
    id, name, homeTeam, awayTeam,
    dateTime, venue, sport, league,
    city, state, latitude, longitude,
    ticketUrl, imageUrl,
    priceMin, priceMax, currency,
    localDate, localTime
  },
  savedAt: "2026-06-23T18:00:00Z"  // ISO string
}
```

Full snapshot guarantees the event never disappears even after it leaves the Ticketmaster API. Keyed internally by `event.id`.

### `useSavedEvents` hook (new, mirrors `useFavorites`)

```js
const { savedEvents, toggleSave, isSaved, removeSaved } = useSavedEvents()
```

- `savedEvents` — array of saved records, loaded from localStorage on mount
- `toggleSave(event)` — adds a snapshot if not saved, removes it if already saved
- `isSaved(id)` — boolean
- `removeSaved(id)` — explicit remove (used on the Saved page per-card)

`stadar-favorites` (team-following) remains a **separate concern** from event-saving. The two hooks coexist.

---

## 2. Navigation Shell

### Before
`App.jsx` has two bare routes with no shared layout:
- `/` → DiscoverPage
- `/event/:id` → EventDetailPage

### After
Introduce an `AppLayout` component that renders a fixed-bottom `BottomNav` plus `<Outlet />` for nested routes.

**Route tree:**

| Path | Component | Nav visible? |
|------|-----------|--------------|
| `/` | DiscoverPage | Yes |
| `/saved` | SavedPage | Yes |
| `/saved/team/:teamName` | TeamSavedPage | No (back button) |
| `/event/:id` | EventDetailPage | No (back button) |

The bottom bar stays at the bottom on all viewport sizes. On desktop, content stays centered (max-width container); the nav bar spans full width. The two tabs are **Discover** and **Saved**, marked active by matching `pathname`.

---

## 3. Save Action UI

A **bookmark icon** button is added to `EventCard` and `EventDetailPage`:

- Visually distinct from the team-follow heart (bookmark shape, not heart)
- Filled = saved; outline = unsaved
- Tap calls `toggleSave(event)` with `e.stopPropagation()` to avoid card navigation
- On `EventCard`: lives top-right of the card alongside the date
- On `EventDetailPage`: lives in the header/action row

The bookmark icon is purely a save-event action. The existing heart remains a team-follow action.

---

## 4. Saved Page (`/saved`)

Single scrolling page with three sections, in order:

### 4a. Upcoming
- Saved events where `event.dateTime > now`, sorted ascending (soonest first)
- Rendered as `EventCard` components
- If empty: "No upcoming saved events" placeholder

### 4b. Past (collapsible)
- Saved events where `event.dateTime <= now`, sorted descending (most recent first)
- Collapsed by default; user taps to expand
- Each card includes a **Remove** action (calls `removeSaved(id)`)
- Always shows the stored snapshot — no API refresh for past events
- If empty: section is omitted entirely

### 4c. Your Teams
- One card per team in `stadar-favorites`, regardless of whether they have saved events
- Tapping a team card navigates to `/saved/team/:teamName`
- If no favorite teams: "Follow teams on the Discover page to see them here"

### Partition logic
Pure helpers (non-React, importable): `partitionByTime(savedEvents, now)` → `{ upcoming, past }` and `groupSavedByTeam(savedEvents, favoriteTeams)` → map of teamName → saved records. These are self-contained and easy to unit-test if tests are added later.

---

## 5. Team Saved Page (`/saved/team/:teamName`)

Accessible via `/saved/team/:teamName` (URL-encoded).

- Header: team logo + team name
- Back button to `/saved`
- Lists all saved events where `getCanonicalTeamName(homeTeam) === teamName` **or** `getCanonicalTeamName(awayTeam) === teamName` — home or away
- Sorted ascending
- If no saved events for this team: "No saved events for [Team Name] yet."
- Cards link to `/event/:id` as normal

---

## 6. Snapshot + Refresh Behavior

When the user opens a **detail page** for a saved event:

- **Past event** (dateTime ≤ now): render snapshot directly, no fetch
- **Upcoming event** (dateTime > now): attempt `GET /api/events/{id}`
  - On success: render fresh data **and update the stored snapshot** (keeps future views current)
  - On 404 or network failure: fall back to snapshot, show no error (event may have left the API)

Non-saved events behave as they do today (fetch always attempted; 404 shows error state).

---

## 7. Out of Scope (explicit deferral)

| Item | Notes |
|------|-------|
| Auth / accounts | localStorage only for MVP; DB-ready shape enables migration |
| Cross-device sync | Requires auth; deferred |
| Memories / past-event scores | Groundwork laid (past events persist); feature deferred |
| Frontend test runner (Vitest) | Skipped for MVP; pure helpers are structured to allow it later |
| React Native port | Deferred to v2, after web MVP stabilizes and SeatGeek API is available |
| Profile tab | Not added; location picker + favorites stay in Discover header |
| Date grouping / search | Not in this effort; next roadmap item after deploy |

---

## 8. Files Changed (anticipated)

| File | Change |
|------|--------|
| `client/src/App.jsx` | Add `AppLayout`, `BottomNav`, update route tree |
| `client/src/hooks/useSavedEvents.js` | New hook |
| `client/src/components/BottomNav.jsx` | New component |
| `client/src/components/EventCard.jsx` | Add bookmark icon, accept `isSaved`/`onToggleSave` props |
| `client/src/pages/DiscoverPage.jsx` | Wire `useSavedEvents`, pass props to EventCard |
| `client/src/pages/SavedPage.jsx` | New page |
| `client/src/pages/TeamSavedPage.jsx` | New page |
| `client/src/pages/EventDetailPage.jsx` | Add bookmark, snapshot-refresh logic |
| `client/src/utils/savedHelpers.js` | New — `partitionByTime`, `groupSavedByTeam` |
