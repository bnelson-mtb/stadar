# DB-Prep Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the seven bugs found in the 2026-07-15 repo analysis, refactor client persistence behind a storage adapter (the seam for accounts/DB and the React Native port), and bring CLAUDE.md back in sync with the code.

**Architecture:** All changes are surgical fixes to the existing pipeline — no new subsystems. Backend: venue-local date handling, World Cup removal, URL escaping, ASP.NET Core built-in rate limiting + negative caching. Client: two React effect/lifecycle fixes plus a storage-adapter extraction so `useFavorites`/`useSavedEvents` never touch `localStorage` directly. CI starts running the client test suite (which currently has 2 committed failures that this plan fixes first).

**Tech Stack:** ASP.NET Core minimal API (.NET 10, MSTest), React 19 + Vite (node:test), GitHub Actions.

**Branch:** `fix/db-prep` (already created off `main`).

---

## Context for a zero-context engineer

- **Run API tests:** `dotnet test Api.Tests/Api.Tests.csproj` from the repo root. Expect ~117 passing, 3 skipped (live Gemini tests gated on `GEMINI_API_KEY` — leave them skipped).
- **Run client tests:** from `client/`: `node --test "src/**/*.test.js"` (after Task 1: `npm test`). The suite currently fails 2 tests — Task 1 fixes that.
- **Run client lint:** from `client/`: `npm run lint`.
- **Do NOT push to `main`** — pushing `main` triggers a production deploy. All work stays on `fix/db-prep`.
- The API path segment is `games` (not `events`) on purpose — ad-block filter lists kill `/api/event` fragments client-side. Never rename it.
- Commit messages: end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## File Structure

| File | Change | Why |
|---|---|---|
| `client/package.json` | Modify | add `test` script |
| `client/src/utils/ticketLinks.test.js` | Modify | drop AXS expectations (AXS support was removed) |
| `.github/workflows/deploy.yml` | Modify | run client tests in CI |
| `client/src/pages/DiscoverPage.jsx` | Modify | fix fetch race; remove `World Cup` from `LEAGUE_ORDER` |
| `client/src/App.jsx` | Modify | remount `EventDetailPage` when `:id` changes |
| `Api/Services/TicketmasterClient.cs` | Modify | venue-local end-of-day for date-only events; escape event id |
| `Api.Tests/TicketmasterClientParseTests.cs` | Modify | replace date-only test, add timezone + fallback tests |
| `Api/Services/EventNormalizer.cs` | Modify | remove World Cup league mapping |
| `Api/Models/EventVerdict.cs` | Modify | remove "World Cup" from schema enum, bump Version 3→4 |
| `Api.Tests/EventNormalizerTests.cs` | Modify | add World Cup regression test |
| `Api.Tests/ClassificationTriggersTests.cs` | Modify | remove "World Cup" from expected normalizer leagues |
| `client/src/data/teams.js` | Modify | remove `World Cup` from `LEAGUE_COLORS` |
| `client/src/data/leagueInfo.js` | Modify | remove `World Cup` entry |
| `Api/Program.cs` | Modify | forwarded headers, rate limiter, negative caching, `public partial class Program` |
| `Api.Tests/Api.Tests.csproj` | Modify | add `Microsoft.AspNetCore.Mvc.Testing` |
| `Api.Tests/RateLimitingTests.cs` | **Create** | integration tests for rate limiting + 404 contract |
| `client/src/utils/storageAdapter.js` | **Create** | the storage seam (localStorage today; API/AsyncStorage later) |
| `client/src/utils/storageAdapter.test.js` | **Create** | adapter unit tests |
| `client/src/hooks/useFavorites.js` | Modify | use adapter |
| `client/src/hooks/useSavedEvents.js` | Modify | use adapter |
| `client/src/utils/savedEventRecords.js` | Modify | remove `persistSavedRecords` (superseded by adapter) |
| `client/src/utils/savedEventRecords.test.js` | Modify | remove `persistSavedRecords` tests (ported to adapter tests) |
| `CLAUDE.md` | Modify | sync docs with reality |

---

### Task 1: Fix the two failing client tests and wire client tests into CI

AXS was deliberately removed from ticket providers; the tests still expect it. Root cause of the drift: client tests never run in CI and there is no npm `test` script.

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/utils/ticketLinks.test.js:28-53`
- Modify: `.github/workflows/deploy.yml:31-35`

- [ ] **Step 1: Reproduce the failures**

Run from `client/`:
```bash
node --test "src/**/*.test.js"
```
Expected: 44 pass, **2 fail** (`TICKET_SEARCH_PROVIDERS includes supported secondary marketplaces`, `ticket providers include compact logo metadata`) — both expecting `'AXS'`.

- [ ] **Step 2: Remove AXS from the expected arrays**

In `client/src/utils/ticketLinks.test.js`, change the two assertions:

```js
test('TICKET_SEARCH_PROVIDERS includes supported secondary marketplaces', () => {
  assert.deepEqual(
    TICKET_SEARCH_PROVIDERS.map(provider => provider.name),
    ['SeatGeek', 'TickPick', 'Gametime', 'StubHub', 'Vivid Seats']
  )
})

