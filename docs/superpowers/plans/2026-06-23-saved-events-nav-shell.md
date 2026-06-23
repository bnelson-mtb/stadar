# Saved Events & Navigation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add saved-event persistence, a fixed bottom nav bar (Discover / Saved), a Saved page, and per-team saved-event pages to complete the Stadar web MVP.

**Architecture:** A new `useSavedEvents` hook mirrors the existing `useFavorites` pattern — full event snapshots stored in localStorage under `stadar-saved-events`. The app shell gains an `AppLayout` wrapper with a fixed-bottom `BottomNav`. The Saved page partitions saved events into Upcoming / Past / Your Teams using pure helper functions. Upcoming saved events silently refresh from the API when viewed on the detail page.

**Tech Stack:** React 18, React Router v7, Tailwind CSS v4, Vite, localStorage (no new backend work).

---

## Parallelization Strategy

This plan is designed for **five Haiku agents** across two parallel phases. Each agent works on non-overlapping files, so merge conflicts are minimal (only sequential `git pull --rebase` needed before pushing).

```
Task 0: Create branch (sequential, ~2 min)
    │
    ├─ Task 1A: Data layer       ─┐ PARALLEL
    └─ Task 1B: Nav shell         ┘ (both start after Task 0)
    
         ↓ MERGE GATE — merge 1A + 1B into feature/saved-events ↓

    ├─ Task 2A: EventCard + Discover  ─┐
    ├─ Task 2B: SavedPage + TeamPage   ├ PARALLEL
    └─ Task 2C: EventDetailPage        ┘ (all start after merge gate)
    
         ↓ MERGE GATE — merge 2A + 2B + 2C into feature/saved-events ↓
    
Task 3: Final verification (sequential)
```

---

## File Map

| File | Action | Task |
|------|--------|------|
| `client/src/hooks/useSavedEvents.js` | Create | 1A |
| `client/src/utils/savedHelpers.js` | Create | 1A |
| `client/src/components/BottomNav.jsx` | Create | 1B |
| `client/src/pages/SavedPage.jsx` | Create stub | 1B |
| `client/src/pages/TeamSavedPage.jsx` | Create stub | 1B |
| `client/src/App.jsx` | Modify | 1B |
| `client/src/components/EventCard.jsx` | Modify | 2A |
| `client/src/pages/DiscoverPage.jsx` | Modify | 2A |
| `client/src/pages/SavedPage.jsx` | Replace stub | 2B |
| `client/src/pages/TeamSavedPage.jsx` | Replace stub | 2B |
| `client/src/pages/EventDetailPage.jsx` | Modify | 2C |

---

## Task 0: Create Feature Branch

**Files:** none

- [ ] **Step 1: Create and push the branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout main
git pull
git checkout -b feature/saved-events
git push -u origin feature/saved-events
```

Expected: branch `feature/saved-events` exists on remote.

---

## Task 1A: Data Layer `[PHASE 1 — PARALLEL with 1B]`

**Files:**
- Create: `client/src/hooks/useSavedEvents.js`
- Create: `client/src/utils/savedHelpers.js`

- [ ] **Step 1: Pull the branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
```

- [ ] **Step 2: Create `useSavedEvents.js`**

Create `client/src/hooks/useSavedEvents.js`:

```js
import { useState } from 'react'

const STORAGE_KEY = 'stadar-saved-events'

function loadSaved() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function useSavedEvents() {
  const [savedEvents, setSavedEvents] = useState(loadSaved)

  function toggleSave(event) {
    setSavedEvents(prev => {
      const exists = prev.some(r => r.event.id === event.id)
      const next = exists
        ? prev.filter(r => r.event.id !== event.id)
        : [...prev, { event, savedAt: new Date().toISOString() }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function isSaved(id) {
    return savedEvents.some(r => r.event.id === id)
  }

  function removeSaved(id) {
    setSavedEvents(prev => {
      const next = prev.filter(r => r.event.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function updateSnapshot(freshEvent) {
    setSavedEvents(prev => {
      const next = prev.map(r =>
        r.event.id === freshEvent.id ? { ...r, event: freshEvent } : r
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { savedEvents, toggleSave, isSaved, removeSaved, updateSnapshot }
}
```

