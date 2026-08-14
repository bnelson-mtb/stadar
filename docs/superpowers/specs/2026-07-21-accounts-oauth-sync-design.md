# Accounts: OAuth Sign-In and Cross-Device Sync Design

**Date:** 2026-07-21

## Goal

Add optional user accounts so that favorites and saved events can sync across
devices, while keeping the anonymous experience exactly as fast and simple as
it is today. Stadar stays a quick discovery tool by default; making an account
is pure upside that deepens the experience without gating any browsing.

This is the first feature to introduce a database and server-side user data,
and it is intentionally sequenced ahead of the React Native port so the web app
can carry accounts as a portfolio-facing capability.

## Scope

This change adds:

- an Azure SQL database (EF Core) holding users, favorites, and saved events;
- Google OAuth sign-in via ASP.NET Core's built-in authentication handlers,
  with a cookie session (no passwords, no email verification, no reset flow);
- authenticated `/api/me/*` endpoints for reading and writing a user's
  favorites and saved events;
- a client auth context, an API-backed storage adapter, and conversion of the
  favorites and saved-events hooks to a cache-first / sync-later model;
- a one-time import prompt when a signed-in user has existing local data.

It does **not** add: email/password login, additional OAuth providers beyond
Google, real-time multi-tab sync, server-side event data (Ticketmaster data is
still fetched and cached exactly as today), account deletion UI, or any change
to the anonymous browsing path's data flow.

## Guiding Principle: Anonymous Stays DB-Free

The anonymous path must never touch the database. All existing pages, hooks,
and fetches continue to run entirely against `localStorage` and the existing
Ticketmaster proxy. Only two new route groups (`/api/auth/*` and `/api/me/*`)
touch SQL, and both require an authenticated cookie. This keeps three
properties intact:

1. Recruiters and first-time visitors get the current instant experience with
   zero cold-resume cost from the database.
2. The auth layer is fail-soft: with no Google credentials or connection string
   configured, the layer is inert and the app runs exactly as it does today —
   the same posture as the existing Gemini and SeatGeek layers.
3. The database's serverless auto-pause only ever affects a signed-in user's
   first account action after an idle period, never anonymous browsing.

## Data Model (Azure SQL, EF Core)

Three tables, deliberately thin.

```
Users
  Id                uniqueidentifier   PK
  Provider          nvarchar           ('google')
  ProviderSubject   nvarchar           Google 'sub' claim; UNIQUE
  Email             nvarchar
  DisplayName       nvarchar
  CreatedAt         datetime2

Favorites            (composite PK: UserId + TeamName)
  UserId            uniqueidentifier   FK -> Users.Id
  TeamName          nvarchar
  CreatedAt         datetime2

SavedEvents          (composite PK: UserId + EventId)
  UserId            uniqueidentifier   FK -> Users.Id
  EventId           nvarchar
  SnapshotJson      nvarchar(max)
  UpdatedAt         datetime2
```

A user is identified by `(Provider, ProviderSubject)`, not by email — email can
change and is not a stable identity key. `ProviderSubject` is Google's stable
`sub` claim.

`SavedEvents.SnapshotJson` stores the client's saved-record shape verbatim
(the full event snapshot plus notes and score) as an opaque JSON string. The
server never queries inside a saved event; it is a per-user key-value store
keyed by event id. This keeps the schema stable as the client record shape
evolves and avoids duplicating the `SportEvent` field list in SQL columns.

Favorites are modeled as rows rather than a JSON blob because a favorite is a
single scalar (a canonical team name) and row-per-favorite keeps the set
queryable and cheap to reconcile.

## Authentication (ASP.NET Core built-in, Google OAuth)

Authentication uses ASP.NET Core's built-in handlers: a cookie scheme for the
session plus `AddGoogle` for the OAuth flow. The application owns the flow
directly; no managed identity service (Entra External ID / B2C) is introduced.

The session cookie is `HttpOnly`, `Secure`, and `SameSite=Lax`. Because the SPA
is served same-origin with the API in production, the cookie is sent
automatically on `/api/me/*` requests with no bearer-token handling in the
client.

