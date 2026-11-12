# Mobile app MVP (Expo) — design

Date: 2026-11-11
Status: approved design, not yet planned

## Goal

A React Native app for Stadar that has every screen the web app has, runs on
an Android phone through Expo Go, and shares its data and logic with the web
client instead of copying it. The .NET API is not changed.

## Decisions (made with Brady, 2026-11-11)

| Question | Decision |
|---|---|
| First-version scope | All screens, anonymous only. No Google sign-in |
| Day-to-day test device | Brady's Android phone via Expo Go |
| Repo layout | Same repo, npm workspaces, `packages/shared` used by web and mobile |
| Styling | NativeWind 4 (stable, Tailwind CSS 3) |

## Milestones

1. **This spec.** Shared package, then the Expo app (anonymous, all screens).
2. **Later, own spec.** Google sign-in and account sync on mobile. Needs a
   mobile sign-in flow and an additive API change; the web cookie flow does
   not carry over.
3. **Later, own spec.** Release: Android package name, EAS Build/Submit/Update,
   Play Console, the 12-tester / 14-day closed test.

Push notifications stay in roadmap Phase 3.

## Non-goals for this milestone

- Sign-in, account sync, the import prompt.
- Store builds, EAS, app signing, a Google Maps API key.
- iOS verification (nothing blocks it, nobody is testing it).
- Device GPS. Location stays the IP lookup plus the manual state picker.
- Deep links from `https://stadar.app` URLs into the app.
- New features the web app does not have.

## Part A — workspace and shared package

Lands first, as its own change, verified by the existing web tests, build and
deploy before any mobile code exists.

### Layout

```text
package.json            root: "workspaces": ["client", "mobile", "packages/*"]
package-lock.json       single root lockfile (client/package-lock.json is removed)
packages/shared/        @stadar/shared — plain ESM JavaScript, no build step
  package.json          "type": "module", "exports": { "./*": "./*" }, react as a peer dependency
  data/                 teams.js, leagueInfo.js, logoManifest.json, usStates.js, venues/
  utils/                api.js, storageAdapter.js, reconcile.js, accountLink.js,
                        feedFilters.js, eventDisplay.js, countdown.js, savedHelpers.js,
                        savedEventRecords.js, eventDetailState.js, maps.js, ticketLinks.js,
                        ics.js (new, extracted)
  copy/                 profileCopy.js, authButtonCopy.js, importPromptCopy.js
  context/              AuthContextDef.js, AccountLinkContextDef.js
  hooks/                useAuth.js, useAccountLink.js, useFavorites.js,
                        useSavedEvents.js, useGames.js, useCountdown.js
client/                 web app; imports from '@stadar/shared/...'
mobile/                 Expo app (Part B)
```

Each test file moves with the file it tests. Web-only files stay in `client/`:
all components and pages, `AuthContext.jsx`, `AccountLinkContext.jsx`,
`authApi.js` (uses `window.location`), `index.css`, `main.jsx`.

Consumers import by subpath, for example
`import { getTeamData } from '@stadar/shared/data/teams.js'`.

### Code changes inside the move

1. **`api.js` loses its Vite dependency.** It currently reads
   `import.meta.env`, which Metro does not provide. The shared version exports
   `export let API_BASE = ''` and `setApiBase(url)`. Because ES module exports
   are live bindings, every existing `${API_BASE}` call site keeps working
   unchanged. All uses are inside functions, so setting it at startup is early
   enough.
   - Web: a new `client/src/apiBase.js` computes the value exactly as today
     (`VITE_API_URL`, else `http://localhost:5068` in dev, else `''`) and calls
     `setApiBase`. `main.jsx` imports it first.
   - Mobile: `process.env.EXPO_PUBLIC_API_URL ?? 'https://stadar.app'`.
2. **`ics.js` is extracted.** `buildIcsContent(event)` moves out of
   `EventDetailPage.jsx` into `packages/shared/utils/ics.js` unchanged, with a
   test. The browser-only `downloadIcs` stays in the web page.

No other behaviour changes. This is a move, not a refactor.

### Things outside `client/` that must follow the move