- [ ] **Step 3: Create `savedHelpers.js`**

Create `client/src/utils/savedHelpers.js`:

```js
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
```

- [ ] **Step 4: Commit and push**

```bash
git add client/src/hooks/useSavedEvents.js client/src/utils/savedHelpers.js
git commit -m "feat: add useSavedEvents hook and savedHelpers utilities"
git push origin feature/saved-events
```

---

## Task 1B: Navigation Shell `[PHASE 1 — PARALLEL with 1A]`

**Files:**
- Create: `client/src/components/BottomNav.jsx`
- Create stub: `client/src/pages/SavedPage.jsx`
- Create stub: `client/src/pages/TeamSavedPage.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Pull the branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
```

- [ ] **Step 2: Create `BottomNav.jsx`**

Create `client/src/components/BottomNav.jsx`:

```jsx
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`
        }
      >
        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        Discover
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`
        }
      >
        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        Saved
      </NavLink>
    </nav>
  )
}
```

- [ ] **Step 3: Create stub `SavedPage.jsx`**

Create `client/src/pages/SavedPage.jsx` (stub — Task 2B replaces this):

```jsx
export default function SavedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-400">
      Saved (coming soon)
    </div>
  )
}
```

- [ ] **Step 4: Create stub `TeamSavedPage.jsx`**

Create `client/src/pages/TeamSavedPage.jsx` (stub — Task 2B replaces this):

```jsx
export default function TeamSavedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-400">
      Team page (coming soon)
    </div>
  )
}
```

- [ ] **Step 5: Rewrite `App.jsx`**

Replace the entire contents of `client/src/App.jsx`:

```jsx
import { Routes, Route, Outlet } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import TeamSavedPage from './pages/TeamSavedPage.jsx'

function AppLayout() {
  return (
    <div className="pb-16">
      <Outlet />
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/saved" element={<SavedPage />} />
      </Route>
      <Route path="/saved/team/:teamName" element={<TeamSavedPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
    </Routes>
  )
}

export default App
```

The `pb-16` (64 px) on the wrapper prevents content from hiding behind the fixed nav bar. Sub-pages (`/event/:id`, `/saved/team/:teamName`) are intentionally outside `AppLayout` — they have no bottom nav.

- [ ] **Step 6: Run dev server and verify nav bar renders**

```bash
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

Open http://localhost:5173. You should see the Discover tab active and a fixed bottom nav bar with Discover and Saved icons. Clicking Saved should show "Saved (coming soon)". No console errors.

- [ ] **Step 7: Commit and push**

```bash
git add client/src/components/BottomNav.jsx client/src/pages/SavedPage.jsx client/src/pages/TeamSavedPage.jsx client/src/App.jsx
git commit -m "feat: add AppLayout, BottomNav, and route tree with stub pages"
git push origin feature/saved-events
```

---

> ## ⚠️ MERGE GATE 1
> Both Task 1A and Task 1B must be pushed to `feature/saved-events` before starting Phase 2.
> Each Phase 2 agent should start with `git pull origin feature/saved-events` to pick up both commits.

---

## Task 2A: EventCard Bookmark + Discover Wiring `[PHASE 2 — PARALLEL with 2B and 2C]`

**Files:**
- Modify: `client/src/components/EventCard.jsx`
- Modify: `client/src/pages/DiscoverPage.jsx`

- [ ] **Step 1: Pull the merged branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
```

- [ ] **Step 2: Rewrite `EventCard.jsx`**

Replace the entire contents of `client/src/components/EventCard.jsx`. Key changes: add `isSavedEvent`, `onToggleSave`, and `backTo` props; add bookmark button; pass `backTo` in navigate call.