test('ticket providers include compact logo metadata', () => {
  assert.deepEqual(
    TICKET_SEARCH_PROVIDERS.map(provider => provider.logoLabel),
    ['SG', 'TP', 'GT', 'SH', 'VS']
  )
  // ... rest of the test body is unchanged
})
```

(Only the two arrays change — delete `, 'AXS'` from each. Leave the `TICKETMASTER_PROVIDER` assertions and the `for` loop untouched.)

- [ ] **Step 3: Add the npm test script**

In `client/package.json`, add to `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "test": "node --test \"src/**/*.test.js\"",
  "preview": "vite preview"
},
```

- [ ] **Step 4: Verify the suite is green**

Run from `client/`:
```bash
npm test
```
Expected: **46 pass, 0 fail**.

- [ ] **Step 5: Add the CI step**

In `.github/workflows/deploy.yml`, after the `Build client` step in the `test` job, add:

```yaml
      - name: Run client tests
        working-directory: client
        run: npm test
```

(The `Build client` step already ran `npm ci`, so dependencies are installed.)

- [ ] **Step 6: Commit**

```bash
git add client/package.json client/src/utils/ticketLinks.test.js .github/workflows/deploy.yml
git commit -m "test: drop removed AXS provider from expectations, run client tests in CI"
```

---

### Task 2: Fix the DiscoverPage fetch race (analysis bug #2)

On first visit the events fetch fires for the default `UT` while IP auto-detect may then switch `stateCode`, firing a second fetch. `fetchJsonWithRetry` can retry up to 75s, so the stale response can resolve *after* the fresh one and clobber `events`. Standard React fix: an `ignore` flag in the effect cleanup.

**Files:**
- Modify: `client/src/pages/DiscoverPage.jsx:203-215`

- [ ] **Step 1: Add the stale-response guard**

Replace the fetch effect:

```jsx
  useEffect(() => {
    if (!stateCode) return
    // Guard against out-of-order responses: auto-detect can change
    // stateCode while the first fetch is still retrying (up to 75s during
    // a cold start), and the stale response must not clobber the fresh one.
    let ignore = false
    fetchJsonWithRetry(`${API_BASE}/api/games?stateCode=${stateCode}`)
      .then(data => {
        if (ignore) return
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        if (ignore) return
        // .status = HTTP error from the API; no .status = never got a response
        setError(err.status ? 'server' : 'network')
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [stateCode, retryToken])
```

- [ ] **Step 2: Verify lint and tests**

Run from `client/`:
```bash
npm run lint
npm test
```
Expected: lint clean, 46 tests pass.

- [ ] **Step 3: Manual smoke check (optional but recommended)**

Run the app (`dotnet watch` in `Api/`, `npm run dev` in `client/`), open a private window with devtools → Application → clear `stadar-location`, reload, and confirm the list matches whatever state the dropdown settles on.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/DiscoverPage.jsx
git commit -m "fix: ignore stale event responses when stateCode changes mid-fetch"
```

---

### Task 3: Remount EventDetailPage when the event id changes (analysis bug #3)

`EventDetailPage` initializes `event` state once from router state / saved snapshot; if the route ever navigates `/event/A` → `/event/B`, B renders A's data. Latent today, a landmine for upcoming features. Fix: key the page by `:id` so React remounts it (resetting `event`, `loading`, `seatGeekUrl`, `copied`, boundary timers).

**Files:**
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Add a keyed wrapper**

Replace `client/src/App.jsx` content:

```jsx
import { Routes, Route, Outlet, useParams } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import TeamSavedPage from './pages/TeamSavedPage.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen bg-night-950 pb-16">
      <Outlet />
      <BottomNav />
    </div>
  )
}

// key={id} remounts the detail page when navigating between events, so
// state initialized from router state / saved snapshots can never leak
// from one event to another.
function EventDetailRoute() {
  const { id } = useParams()
  return <EventDetailPage key={id} />
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/saved" element={<SavedPage />} />
      </Route>
      <Route path="/saved/team/:teamName" element={<TeamSavedPage />} />
      <Route path="/event/:id" element={<EventDetailRoute />} />
    </Routes>
  )
}

export default App
```

- [ ] **Step 2: Verify lint and tests**

Run from `client/`:
```bash
npm run lint
npm test
```
Expected: clean / 46 pass.

- [ ] **Step 3: Commit**

```bash
git add client/src/App.jsx
git commit -m "fix: remount EventDetailPage when navigating between event ids"
```

---

### Task 4: Venue-local end-of-day for date-only events (analysis bug #4)

Date-only events currently get `DateTime` = end-of-day **UTC**, and the past-event filter compares against `DateTime.UtcNow` — so a "Time TBD" event *today* vanishes from the feed at ~5–6 PM Mountain. Fix: convert end-of-day using Ticketmaster's `dates.timezone` (IANA id, e.g. `"America/Denver"`); when the timezone is missing/unknown, pad 12h past UTC midnight (covers every US offset).

**Files:**
- Test: `Api.Tests/TicketmasterClientParseTests.cs` (replace `ParseEvent_LocalDateOnly_StillParsesDate`)
- Modify: `Api/Services/TicketmasterClient.cs:279-319`

- [ ] **Step 1: Replace the old date-only test with two new failing tests**

In `Api.Tests/TicketmasterClientParseTests.cs`, **delete** the existing `ParseEvent_LocalDateOnly_StillParsesDate` test (its `TimeOfDay > 23:59` assertion encodes the buggy behavior) and add:

```csharp
    [TestMethod]
    public void ParseEvent_LocalDateOnly_UsesVenueTimezoneEndOfDay()
    {
        // Dynamic future date so the past-event gate never drops the fixture.
        var localDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");
        var json = Parse($$"""
        {
          "id": "x4",
          "name": "Utah Utes vs BYU Cougars",
          "dates": { "timezone": "America/Denver", "start": { "localDate": "{{localDate}}" } },
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Utes Football" },
              { "name": "BYU Cougars Football" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual(localDate, ev.LocalDate);
        Assert.IsNull(ev.LocalTime);

        // End of the *venue-local* day converted to UTC — strictly later than
        // plain UTC end-of-day, so the event no longer vanishes from the feed
        // on game-day afternoon.
        var tz = TimeZoneInfo.FindSystemTimeZoneById("America/Denver");
        var endOfLocalDay = DateTime.Parse(localDate).Date.AddDays(1).AddTicks(-1);
        var expected = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(endOfLocalDay, DateTimeKind.Unspecified), tz);
        Assert.AreEqual(expected, ev.DateTime);
        Assert.IsTrue(ev.DateTime > DateTime.SpecifyKind(endOfLocalDay, DateTimeKind.Utc));
    }

    [TestMethod]
    public void ParseEvent_LocalDateOnlyNoTimezone_PadsPastUtcMidnight()
    {
        var localDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");
        var json = Parse($$"""
        {
          "id": "x5",
          "name": "Utah Utes vs BYU Cougars",
          "dates": { "start": { "localDate": "{{localDate}}" } },
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Utes Football" },
              { "name": "BYU Cougars Football" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        var endOfLocalDay = DateTime.Parse(localDate).Date.AddDays(1).AddTicks(-1);
        Assert.AreEqual(
            DateTime.SpecifyKind(endOfLocalDay.AddHours(12), DateTimeKind.Utc),
            ev.DateTime);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
dotnet test Api.Tests/Api.Tests.csproj --filter "ParseEvent_LocalDateOnly" --nologo -v q
```
Expected: **both new tests FAIL** (actual `DateTime` is end-of-day UTC, not the converted/padded value).

- [ ] **Step 3: Implement venue-local conversion**

In `Api/Services/TicketmasterClient.cs`, inside `ExtractDateTime`, replace the date-only fallback branch:

```csharp
            else if (!string.IsNullOrWhiteSpace(localDateStr) &&
                     DateTime.TryParse(localDateStr, out var localDateOnly))
            {
                // End of day at the *venue* (dates.timezone) so date-only
                // events survive until venue-local midnight instead of
                // dropping when UTC rolls over (~5-6 PM Mountain). Unknown
                // timezone: pad 12h past UTC midnight — covers every US offset.
                var endOfLocalDay = localDateOnly.Date.AddDays(1).AddTicks(-1);
                dateTime = ConvertVenueLocalToUtc(ev, endOfLocalDay)
                    ?? DateTime.SpecifyKind(endOfLocalDay.AddHours(12), DateTimeKind.Utc);
            }
```

And add this private helper to the same class (next to `ExtractDateTime`):

```csharp
    /// <summary>
    /// Converts a venue-local wall-clock time to UTC using the event's
    /// dates.timezone (IANA id, e.g. "America/Denver"). Returns null when
    /// the field is missing or the id is unknown on this platform.
    /// </summary>
    private static DateTime? ConvertVenueLocalToUtc(JsonElement ev, DateTime local)
    {
        if (!ev.TryGetProperty("dates", out var dates) ||
            !dates.TryGetProperty("timezone", out var tzProp))
            return null;

        var tzId = tzProp.GetString();
        if (string.IsNullOrWhiteSpace(tzId))
            return null;

        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(tzId);
            return TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(local, DateTimeKind.Unspecified), tz);
        }
        catch (Exception e) when (e is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return null;
        }
    }
```

Note: `FindSystemTimeZoneById` accepts IANA ids on .NET 8+ on both Windows (ICU) and the Linux container — no package needed.

- [ ] **Step 4: Run the full API suite**

```bash
dotnet test Api.Tests/Api.Tests.csproj --nologo -v q
```
Expected: all pass (118 passing — one test deleted, two added — 3 skipped).

- [ ] **Step 5: Commit**

```bash
git add Api/Services/TicketmasterClient.cs Api.Tests/TicketmasterClientParseTests.cs
git commit -m "fix: keep date-only events until venue-local midnight"
```

---

### Task 5: Remove World Cup support entirely (analysis bug #5)

`"world cup"` stays in `EventFilter.NameDenylist` (the drop mechanism) and in `IsPlaceholderTeam` (a guard). Everything that *supports* World Cup as a league is removed: normalizer mapping, classifier enum (schema bump → stored verdicts lazily re-classified once, by design), and client league metadata.

**Files:**
- Test: `Api.Tests/EventNormalizerTests.cs`
- Modify: `Api/Services/EventNormalizer.cs:116`
- Modify: `Api/Models/EventVerdict.cs:25,38`
- Modify: `Api.Tests/ClassificationTriggersTests.cs:89`
- Modify: `client/src/pages/DiscoverPage.jsx:37` (LEAGUE_ORDER)
- Modify: `client/src/data/teams.js:3898` (LEAGUE_COLORS)
- Modify: `client/src/data/leagueInfo.js:50-55`

- [ ] **Step 1: Write the failing normalizer test**

Add to `Api.Tests/EventNormalizerTests.cs`:

```csharp
    [TestMethod]
    public void NormalizeEvent_WorldCupSubGenre_FallsThroughToGenericSoccer()
    {
        // World Cup is not a supported league: the subGenre no longer maps,
        // so the event falls through to plain Soccer/Other. (Events *named*
        // "world cup" are hard-dropped by the EventFilter denylist upstream.)
        var result = EventNormalizer.NormalizeEvent(
            "Mexico vs Argentina",
            "Mexico National Football Team",
            "Argentina National Football Team",
            "Soccer",
            "FIFA World Cup");

        Assert.AreEqual("Soccer", result.Sport);
        Assert.AreEqual("Other", result.League);
    }
```

- [ ] **Step 2: Run it to verify it fails**

```bash
dotnet test Api.Tests/Api.Tests.csproj --filter "NormalizeEvent_WorldCupSubGenre_FallsThroughToGenericSoccer" --nologo -v q
```
Expected: FAIL — league comes back `"World Cup"`.

- [ ] **Step 3: Remove the normalizer mapping**

In `Api/Services/EventNormalizer.cs`, `MatchProLeague`, delete this line:

```csharp
            "fifa world cup" or "world cup"    => ("Soccer", "World Cup"),
```

- [ ] **Step 4: Remove "World Cup" from the classifier schema and bump the version**

In `Api/Models/EventVerdict.cs`:

```csharp
    public const int Version = 4;
```

and remove `"World Cup", ` from the `Leagues` array so the line reads:

```csharp
        "USL", "Liga MX", "International", "AHL", "ECHL",
```

**Consequence (intentional):** all stored verdicts are v3 and will be discarded on next load, triggering a one-time re-classification burst against Gemini. This is the schema-version mechanism working as designed; the cost is a handful of batched free-tier calls.

- [ ] **Step 5: Update the schema-coverage test**

In `Api.Tests/ClassificationTriggersTests.cs` (`SchemaLeagues_CoverEverythingTheNormalizerCanProduce`), remove `"World Cup", ` from `normalizerLeagues` so the line reads:

```csharp
            "USL", "Liga MX", "International", "AHL", "ECHL", "LOVB",
```

- [ ] **Step 6: Run the API suite**

```bash
dotnet test Api.Tests/Api.Tests.csproj --nologo -v q
```
Expected: all pass (119 passing, 3 skipped).

- [ ] **Step 7: Remove client-side World Cup metadata**

Three deletions:

1. `client/src/pages/DiscoverPage.jsx` — in `LEAGUE_ORDER`, delete the line `  'World Cup',`
2. `client/src/data/teams.js` — in `LEAGUE_COLORS`, delete the line `  'World Cup': 'bg-cyan-700',`
3. `client/src/data/leagueInfo.js` — delete the whole entry:

```js
  'World Cup': {
    fullName: 'FIFA World Cup',
    tier: 'International',
    description: 'The FIFA World Cup is the premier international soccer tournament, bringing together the top national teams in the world.',
    website: 'fifa.com',
  },
```

(Leave the `International` entry — International soccer remains supported. Leave the World Cup *mentions* inside venue descriptions in `client/src/data/venues/mls.js` — those are prose about stadiums, not league support.)

- [ ] **Step 8: Verify client**

Run from `client/`:
```bash
npm run lint
npm test
```
Expected: clean / 46 pass.

- [ ] **Step 9: Commit**

```bash
git add Api/Services/EventNormalizer.cs Api/Models/EventVerdict.cs Api.Tests/EventNormalizerTests.cs Api.Tests/ClassificationTriggersTests.cs client/src/pages/DiscoverPage.jsx client/src/data/teams.js client/src/data/leagueInfo.js
git commit -m "feat: drop World Cup league support (denylist drop stays)"
```

---

### Task 6: Escape the event id in the Ticketmaster URL (analysis bug #6)

Route values can contain percent-decoded characters (`%3F` → `?`, `%2F` → `/`), letting a caller reshape the outbound Ticketmaster request. One-line hardening; `SeatGeekClient` already escapes its inputs.

**Files:**
- Modify: `Api/Services/TicketmasterClient.cs:60`

- [ ] **Step 1: Escape the id**

In `GetEventByIdAsync`, change the URL line to:

```csharp
        var url = $"https://app.ticketmaster.com/discovery/v2/events/{Uri.EscapeDataString(eventId)}.json?apikey={apiKey}";
```

- [ ] **Step 2: Verify build and tests**

```bash
dotnet test Api.Tests/Api.Tests.csproj --nologo -v q
```
Expected: all pass. (No new unit test — the URL string is private to the HTTP call; the change is mechanical.)

- [ ] **Step 3: Commit**

```bash
git add Api/Services/TicketmasterClient.cs
git commit -m "fix: escape event id before building Ticketmaster URL"
```

---

### Task 7: Rate limiting + negative caching (analysis bug #7)

`/api/games/{id}` cache-misses each cost a Ticketmaster call (5k/day quota) and can trigger Gemini calls — a dumb loop can blank the app for everyone. Three parts:
1. **Forwarded headers** so the rate limiter sees the real client IP behind Container Apps ingress.
2. **Per-IP fixed-window limiter on `/api` only** (60/min — ~30x a real browsing session). `/healthz` and static assets stay unlimited.
3. **Negative caching**: cache `null` lookups for 1 minute so random-id probes don't each burn a Ticketmaster call (`IMemoryCache` stores null values fine — `TryGetValue` returns `true` with a null out value).

Uses only built-in ASP.NET Core primitives; the test project gains `Microsoft.AspNetCore.Mvc.Testing` for in-memory integration tests.

**Files:**
- Modify: `Api.Tests/Api.Tests.csproj` (new package)
- Create: `Api.Tests/RateLimitingTests.cs`
- Modify: `Api/Program.cs`

- [ ] **Step 1: Add the test package**

```bash
dotnet add Api.Tests/Api.Tests.csproj package Microsoft.AspNetCore.Mvc.Testing
```

- [ ] **Step 2: Write the failing integration tests**

Create `Api.Tests/RateLimitingTests.cs`:

```csharp
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Api.Tests;

// In-memory integration tests. No Ticketmaster key is configured in the
// test host, so /api/games endpoints short-circuit without network calls
// (games -> 500 Problem, games/{id} -> 404) — which is all these tests need.
[TestClass]
public class RateLimitingTests
{
    [TestMethod]
    public async Task ApiRequests_Beyond60PerMinute_Get429()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 61; i++)
        {
            using var response = await client.GetAsync("/api/games?stateCode=UT");
            statuses.Add(response.StatusCode);
        }

        Assert.IsFalse(statuses.Take(60).Any(s => s == HttpStatusCode.TooManyRequests),
            "the first 60 requests must not be throttled");
        Assert.AreEqual(HttpStatusCode.TooManyRequests, statuses[60]);
    }

    [TestMethod]
    public async Task Healthz_IsNeverRateLimited()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        for (var i = 0; i < 70; i++)
        {
            using var response = await client.GetAsync("/healthz");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [TestMethod]
    public async Task GamesById_UnknownEvent_Returns404()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/games/no-such-id");
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

- [ ] **Step 3: Make `Program` visible to the test host, then verify the tests fail**

At the very end of `Api/Program.cs` (after `app.Run();`), add:

```csharp
// Exposes the implicit Program class to WebApplicationFactory-based tests.
public partial class Program { }
```

Then run:
```bash
dotnet test Api.Tests/Api.Tests.csproj --filter "RateLimitingTests" --nologo -v q
```
Expected: `ApiRequests_Beyond60PerMinute_Get429` **FAILS** (no 429 ever — limiter not implemented). `Healthz_IsNeverRateLimited` and `GamesById_UnknownEvent_Returns404` pass (baseline behavior).

- [ ] **Step 4: Implement forwarded headers + rate limiter in Program.cs**

Add usings at the top of `Api/Program.cs`:

```csharp
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
```

After the CORS service registration (`builder.Services.AddCors(...)`), add:

```csharp
// Behind Container Apps ingress the socket peer is the proxy; restore the
// real client IP from X-Forwarded-For so the rate limiter partitions per
// visitor. The ingress is the only hop and its address isn't static, so
// trust the immediate proxy instead of pinning known networks.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Per-IP fixed window on /api only — /healthz and static assets stay
// unlimited. 60/min is ~30x a real browsing session; the target is
// quota-burning loops (each uncached /api/games/{id} costs a Ticketmaster
// call against the 5k/day quota).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        ctx.Request.Path.StartsWithSegments("/api")
            ? RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 60,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                })
            : RateLimitPartition.GetNoLimiter("unlimited"));
});
```

In the middleware pipeline: add `app.UseForwardedHeaders();` immediately after `var app = builder.Build();`, and add `app.UseRateLimiter();` **after** the request-logging middleware (so 429s show up in the request log) and before `app.MapGet("/healthz", ...)`.

- [ ] **Step 5: Add negative caching to both single-event lookups**

In `Api/Program.cs`, `GetEventById` endpoint — replace the cache-miss block:

```csharp
    var cacheKey = $"event:{id}";
    if (!cache.TryGetValue(cacheKey, out SportEvent? ev))
    {
        ev = await ticketmaster.GetEventByIdAsync(id);
        // Misses are cached too (short TTL) so random-id probes don't each
        // burn a Ticketmaster call; hits keep the normal 5-minute TTL.
        cache.Set(cacheKey, ev, ev == null ? TimeSpan.FromMinutes(1) : TimeSpan.FromMinutes(5));
    }

    return ev == null ? Results.NotFound() : Results.Ok(ev);