| File | Change |
|---|---|
| `Dockerfile` (client stage) | Copy the root manifest, lockfile and `packages/shared`; install only the web workspace's dependencies; build `client`. The plan must confirm the install does not pull the mobile app's dependencies into the image |
| `.dockerignore` | Exclude `mobile/` |
| `.github/workflows/deploy.yml` | `npm ci` at the root; run shared tests and client tests; build client; `cache-dependency-path` becomes the root lockfile; add `paths-ignore: ['mobile/**']` to the push trigger so mobile-only commits do not redeploy the site |
| `scripts/upload-logos.mjs` | Writes the manifest to `packages/shared/data/logoManifest.json` |
| `scripts/export-known-teams.mjs` | Reads `packages/shared/data/teams.js` |
| `CLAUDE.md`, `README.md` | File structure, test commands, run instructions |

### Done when

- `npm test` at the root runs every test that runs today, all passing.
- `npm run build -w client` produces the same app; `npm run dev -w client`
  works against the local API.
- `docker build` succeeds locally and the image serves the site.
- Both scripts run against the new paths.
- A push to `main` deploys and https://stadar.app behaves as before.

## Part B — the Expo app

### Stack

- **Expo SDK 57**, managed workflow, New Architecture (mandatory since SDK 55).
  57 rather than the newest (58) because NativeWind 4.2.7's documentation
  names SDK 57 support and nothing later.
- **Expo Router** for navigation.
- **NativeWind 4.2.7** with `tailwindcss@^3.4.17`, Reanimated 4 and
  `react-native-worklets`.
