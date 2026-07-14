# SeatGeek Direct Event Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The SeatGeek button on the event detail page opens the matching seatgeek.com event page directly, falling back to today's Google search link when no confident match exists.

**Architecture:** A new server-side `SeatGeekClient` (typed HttpClient, inert without config — same pattern as the Gemini layer) queries the SeatGeek Platform API and picks a match with a deterministic scorer. A new lazy endpoint `GET /api/games/{id}/seatgeek` serves the URL with 6-hour in-memory caching. The detail page fetches it in the background and silently upgrades the SeatGeek button.

**Tech Stack:** ASP.NET Core minimal APIs (.NET 10), MSTest, React (Vite), SeatGeek Platform API v2.

**Spec:** `docs/superpowers/specs/2026-07-13-seatgeek-event-links-design.md`

**Preconditions (already done, no tasks needed):**
- `SeatGeek:ClientId` / `SeatGeek:ClientSecret` are in `Api/appsettings.Development.json` (never commit this file).
- `SeatGeek__ClientId` / `SeatGeek__ClientSecret` env vars are set on the Azure Container App.

**⚠ Before you start:** `git status` currently shows uncommitted venue-knowledge work in `client/src/data/venues/cfbBig12.js` and `client/src/pages/EventDetailPage.jsx`. Task 4 modifies `EventDetailPage.jsx`, so its commit would swallow that WIP. **Stop and ask Brady to commit (or stash) his venue-knowledge changes before starting Task 4.** Tasks 1–3 only touch `Api/`, `Api.Tests/`, and docs, so they are safe regardless.

---

### Task 1: SeatGeekClient tests (red)

**Files:**
- Create: `Api.Tests/SeatGeekClientTests.cs`

The whole test file is written first; it will not compile until `SeatGeekClient` exists (Task 2). This is the red half of one red→green cycle covering the pure matcher and the HTTP behavior.

- [ ] **Step 1: Write the failing tests**

Create `Api.Tests/SeatGeekClientTests.cs` with exactly:

```csharp
using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class SeatGeekClientTests
{
    private sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Requests.Add(request);
            return Task.FromResult(responder(request));
        }
    }

    private static IConfiguration Config(string? clientId = "test-client-id") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["SeatGeek:ClientId"] = clientId,
        }).Build();

    private static SportEvent MakeEvent(
        string home = "Utah Jazz", string away = "Denver Nuggets",
        string city = "Salt Lake City", string state = "UT",
        string localDate = "2026-10-01") =>
        new(
            Id: "tm-1", Name: $"{home} vs. {away}",
            HomeTeam: home, AwayTeam: away,
            DateTime: new DateTime(2026, 10, 1, 19, 0, 0),
            Venue: "Delta Center", Sport: "Basketball", League: "NBA",
            City: city, State: state, Latitude: 40.77, Longitude: -111.89,
            TicketUrl: "https://www.ticketmaster.com/event/tm-1", ImageUrl: "",
            LocalDate: localDate, LocalTime: "19:00:00");

    // Shapes candidates the way the SeatGeek /2/events response does.
    private static object SgEvent(string url, string datetimeLocal, string title, string city, params string[] performers) => new
    {
        title,
        url,
        datetime_local = datetimeLocal,
        venue = new { city },
        performers = performers.Select(name => new { name }).ToArray(),
    };

    private static JsonElement SgJson(params object[] events) =>
        JsonSerializer.SerializeToElement(new { events });

    private static HttpResponseMessage Ok(object body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json") };

    // ---------- Matcher (pure) ----------

    [TestMethod]
    public void Match_SameDateAndHomeTeamInTitle_ReturnsUrl()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.AreEqual("https://seatgeek.com/e/1", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_HomeTeamInPerformersOnly_ReturnsUrl()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "NBA Preseason Game 3", "Salt Lake City", "Utah Jazz", "Denver Nuggets"));

        Assert.AreEqual("https://seatgeek.com/e/1", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_CityBreaksTieBetweenSameDayCandidates()
    {
        var json = SgJson(
            SgEvent("https://seatgeek.com/e/vegas", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Las Vegas"),
            SgEvent("https://seatgeek.com/e/slc", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.AreEqual("https://seatgeek.com/e/slc", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_NoCityMatch_UsesFirstHardMatch()
    {
        var json = SgJson(
            SgEvent("https://seatgeek.com/e/a", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "West Valley City"),
            SgEvent("https://seatgeek.com/e/b", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Las Vegas"));

        Assert.AreEqual("https://seatgeek.com/e/a", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_WrongDate_ReturnsNull()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-02T19:00:00",
            "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_HomeTeamAbsentEverywhere_ReturnsNull()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "Some Other Game", "Salt Lake City", "Team A", "Team B"));

        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_EmptyOrMissingEventsArray_ReturnsNull()
    {
        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(SgJson(), MakeEvent()));
        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(
            JsonSerializer.SerializeToElement(new { message = "no events key" }), MakeEvent()));
    }

    // ---------- HTTP behavior ----------

    [TestMethod]
    public async Task Disabled_WithoutClientId_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config(clientId: null));

        Assert.IsFalse(client.IsEnabled);
        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Lookup_SendsExpectedQuery()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        await client.FindEventUrlAsync(MakeEvent());

        var uri = handler.Requests.Single().RequestUri!;
        Assert.AreEqual("api.seatgeek.com", uri.Host);
        Assert.AreEqual("/2/events", uri.AbsolutePath);
        StringAssert.Contains(uri.Query, "client_id=test-client-id");
        StringAssert.Contains(uri.Query, "q=Utah%20Jazz%20Denver%20Nuggets");
        StringAssert.Contains(uri.Query, "venue.state=UT");
        StringAssert.Contains(uri.Query, "datetime_local.gte=2026-10-01T00:00:00");
        StringAssert.Contains(uri.Query, "datetime_local.lte=2026-10-01T23:59:59");
        StringAssert.Contains(uri.Query, "per_page=10");
    }

    [TestMethod]
    public async Task Lookup_NoAwayTeam_QueriesHomeTeamOnly()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        await client.FindEventUrlAsync(MakeEvent(away: ""));

        StringAssert.Contains(handler.Requests.Single().RequestUri!.Query, "q=Utah%20Jazz&");
    }

    [TestMethod]
    public async Task Lookup_ReturnsMatchedUrl()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new
        {
            events = new[]
            {
                SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Salt Lake City"),
            },
        }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.AreEqual("https://seatgeek.com/e/1", await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_ServerError_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_MalformedJson_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("not json", Encoding.UTF8, "application/json"),
        });
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_NetworkFailure_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => throw new HttpRequestException("boom"));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_MissingLocalDate_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent(localDate: "")));
        Assert.AreEqual(0, handler.Requests.Count);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from repo root):

```powershell
dotnet test Api.Tests/Api.Tests.csproj --filter "FullyQualifiedName~SeatGeekClientTests"
```

Expected: **build FAILURE** with `CS0246: The type or namespace name 'SeatGeekClient' could not be found`. Do not commit yet — the suite must be green first.

---

### Task 2: SeatGeekClient implementation (green)

**Files:**
- Create: `Api/Services/SeatGeekClient.cs`
- Test: `Api.Tests/SeatGeekClientTests.cs` (from Task 1)

- [ ] **Step 1: Write the implementation**

Create `Api/Services/SeatGeekClient.cs` with exactly:

```csharp
using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Finds the direct SeatGeek event page for a SportEvent via the SeatGeek
/// Platform API. Inert without SeatGeek:ClientId configured: no network
/// calls, every lookup returns null (same pattern as the Gemini layer).
/// Only the client id is sent; SeatGeek:ClientSecret is reserved for future
/// authenticated endpoints.
/// </summary>
public class SeatGeekClient(HttpClient httpClient, IConfiguration config)
{
    public bool IsEnabled => !string.IsNullOrWhiteSpace(config["SeatGeek:ClientId"]);

