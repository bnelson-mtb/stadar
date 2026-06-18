# Trust Layer & Forward Roadmap — Design Spec
_2026-06-17_

## Goal

Make Stadar return a clean, believable, spectator-ready list of events **for every US state**, not just the hand-tuned Utah market — then build UI and feature depth on top of that foundation.

Today, opening a high-volume state (e.g. California) exposes the app's weak spots: cancelled events, fishing trips, watch parties, misclassified DJ sets, midnight ("12:00 AM") and wrong-timezone start times, and placeholder "matchups" like _2026 World Cup vs Bosnia & Herzegovina National Football Team_. This spec fixes the data layer first, then layers on date grouping and search.

**Guiding decisions (agreed during brainstorming):**
- **Strict filtering** — only show clear spectator sporting events with an identifiable team/competitor. When in doubt, drop it.
- **Backend-first** — all validation, filtering, and time normalization live in the API so there is one source of truth, it's covered by the existing `Api.Tests` MSTest suite, and the future React Native client inherits clean data.
- **Auto-detect location** — resolve the user's state on load via IP geolocation, fall back to UT, persist their choice to localStorage. Dropdown remains the manual override.
- **Venue-local time** — display Ticketmaster's `localTime`/`localDate` verbatim (the actual time at the stadium), never the browser's timezone.

---

## Evidence (from the California snapshot)

Real rows currently returned for `stateCode=CA`, with the root cause traced in code:

| What renders | Root cause | Location |
|---|---|---|
| "World Cup 26 Watch Party … - **CANCELLED**" | `dates.status.code` is never checked | `TicketmasterClient.ParseEvent` |
| "Barrett Lake **Fishing**", "Todd Edwards" (a DJ) | Only gate is "has a home team"; any single-attraction listing survives | `ParseEvent` returns null only when `homeTeam` empty |
| Minor-league games at **"12:00 AM"** | No precise `dateTime` → falls back to `localDate` → midnight | `ExtractDateTime` |
| "Sat **Mar 8** 1:00 AM" (past date / wrong hour) | Time rendered in the **browser's** timezone, not the venue's | `EventCard.jsx` `toLocaleTimeString` |
| "2026 World Cup" vs "Bosnia & Herzegovina National Football Team" | Placeholder/competition name parsed as a team | `ExtractTeams` + `NormalizeEvent` |
| Junk badges "TE", "C-C", "2WC", "B&H" | Initials fallback for non-team names (symptom of the above) | `TeamLogo.jsx` |

These exact rows become the regression fixtures for the new filter (see Testing).

---

## Phase 1 — Trust Layer + Location  *(the "usable everywhere" phase — specced in full)*

### 1.1 Event quality gate (backend)

A single, ordered, testable gate decides whether a parsed event is shown. Implemented as a static `EventFilter.IsSpectatorEvent(...)` (new file `Api/Services/EventFilter.cs`) called from `TicketmasterClient.ParseEvent` after normalization; `ParseEvent` returns `null` (event dropped) when the gate fails.

**Drop the event if ANY of these are true:**

1. **Cancelled / postponed** — `dates.status.code` ∈ { `canceled`, `cancelled`, `postponed` } (match both spellings; Ticketmaster uses `canceled`). Keep `rescheduled` — those are still real future games with a new date.
2. **Past** — event start (UTC `dateTime`, or `localDate` at end-of-day if no time) is before _now_. (Cheap correctness win: Ticketmaster occasionally returns stale rows.)
3. **Name denylist** — event name contains (case-insensitive) any of: `watch party`, `viewing party`, `fan fest`, `fanfest`, `fan zone`, `tailgate`, `parking`, `meet and greet`, `meet & greet`, `fishing`, `tryout`, `combine`, `clinic`, `tour:`. The list lives as a `string[]` constant so Brady can extend it.
4. **Unrecognized as a real sporting event** — after normalization, `Sport == "Misc"`.
5. **Placeholder home team** — `HomeTeam` is a competition/series name, not a club. Heuristic: home team (case-insensitive) contains `world cup`, `championship`, `tournament`, `series`, `playoff`, `all-star`, `all star` **and** there is no recognized league. (Real tournament games tagged with a proper league/subGenre are kept — see 1.2.)