```

And the inner event fetch inside the `GetSeatGeekLink` endpoint — replace:

```csharp
        // Same cached source-event path as GetEventById.
        var eventKey = $"event:{id}";
        if (!cache.TryGetValue(eventKey, out SportEvent? ev))
        {
            ev = await ticketmaster.GetEventByIdAsync(id);
            cache.Set(eventKey, ev, ev == null ? TimeSpan.FromMinutes(1) : TimeSpan.FromMinutes(5));
        }
        if (ev == null)
            return Results.NotFound();
```

(Note: with null now cached, `TryGetValue` returning `true` with `ev == null` short-circuits to 404 without a refetch — that is the point.)

- [ ] **Step 6: Run the full API suite**

```bash
dotnet test Api.Tests/Api.Tests.csproj --nologo -v q
```
Expected: all pass, including the three new integration tests (122 passing, 3 skipped).

- [ ] **Step 7: Commit**

```bash
git add Api/Program.cs Api.Tests/Api.Tests.csproj Api.Tests/RateLimitingTests.cs
git commit -m "feat: per-IP rate limiting on /api and negative caching for event lookups"
```

---

### Task 8: Storage-adapter refactor

Extract all localStorage access behind one adapter so hooks never touch storage directly. This is the seam for the accounts/DB phase (an API-backed adapter), the React Native port (AsyncStorage-backed adapter), and test injection.

**Scope decision:** the adapter covers **favorites and saved events** (the data destined for account sync). `stadar-location` stays a raw string outside the adapter on purpose — it's device-local by nature and is *not* JSON-encoded in existing clients (running it through `JSON.parse` would silently reset every existing user's location).

**Interface decision (YAGNI):** synchronous `load` / result-returning `save`, matching localStorage — hooks keep hydrating initial state synchronously with no flash of empty content. `useSavedEvents` already models `persistenceStatus: 'saving' | 'saved' | 'error'`, so when an async API adapter arrives, only the adapter and this status wiring change.

**Files:**
- Create: `client/src/utils/storageAdapter.js`
- Create: `client/src/utils/storageAdapter.test.js`
- Modify: `client/src/hooks/useFavorites.js`
- Modify: `client/src/hooks/useSavedEvents.js`
- Modify: `client/src/utils/savedEventRecords.js` (remove `persistSavedRecords`)
- Modify: `client/src/utils/savedEventRecords.test.js` (remove its two tests)

- [ ] **Step 1: Write the failing adapter tests**

Create `client/src/utils/storageAdapter.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocalStorageAdapter } from './storageAdapter.js'