    public async Task<string?> FindEventUrlAsync(SportEvent ev)
    {
        var clientId = config["SeatGeek:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(ev.LocalDate))
            return null;

        var query = string.IsNullOrWhiteSpace(ev.AwayTeam)
            ? ev.HomeTeam
            : $"{ev.HomeTeam} {ev.AwayTeam}";

        var url = "https://api.seatgeek.com/2/events" +
                  $"?client_id={Uri.EscapeDataString(clientId)}" +
                  $"&q={Uri.EscapeDataString(query)}" +
                  $"&venue.state={Uri.EscapeDataString(ev.State)}" +
                  $"&datetime_local.gte={ev.LocalDate}T00:00:00" +
                  $"&datetime_local.lte={ev.LocalDate}T23:59:59" +
                  "&per_page=10";

        var response = await GetOrDefaultAsync(url);
        if (response == null || !response.IsSuccessStatusCode)
            return null;

        try
        {
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return PickBestMatchUrl(json, ev);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    /// <summary>
    /// Deterministic scorer, pure for tests. Hard requirements: candidate is
    /// on the same local date and its title or a performer name contains the
    /// home team. A venue-city match wins ties; otherwise the first hard
    /// match is used. Nothing qualifies -> null (no guessing).
    /// </summary>
    public static string? PickBestMatchUrl(JsonElement json, SportEvent ev)
    {
        if (string.IsNullOrWhiteSpace(ev.HomeTeam) ||
            json.ValueKind != JsonValueKind.Object ||
            !json.TryGetProperty("events", out var events) ||
            events.ValueKind != JsonValueKind.Array)
            return null;

        string? firstHardMatch = null;
        foreach (var candidate in events.EnumerateArray())
        {
            var url = GetString(candidate, "url");
            if (url.Length == 0 ||
                !SameLocalDate(candidate, ev.LocalDate) ||
                !MentionsHomeTeam(candidate, ev.HomeTeam))
                continue;

            var city = candidate.TryGetProperty("venue", out var venue) ? GetString(venue, "city") : "";
            if (string.Equals(city, ev.City, StringComparison.OrdinalIgnoreCase))
                return url;
            firstHardMatch ??= url;
        }
        return firstHardMatch;
    }

    private static bool SameLocalDate(JsonElement candidate, string localDate) =>
        GetString(candidate, "datetime_local") is { Length: >= 10 } dt && dt[..10] == localDate;

    private static bool MentionsHomeTeam(JsonElement candidate, string homeTeam)
    {
        if (GetString(candidate, "title").Contains(homeTeam, StringComparison.OrdinalIgnoreCase))
            return true;

        if (candidate.TryGetProperty("performers", out var performers) &&
            performers.ValueKind == JsonValueKind.Array)
        {
            foreach (var performer in performers.EnumerateArray())
                if (GetString(performer, "name").Contains(homeTeam, StringComparison.OrdinalIgnoreCase))
                    return true;
        }
        return false;
    }

    private static string GetString(JsonElement element, string property) =>
        element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(property, out var value) &&
        value.ValueKind == JsonValueKind.String
            ? value.GetString() ?? ""
            : "";

    // Network failures and timeouts surface the same as a non-success status:
    // callers get null and the endpoint responds 404 instead of a 500.
    private async Task<HttpResponseMessage?> GetOrDefaultAsync(string url)
    {
        try
        {
            return await httpClient.GetAsync(url);
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException)
        {
            Console.WriteLine($"SeatGeek request failed: {e.Message}");
            return null;
        }
    }
}
```

- [ ] **Step 2: Run the new tests to verify they pass**

```powershell
dotnet test Api.Tests/Api.Tests.csproj --filter "FullyQualifiedName~SeatGeekClientTests"
```

Expected: PASS — `Passed! - Failed: 0, Passed: 15`.

- [ ] **Step 3: Run the full suite to check for regressions**

```powershell
dotnet test Api.Tests/Api.Tests.csproj
```

Expected: PASS with zero failures (live Gemini integration tests may report skipped — that is normal).

- [ ] **Step 4: Commit**

```powershell
git add Api/Services/SeatGeekClient.cs Api.Tests/SeatGeekClientTests.cs
git commit -m @'
Add SeatGeekClient with deterministic event matcher

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: DI registration + lazy endpoint

**Files:**
- Modify: `Api/Program.cs` (registration near line 8; endpoint after the `GetEventById` block, currently lines 113–125)

- [ ] **Step 1: Register the typed client**

In `Api/Program.cs`, change:

```csharp
builder.Services.AddHttpClient<TicketmasterClient>();
```

to:

```csharp
builder.Services.AddHttpClient<TicketmasterClient>();
builder.Services.AddHttpClient<SeatGeekClient>();
```

- [ ] **Step 2: Add the endpoint**

Immediately after the `app.MapGet("/api/games/{id}", ...)` block (after its `.WithName("GetEventById");` line), add:

```csharp
// Lazy per-event SeatGeek lookup. Lives under /api/games and avoids the
// words "event"/"ticket" in the path for the same ad-block reasons as the
// games route. 404 covers all "no link" cases: unconfigured, unknown id,
// or no confident match — the client keeps its search-link fallback.
app.MapGet("/api/games/{id}/seatgeek", async (string id, TicketmasterClient ticketmaster, SeatGeekClient seatGeek, IMemoryCache cache) =>
{
    if (!seatGeek.IsEnabled)
        return Results.NotFound();

    // Same cached source-event path as GetEventById.
    var eventKey = $"event:{id}";
    if (!cache.TryGetValue(eventKey, out SportEvent? ev))
    {
        ev = await ticketmaster.GetEventByIdAsync(id);
        if (ev != null)
            cache.Set(eventKey, ev, TimeSpan.FromMinutes(5));
    }
    if (ev == null)
        return Results.NotFound();

    // Cache the lookup — including "no match" — so repeat visits don't
    // re-hit SeatGeek. The URL for an event is stable, hence the long TTL.
    var linkKey = $"seatgeek:{id}";
    if (!cache.TryGetValue(linkKey, out string? url))
    {
        url = await seatGeek.FindEventUrlAsync(ev);
        cache.Set(linkKey, url, TimeSpan.FromHours(6));
    }

    return url == null ? Results.NotFound() : Results.Ok(new { url });
})
.WithName("GetSeatGeekLink");
```

- [ ] **Step 3: Verify it builds and the suite still passes**

```powershell
dotnet build Api/Api.csproj
dotnet test Api.Tests/Api.Tests.csproj
```

Expected: build succeeded; all tests pass.

- [ ] **Step 4: Commit**

```powershell
git add Api/Program.cs
git commit -m @'
Add GET /api/games/{id}/seatgeek lazy link endpoint

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 4: Detail page wiring

**⚠ Gate:** `client/src/pages/EventDetailPage.jsx` has uncommitted venue-knowledge changes. Confirm Brady has committed or stashed them before editing (`git status` must show it clean, or Brady has explicitly said to proceed and will sort out the commit himself).

**Files:**
- Modify: `client/src/pages/EventDetailPage.jsx` (state near line 295, new effect after the event-fetch effect ending near line 357, `ticketSearchLinks` near line 419)

- [ ] **Step 1: Add the `seatGeekUrl` state**

In the `EventDetailPage` component, after:

```jsx
  const [venueKnowledge, setVenueKnowledge] = useState(null)
```

add:

```jsx
  const [seatGeekUrl, setSeatGeekUrl] = useState(null)
```

- [ ] **Step 2: Add the background lookup effect**

Immediately after the existing event-fetch `useEffect` (the one ending with `}, [id]) // eslint-disable-line react-hooks/exhaustive-deps`), add:

```jsx
  // Background lookup for a direct SeatGeek event link. 404 (no match /
  // not configured) fails fast in fetchJsonWithRetry and is swallowed, so
  // the Google-search fallback link simply stays.
  useEffect(() => {
    let cancelled = false
    setSeatGeekUrl(null)

    fetchJsonWithRetry(`${API_BASE}/api/games/${id}/seatgeek`)
      .then(data => {
        if (!cancelled && data?.url) setSeatGeekUrl(data.url)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])
```

- [ ] **Step 3: Override the SeatGeek provider URL**

Change:

```jsx
  const ticketSearchLinks = TICKET_SEARCH_PROVIDERS.map(provider => ({
    ...provider,
    url: buildTicketSearchUrl(event, provider.domain),
  }))
```

to:

```jsx
  const ticketSearchLinks = TICKET_SEARCH_PROVIDERS.map(provider => ({
    ...provider,
    url: provider.name === 'SeatGeek' && seatGeekUrl
      ? seatGeekUrl
      : buildTicketSearchUrl(event, provider.domain),
  }))
```

- [ ] **Step 4: Lint and build the client**

```powershell
cd client; npm run lint; npm run build
```

Expected: lint clean, build succeeds.

- [ ] **Step 5: Commit**

```powershell
git add client/src/pages/EventDetailPage.jsx
git commit -m @'
Detail page upgrades SeatGeek button to direct event link

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: Documentation

**Files:**
- Modify: `CLAUDE.md` (API section endpoint list + Key Technical Notes + file structure)

- [ ] **Step 1: Update CLAUDE.md**

1. In the `## API` section, change the endpoint list to:

```text
GET /api/games?stateCode={XX}
GET /api/games/{id}
GET /api/games/{id}/seatgeek
GET /healthz
```

and after the `GET /api/games/{id}:` bullet block, add:

```markdown
`GET /api/games/{id}/seatgeek`:
- Returns `{ "url": ... }` — the direct SeatGeek event page for the event
- Deterministic match (same local date + home team in title/performers; city breaks ties)
- Caches results per event for 6 hours (including "no match")
- Returns `404` when SeatGeek is unconfigured, the event is unknown, or no confident match exists — the client keeps its Google-search fallback link
```

2. In `## Key Technical Notes`, after the Gemini API key bullet, add:

```markdown
- **SeatGeek API key:** local dev in `appsettings.Development.json` (`SeatGeek:ClientId` / `SeatGeek:ClientSecret`); Azure uses `SeatGeek__ClientId` / `SeatGeek__ClientSecret`. Only the client id is sent on requests; no key → endpoint 404s and the detail page keeps its search-link fallback
```

3. In the `## File Structure` tree, add `|       |-- SeatGeekClient.cs` under `Api/Services/` (after `|       |-- MinorLeagueBaseball.cs`) and `|   |-- SeatGeekClientTests.cs` under `Api.Tests/` (after `|   |-- MinorLeagueBaseballTests.cs`).

- [ ] **Step 2: Commit**

```powershell
git add CLAUDE.md
git commit -m @'
Document SeatGeek link endpoint and config

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: End-to-end verification

No new files. Exercises the real flow with live SeatGeek credentials.

- [ ] **Step 1: Start the API** (background terminal)

```powershell
cd Api; dotnet run
```

Expected: listening on `http://localhost:5068`.

- [ ] **Step 2: Fetch a real event id, then hit the new endpoint**

```powershell
$games = Invoke-RestMethod "http://localhost:5068/api/games?stateCode=UT"
$id = $games[0].id
Invoke-RestMethod "http://localhost:5068/api/games/$id/seatgeek"
```

Expected: `{ url: https://seatgeek.com/... }` for a major-league event. (A 404 here is only acceptable if that particular event genuinely isn't on SeatGeek — try another id, e.g. an NBA/MLB game, before concluding the lookup is broken.)

- [ ] **Step 3: Verify the fallback path**

```powershell
Invoke-RestMethod "http://localhost:5068/api/games/nonexistent-id-123/seatgeek"
```

Expected: 404 error (`Invoke-RestMethod` throws `(404) Not Found`).

- [ ] **Step 4: Check the page in the browser**

Start the client (`cd client; npm run dev`), open `http://localhost:5173`, click into a major-league event, and confirm in the tickets section that the SeatGeek button's `href` is a `seatgeek.com/...` URL (inspect element or hover the status bar) and that it opens the correct event. Also confirm the other provider buttons still use Google search URLs.

- [ ] **Step 5: Confirm server logs show caching**

Reload the detail page and check the API terminal: the second `GET /api/games/{id}/seatgeek` must not log a `SeatGeek request failed` line nor re-fetch (both caches warm). Request log lines appear for every hit; that is expected.