**Otherwise keep the event if EITHER:**

- It has a **recognized non-empty `League`** (NBA/WNBA/NHL/NFL/MLB/MLS/NWSL/PLL/NCAA*/AHL/ECHL/Minor League/…), **or**
- It is a **clear club-vs-club matchup**: both `HomeTeam` and `AwayTeam` are non-empty, neither is a placeholder (rule 5), and the title read like a matchup (`vs`/`@`). This keeps legit lower-tier club games such as _Oakland Roots vs Birmingham Legion FC_ that arrive with an empty league.

> **Known hard case — international / national-team soccer.** National-team rows with an empty league at small non-stadium venues (e.g. _Mexico vs South Korea_ at "Academy LA") are watch parties in disguise and are dropped by rules 4–5 + the empty-league requirement. Genuine FIFA World Cup 2026 matches arrive with a proper Ticketmaster classification and are kept once that subGenre is mapped to a league (1.2). This is the single most tunable area and is pinned down by fixtures, not guesswork.

### 1.2 Recognized-league coverage (backend)

Extend `EventNormalizer.MatchProLeague` so real events that are currently slipping through as empty-league get a label (which then satisfies the keep-rule and renders a clean badge):

| Ticketmaster subGenre (lowercased) | Sport | League |
|---|---|---|
| `usl championship`, `usl league one`, `united soccer league` | Soccer | USL |
| `liga mx` | Soccer | Liga MX |
| `fifa world cup`, `world cup` | Soccer | World Cup |
| `international soccer` *(only when at a recognized stadium — else dropped by 1.1)* | Soccer | International |

Club lists (`IsNwslTeam` etc.) already follow this pattern; new leagues reuse it. Anything still unrecognized after this stays `Misc`/empty and is dropped under strict mode — acceptable and intentional.

### 1.3 Time / date normalization (backend + card)

**Model change — `Api/Models/SportEvent.cs`:** add two fields sourced straight from Ticketmaster's venue-local block:

```csharp
string LocalDate = "",   // "2026-06-17" from dates.start.localDate
string? LocalTime = null // "20:00:00" from dates.start.localTime, null when absent
```

- Keep the existing UTC `DateTime` for **sorting** and the past-event check only.
- `ExtractDateTime` also reads `dates.start.localDate` / `localTime` and the `dateTBA` / `timeTBA` / `noSpecificTime` booleans. When time is TBA/absent, `LocalTime` stays `null`.

**Frontend — `EventCard.jsx` (and `EventDetailPage.jsx`):** render from `LocalDate` / `LocalTime` directly, with **no timezone conversion**:

- Day/month from `LocalDate` (parse as a plain calendar date, not a `Date` in browser TZ).
- Time from `LocalTime` formatted to `h:mm a`; when `LocalTime` is null show **"Time TBD"** instead of "12:00 AM".

This single change fixes both the midnight rows and the wrong-timezone rows in the snapshot.

### 1.4 Auto-location (frontend)

