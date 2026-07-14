# SeatGeek Direct Event Links — Design

**Date:** 2026-07-13
**Status:** Approved (design review with Brady)

## Goal

The SeatGeek button in the detail page's tickets section should open the
matching event page on seatgeek.com directly, instead of today's Google
"I'm feeling lucky" search. SeatGeek credentials (client ID + secret) are
available and must stay server-side.

## Background

- `client/src/utils/ticketLinks.js` builds Google `site:` search URLs for
  all secondary providers (SeatGeek, TickPick, Gametime, StubHub, Vivid
  Seats). `EventDetailPage.jsx` renders them as buttons.
- The detail page usually does **not** call `/api/games/{id}`: when the user
  navigates from the list, the event arrives via router state and the fetch
  is skipped. Any design that only enriches that endpoint misses the common
  path.
- All external API keys live server-side (Ticketmaster, Gemini). The client
  bundle must never contain keys or environment-specific URLs.

## Decision: lazy lookup endpoint

Chosen over (a) enriching `SportEvent` with a `seatGeekUrl` field — misses
the router-state path, and enriching the 50-event list would cost 50
SeatGeek calls per state fetch — and (b) a click-time 302 redirect — adds
per-click latency and a blank tab while two upstream calls resolve.

The detail page renders instantly with the existing Google fallback link,
fetches the direct link in the background, and silently upgrades the
SeatGeek button when it arrives.

## API contract

```
GET /api/games/{id}/seatgeek
  200 → { "url": "https://seatgeek.com/..." }
  404 → no confident match, SeatGeek not configured, or unknown event id
```

- Lives under `/api/games/` and avoids the words "event" and "ticket" in the
  path (ad-block filter lists match those fragments; same reasoning as the
  existing `games` route).
- Resolves the event via the same cached path as `GetEventById` (populating
  the `event:{id}` 5-minute cache if needed) to obtain teams, venue, city,
  state, and local date.
- Caches the lookup result under `seatgeek:{id}` for 6 hours — including
  "no match" — so repeat visits don't re-hit SeatGeek. In-memory cache,
  consistent with the rest of the API.

## SeatGeekClient (`Api/Services/SeatGeekClient.cs`)

Typed `HttpClient` service registered like `TicketmasterClient`.

- **Request:** `GET https://api.seatgeek.com/2/events` with `client_id`,
  `q = "{homeTeam}"`, `venue.state = {state}`, and `datetime_local.gte` /
  `datetime_local.lte` bounding the event's local date (works for Time-TBD
  events too), `per_page = 10`.
  *(Changed during verification: the original design queried
  `"{homeTeam} {awayTeam}"`, but SeatGeek's `q=` full-text search returns
  zero results when both team names are present — confirmed live 2026-07-13
  against RSL, Bees, and Royals events. Home-team-only queries return the
  correct event; the matcher's hard requirements keep precision.)*
- **Matching:** a pure, unit-testable scorer picks the best candidate:
  - Hard requirements: candidate's `datetime_local` date equals the event's
    `LocalDate`, and its title or performer names contain the home team name
    (case-insensitive).
  - Tie-break: candidate venue city matches the event city.
  - No candidate meets the hard requirements → null (no guessing).
- **Result:** the matched candidate's `url` field (direct event page).
- **Disabled state:** no `SeatGeek:ClientId` in config → return null
  immediately, zero network calls (same inert-without-key pattern as
  Gemini).
- **Failures:** timeouts and non-success responses return null via the same
  `GetOrDefaultAsync` pattern as `TicketmasterClient`; a SeatGeek outage can
  never break the page.
- Only the client ID is sent on requests. The client secret is stored in
  config for future authenticated SeatGeek work but unused today.

## Client changes (`EventDetailPage.jsx` only)

- New `seatGeekUrl` state plus one `useEffect` keyed on the event id that
  calls `fetchJsonWithRetry` against the new endpoint, cancel-safe. 404
  fails fast per `fetchJsonWithRetry` semantics; errors are swallowed and
  the fallback link stays.
- When building `ticketSearchLinks`, override the SeatGeek provider's URL
  with the direct link when present.
- `ticketLinks.js` and all other providers are untouched.

## Config and deployment

- Local: `SeatGeek:ClientId` and `SeatGeek:ClientSecret` in
  `Api/appsettings.Development.json` (already added; never committed).
- Azure: `SeatGeek__ClientId` and `SeatGeek__ClientSecret` env vars on the
  `stadar` Container App, set once via
  `az containerapp update --set-env-vars` (the same manual path used for
  the Gemini key). `deploy.yml` needs no change — its `--set-env-vars` for
  the Ticketmaster key merges with, rather than replaces, existing vars.

## Testing

`Api.Tests/SeatGeekClientTests.cs`, written test-first:

- Matcher with canned SeatGeek JSON: exact match returns its `url`;
  multiple same-day candidates pick the city tie-break winner; no candidate
  on the right date → null; title/performers missing the home team → null;
  malformed JSON → null.
- Missing config → null with no HTTP call.
- Endpoint behavior: unconfigured or no-match → 404; match → 200 with URL.

## Out of scope

- Direct links for TickPick, Gametime, StubHub, Vivid Seats (they keep the
  Google fallback).
- SeatGeek affiliate/`aid` parameters.
- Any further SeatGeek features (price display, recommendations) — the
  reusable `SeatGeekClient` is the seam for those later.