```jsx
import { useNavigate } from 'react-router-dom'
import { SPORT_ICONS, LEAGUE_COLORS, getCanonicalTeamName, getTeamData } from '../data/teams'
import TeamLogo from './TeamLogo'

function EventCard({ event, isFavorite, onToggleFavorite, stateCode, isSavedEvent = false, onToggleSave = () => {}, backTo = undefined }) {
  const navigate = useNavigate()
  const homeTeamName = getCanonicalTeamName(event.homeTeam)
  const awayTeamName = getCanonicalTeamName(event.awayTeam)

  // Parse localDate as a plain calendar date (no timezone conversion)
  const [year, month, day] = (event.localDate || '').split('-').map(Number)
  const localDateObj = event.localDate ? new Date(year, month - 1, day) : null
  const dayOfWeek = localDateObj ? localDateObj.toLocaleDateString('en-US', { weekday: 'short' }) : ''
  const monthDay = localDateObj ? localDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  // Format localTime or show "Time TBD"
  const time = event.localTime
    ? new Date(`1970-01-01T${event.localTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Time TBD'

  const badgeLabel = event.league
  const badgeColor = LEAGUE_COLORS[event.league] || 'bg-gray-500'
  const borderColor = getTeamData(event.homeTeam)?.color || '#6B7280'
  const icon = SPORT_ICONS[event.sport] || ''

  const handleCardClick = () => {
    navigate(`/event/${event.id}`, { state: { event, fromStateCode: stateCode, backTo } })
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow border-l-4 cursor-pointer"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {badgeLabel}
            </span>
            <span className="text-sm">{icon}</span>
            <span className="text-xs text-gray-400">{event.sport}</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <TeamLogo name={homeTeamName} />
            <span className="text-lg font-bold text-gray-900">{homeTeamName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(homeTeamName) }}
              className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
              title={isFavorite ? `Unfollow ${homeTeamName}` : `Follow ${homeTeamName}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
          </div>
          {awayTeamName && (
            <div className="flex items-center gap-2">
              <TeamLogo name={awayTeamName} />
              <span className="text-base text-gray-600">{awayTeamName}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {event.venue}
            </span>
            <span className="text-gray-300">&middot;</span>
            <span>{event.city}, {event.state}</span>
          </div>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(event) }}
            className={`transition-colors ${isSavedEvent ? 'text-blue-500' : 'text-gray-300 hover:text-blue-300'}`}
            title={isSavedEvent ? 'Remove from saved' : 'Save event'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isSavedEvent ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>
          <div className="text-xs font-medium text-gray-400 uppercase">{dayOfWeek}</div>
          <div className="text-lg font-bold text-gray-900">{monthDay}</div>
          <div className="text-sm text-gray-500">{time}</div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
```

- [ ] **Step 3: Wire `useSavedEvents` into `DiscoverPage.jsx`**

Make three targeted edits to `client/src/pages/DiscoverPage.jsx`:

**Edit 1** — add import after the existing `useFavorites` import (line 6):
```jsx
import useSavedEvents from '../hooks/useSavedEvents.js'
```

**Edit 2** — add the hook call directly after the `useFavorites` call (around line 164):
```jsx
const { toggleSave, isSaved } = useSavedEvents()
```

**Edit 3** — update the `<EventCard>` render (around lines 356–362). Replace:
```jsx
<EventCard
  key={event.id}
  event={event}
  isFavorite={isFavorite(getCanonicalTeamName(event.homeTeam))}
  onToggleFavorite={toggleFavorite}
  stateCode={stateCode}
/>
```
With:
```jsx
<EventCard
  key={event.id}
  event={event}
  isFavorite={isFavorite(getCanonicalTeamName(event.homeTeam))}
  onToggleFavorite={toggleFavorite}
  stateCode={stateCode}
  isSavedEvent={isSaved(event.id)}
  onToggleSave={toggleSave}
/>
```

- [ ] **Step 4: Run dev server and verify bookmark**

```bash
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

Open http://localhost:5173. Event cards should show a bookmark icon (outline) in the top-right corner. Clicking it should fill it blue and persist through a page refresh. No console errors.

- [ ] **Step 5: Commit and push**

```bash
git add client/src/components/EventCard.jsx client/src/pages/DiscoverPage.jsx
git commit -m "feat: add bookmark save action to EventCard and wire DiscoverPage"
git push origin feature/saved-events
```

If another Phase 2 agent already pushed, run `git pull --rebase origin feature/saved-events` before pushing.

---

## Task 2B: SavedPage + TeamSavedPage `[PHASE 2 — PARALLEL with 2A and 2C]`

**Files:**
- Replace stub: `client/src/pages/SavedPage.jsx`
- Replace stub: `client/src/pages/TeamSavedPage.jsx`

- [ ] **Step 1: Pull the merged branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
```

- [ ] **Step 2: Rewrite `SavedPage.jsx`**

Replace the entire contents of `client/src/pages/SavedPage.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import useFavorites from '../hooks/useFavorites.js'
import { partitionByTime, groupSavedByTeam } from '../utils/savedHelpers.js'

export default function SavedPage() {
  const { savedEvents, removeSaved } = useSavedEvents()
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const [pastExpanded, setPastExpanded] = useState(false)

  const { upcoming, past } = partitionByTime(savedEvents)
  const teamMap = groupSavedByTeam(savedEvents, favorites)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Saved</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming saved events.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(r => (
                <EventCard
                  key={r.event.id}
                  event={r.event}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                  stateCode={r.event.state}
                  isSavedEvent={true}
                  onToggleSave={() => removeSaved(r.event.id)}
                  backTo="/saved"
                />
              ))}
            </div>
          )}
        </section>

        {/* Past (collapsible) */}
        {past.length > 0 && (
          <section>
            <button
              onClick={() => setPastExpanded(prev => !prev)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3 w-full text-left"
            >
              <span>Past</span>
              <svg
                className={`w-4 h-4 transition-transform ${pastExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {pastExpanded && (
              <div className="flex flex-col gap-3">
                {past.map(r => (
                  <EventCard
                    key={r.event.id}
                    event={r.event}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                    stateCode={r.event.state}
                    isSavedEvent={true}
                    onToggleSave={() => removeSaved(r.event.id)}
                    backTo="/saved"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Your Teams */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Teams</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400 text-sm">Follow teams on the Discover page to see them here.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {favorites.map(team => (
                <button
                  key={team}
                  onClick={() => navigate(`/saved/team/${encodeURIComponent(team)}`)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md transition-shadow"
                >
                  <TeamLogo name={team} />
                  <span className="font-medium text-gray-800">{team}</span>
                  {teamMap[team]?.length > 0 && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                      {teamMap[team].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `TeamSavedPage.jsx`**

Replace the entire contents of `client/src/pages/TeamSavedPage.jsx`:

```jsx
import { useParams, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '../data/teams.js'

export default function TeamSavedPage() {
  const { teamName } = useParams()
  const decodedTeam = decodeURIComponent(teamName)
  const navigate = useNavigate()
  const { savedEvents, removeSaved } = useSavedEvents()

  const teamEvents = savedEvents
    .filter(r => {
      const home = getCanonicalTeamName(r.event.homeTeam)
      const away = r.event.awayTeam ? getCanonicalTeamName(r.event.awayTeam) : null
      return home === decodedTeam || away === decodedTeam
    })
    .sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/saved')}
            className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            ← Saved
          </button>
          <div className="flex items-center gap-2">
            <TeamLogo name={decodedTeam} size="large" />
            <h1 className="text-xl font-bold text-gray-900">{decodedTeam}</h1>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {teamEvents.length === 0 ? (
          <p className="text-gray-400 text-sm">No saved events for {decodedTeam} yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teamEvents.map(r => (
              <EventCard
                key={r.event.id}
                event={r.event}
                isFavorite={false}
                onToggleFavorite={() => {}}
                stateCode={r.event.state}
                isSavedEvent={true}
                onToggleSave={() => removeSaved(r.event.id)}
                backTo={`/saved/team/${encodeURIComponent(decodedTeam)}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

1. Go to http://localhost:5173. Save at least one event using the bookmark icon on a card.
2. Tap **Saved** in the bottom nav. You should see the saved event under **Upcoming**.
3. If you have favorite teams (heart icon), they should appear under **Your Teams** as tappable cards.
4. Tap a team card — it should navigate to `/saved/team/...` showing that team's saved events.
5. No console errors.

- [ ] **Step 5: Commit and push**

```bash
git add client/src/pages/SavedPage.jsx client/src/pages/TeamSavedPage.jsx
git commit -m "feat: implement SavedPage and TeamSavedPage"
git push origin feature/saved-events
```

If another Phase 2 agent already pushed, run `git pull --rebase origin feature/saved-events` before pushing.

---

## Task 2C: EventDetailPage Bookmark + Snapshot Refresh `[PHASE 2 — PARALLEL with 2A and 2B]`

**Files:**
- Modify: `client/src/pages/EventDetailPage.jsx`

- [ ] **Step 1: Pull the merged branch**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
```

- [ ] **Step 2: Add `useSavedEvents` import**

At the top of `client/src/pages/EventDetailPage.jsx`, after the existing imports, add:

```jsx
import useSavedEvents from '../hooks/useSavedEvents.js'
```

- [ ] **Step 3: Replace the hook/state initialization block**

Find the existing state initialization at the top of `EventDetailPage` (lines 67–74 in the original):

```jsx
function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState(location.state?.event ?? null)
  const [loading, setLoading] = useState(!event)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef(null)
```

Replace with:

```jsx
function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isSaved, toggleSave, updateSnapshot, savedEvents } = useSavedEvents()
  const savedRecord = savedEvents.find(r => r.event.id === id)
  const [event, setEvent] = useState(
    () => location.state?.event ?? savedRecord?.event ?? null
  )
  const [loading, setLoading] = useState(!event)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef(null)
```

The `savedRecord` lookup gives a free snapshot fallback when someone navigates directly to a saved event's URL without router state.

- [ ] **Step 4: Replace the fetch `useEffect`**

Find the existing fetch effect (lines 86–95 in the original):

```jsx
useEffect(() => {
  if (event) return

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5068'
  fetch(`${apiBase}/api/events/${id}`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Not found')))
    .then(setEvent)
    .catch(() => setEvent(null))
    .finally(() => setLoading(false))
}, [id, event])
```

Replace with:

```jsx
useEffect(() => {
  const isEventSaved = isSaved(id)
  const isPast = event ? new Date(event.dateTime) <= new Date() : false

  // Skip fetch for non-saved events that already have router state,
  // and for past saved events (always use snapshot).
  if (event && (!isEventSaved || isPast)) return

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5068'
  fetch(`${apiBase}/api/events/${id}`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Not found')))
    .then(fresh => {
      setEvent(fresh)
      if (isEventSaved) updateSnapshot(fresh)
    })
    .catch(() => {
      // Only clear event if there is no snapshot fallback
      if (!event) setEvent(null)
    })
    .finally(() => setLoading(false))
}, [id]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 5: Update `handleBack`**

Find the existing `handleBack` function (lines 77–84 in the original):

```jsx
function handleBack() {
  const fromStateCode = location.state?.fromStateCode
  if (fromStateCode) {
    navigate('/', { state: { stateCode: fromStateCode } })
    return
  }
  navigate(-1)
}
```

Replace with:

```jsx
function handleBack() {
  const { backTo, fromStateCode } = location.state ?? {}
  // backTo is set by SavedPage / TeamSavedPage; fromStateCode is set by DiscoverPage
  if (backTo) {
    navigate(backTo)
    return
  }
  if (fromStateCode) {
    navigate('/', { state: { stateCode: fromStateCode } })
    return
  }
  navigate(-1)
}
```

This routes back to the Discover page (with state restoration) when coming from there, back to `/saved` or `/saved/team/...` when coming from those pages, and falls back to browser history otherwise.

- [ ] **Step 6: Add the bookmark button to the detail page header**

Find the header action area (lines 171–187 in the original):

```jsx
<div className="w-20 flex justify-end">
  {copied ? (
    <span className="text-xs font-medium text-green-600 pr-1">Copied!</span>
  ) : (
    <button
      type="button"
      onClick={handleShare}
      className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
      aria-label="Share event"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
      </svg>
    </button>
  )}
</div>
```

Replace with:

```jsx
<div className="flex items-center gap-1">
  <button
    type="button"
    onClick={() => toggleSave(event)}
    className={`p-2 transition-colors ${isSaved(event.id) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-700'}`}
    aria-label={isSaved(event.id) ? 'Remove from saved' : 'Save event'}
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved(event.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  </button>
  {copied ? (
    <span className="text-xs font-medium text-green-600 pr-1">Copied!</span>
  ) : (
    <button
      type="button"
      onClick={handleShare}
      className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
      aria-label="Share event"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
      </svg>
    </button>
  )}
</div>
```

Note: this bookmark button is only rendered after the `if (!event)` guard, so `event` is guaranteed non-null here.

- [ ] **Step 7: Run dev server and verify**

```bash
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

1. Click an event card — the detail page should show a bookmark icon next to the share button in the header.
2. Tap the bookmark icon — it should fill blue. Tap again — it unfills.
3. Save an event, navigate to it again from the Saved page — the bookmark should be filled and the page should silently refresh data.
4. Navigate back from the detail page — should return to the correct page (Discover or Saved) depending on origin.
5. No console errors.

- [ ] **Step 8: Commit and push**

```bash
git add client/src/pages/EventDetailPage.jsx
git commit -m "feat: add bookmark and snapshot-refresh logic to EventDetailPage"
git push origin feature/saved-events
```

If another Phase 2 agent already pushed, run `git pull --rebase origin feature/saved-events` before pushing.

---

> ## ⚠️ MERGE GATE 2
> All three Phase 2 tasks (2A, 2B, 2C) must be pushed to `feature/saved-events` before Task 3.

---

## Task 3: Final Verification (sequential)

**Files:** none (read-only verification)

- [ ] **Step 1: Pull all Phase 2 changes**

```bash
cd C:\Users\brady\Repos\stadar
git checkout feature/saved-events
git pull origin feature/saved-events
git log --oneline -8
```

Expected: 6 commits from Tasks 0, 1A, 1B, 2A, 2B, 2C.

- [ ] **Step 2: Run dev server**

```bash
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

- [ ] **Step 3: End-to-end smoke test**

Walk through each scenario:

1. **Bottom nav** — Discover and Saved tabs both visible and switch correctly.
2. **Bookmark on card** — Click bookmark on any Discover event card; icon fills blue. Refresh the page; it stays blue.
3. **Bookmark on detail** — Open the saved event; bookmark icon is filled. Tapping it removes the event.
4. **Saved page: Upcoming** — Saved future events appear under "Upcoming" section.
5. **Saved page: Past** — Save an event and manually change its `dateTime` in localStorage to a past date, reload; it appears under "Past" (collapsed by default).
6. **Saved page: Your Teams** — Follow a team via the heart icon on Discover, go to Saved; team card appears. Tap it to open team page.
7. **Team page** — Shows all saved games for that team (home or away). Back button returns to Saved.
8. **Back navigation** — From Discover → detail → Back: returns to Discover. From Saved → detail → Back: returns to Saved.
9. **No console errors** throughout.

- [ ] **Step 4: Run API tests (unrelated, quick sanity check)**

```bash
cd C:\Users\brady\Repos\stadar\Api.Tests
dotnet test
```

Expected: all tests pass (this feature adds no backend changes).

- [ ] **Step 5: Final commit note**

No code changes needed. The branch is ready for PR or merge into main.