- On load, `DiscoverPage` reads `localStorage['stadar-location']`. If present and valid, use it.
- If absent, call a free IP-geolocation endpoint (e.g. `https://ipapi.co/json/` or `https://ipwho.is/`) to get `region_code`. If it's a US state in `US_STATES`, default to it; otherwise fall back to `'UT'`. The lookup is non-blocking and time-bounded — render must never hang on it.
- Selecting a state in the dropdown writes `localStorage['stadar-location']`. (This also closes existing roadmap item #6, "persist location.")
- Privacy note: IP geolocation is approximate and prompt-free; precise GPS is deferred to Phase 3.

### 1.5 Graceful fallbacks (frontend)

- **Initials** in `TeamLogo.jsx`: single-word names → first 3 letters uppercased ("Croatia" → "CRO"); multi-word → first letter of up to 3 words (current behavior). After strict filtering most logo-less rows are real teams, so this reads cleanly.
- Keep existing empty/error states; verify the "No upcoming events found" path looks intentional for low-volume states.

### 1.6 Filter pills cleanup (frontend)

`DEFAULT_SPORTS` / `DEFAULT_LEAGUES` in `DiscoverPage.jsx` currently force pills (NCAAF, MLB, …) to appear even when a state has none of those events. Derive pills **only** from the events actually returned, so filters never advertise empty categories. Drop `Misc` from `SPORT_ORDER`/`LEAGUE_ORDER` since strict filtering removes it.

### 1.7 Testing (MSTest, `Api.Tests`)

New `EventFilterTests.cs` with fixtures lifted from the CA snapshot. **Must be dropped:**
- "World Cup 26 Watch Party (England v Croatia) - CANCELLED" (status + name + placeholder)
- "Barrett Lake Fishing" (denylist + Misc)
- "Todd Edwards" single act (Misc)
- "2026 World Cup" vs "Bosnia & Herzegovina National Football Team" (placeholder home)
- "Mexico vs South Korea" at "Academy LA" (empty-league national-team watch party)

**Must be kept:**
- Golden State Valkyries vs Dallas Wings (WNBA)
- Anaheim Ducks (NHL)
- Stockton Ports vs Visalia Rawhide (Minor League Baseball)
- Oakland Roots vs Birmingham Legion FC (club matchup, empty league → kept by matchup rule)

Plus unit tests for `ExtractDateTime` populating `LocalDate`/`LocalTime` and leaving `LocalTime` null on `timeTBA`.

---

## Phase 2 — UI Expansion  *(led by date grouping + search)*

Lighter detail; specced fully when Phase 1 lands.

1. **Date grouping** — group the filtered list into **Today / This Weekend / This Week / Later** sections (computed from `LocalDate`) with sticky section headers in `DiscoverPage`.
2. **Search** — a text input filtering the fetched events client-side by team name, city, and venue; composes with the existing sport/league/favorites filters.
3. Skeleton loaders, a date-range filter, fill remaining team logos, and a general visual polish pass (hero/header, card spacing, mobile).

## Phase 3 — Depth & Reach

1. **Precise "near me"** — opt-in browser geolocation + radius search; requires moving beyond single-`stateCode` Ticketmaster queries (lat/long + multi-state).
2. **Share / calendar export** — shareable event links, add-to-calendar (.ics).
3. **React Native conversion** — already on the CLAUDE.md roadmap; benefits directly from the clean, backend-owned data contract built in Phase 1.

---

## Files Changed (Phase 1)

| File | Change |
|---|---|
| `Api/Services/EventFilter.cs` | **New** — `IsSpectatorEvent` strict gate (status, past, denylist, Misc, placeholder, keep-rules) |
| `Api/Services/TicketmasterClient.cs` | Call the gate in `ParseEvent`; populate `LocalDate`/`LocalTime`; read status + TBA flags |
| `Api/Services/EventNormalizer.cs` | Add USL / Liga MX / World Cup / International to `MatchProLeague` |
| `Api/Models/SportEvent.cs` | Add `LocalDate`, `LocalTime` fields |
| `Api.Tests/EventFilterTests.cs` | **New** — keep/drop fixtures from the CA snapshot + time tests |
| `client/src/components/EventCard.jsx` | Render `LocalDate`/`LocalTime`; "Time TBD" fallback |
| `client/src/pages/EventDetailPage.jsx` | Same venue-local time rendering |
| `client/src/components/TeamLogo.jsx` | Improved single-word initials |
| `client/src/pages/DiscoverPage.jsx` | Auto-location + localStorage persistence; pills derived from real data |

---

## Out of Scope (Phase 1)

- Precise GPS / radius search (Phase 3)
- Any non-Ticketmaster data source
- Auth / database — localStorage only, per MVP
- Caring about non-US events (Ticketmaster query stays `stateCode`-based)
- Perfectly resolving every international-soccer edge case beyond the fixtures above — the gate is intentionally tunable