Endpoints:

- `GET /api/auth/login` — issues an OAuth challenge, redirecting to Google. An
  optional `returnUrl` (validated as a local path) records where to land after
  sign-in.
- `GET /api/auth/callback` — Google's redirect target. Finds or creates the
  user by `(Provider, ProviderSubject)`, issues the session cookie, and
  redirects back into the SPA.
- `POST /api/auth/logout` — clears the session cookie.
- `GET /api/me` — returns the current user's public profile
  (`{ id, email, displayName }`) or `401` when anonymous.

Find-or-create runs in the callback: an unknown `ProviderSubject` inserts a new
`Users` row; a known one updates `Email`/`DisplayName` if they changed and
reuses the existing id.

## Account Data Endpoints

All `/api/me/*` data endpoints require an authenticated cookie and return `401`
when anonymous. They live under the existing per-IP rate limiter.

```
GET /api/me/favorites   -> string[]              (canonical team names)
PUT /api/me/favorites   -> replaces the whole set; returns the stored set
GET /api/me/saved       -> record[]              (saved-event records)
PUT /api/me/saved       -> replaces the whole set; returns the stored set
```

Writes use whole-set `PUT` rather than per-item `POST`/`DELETE`. The per-user
data is small, and a whole-set replace matches the client storage adapter's
`persist(key, wholeValue)` contract exactly, so the adapter stays a dumb
transport with no per-item diffing. Each `PUT` replaces the authenticated
user's rows for that collection transactionally.

## Client: Storage Adapter (cache-first, sync-later)

> **Revision (Slice 2 implementation, 2026-07-22):** for signed-in users the
> account is the sole source of truth — the API adapter's `persist` PUTs the
> server and keeps **no** local copy, and first-login reconciliation **deletes**
> the anonymous `stadar-favorites` key after moving it to the account (a
> transfer, not a copy). Signed-in favorites live in memory + the account and
> are re-hydrated on load. The original "signed-in `persist` also mirrors the
> cache" wording below is superseded for the signed-in tier; the anonymous tier
> is unchanged. Slice 3 should follow the same account-only model for saved
> events. Rationale: a single source of truth, and nothing user-specific
> lingering in `localStorage` after sign-out.

The storage adapter gains an interface that separates an instant local read
from an asynchronous remote read:

- `readCache(key, fallback)` — synchronous `localStorage` read; the source of
  first paint. Same semantics as today's `load`.
- `fetchRemote(key, fallback)` — asynchronous; resolves to `null` in the
  localStorage adapter, meaning "no remote, the cache is the source of truth."
  The API adapter overrides this with a `GET` to `/api/me/*`.
- `persist(key, value)` — writes through: always writes the cache
  synchronously (so data is never lost locally), and additionally pushes to the
  remote when one exists. Resolves `{ ok, error }` describing the remote leg.

Two adapter implementations share this interface:

- The **localStorage adapter** (anonymous tier): `fetchRemote` returns `null`;
  `persist` only writes the cache. This makes the anonymous hydrate path a true
  no-op — the hydrate effect fires, immediately sees `null`, and bails with no
  spinner and no render churn.
- The **API adapter** (signed-in tier): `fetchRemote` GETs the server set;
  `persist` writes the cache and PUTs the remote set.

Reconciliation (how a local set and a remote set combine) lives in the hooks,
not the adapter. The adapter remains transport only.

## Client: Auth Context

A new `AuthContext` provider holds `{ user, status }` where `status` is one of
`loading | anonymous | authenticated`. On mount it calls `/api/me`; a `200`
sets `authenticated`, a `401` sets `anonymous`. It exposes `login()` (navigates
to `/api/auth/login`) and `logout()` (POSTs `/api/auth/logout`, clears state).

The context chooses which storage adapter the hooks receive: `anonymous` yields
the localStorage adapter, `authenticated` yields the API adapter. Hooks consume
the adapter from context rather than importing a module-level singleton, so an
auth-state change re-points persistence without the hooks knowing the detail.

## Client: Hook Conversion