function makeFakeStorage(overrides = {}) {
  const map = new Map()
  return {
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    ...overrides,
  }
}

test('load returns the parsed value for a stored key', () => {
  const storage = makeFakeStorage()
  storage.setItem('k', JSON.stringify(['Utah Jazz']))
  const adapter = createLocalStorageAdapter(storage)

  assert.deepEqual(adapter.load('k', []), ['Utah Jazz'])
})

test('load returns the fallback for a missing key', () => {
  const adapter = createLocalStorageAdapter(makeFakeStorage())

  assert.deepEqual(adapter.load('missing', []), [])
})

test('load returns the fallback for corrupt JSON', () => {
  const storage = makeFakeStorage()
  storage.setItem('k', '{not json')
  const adapter = createLocalStorageAdapter(storage)

  assert.deepEqual(adapter.load('k', []), [])
})

test('load returns the fallback when storage is unavailable', () => {
  const adapter = createLocalStorageAdapter(undefined)

  assert.deepEqual(adapter.load('k', []), [])
})

test('save round-trips through load', () => {
  const adapter = createLocalStorageAdapter(makeFakeStorage())

  const result = adapter.save('k', [{ id: 'e1' }])

  assert.deepEqual(result, { ok: true })
  assert.deepEqual(adapter.load('k', []), [{ id: 'e1' }])
})