- One React version across the workspace: pin `react` (and web's `react-dom`)
  to the exact version SDK 57 ships, using npm `overrides` if hoisting does
  not settle on one copy.

### Routes

```text
mobile/app/_layout.jsx                 localStorage install, setApiBase, fonts, providers
mobile/app/(tabs)/_layout.jsx          tab bar: Discover, Teams, Saved, Profile
mobile/app/(tabs)/index.jsx            Discover
mobile/app/(tabs)/teams.jsx            Teams
mobile/app/(tabs)/saved.jsx            Saved
mobile/app/(tabs)/profile.jsx          Profile
mobile/app/saved/team/[teamName].jsx   Team saved page
mobile/app/event/[id].jsx              Event detail
mobile/src/components/                 one React Native file per web component
mobile/src/theme.js                    colour and font tokens used by tailwind.config.js
```

Route files stay thin; screen bodies live in `mobile/src/screens/` so no file
repeats the 766-line `EventDetailPage.jsx`. The detail screen is split into
its sections (header, venue card, tickets, notes, league info) as it is ported.

### Storage

`import 'expo-sqlite/localStorage/install'` is the first import in the root
layout. It defines a synchronous `globalThis.localStorage` backed by SQLite,
so `storageAdapter.js`, the `stadar-location` key, and the favorites and
saved-events hooks run without modification. It must load before any
`@stadar/shared` module, because `storageAdapter.js` captures
`globalThis.localStorage` when it is first imported.

Keys are the same as web: `stadar-favorites`, `stadar-saved-events`,
`stadar-location`.

### Auth (anonymous only)

The shared hooks call `useAuth()` and `useAccountLink()`. The mobile app
supplies two small providers that return the fixed anonymous values — status
`anonymous`, no user, the local-storage adapter, link mode `anonymous` — with
the same value shapes as the web providers. The hooks then take their existing
local-only path. Milestone 2 replaces these providers; nothing else changes.

Profile shows the "How my data is used" dialog and followed-team tiles. The
account card and sign-in button are omitted. The dialog's signed-in section is
hidden, since the app cannot sign in.

### Component mapping

| Web | Mobile |
|---|---|
| `BottomNav` | Custom tab bar passed to Expo Router `Tabs` |
| `BottomSheet`, `NotesSheet`, `TicketSheet`, `FollowSheet` | One `Sheet` built on React Native `Modal` (slide-up, backdrop tap and Android back to close); the three sheets render inside it |
| `DataUsageDialog`, `UnsaveConfirmDialog` | One `Dialog` built on `Modal`. The web focus-trap and Escape handling are dropped; `Modal` provides the equivalent |
| `icons.jsx`, `RadarLogo` | `react-native-svg` |
| `TeamLogo` | `expo-image` (manifest holds 610 PNG, 72 SVG, 5 WebP) |
| `VenueMap` iframe | `react-native-webview` on the same `getVenueMapUrls().embedUrl`, non-interactive, with injected CSS for the dark filter. Directions opens the device Maps app with `Linking` |
| Share (`navigator.share`) | `Share.share` with `https://stadar.app/event/{id}` |
| Add to calendar (`.ics` download) | `buildIcsContent` written to a cache file and opened with the system share/open sheet |
| Ticket and external links | `Linking.openURL` |
| `ImportPrompt`, `AuthButton` | Not ported in this milestone |
| Anton, Sora | `@expo-google-fonts`, loaded before the first screen renders |
| `radar-sweep`, `radar-blip`, `shimmer`, sheet animations | Reanimated; disabled when the OS "reduce motion" setting is on |
| `.press` hover/active wash | `Pressable` pressed state |
| Scrolling lists | `FlatList` / `SectionList` for the feed and saved lists; `ScrollView` elsewhere |

Everything else (`EventRow`, `NextUpHero`, `MyTeamsRail`, `FilterBar`,
`SegmentedControl`, `Countdown`, `SavedEventRow`, `SavedScoreCard`,
`GameNotesSection`, `CollapsibleSection`, `EmptyState`, `SkeletonCard`) is a
direct markup translation: `div` → `View`, text wrapped in `Text`, `button` →
`Pressable`, the same class names where NativeWind supports them.

### Theme

`mobile/src/theme.js` holds the night / radar / ink colours and the two font
families, copied from the `@theme` block in `client/src/index.css`, and
`mobile/tailwind.config.js` reads them. The values exist in two places (web
CSS and this file); a comment in each points at the other.

### Data flow

Unchanged from web. Screens call `useGames(stateCode)` for the feed and
`fetchJsonWithRetry` for a single event; favorites and saved events go through
the shared hooks and the storage adapter. The app talks to
`https://stadar.app` and can be pointed at a local API with
`EXPO_PUBLIC_API_URL`.

### Error handling

Same states as web: skeletons while loading, the "waking up the server" hint
during the retry window, the existing empty states, and a retry action for
`network` and `server` errors from `useGames`. The detail screen handles a
missing or rejected event (`404`) and router-state / saved-snapshot
initialisation exactly as `EventDetailPage.jsx` does today; the plan ports
that logic rather than redesigning it.

### Testing

- Logic is tested where it lives: the moved `node:test` suites in
  `packages/shared`, run in CI.
- The mobile workspace gets ESLint only. No component tests in this milestone.
- Each screen is checked by hand on Brady's phone in Expo Go against the web
  app at the same route. This is the acceptance check, and only Brady can do
  it.

### Done when

On the Android phone, in Expo Go, with no account:

- Discover loads live games for the detected or chosen state; date, sport,
  league and My Teams filters work.
- Teams, Saved, the per-team saved page and Profile render and navigate.
- Following a team and saving an event survive closing and reopening the app.
- Event detail shows the map preview, opens directions, tickets and share,
  and adds the event to the calendar.
- A cold API start shows the waking-up hint and then the feed.

## Risks to resolve in the plan

1. **Expo Go and SDK 57.** The Play Store Expo Go targets the newest SDK. If a
   57-compatible Expo Go is not practical to install, try NativeWind 4.2.7 on
   SDK 58 before reconsidering the styling choice.
2. **JSON import attribute.** `teams.js` uses
   `import … with { type: 'json' }`, which Node requires for the tests. Confirm
   Metro's Babel preset parses it; if not, add the syntax plugin in the mobile
   Babel config.
3. **Docker and CI installs under workspaces.** Confirm a web-only install
   from the single lockfile works and stays fast.
4. **Metro resolving `@stadar/shared`.** Automatic monorepo config exists
   since SDK 52; confirm subpath `exports` and un-transpiled ESM from a
   workspace package resolve without extra config.
5. **Map appearance.** The CSS-filter darkening may not match the web exactly
   inside a WebView. Acceptable if it is legible; otherwise fall back to an
   un-darkened map.