Both `useFavorites` and `useSavedEvents` move to the cache-first / sync-later
model:

- Initial state still comes from `readCache` in a `useState` initializer, so the
  anonymous path paints instantly with no loading state.
- A hydrate `useEffect` calls `fetchRemote`. A `null` result (anonymous) is a
  no-op. A non-null result on an **already-linked** device replaces the cache
  with the server set (the server is the source of truth once signed in). A
  non-null result during the **one-time import** is unioned with local data and
  pushed back via `persist` — see First-Login Import Prompt.
- Mutations apply optimistically, then `persist`; on a remote failure the hook
  rolls back to the prior set and surfaces an error status.
- Each hook exposes a `syncStatus` (`idle | syncing | synced | error`).

Once a device is linked, every mutation goes through the API adapter's
`persist`, which writes both the cache and the server, so the local cache
stays a mirror of the server. Reconciliation between distinct local and remote
sets therefore only happens at the import moment; ongoing hydrates simply
refresh the cache from the authoritative server set.

`useFavorites` requires the larger change: today it persists fire-and-forget
and ignores the result. It adopts the ref-plus-optimistic pattern that
`useSavedEvents` already uses (`savedEventsRef`), because rollback inside an
async `.then()` needs a stable reference to the prior set rather than a stale
closure under rapid toggling. Favorites reconcile as a set union.

`useSavedEvents` is already optimistic-with-deferred-status; the change is
mainly swapping the synchronous `persist` return plus `queueMicrotask` for an
awaited `persist`. At import, saved events union by `EventId`; on an id present
in both sets the local record is kept, since a brand-new account's server set
is empty or older and the import intent is to bring local data in. The server's
`SavedEvents.UpdatedAt` column is last-write bookkeeping, not a client
reconciliation input.