test('save reports a storage write failure without throwing', () => {
  const quotaError = new Error('quota exceeded')
  const adapter = createLocalStorageAdapter(makeFakeStorage({
    setItem() {
      throw quotaError
    },
  }))

  const result = adapter.save('k', [1])

  assert.equal(result.ok, false)
  assert.strictEqual(result.error, quotaError)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `client/`:
```bash
npm test
```
Expected: the new file errors with "Cannot find module './storageAdapter.js'".

- [ ] **Step 3: Implement the adapter**

Create `client/src/utils/storageAdapter.js`:

```js
// Storage adapter — the single seam between hooks and persistence.
//
// Today there is one backend: browser localStorage (the anonymous tier).
// When accounts land, an API-backed adapter implements this same interface
// and the hooks switch on auth state; the React Native port swaps in an
// AsyncStorage-backed adapter. Hooks must never touch localStorage
// directly — always go through this module.
//
// Scope: user data destined for account sync (favorites, saved events).
// `stadar-location` stays a raw string outside the adapter on purpose —
// it is device-local and not JSON-encoded in existing clients.

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  return {
    // Returns the parsed value, or `fallback` on a missing key, corrupt
    // JSON, or unavailable storage.
    load(key, fallback) {
      try {
        const raw = storage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch {
        return fallback
      }
    },
    // Returns { ok: true } or { ok: false, error } — callers surface
    // failures (quota, private mode) instead of throwing mid-render.
    save(key, value) {
      try {
        storage.setItem(key, JSON.stringify(value))
        return { ok: true }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

export const storageAdapter = createLocalStorageAdapter()
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `client/`:
```bash
npm test
```
Expected: 52 pass, 0 fail.

- [ ] **Step 5: Migrate useFavorites**

Replace `client/src/hooks/useFavorites.js`:

```js
import { useState } from 'react'
import { storageAdapter } from '../utils/storageAdapter.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => storageAdapter.load(STORAGE_KEY, []))

  function toggleFavorite(teamName) {
    setFavorites(prev => {
      const next = prev.includes(teamName)
        ? prev.filter(t => t !== teamName)
        : [...prev, teamName]
      storageAdapter.save(STORAGE_KEY, next)
      return next
    })
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite }
}
```

- [ ] **Step 6: Migrate useSavedEvents**

In `client/src/hooks/useSavedEvents.js`:

1. Remove `persistSavedRecords,` from the `../utils/savedEventRecords.js` import list and add:

```js
import { storageAdapter } from '../utils/storageAdapter.js'
```

2. Replace `loadSaved`:

```js
function loadSaved() {
  return normalizeSavedRecords(storageAdapter.load(STORAGE_KEY, []))
}
```

3. In the persist effect, replace the `persistSavedRecords` call:

```js
    const result = storageAdapter.save(STORAGE_KEY, savedEvents)
```

(Everything else in the hook stays exactly as-is — same `{ ok }` result shape, so `persistenceStatus` wiring is untouched.)

- [ ] **Step 7: Remove the superseded helper**

1. In `client/src/utils/savedEventRecords.js`, delete the `persistSavedRecords` function (the whole `export function persistSavedRecords(...) {...}` block).
2. In `client/src/utils/savedEventRecords.test.js`, delete `persistSavedRecords,` from the import and delete the two tests:
   - `test('persistSavedRecords serializes records to the requested storage key', ...)`
   - `test('persistSavedRecords reports a storage write failure without throwing', ...)`

- [ ] **Step 8: Verify nothing else references the old helper, then run everything**

Run from `client/`:
```bash
grep -rn "persistSavedRecords" src/
npm run lint
npm test
```
Expected: grep finds nothing; lint clean; **50 tests pass** (52 minus the 2 removed).

- [ ] **Step 9: Commit**

```bash
git add client/src/utils/storageAdapter.js client/src/utils/storageAdapter.test.js client/src/hooks/useFavorites.js client/src/hooks/useSavedEvents.js client/src/utils/savedEventRecords.js client/src/utils/savedEventRecords.test.js
git commit -m "refactor: route favorites and saved events through a storage adapter"
```

---

### Task 9: Sync CLAUDE.md with reality

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Apply the documentation fixes**

1. **SportEvent record** (in the `### SportEvent Record` section): delete the three stale lines so the record matches `Api/Models/SportEvent.cs`:
   - `    double? PriceMin = null,`
   - `    double? PriceMax = null,`
   - `    string Currency = "",`
   Also change `string LocalDate = "",` to keep valid syntax as the first optional param (no other edits needed — just remove the three lines).
2. **"What's Working" table:** change the Detail page row from `Full event view with venue map, pricing, and league info` to `Full event view with venue map and league info`.
3. **League detection bullet** (Key Technical Notes): remove `World Cup, ` from the league list so it reads `...USL, Liga MX, and International soccer`.
4. **Tests bullet:** change to:
   `- **Tests:** API: \`cd Api.Tests && dotnet test\` — client: \`cd client && npm test\` (node:test). CI runs both plus the client build`
5. **"To Deploy" paragraph:** change "runs the API tests and client build" to "runs the API and client tests and the client build".
6. **API section**, after the endpoint descriptions, add:
   `All /api routes are rate limited per client IP (60 requests/minute, fixed window; 429 on excess). /healthz and static assets are unlimited. Single-event lookups negative-cache misses for 1 minute so random-id probes don't burn Ticketmaster quota.`
7. **Key Technical Notes**, add two bullets:
   `- **Storage adapter:** all account-sync data (favorites, saved events) goes through \`client/src/utils/storageAdapter.js\` — hooks never touch localStorage directly. This is the seam for the future API-backed adapter (accounts/DB) and the RN AsyncStorage port. \`stadar-location\` intentionally stays a raw string outside the adapter`
   `- **Date-only events:** events with no start time keep venue-local end-of-day (via TM \`dates.timezone\`), so they stay in the feed until venue midnight`
8. **File structure block:** under `client/src/utils/`, add `storageAdapter.js` (`# localStorage seam; future API/AsyncStorage adapters`); under `Api.Tests/`, add `RateLimitingTests.cs`.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: sync CLAUDE.md with db-prep fixes"
```

---

### Task 10: Final verification

- [ ] **Step 1: Full API suite**

```bash
dotnet test Api.Tests/Api.Tests.csproj --nologo -v q
```
Expected: 122 passed, 0 failed, 3 skipped.

- [ ] **Step 2: Full client suite + lint + production build**

Run from `client/`:
```bash
npm test
npm run lint
npm run build
```
Expected: 50 tests pass, lint clean, build succeeds.

- [ ] **Step 3: End-to-end smoke test**

Terminal 1: `cd Api && dotnet watch` — Terminal 2: `cd client && npm run dev`, then verify:
- Discover page loads events; switching states never shows a mismatched list.
- An event detail page opens from a card; Save → Saved tab shows it; notes persist across reload (adapter path).
- `curl` hammer: `for ($i=0; $i -lt 65; $i++) { (Invoke-WebRequest -Uri http://localhost:5068/api/games?stateCode=UT -SkipHttpErrorCheck).StatusCode }` — expect 429s after 60.

- [ ] **Step 4: Review the branch**

```bash
git log --oneline main..fix/db-prep
```
Expected: 9 commits matching Tasks 1–9. Do **not** push or merge — hand back for review (use superpowers:finishing-a-development-branch).