The existing `persistenceStatus` string (`saving | saved | error`) rendered by
`GameNotesSection` is superseded by `syncStatus`. The state machine survives;
the copy gains a signed-in variant (for example, "Synced" and "Couldn't reach
your account — saved on this device" alongside the existing local-only text).

## First-Login Import Prompt

The first time a user signs in on a device that holds anonymous local data, and
that account has not yet been reconciled on this device, the client shows a
prompt:

> "Import your N saved teams and M saved events into your account?"
> **Import** / **Start fresh**

- **Import** unions the local favorites and saved events into the account,
  `PUT`s the merged sets, and marks the device reconciled.
- **Start fresh** switches to the account's server data, marks the device
  reconciled, and leaves the local cache untouched — so signing out returns the
  user to their intact anonymous collection.

Reconciliation state is tracked per account with a `stadar-linked-<sub>`
`localStorage` flag so the prompt appears once per account per device and never
re-fires on subsequent logins. If there is no local data at sign-in, no prompt
is shown and the account is marked reconciled immediately.

## Authentication UI

A minimal surface: a "Sign in with Google" control when anonymous, and a
compact account affordance (display name / avatar with a sign-out action) when
authenticated. Placement follows the existing navigation shell. Anonymous users
see no new required steps; the control is an invitation, not a gate.

## Configuration and Secrets

Following the existing per-service pattern:

- Google OAuth: `Google:ClientId` / `Google:ClientSecret` in
  `appsettings.Development.json` for local dev; `Google__ClientId` /
  `Google__ClientSecret` as Azure environment variables.
- Database: `ConnectionStrings:Default` locally (LocalDB or SQLite for the dev
  loop); `ConnectionStrings__Default` in Azure pointing at Azure SQL.
- With **no** Google credentials or connection string configured, the auth and
  data layers are inert: `/api/auth/*` and `/api/me/*` behave as unavailable and
  the client stays in the anonymous tier. The app runs unchanged.

The GitHub Actions deploy workflow gains the new secrets
(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SQL_CONNECTION_STRING`) passed
through to the Container App, alongside the existing Ticketmaster secret.

## Database Hosting and Cold-Resume Containment

The database is Azure SQL in the serverless tier with auto-pause, chosen so the
database mirrors the container's scale-to-zero cost posture and fits within the
student subscription credits. A paused database has a cold resume (tens of
seconds) that stacks on the container's cold start.

Because the anonymous path never touches SQL, this cost is contained to a
signed-in user's first account action after idle. It is absorbed
non-blockingly: mutations are optimistic and the UI shows `syncStatus` rather
than blocking on the round-trip, and the initial `/api/me` hydrate runs in the
background behind an already-painted cache. Anonymous visitors never encounter
it.

## Component and Service Boundaries

Server:

- An EF Core `DbContext` owns the schema and migrations.
- An auth endpoint group owns the OAuth challenge/callback/logout/me routes and
  find-or-create.
- A `/api/me/*` endpoint group owns favorites and saved-events read/replace,
  scoped to the authenticated user id from the cookie.

Client:

- The storage adapter owns transport only (`readCache` / `fetchRemote` /
  `persist`) in two implementations behind one interface.
- `AuthContext` owns auth state and adapter selection.
- `useFavorites` and `useSavedEvents` own React state, optimistic mutation,
  reconciliation, and `syncStatus`.
- An import-prompt component owns the one-time reconciliation choice.

## Failure Behavior

- Malformed local JSON continues falling back to an empty collection, as today.
- A failed `fetchRemote` (network, cold resume timeout, `5xx`) leaves the cache
  in place; the user keeps working locally and hydration retries on the next
  mount. Anonymous behavior is unaffected because `fetchRemote` returns `null`
  without a request.
- A failed `persist` remote leg rolls the hook back to the prior set and sets
  `syncStatus` to `error`; the cache write still succeeded, so data survives
  locally.
- `/api/me/*` returns `401` when the cookie is missing or invalid; the client
  treats a `401` as a transition to the anonymous tier.
- Whole-set `PUT` is last-write-wins across simultaneous edits on two signed-in
  devices: a device writing from a stale set can clobber the other's change.
  This is an accepted limitation given the small per-user data size and the
  expected single-active-device usage; per-item sync or conflict resolution is
  explicitly out of scope.
- Missing Google or SQL configuration disables the layer rather than throwing.

## Build Order

One spec, three independently landable slices:

1. **Auth + database skeleton.** EF Core schema and migrations, Google OAuth
   sign-in end to end, `GET /api/me` returning a user, sign-in/out UI. No data
   sync yet.
2. **Favorites sync.** The `/api/me/favorites` endpoints, the API adapter, the
   `useFavorites` conversion, and set-union reconciliation. Proves the
   cache-first / hydrate / merge path on the smaller hook.
3. **Saved events sync and import prompt.** The `/api/me/saved` endpoints, the
   `useSavedEvents` conversion, per-record reconciliation, and the one-time
   import prompt, reusing everything from slice 2.

## Verification

Automated tests will cover:

**Server**

- find-or-create inserts a new user for an unknown subject and reuses the
  existing id for a known one;
- `/api/me` and every `/api/me/*` data route return `401` when anonymous;
- favorites `GET`/`PUT` round-trip and whole-set replace for the authenticated
  user only (no cross-user leakage);
- saved-events `GET`/`PUT` round-trip preserving `SnapshotJson` verbatim;
- the layer is inert when Google/SQL configuration is absent.

Server tests run EF Core against SQLite in-memory.

**Client**

- the localStorage adapter's `fetchRemote` resolves to `null` and `persist`
  writes only the cache;
- the API adapter's `fetchRemote`/`persist` hit the expected routes (mocked);
- `useFavorites` and `useSavedEvents` paint from cache with no loading state,
  hydrate and reconcile on a non-null remote, and roll back on a failed
  `persist`;
- import-time union reconciliation: favorites by team name, saved events by
  `EventId` (local record kept on collision), and server-authoritative refresh
  on an already-linked device;
- the import prompt fires once per account per device and imports or starts
  fresh as chosen.

The API test suite, the client test suite, the client lint, and the production
build must all pass. Manual verification will cover a full Google sign-in and
sign-out, cross-device sync of a favorite and a saved event, the first-login
import prompt in both Import and Start-fresh paths, and confirmation that the
anonymous path issues no database requests.
