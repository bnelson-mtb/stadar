# LLM Event Classification Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Gemini-powered verdict layer that judges borderline Ticketmaster events (real game vs junk) and corrects their labels, per the approved spec at `docs/superpowers/specs/2026-07-07-llm-event-classification-design.md`.

**Architecture:** Deterministic hard rules run first and are free. Events without a stored verdict that fire any of four triggers are classified once by `gemini-2.5-flash-lite` (structured output, closed enums) during the fetch, in parallel with bounded concurrency; verdicts persist to a JSON blob in `stadarstorage` and always win over the rules on later fetches. No Gemini key → the whole layer is inert and the pipeline behaves exactly as today.

**Tech Stack:** ASP.NET Core (.NET 10) minimal API, `HttpClient` + `System.Text.Json` for Gemini REST (no SDK), `Azure.Storage.Blobs` for the verdict store, MSTest for tests, Node ≥ 20.10 for the known-teams export script.

**Branch:** all work happens on `feature/AI-classifier`. Never push to or merge into `main` as part of this plan.

---

## Prerequisites (Brady provides — see also "Parallel Execution Model")

| # | Item | Needed by | How to get it |
|---|------|-----------|---------------|
| 1 | **Gemini API key** (free) | Task 7 live test + Task 8 end-to-end verification. Coding/unit tests do NOT need it. | https://aistudio.google.com → "Get API key". Confirm `gemini-2.5-flash-lite` appears in the model list. |
| 2 | **Storage connection string** | Task 8 blob verification (memory-only mode works without it) + eventual deploy | `az storage account show-connection-string --name stadarstorage --resource-group stadar-rg --query connectionString -o tsv` |
| 3 | **Local secrets file** | Task 8 | Add to `Api/appsettings.Development.json` (untracked): `"Gemini": { "ApiKey": "<key>" }, "Storage": { "ConnectionString": "<conn>" }` |
| 4 | **Approval to commit the spec + this plan onto `feature/AI-classifier`** | before Wave 1 | Worktree-isolated agents can only see committed files. One commit: both docs. |
| 5 | Node ≥ 20.10 | Task 5 | Already satisfied if the Vite client builds locally. |

Deploy-time (later, only when this branch merges — CI deploys on push to `main` only, so nothing ships during development):

```bash
az containerapp secret set -n stadar -g stadar-rg --secrets gemini-api-key=<KEY> storage-conn="<CONNSTRING>"
az containerapp update -n stadar -g stadar-rg --set-env-vars Gemini__ApiKey=secretref:gemini-api-key Storage__ConnectionString=secretref:storage-conn
```

---

## Parallel Execution Model (cost-optimized)

Wave 1 tasks touch **disjoint files** and share only the Task 1 contracts, so they can run as **simultaneous Haiku subagents** (cheap models handle well-specified, isolated tasks reliably; every task here carries its full code and tests). Integration (Task 6) touches load-bearing existing code and is done by the orchestrator's main model.

| Wave | Tasks | Executor | Isolation |
|------|-------|----------|-----------|
| 0 | Task 1 (contracts + csproj) | Orchestrator, directly on `feature/AI-classifier` | none |
| 1 | Tasks 2, 3, 4, 5 **in parallel** | 4 subagents, `model: haiku`, one task each | `isolation: worktree` (each agent gets its own worktree/branch; avoids git-index and MSBuild lock contention) |
| 2 | Task 6 (pipeline integration) | Orchestrator (main model) | none |
| 2 | Task 7 (live test + docs) | 1 subagent, `model: haiku` (or orchestrator) | worktree or none |
| 3 | Task 8 (final verification) | Orchestrator | none |

**Orchestrator responsibilities per Wave-1 agent:** give the agent its full task text verbatim plus this preamble: *"You are implementing one task of a plan in a .NET 10 + MSTest repo. Only create/modify the files listed in your task. Follow the steps exactly, run the verification commands, and commit with the given message. Do not touch any other files."* After each agent finishes: review the diff, merge its worktree branch into `feature/AI-classifier` (`git merge --no-ff <agent-branch>` — file-disjoint, so no conflicts), and run `dotnet test` on the merged result before dispatching Wave 2.

---

## File Map

| File | Task | Responsibility |
|------|------|----------------|
| `Api/Models/EventVerdict.cs` | 1 | Verdict record + `ClassificationSchema` (enums, version) |
| `Api/Models/ClassificationInput.cs` | 1 | Compact per-event payload for triggers + prompt |
| `Api/Services/IEventClassifier.cs`, `IVerdictStore.cs`, `IBlobStorage.cs` | 1 | Contracts |
| `Api/Data/known-teams.json` | 1 (placeholder), 5 (real) | Canonical team names for trigger 1 |
| `Api/Api.csproj` | 1 | `Azure.Storage.Blobs` package + content copy |
| `Api/Services/GeminiEventClassifier.cs` + tests | 2 | Gemini REST call, schema, parsing |
| `Api/Services/BlobVerdictStore.cs`, `AzureBlobStorage.cs` + tests | 3 | Persistent verdict cache, pruning |
| `Api/Services/ClassificationTriggers.cs`, `KnownTeams.cs` + tests | 4 | The four triggers + team-set loader |
| `scripts/export-known-teams.mjs` | 5 | Regenerates `known-teams.json` from `teams.js` |
| `Api/Models/ParsedEvent.cs`, `TicketmasterClient.cs`, `EventFilter.cs`, `Program.cs` + tests | 6 | Pipeline integration |
| `Api.Tests/GeminiLiveIntegrationTests.cs`, `CLAUDE.md`, `DEPLOYMENT.md` | 7 | Env-gated live test + docs |

---

### Task 1: Contracts, package, and data placeholder (Wave 0 — orchestrator)

**Files:**
- Create: `Api/Models/EventVerdict.cs`
- Create: `Api/Models/ClassificationInput.cs`
- Create: `Api/Services/IEventClassifier.cs`
- Create: `Api/Services/IVerdictStore.cs`
- Create: `Api/Services/IBlobStorage.cs`
- Create: `Api/Data/known-teams.json`
- Modify: `Api/Api.csproj`

- [ ] **Step 1: Create `Api/Models/EventVerdict.cs`**

```csharp
namespace Api.Models;

/// <summary>
/// The LLM's ruling on one Ticketmaster event. Stored verdicts always win
/// over the rules pipeline; only LLM-classified events are ever stored.
/// </summary>
public record EventVerdict(
    bool IsSpectatorGame,
    string Sport,
    string League,      // from ClassificationSchema.Leagues; "Unknown" is mapped to "Other" at display time
    string HomeTeam,
    string AwayTeam,
    string Reason,      // one short sentence, logged when an event is dropped
    string EventDate,   // event's local date (yyyy-MM-dd), used for pruning
    int SchemaVersion,  // verdicts from older schema versions are re-classified
    DateTime ClassifiedAt);

/// <summary>
/// Closed vocabularies for the classifier's structured output. Bump Version
/// whenever the prompt, enums, or verdict semantics change — stored verdicts
/// with an older version are lazily re-classified.
/// </summary>
public static class ClassificationSchema
{
    public const int Version = 1;
    public const string UnknownLeague = "Unknown";

    public static readonly string[] Sports =
    [
        "Basketball", "Football", "Baseball", "Softball", "Hockey",
        "Soccer", "Volleyball", "Lacrosse", "Other",
    ];

    // Every league the pipeline or the client data layer knows, plus Unknown.
    public static readonly string[] Leagues =
    [
        "NBA", "WNBA", "NHL", "NFL", "MLB", "MLS", "NWSL", "PLL", "IAL",
        "USL", "Liga MX", "World Cup", "International", "AHL", "ECHL",
        "LOVB", "PWHL",
        "NCAAM", "NCAAW", "NCAAF", "NCAA Baseball", "NCAA Softball",
        "NCAA WVB", "NCAA MVB", "NCAA VB",
        "Women's Soccer", "Men's Soccer", "NCAA Soccer", "NCAA",
        "Triple-A", "Double-A", "High-A", "Single-A",
        "Other", UnknownLeague,
    ];
}
```

- [ ] **Step 2: Create `Api/Models/ClassificationInput.cs`**

```csharp
namespace Api.Models;

/// <summary>
/// Everything the trigger evaluator and the classifier prompt need about one
/// event — raw Ticketmaster fields plus the deterministic rules draft.
/// </summary>
public record ClassificationInput(
    string EventId,
    string EventName,
    string RawHomeTeam,   // first attraction name, as extracted
    string RawAwayTeam,   // second attraction / title-parsed, may be ""
    string RawSport,      // Ticketmaster genre
    string RawLeague,     // Ticketmaster subGenre
    string DraftHomeTeam, // post-NormalizeTeamName
    string DraftAwayTeam,
    string DraftSport,    // EventNormalizer output
    string DraftLeague,
    string Venue,
    string City,
    string State,
    string LocalDate);
```

- [ ] **Step 3: Create `Api/Services/IEventClassifier.cs`**

```csharp
using Api.Models;

namespace Api.Services;

public interface IEventClassifier
{
    /// <summary>False when no API key is configured — the verdict layer is then fully inert.</summary>
    bool IsEnabled { get; }

    /// <summary>Returns null on any failure (disabled, timeout, HTTP error, unparseable response).</summary>
    Task<EventVerdict?> ClassifyAsync(ClassificationInput input, CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Create `Api/Services/IVerdictStore.cs`**

```csharp
using Api.Models;

namespace Api.Services;

public interface IVerdictStore
{
    /// <summary>Hydrates from persistence once per app lifetime. Safe to call repeatedly.</summary>
    Task EnsureLoadedAsync(CancellationToken cancellationToken);

    bool TryGet(string eventId, out EventVerdict verdict);

    void Add(string eventId, EventVerdict verdict);

    /// <summary>Persists if anything was added since the last save. Failures are logged, never thrown.</summary>
    Task SaveAsync(CancellationToken cancellationToken);
}
```

- [ ] **Step 5: Create `Api/Services/IBlobStorage.cs`**

```csharp
namespace Api.Services;

/// <summary>Thin blob wrapper so the verdict store is unit-testable without Azure.</summary>
public interface IBlobStorage
{
    Task<string?> DownloadIfExistsAsync(CancellationToken cancellationToken);
    Task UploadAsync(string content, CancellationToken cancellationToken);
}
```

- [ ] **Step 6: Create placeholder `Api/Data/known-teams.json`** (Task 5 regenerates it)

```json
[]
```

- [ ] **Step 7: Modify `Api/Api.csproj`** — add the blob package and make the data file ship with the build output:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.3" />
    <PackageReference Include="Azure.Storage.Blobs" Version="12.24.0" />
  </ItemGroup>

  <ItemGroup>
    <Content Update="Data\known-teams.json" CopyToOutputDirectory="PreserveNewest" />
  </ItemGroup>

</Project>
```

- [ ] **Step 8: Build and verify the data file copies**

Run: `dotnet build Api/Api.csproj`
Expected: Build succeeded; `Api/bin/Debug/net10.0/Data/known-teams.json` exists.
Troubleshooting: if the file is missing from `bin`, replace the `Content Update` line with `<None Remove="Data\known-teams.json" /><Content Include="Data\known-teams.json" CopyToOutputDirectory="PreserveNewest" />`.

- [ ] **Step 9: Run the existing test suite**

Run: `dotnet test`
Expected: all existing tests PASS (nothing behavioral changed).

- [ ] **Step 10: Commit**

```bash
git add Api/Models/EventVerdict.cs Api/Models/ClassificationInput.cs Api/Services/IEventClassifier.cs Api/Services/IVerdictStore.cs Api/Services/IBlobStorage.cs Api/Data/known-teams.json Api/Api.csproj
git commit -m "Add classification contracts, schema enums, and blob package"
```

---

### Task 2: GeminiEventClassifier (Wave 1 — Haiku agent A)

**Files:**
- Create: `Api/Services/GeminiEventClassifier.cs`
- Test: `Api.Tests/GeminiEventClassifierTests.cs`

- [ ] **Step 1: Write the failing tests** — create `Api.Tests/GeminiEventClassifierTests.cs`:

```csharp
using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class GeminiEventClassifierTests
{
    private sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = [];
        public string? LastRequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Requests.Add(request);
            LastRequestBody = request.Content == null ? null : await request.Content.ReadAsStringAsync(ct);
            return responder(request);
        }
    }

    private static IConfiguration Config(string? apiKey = "test-key") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Gemini:ApiKey"] = apiKey,
        }).Build();

    private static ClassificationInput MakeInput(
        string name = "Utah Jazz Block Party",
        string draftLeague = "NBA") =>
        new(
            EventId: "evt-1", EventName: name,
            RawHomeTeam: "Utah Jazz", RawAwayTeam: "",
            RawSport: "Basketball", RawLeague: "NBA",
            DraftHomeTeam: "Utah Jazz", DraftAwayTeam: "",
            DraftSport: "Basketball", DraftLeague: draftLeague,
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-01");

    private static string GeminiResponse(object verdict) => JsonSerializer.Serialize(new
    {
        candidates = new[] { new { content = new { parts = new[] { new { text = JsonSerializer.Serialize(verdict) } } } } },
        usageMetadata = new { promptTokenCount = 850, candidatesTokenCount = 90 },
    });

    private static HttpResponseMessage Ok(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    private static GeminiEventClassifier Make(FakeHttpMessageHandler handler, string? apiKey = "test-key") =>
        new(new HttpClient(handler), Config(apiKey));

    [TestMethod]
    public async Task Disabled_WithoutKey_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("{}"));
        var classifier = Make(handler, apiKey: null);

        Assert.IsFalse(classifier.IsEnabled);
        Assert.IsNull(await classifier.ClassifyAsync(MakeInput(), CancellationToken.None));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Success_ReturnsVerdictWithMetadata()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = false,
            sport = "Basketball",
            league = "NBA",
            home_team = "Utah Jazz",
            away_team = "",
            reason = "Fan event, not a game.",
        })));
        var verdict = await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        Assert.IsNotNull(verdict);
        Assert.IsFalse(verdict.IsSpectatorGame);
        Assert.AreEqual("NBA", verdict.League);
        Assert.AreEqual("2026-08-01", verdict.EventDate);
        Assert.AreEqual(ClassificationSchema.Version, verdict.SchemaVersion);
    }

    [TestMethod]
    public async Task Request_CarriesSchemaKeyAndEventData()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = true, sport = "Basketball", league = "NBA",
            home_team = "Utah Jazz", away_team = "", reason = "ok",
        })));
        await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        var request = handler.Requests.Single();
        Assert.IsTrue(request.RequestUri!.ToString().Contains("gemini-2.5-flash-lite"));
        Assert.AreEqual("test-key", request.Headers.GetValues("x-goog-api-key").Single());
        StringAssert.Contains(handler.LastRequestBody, "\"enum\"");
        StringAssert.Contains(handler.LastRequestBody, "Utah Jazz Block Party");
        StringAssert.Contains(handler.LastRequestBody, "\"responseMimeType\":\"application/json\"");
    }

    [TestMethod]
    public async Task Non200_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.TooManyRequests));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task EmptyCandidates_SafetyBlock_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("""{"candidates":[]}"""));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task MalformedInnerJson_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(JsonSerializer.Serialize(new
        {
            candidates = new[] { new { content = new { parts = new[] { new { text = "not json {" } } } } },
        })));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task LeagueOutsideEnum_MapsToUnknown()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = true, sport = "Quidditch", league = "XFL",
            home_team = "A", away_team = "B", reason = "r",
        })));
        var verdict = await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        Assert.IsNotNull(verdict);
        Assert.AreEqual(ClassificationSchema.UnknownLeague, verdict.League);
        Assert.AreEqual("Other", verdict.Sport);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test --filter GeminiEventClassifierTests`
Expected: FAIL — `GeminiEventClassifier` does not exist.

- [ ] **Step 3: Implement `Api/Services/GeminiEventClassifier.cs`**

```csharp
using System.Text;
using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Classifies borderline Ticketmaster events with the Gemini API using a
/// closed-enum structured-output schema. Returns null on any failure so the
/// pipeline falls back to the deterministic rules.
/// </summary>
public class GeminiEventClassifier : IEventClassifier
{
    private const string SystemInstruction = """
        You classify Ticketmaster listings for a sports-discovery app that only
        shows real, ticketed spectator games.

        Set is_spectator_game=true ONLY for a competitive spectator sporting
        event (team vs team, or a competitive match users attend to watch).
        Set it false for: fan fests, watch/viewing parties, block parties,
        draft parties, "An Evening With..." shows, camps, clinics, tryouts,
        autograph or meet-and-greet sessions, parking or hospitality passes,
        season-ticket packages, concerts, and combat sports (boxing, MMA,
        wrestling).

        Use ONLY the data provided. Never invent team names: extract them from
        the attraction names or the event title, cleaned to their canonical
        short form (e.g. "Utah Utes", not "University of Utah Utes Men's
        Basketball"). If there is no opposing team, set away_team to "".

        Choose league strictly from the allowed list. If the true league is
        not in the list or you are not confident, use "Unknown" - never guess.
        The rules draft is a hint from a rule engine; correct it when the data
        disagrees with it.

        Set reason to one short sentence justifying the verdict.
        """;

    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private readonly string _model;

    public GeminiEventClassifier(HttpClient http, IConfiguration config)
    {
        _http = http;
        _http.Timeout = TimeSpan.FromSeconds(10);
        _apiKey = config["Gemini:ApiKey"];
        _model = config["Classifier:Model"] ?? "gemini-2.5-flash-lite";
    }

    public bool IsEnabled => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<EventVerdict?> ClassifyAsync(ClassificationInput input, CancellationToken cancellationToken)
    {
        if (!IsEnabled) return null;
        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent";
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("x-goog-api-key", _apiKey);
            request.Content = new StringContent(BuildRequestJson(input), Encoding.UTF8, "application/json");

            using var response = await _http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Gemini classify {input.EventId}: HTTP {(int)response.StatusCode}");
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            return ParseVerdict(json, input);
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException)
        {
            Console.WriteLine($"Gemini classify {input.EventId} failed: {e.Message}");
            return null;
        }
    }

    public static string BuildRequestJson(ClassificationInput input)
    {
        var payload = new
        {
            systemInstruction = new { parts = new[] { new { text = SystemInstruction } } },
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = BuildEventText(input) } } },
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = new
                {
                    type = "OBJECT",
                    properties = new Dictionary<string, object>
                    {
                        ["is_spectator_game"] = new { type = "BOOLEAN" },
                        ["sport"] = new { type = "STRING", @enum = ClassificationSchema.Sports },
                        ["league"] = new { type = "STRING", @enum = ClassificationSchema.Leagues },
                        ["home_team"] = new { type = "STRING" },
                        ["away_team"] = new { type = "STRING" },
                        ["reason"] = new { type = "STRING" },
                    },
                    required = new[] { "is_spectator_game", "sport", "league", "home_team", "away_team", "reason" },
                },
                maxOutputTokens = 500,
                temperature = 0,
            },
        };
        return JsonSerializer.Serialize(payload);
    }

    private static string BuildEventText(ClassificationInput input) =>
        $"""
        Event name: {input.EventName}
        Attractions: {input.RawHomeTeam} | {input.RawAwayTeam}
        Ticketmaster genre: {input.RawSport} / subGenre: {input.RawLeague}
        Venue: {input.Venue}, {input.City}, {input.State}
        Local date: {input.LocalDate}
        Rules draft: sport={input.DraftSport}, league={input.DraftLeague}, home={input.DraftHomeTeam}, away={input.DraftAwayTeam}
        """;

    public static EventVerdict? ParseVerdict(JsonElement response, ClassificationInput input)
    {
        if (!response.TryGetProperty("candidates", out var candidates) ||
            candidates.ValueKind != JsonValueKind.Array ||
            candidates.GetArrayLength() == 0)
            return null; // safety block or empty response

        var first = candidates[0];
        if (!first.TryGetProperty("content", out var content) ||
            !content.TryGetProperty("parts", out var parts) ||
            parts.ValueKind != JsonValueKind.Array ||
            parts.GetArrayLength() == 0 ||
            !parts[0].TryGetProperty("text", out var textProp))
            return null;

        JsonElement v;
        try { v = JsonSerializer.Deserialize<JsonElement>(textProp.GetString() ?? ""); }
        catch (JsonException) { return null; }

        if (v.ValueKind != JsonValueKind.Object ||
            !v.TryGetProperty("is_spectator_game", out var isGameProp) ||
            (isGameProp.ValueKind != JsonValueKind.True && isGameProp.ValueKind != JsonValueKind.False))
            return null;

        string GetStr(string name) =>
            v.TryGetProperty(name, out var p) && p.ValueKind == JsonValueKind.String ? p.GetString()! : "";

        // Belt-and-suspenders: the schema constrains these, but never trust output blindly.
        var sport = ClassificationSchema.Sports.Contains(GetStr("sport")) ? GetStr("sport") : "Other";
        var league = ClassificationSchema.Leagues.Contains(GetStr("league"))
            ? GetStr("league")
            : ClassificationSchema.UnknownLeague;

        LogUsage(response, input.EventId);

        return new EventVerdict(
            IsSpectatorGame: isGameProp.GetBoolean(),
            Sport: sport,
            League: league,
            HomeTeam: GetStr("home_team"),
            AwayTeam: GetStr("away_team"),
            Reason: GetStr("reason"),
            EventDate: input.LocalDate,
            SchemaVersion: ClassificationSchema.Version,
            ClassifiedAt: DateTime.UtcNow);
    }

    private static void LogUsage(JsonElement response, string eventId)
    {
        if (!response.TryGetProperty("usageMetadata", out var usage)) return;
        var prompt = usage.TryGetProperty("promptTokenCount", out var p) ? p.GetInt32() : 0;
        var output = usage.TryGetProperty("candidatesTokenCount", out var c) ? c.GetInt32() : 0;
        Console.WriteLine($"Gemini classify {eventId}: {prompt} in / {output} out tokens");
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test --filter GeminiEventClassifierTests`
Expected: 7 PASS.

- [ ] **Step 5: Commit**

```bash
git add Api/Services/GeminiEventClassifier.cs Api.Tests/GeminiEventClassifierTests.cs
git commit -m "Add Gemini classifier with structured-output schema"
```

---

### Task 3: BlobVerdictStore + AzureBlobStorage (Wave 1 — Haiku agent B)

**Files:**
- Create: `Api/Services/BlobVerdictStore.cs`
- Create: `Api/Services/AzureBlobStorage.cs`
- Test: `Api.Tests/BlobVerdictStoreTests.cs`

- [ ] **Step 1: Write the failing tests** — create `Api.Tests/BlobVerdictStoreTests.cs`:

```csharp
using System.Text.Json;
using Api.Models;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class BlobVerdictStoreTests
{
    private sealed class FakeBlobStorage : IBlobStorage
    {
        public string? Content;
        public int Downloads;
        public int Uploads;
        public bool ThrowOnDownload;
        public bool ThrowOnUpload;

        public Task<string?> DownloadIfExistsAsync(CancellationToken ct)
        {
            Downloads++;
            if (ThrowOnDownload) throw new InvalidOperationException("download boom");
            return Task.FromResult(Content);
        }

        public Task UploadAsync(string content, CancellationToken ct)
        {
            Uploads++;
            if (ThrowOnUpload) throw new InvalidOperationException("upload boom");
            Content = content;
            return Task.CompletedTask;
        }
    }

    private static EventVerdict MakeVerdict(
        string? eventDate = null,
        int schemaVersion = ClassificationSchema.Version) =>
        new(
            IsSpectatorGame: true, Sport: "Hockey", League: "ECHL",
            HomeTeam: "Utah Grizzlies", AwayTeam: "Idaho Steelheads",
            Reason: "Real ECHL game.",
            EventDate: eventDate ?? DateTime.UtcNow.Date.AddDays(30).ToString("yyyy-MM-dd"),
            SchemaVersion: schemaVersion,
            ClassifiedAt: DateTime.UtcNow);

    [TestMethod]
    public async Task SaveThenLoad_RoundTrips()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None);

        var reloaded = new BlobVerdictStore(blob);
        await reloaded.EnsureLoadedAsync(CancellationToken.None);
        Assert.IsTrue(reloaded.TryGet("e1", out var verdict));
        Assert.AreEqual("ECHL", verdict.League);
    }

    [TestMethod]
    public async Task EnsureLoaded_OnlyDownloadsOnce()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        await store.EnsureLoadedAsync(CancellationToken.None);
        Assert.AreEqual(1, blob.Downloads);
    }

    [TestMethod]
    public async Task OldSchemaVersion_TreatedAsMissing()
    {
        var blob = new FakeBlobStorage
        {
            Content = JsonSerializer.Serialize(new Dictionary<string, EventVerdict>
            {
                ["old"] = MakeVerdict(schemaVersion: ClassificationSchema.Version - 1),
            }),
        };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        Assert.IsFalse(store.TryGet("old", out _));
    }

    [TestMethod]
    public async Task Save_SkippedWhenNothingAdded()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        await store.SaveAsync(CancellationToken.None);
        Assert.AreEqual(0, blob.Uploads);
    }

    [TestMethod]
    public async Task Save_PrunesEventsMoreThanSevenDaysPast()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("stale", MakeVerdict(eventDate: DateTime.UtcNow.Date.AddDays(-8).ToString("yyyy-MM-dd")));
        store.Add("recent", MakeVerdict(eventDate: DateTime.UtcNow.Date.AddDays(-1).ToString("yyyy-MM-dd")));
        store.Add("future", MakeVerdict());
        await store.SaveAsync(CancellationToken.None);

        Assert.IsFalse(store.TryGet("stale", out _));
        Assert.IsTrue(store.TryGet("recent", out _));
        Assert.IsTrue(store.TryGet("future", out _));
        StringAssert.Contains(blob.Content, "recent");
    }

    [TestMethod]
    public async Task DownloadFailure_StartsEmptyAndStillWorks()
    {
        var blob = new FakeBlobStorage { ThrowOnDownload = true };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        Assert.IsTrue(store.TryGet("e1", out _));
    }

    [TestMethod]
    public async Task UploadFailure_KeepsVerdictsAndRetriesNextSave()
    {
        var blob = new FakeBlobStorage { ThrowOnUpload = true };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None); // fails, logged

        blob.ThrowOnUpload = false;
        await store.SaveAsync(CancellationToken.None); // dirty flag still set -> retries
        Assert.AreEqual(2, blob.Uploads);
        StringAssert.Contains(blob.Content, "e1");
    }

    [TestMethod]
    public async Task NullStorage_MemoryOnlyMode_Works()
    {
        var store = new BlobVerdictStore(null);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None); // no-op, no throw
        Assert.IsTrue(store.TryGet("e1", out _));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test --filter BlobVerdictStoreTests`
Expected: FAIL — `BlobVerdictStore` does not exist.

- [ ] **Step 3: Implement `Api/Services/BlobVerdictStore.cs`**

```csharp
using System.Collections.Concurrent;
using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// In-memory verdict cache backed by an optional blob. Null storage means
/// memory-only mode (classifier enabled but no connection string configured).
/// Only LLM-classified events are ever stored — rules-confident events never
/// enter the store.
/// </summary>
public class BlobVerdictStore(IBlobStorage? storage) : IVerdictStore
{
    private readonly ConcurrentDictionary<string, EventVerdict> _verdicts = new();
    private readonly SemaphoreSlim _loadLock = new(1, 1);
    private volatile bool _loaded;
    private volatile bool _dirty;

    public async Task EnsureLoadedAsync(CancellationToken cancellationToken)
    {
        if (_loaded) return;
        if (storage == null) { _loaded = true; return; }

        await _loadLock.WaitAsync(cancellationToken);
        try
        {
            if (_loaded) return;
            var json = await storage.DownloadIfExistsAsync(cancellationToken);
            if (json != null)
            {
                var map = JsonSerializer.Deserialize<Dictionary<string, EventVerdict>>(json) ?? [];
                foreach (var (id, verdict) in map)
                    if (verdict.SchemaVersion == ClassificationSchema.Version)
                        _verdicts[id] = verdict;
                Console.WriteLine($"Verdict store loaded: {_verdicts.Count} entries");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Verdict store load failed ({e.Message}) - starting empty");
        }
        finally
        {
            _loaded = true;
            _loadLock.Release();
        }
    }

    public bool TryGet(string eventId, out EventVerdict verdict) =>
        _verdicts.TryGetValue(eventId, out verdict!);

    public void Add(string eventId, EventVerdict verdict)
    {
        _verdicts[eventId] = verdict;
        _dirty = true;
    }

    public async Task SaveAsync(CancellationToken cancellationToken)
    {
        if (!_dirty || storage == null) return;
        try
        {
            Prune();
            var json = JsonSerializer.Serialize(_verdicts.ToDictionary(kv => kv.Key, kv => kv.Value));
            await storage.UploadAsync(json, cancellationToken);
            _dirty = false;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Verdict store save failed ({e.Message}) - will retry on next save");
        }
    }

    // Verdicts for events safely in the past are dead weight; drop them so the
    // blob stays bounded. Unparseable dates fall back to a 90-day age limit.
    private void Prune()
    {
        var dateCutoff = DateTime.UtcNow.Date.AddDays(-7);
        var ageCutoff = DateTime.UtcNow.AddDays(-90);
        foreach (var (id, v) in _verdicts)
        {
            var expired = DateTime.TryParse(v.EventDate, out var d)
                ? d < dateCutoff
                : v.ClassifiedAt < ageCutoff;
            if (expired) _verdicts.TryRemove(id, out _);
        }
    }
}
```

- [ ] **Step 4: Implement `Api/Services/AzureBlobStorage.cs`** (thin untested wrapper — all logic lives in the store):

```csharp
using Azure.Storage.Blobs;

namespace Api.Services;

/// <summary>Blob-backed IBlobStorage: container "verdicts", blob "verdicts.json".</summary>
public class AzureBlobStorage(string connectionString) : IBlobStorage
{
    private readonly BlobContainerClient _container = new(connectionString, "verdicts");

    public async Task<string?> DownloadIfExistsAsync(CancellationToken cancellationToken)
    {
        var blob = _container.GetBlobClient("verdicts.json");
        if (!await blob.ExistsAsync(cancellationToken))
            return null;
        var result = await blob.DownloadContentAsync(cancellationToken);
        return result.Value.Content.ToString();
    }

    public async Task UploadAsync(string content, CancellationToken cancellationToken)
    {
        await _container.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        await _container.GetBlobClient("verdicts.json")
            .UploadAsync(BinaryData.FromString(content), overwrite: true, cancellationToken);
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `dotnet test --filter BlobVerdictStoreTests`
Expected: 8 PASS.

- [ ] **Step 6: Commit**

```bash
git add Api/Services/BlobVerdictStore.cs Api/Services/AzureBlobStorage.cs Api.Tests/BlobVerdictStoreTests.cs
git commit -m "Add persistent verdict store with pruning and memory-only mode"
```

---

### Task 4: ClassificationTriggers + KnownTeams (Wave 1 — Haiku agent C)

**Files:**
- Create: `Api/Services/ClassificationTriggers.cs`
- Create: `Api/Services/KnownTeams.cs`
- Test: `Api.Tests/ClassificationTriggersTests.cs`

- [ ] **Step 1: Write the failing tests** — create `Api.Tests/ClassificationTriggersTests.cs`:

```csharp
using Api.Models;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class ClassificationTriggersTests
{
    private static readonly IReadOnlySet<string> Teams =
        new HashSet<string>(["Utah Jazz", "Denver Nuggets"], StringComparer.OrdinalIgnoreCase);

    private static ClassificationInput MakeInput(
        string name = "Utah Jazz vs. Denver Nuggets",
        string home = "Utah Jazz",
        string away = "Denver Nuggets",
        string sport = "Basketball",
        string league = "NBA") =>
        new(
            EventId: "evt-1", EventName: name,
            RawHomeTeam: home, RawAwayTeam: away,
            RawSport: sport, RawLeague: league,
            DraftHomeTeam: home, DraftAwayTeam: away,
            DraftSport: sport, DraftLeague: league,
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-01");

    [TestMethod]
    public void CleanMajorLeagueMatchup_FiresNothing()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void UnknownHomeTeam_FiresUnknownTeam()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Springville Flyers vs. Denver Nuggets", home: "Springville Flyers"), Teams);
        CollectionAssert.Contains(fired.ToList(), "unknown-team");
    }

    [TestMethod]
    public void TeamMatch_IsCaseInsensitive()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(home: "UTAH JAZZ"), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void EmptyAwayTeam_WithMatchupTitle_DoesNotFireUnknownTeamOrNoMatchup()
    {
        // Away extracted as empty but the title still reads like a matchup.
        var fired = ClassificationTriggers.Evaluate(MakeInput(away: ""), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void OtherLeague_FiresUnclassified()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(league: "Other"), Teams);
        CollectionAssert.Contains(fired.ToList(), "unclassified");
    }

    [TestMethod]
    public void OtherLeague_NonMatchupTitle_AlsoFiresWouldBeDropped()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Monster Truck Showdown", home: "Monster Trucks", away: "", league: "Other", sport: "Other"),
            Teams).ToList();
        CollectionAssert.Contains(fired, "unclassified");
        CollectionAssert.Contains(fired, "would-be-dropped");
    }

    [TestMethod]
    public void BlockParty_KnownTeamRealLeagueNoMatchup_FiresNoMatchupPass()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Utah Jazz Block Party", away: ""), Teams).ToList();
        CollectionAssert.Contains(fired, "no-matchup-pass");
        CollectionAssert.DoesNotContain(fired, "unknown-team");
    }

    [TestMethod]
    public void SchemaLeagues_CoverEverythingTheNormalizerCanProduce()
    {
        string[] normalizerLeagues =
        [
            "NBA", "WNBA", "NHL", "NFL", "MLB", "MLS", "NWSL", "PLL", "IAL",
            "USL", "Liga MX", "World Cup", "International", "AHL", "ECHL", "LOVB",
            "NCAAM", "NCAAW", "NCAAF", "NCAA Baseball", "NCAA Softball",
            "NCAA WVB", "NCAA MVB", "NCAA VB",
            "Women's Soccer", "Men's Soccer", "NCAA Soccer", "NCAA",
            "Triple-A", "Double-A", "High-A", "Single-A", "Other",
        ];
        foreach (var league in normalizerLeagues)
            Assert.IsTrue(ClassificationSchema.Leagues.Contains(league), $"schema missing league: {league}");
    }

    [TestMethod]
    public void KnownTeams_LoadsWithoutThrowing()
    {
        // Placeholder or generated file — either way loading must not throw.
        Assert.IsNotNull(KnownTeams.Names);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test --filter ClassificationTriggersTests`
Expected: FAIL — `ClassificationTriggers` does not exist.

- [ ] **Step 3: Implement `Api/Services/ClassificationTriggers.cs`**

```csharp
using Api.Models;

namespace Api.Services;

/// <summary>
/// Decides whether an event needs an LLM verdict. Triggers gate verdict
/// creation only — a stored verdict is always applied regardless of triggers.
/// All checks are free (no I/O).
/// </summary>
public static class ClassificationTriggers
{
    public static IReadOnlyList<string> Evaluate(ClassificationInput input, IReadOnlySet<string> knownTeams)
    {
        var fired = new List<string>();

        // 1. A non-empty team name the client data layer doesn't know —
        //    mangled extraction or a genuinely unknown team (the no-logo cases).
        var homeUnknown = !string.IsNullOrWhiteSpace(input.DraftHomeTeam) && !knownTeams.Contains(input.DraftHomeTeam);
        var awayUnknown = !string.IsNullOrWhiteSpace(input.DraftAwayTeam) && !knownTeams.Contains(input.DraftAwayTeam);
        if (homeUnknown || awayUnknown)
            fired.Add("unknown-team");

        var leagueUnresolved = IsOtherOrEmpty(input.DraftLeague);
        var looksLikeMatchup = MatchupTitleParser.LooksLikeMatchup(input.EventName);

        // 2. The rules admit they can't classify it.
        if (leagueUnresolved || IsOtherOrEmpty(input.DraftSport))
            fired.Add("unclassified");

        // 3. No recognized league and no matchup-shaped title — the shape the
        //    heuristic keep-rules exist to drop.
        if (leagueUnresolved && !looksLikeMatchup)
            fired.Add("would-be-dropped");

        // 4. Passed on league alone: single attraction wearing a real league
        //    tag ("Utah Jazz Block Party" tagged NBA).
        if (!leagueUnresolved && string.IsNullOrWhiteSpace(input.DraftAwayTeam) && !looksLikeMatchup)
            fired.Add("no-matchup-pass");

        return fired;
    }

    private static bool IsOtherOrEmpty(string value) =>
        string.IsNullOrWhiteSpace(value) || value.Equals("Other", StringComparison.OrdinalIgnoreCase);
}
```

- [ ] **Step 4: Implement `Api/Services/KnownTeams.cs`**

```csharp
using System.Text.Json;

namespace Api.Services;

/// <summary>
/// Canonical team names exported from the client data layer
/// (scripts/export-known-teams.mjs -> Api/Data/known-teams.json).
/// A missing/broken file degrades to an empty set: the unknown-team trigger
/// then fires more often, which costs quota but never breaks the feed.
/// </summary>
public static class KnownTeams
{
    private static readonly Lazy<IReadOnlySet<string>> Loaded = new(Load);

    public static IReadOnlySet<string> Names => Loaded.Value;

    private static IReadOnlySet<string> Load()
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Data", "known-teams.json");
            var names = JsonSerializer.Deserialize<string[]>(File.ReadAllText(path)) ?? [];
            return new HashSet<string>(names, StringComparer.OrdinalIgnoreCase);
        }
        catch (Exception e)
        {
            Console.WriteLine($"known-teams.json load failed ({e.Message}) - unknown-team trigger will fire for every team");
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `dotnet test --filter ClassificationTriggersTests`
Expected: 9 PASS.

- [ ] **Step 6: Commit**

```bash
git add Api/Services/ClassificationTriggers.cs Api/Services/KnownTeams.cs Api.Tests/ClassificationTriggersTests.cs
git commit -m "Add the four classification triggers and known-team loader"
```

---

### Task 5: Known-teams export script + generated data (Wave 1 — Haiku agent D)

**Files:**
- Create: `scripts/export-known-teams.mjs`
- Modify: `Api/Data/known-teams.json` (regenerated by the script)

- [ ] **Step 1: Create `scripts/export-known-teams.mjs`**

```js
// Exports the canonical team names known to the client data layer into
// Api/Data/known-teams.json so the API's unknown-team trigger can use them.
// Rerun whenever client/src/data/teams.js changes:
//   cd scripts && node export-known-teams.mjs
// Requires Node >= 20.10 (teams.js uses JSON import attributes).
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import TEAMS, {
  NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AAA, AA, PLL, LOVB_TEAMS,
} from '../client/src/data/teams.js'

// Merge the named league maps and the default TEAMS map so nothing is missed.
const merged = Object.assign(
  {}, NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AAA, AA, PLL, LOVB_TEAMS, TEAMS,
)
const names = Object.keys(merged).sort((a, b) => a.localeCompare(b))

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'Api', 'Data', 'known-teams.json')
writeFileSync(outPath, JSON.stringify(names, null, 2) + '\n')
console.log(`Wrote ${names.length} team names to ${outPath}`)
```

- [ ] **Step 2: Run the script**

Run: `cd scripts && node export-known-teams.mjs`
Expected: `Wrote <several hundred> team names to ...Api/Data/known-teams.json`

- [ ] **Step 3: Verify the output**

Run (from repo root): `node -e "const t=require('./Api/Data/known-teams.json'); console.log(t.length, t.includes('Utah Jazz'), t.includes('Utah Utes'))"`
Expected: a count > 300 and `true true`. If `Utah Utes` is `false`, check which named export holds college teams in `teams.js` and add it to the merge list.

- [ ] **Step 4: Commit**

```bash
git add scripts/export-known-teams.mjs Api/Data/known-teams.json
git commit -m "Add known-teams export script and generated team list"
```

---

### Task 6: Pipeline integration (Wave 2 — orchestrator, main model)

**Files:**
- Create: `Api/Models/ParsedEvent.cs`
- Modify: `Api/Services/EventFilter.cs` (add `IsHardDropped`, reuse in `IsSpectatorEvent`)
- Modify: `Api/Services/TicketmasterClient.cs` (split parse, add verdict application)
- Modify: `Api/Program.cs` (DI registrations)
- Test: `Api.Tests/PipelineIntegrationTests.cs`

- [ ] **Step 1: Create `Api/Models/ParsedEvent.cs`**

```csharp
namespace Api.Models;

/// <summary>A parsed event that survived the hard rules, before verdict application.</summary>
public record ParsedEvent(SportEvent Draft, ClassificationInput Input, string StatusCode);
```

- [ ] **Step 2: Modify `Api/Services/EventFilter.cs`** — add the hard-rule gate above `IsSpectatorEvent` and make `IsSpectatorEvent` reuse it (behavior is identical; existing tests must stay green):

```csharp
    /// <summary>
    /// Deterministic drops that apply before any LLM verdict: cancelled or
    /// postponed status, past events, and the ancillary/junk name denylist.
    /// </summary>
    public static bool IsHardDropped(SportEvent evt, string statusCode) =>
        IsCancelledOrPostponed(statusCode)
        || evt.DateTime < DateTime.UtcNow
        || IsOnDenylist(evt.Name);
```

and replace rules 1–3 inside `IsSpectatorEvent` with:

```csharp
        // Rules 1-3: status, past-date, and denylist (shared with the LLM pipeline)
        if (IsHardDropped(evt, statusCode))
            return false;
```

- [ ] **Step 3: Run existing tests**

Run: `dotnet test --filter EventFilterTests`
Expected: all PASS (pure refactor).

- [ ] **Step 4: Write the failing integration tests** — create `Api.Tests/PipelineIntegrationTests.cs`:

```csharp
using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class PipelineIntegrationTests
{
    // ---------- Fakes ----------

    private sealed class FakeClassifier : IEventClassifier
    {
        public bool Enabled { get; set; } = true;
        public Dictionary<string, EventVerdict> Verdicts { get; } = [];
        public List<string> ClassifiedIds { get; } = [];

        public bool IsEnabled => Enabled;

        public Task<EventVerdict?> ClassifyAsync(ClassificationInput input, CancellationToken ct)
        {
            lock (ClassifiedIds) ClassifiedIds.Add(input.EventId); // classify calls run in parallel
            return Task.FromResult(Verdicts.TryGetValue(input.EventId, out var v) ? v : null);
        }
    }

    private sealed class FakeTicketmasterHandler(string json) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            });
    }

    // ---------- Fixture data ----------

    private static string TmEvent(string id, string name, string[] attractions, string genre, string subGenre)
    {
        var attractionJson = string.Join(",", attractions.Select(a => $$"""{"name":"{{a}}","classifications":[]}"""));
        var date = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ");
        return $$"""
        {
          "id": "{{id}}",
          "name": "{{name}}",
          "url": "https://example.com/t",
          "dates": { "start": { "localDate": "2026-08-06", "localTime": "19:00:00", "dateTime": "{{date}}" }, "status": { "code": "onsale" } },
          "classifications": [{ "genre": { "name": "{{genre}}" }, "subGenre": { "name": "{{subGenre}}" } }],
          "_embedded": {
            "attractions": [{{attractionJson}}],
            "venues": [{ "name": "Delta Center", "city": { "name": "Salt Lake City" }, "state": { "stateCode": "UT" }, "location": { "latitude": "40.76", "longitude": "-111.89" } }]
          }
        }
        """;
    }

    private static string DiscoveryPayload() => $$"""
        { "_embedded": { "events": [
          {{TmEvent("nba-game", "Utah Jazz vs. Denver Nuggets", ["Utah Jazz", "Denver Nuggets"], "Basketball", "NBA")}},
          {{TmEvent("block-party", "Utah Jazz Block Party", ["Utah Jazz"], "Basketball", "NBA")}},
          {{TmEvent("weird", "Springville Flyers vs. Ogden Hawks", ["Springville Flyers", "Ogden Hawks"], "", "")}}
        ] } }
        """;

    private static readonly IReadOnlySet<string> KnownTeamsSet =
        new HashSet<string>(["Utah Jazz", "Denver Nuggets"], StringComparer.OrdinalIgnoreCase);

    private static IConfiguration Config() =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Ticketmaster:ApiKey"] = "tm-key",
        }).Build();

    private static TicketmasterClient MakeClient(FakeClassifier classifier, IVerdictStore? store = null) =>
        new(
            new HttpClient(new FakeTicketmasterHandler(DiscoveryPayload())),
            Config(),
            classifier,
            store ?? new BlobVerdictStore(null),
            KnownTeamsSet);

    private static EventVerdict Verdict(bool isGame, string sport = "Basketball", string league = "NBA",
        string home = "Utah Jazz", string away = "", string reason = "test") =>
        new(isGame, sport, league, home, away, reason, "2026-08-06", ClassificationSchema.Version, DateTime.UtcNow);

    // ---------- Tests ----------

    [TestMethod]
    public async Task DisabledClassifier_BehavesExactlyLikeToday()
    {
        var classifier = new FakeClassifier { Enabled = false };
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.IsNotNull(events);
        Assert.AreEqual(3, events.Count); // all pass today's filter
        Assert.AreEqual(0, classifier.ClassifiedIds.Count);
    }

    [TestMethod]
    public async Task CleanMatchup_IsNeverSentToTheClassifier()
    {
        var classifier = new FakeClassifier();
        await MakeClient(classifier).GetEventsAsync("UT");

        CollectionAssert.DoesNotContain(classifier.ClassifiedIds, "nba-game");
        CollectionAssert.Contains(classifier.ClassifiedIds, "block-party"); // no-matchup-pass
        CollectionAssert.Contains(classifier.ClassifiedIds, "weird");       // unknown-team + unclassified
    }

    [TestMethod]
    public async Task JunkVerdict_DropsTheEvent()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["block-party"] = Verdict(isGame: false, reason: "Fan event, not a game.");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.IsNotNull(events);
        Assert.IsFalse(events.Any(e => e.Id == "block-party"));
        Assert.IsTrue(events.Any(e => e.Id == "nba-game"));
    }

    [TestMethod]
    public async Task Verdict_OverridesRulesLabels()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey", league: "ECHL",
            home: "Springville Flyers", away: "Ogden Hawks");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        var weird = events!.Single(e => e.Id == "weird");
        Assert.AreEqual("ECHL", weird.League);
        Assert.AreEqual("Hockey", weird.Sport);
        Assert.AreEqual("Springville Flyers", weird.HomeTeam);
    }

    [TestMethod]
    public async Task UnknownLeagueVerdict_DisplaysAsOther()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey",
            league: ClassificationSchema.UnknownLeague, home: "Springville Flyers", away: "Ogden Hawks");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.AreEqual("Other", events!.Single(e => e.Id == "weird").League);
    }

    [TestMethod]
    public async Task FailedClassification_ServesRulesDraftAndStoresNothing()
    {
        var classifier = new FakeClassifier(); // returns null for everything
        var store = new BlobVerdictStore(null);
        var events = await MakeClient(classifier, store).GetEventsAsync("UT");

        Assert.AreEqual(3, events!.Count); // same as today's behavior
        Assert.IsFalse(store.TryGet("block-party", out _));
    }

    [TestMethod]
    public async Task SecondFetch_UsesStoredVerdicts_NoReclassification()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["block-party"] = Verdict(isGame: false);
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey", league: "ECHL",
            home: "Springville Flyers", away: "Ogden Hawks");
        var store = new BlobVerdictStore(null);

        await MakeClient(classifier, store).GetEventsAsync("UT");
        await MakeClient(classifier, store).GetEventsAsync("UT");

        Assert.AreEqual(1, classifier.ClassifiedIds.Count(id => id == "block-party"));
        Assert.AreEqual(1, classifier.ClassifiedIds.Count(id => id == "weird"));
    }
}
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `dotnet test --filter PipelineIntegrationTests`
Expected: FAIL — `TicketmasterClient` has no such constructor.

- [ ] **Step 6: Modify `Api/Services/TicketmasterClient.cs`**

Change the class declaration and add the verdict pipeline. The extraction helpers (`ExtractTeams`, `ExtractDateTime`, `ExtractVenue`, `ExtractClassification`, `ExtractImageUrl`, `ExtractPriceRange`, `GetString`, `GetOrDefaultAsync`) are untouched.

```csharp
public class TicketmasterClient(
    HttpClient httpClient,
    IConfiguration config,
    IEventClassifier classifier,
    IVerdictStore verdictStore,
    IReadOnlySet<string>? knownTeams = null)
{
    // Tests inject a fixed set; production falls back to the generated file.
    private readonly IReadOnlySet<string> _knownTeams = knownTeams ?? KnownTeams.Names;
```

`GetEventsAsync` — replace the parse loop and return:

```csharp
        var parsed = new List<ParsedEvent>();
        foreach (var ev in eventsArray.EnumerateArray())
        {
            var p = ParseRawEvent(ev);
            if (p != null)
                parsed.Add(p);
        }
        return await ApplyVerdictsAsync(parsed);
```

`GetEventByIdAsync` — replace the final `return ParseEvent(json);` with:

```csharp
        var single = ParseRawEvent(json);
        if (single == null)
            return null;
        var enriched = await ApplyVerdictsAsync([single]);
        return enriched.FirstOrDefault();
```

Keep `ParseEvent` public/static for the existing parse tests, reimplemented on top of the split:

```csharp
    /// <summary>
    /// Rules-only parse + filter (no LLM). Kept for tests and as the shape of
    /// the fallback path; the async pipeline goes through ParseRawEvent +
    /// ApplyVerdictsAsync instead.
    /// </summary>
    public static SportEvent? ParseEvent(JsonElement ev)
    {
        var parsed = ParseRawEvent(ev);
        if (parsed == null)
            return null;
        return EventFilter.IsSpectatorEvent(parsed.Draft, parsed.StatusCode) ? parsed.Draft : null;
    }
```

Add `ParseRawEvent` (the old `ParseEvent` body, ending with hard rules + `ClassificationInput` instead of the filter):

```csharp
    /// <summary>
    /// Parses one raw Ticketmaster event and applies the deterministic hard
    /// rules. Returns null when no home team is found or the event is
    /// hard-dropped (cancelled/postponed, past, denylisted name).
    /// </summary>
    public static ParsedEvent? ParseRawEvent(JsonElement ev)
    {
        var tmId = GetString(ev, "id");
        var eventName = GetString(ev, "name");

        var (homeTeam, awayTeam) = ExtractTeams(ev, eventName);
        if (string.IsNullOrEmpty(homeTeam))
            return null;

        var (dateTime, localDate, localTime) = ExtractDateTime(ev);
        var (venue, city, state, lat, lng) = ExtractVenue(ev);
        var (rawSport, rawLeague) = ExtractClassification(ev);

        var normalized = EventNormalizer.NormalizeEvent(eventName, homeTeam, awayTeam, rawSport, rawLeague);

        var ticketUrl = GetString(ev, "url");
        var imageUrl = ExtractImageUrl(ev);
        var (priceMin, priceMax, currency) = ExtractPriceRange(ev);

        var draft = new SportEvent(
            tmId, eventName, normalized.HomeTeam, normalized.AwayTeam, dateTime, venue,
            normalized.Sport, normalized.League, city, state, lat, lng, ticketUrl, imageUrl,
            priceMin, priceMax, currency, localDate, localTime);

        var statusCode = ev.TryGetProperty("dates", out var dates) &&
                         dates.TryGetProperty("status", out var status) &&
                         status.TryGetProperty("code", out var codeProp)
            ? codeProp.GetString() ?? ""
            : "";

        if (EventFilter.IsHardDropped(draft, statusCode))
            return null;

        var input = new ClassificationInput(
            EventId: tmId, EventName: eventName,
            RawHomeTeam: homeTeam, RawAwayTeam: awayTeam,
            RawSport: rawSport, RawLeague: rawLeague,
            DraftHomeTeam: normalized.HomeTeam, DraftAwayTeam: normalized.AwayTeam,
            DraftSport: normalized.Sport, DraftLeague: normalized.League,
            Venue: venue, City: city, State: state, LocalDate: localDate);

        return new ParsedEvent(draft, input, statusCode);
    }
```

Add the verdict pipeline:

```csharp
    /// <summary>
    /// Applies stored verdicts, classifies triggered unseen events (bounded
    /// parallelism, overall time budget), and falls back to the rules filter
    /// for everything else. With the classifier disabled this is exactly the
    /// pre-LLM pipeline.
    /// </summary>
    private async Task<List<SportEvent>> ApplyVerdictsAsync(List<ParsedEvent> parsed)
    {
        var results = new List<SportEvent>();

        if (!classifier.IsEnabled)
        {
            foreach (var p in parsed)
                if (EventFilter.IsSpectatorEvent(p.Draft, p.StatusCode))
                    results.Add(p.Draft);
            return results;
        }

        await verdictStore.EnsureLoadedAsync(CancellationToken.None);

        var toClassify = parsed
            .Where(p => !verdictStore.TryGet(p.Input.EventId, out _))
            .Select(p => (Parsed: p, Triggers: ClassificationTriggers.Evaluate(p.Input, _knownTeams)))
            .Where(x => x.Triggers.Count > 0)
            .ToList();

        if (toClassify.Count > 0)
        {
            // Free-tier friendly: <=4 in flight, 15s total budget. Stragglers
            // serve the rules draft this fetch and are classified next time.
            using var budget = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            using var gate = new SemaphoreSlim(4);
            var newVerdicts = 0;

            var tasks = toClassify.Select(async x =>
            {
                await gate.WaitAsync(budget.Token);
                try
                {
                    Console.WriteLine(
                        $"Classifying {x.Parsed.Input.EventId} \"{x.Parsed.Input.EventName}\" (triggers: {string.Join(",", x.Triggers)})");
                    var verdict = await classifier.ClassifyAsync(x.Parsed.Input, budget.Token);
                    if (verdict != null)
                    {
                        verdictStore.Add(x.Parsed.Input.EventId, verdict);
                        Interlocked.Increment(ref newVerdicts);
                    }
                }
                finally { gate.Release(); }
            }).ToList();

            try { await Task.WhenAll(tasks); }
            catch (OperationCanceledException)
            {
                Console.WriteLine("Classification budget exhausted - remaining events keep the rules draft this fetch");
            }

            if (newVerdicts > 0)
                await verdictStore.SaveAsync(CancellationToken.None);
        }

        foreach (var p in parsed)
        {
            if (verdictStore.TryGet(p.Input.EventId, out var verdict))
            {
                if (!verdict.IsSpectatorGame)
                {
                    Console.WriteLine($"Verdict drop {p.Input.EventId} \"{p.Input.EventName}\": {verdict.Reason}");
                    continue;
                }
                results.Add(ApplyVerdict(p.Draft, verdict));
            }
            else if (EventFilter.IsSpectatorEvent(p.Draft, p.StatusCode))
            {
                results.Add(p.Draft);
            }
        }
        return results;
    }

    private static SportEvent ApplyVerdict(SportEvent draft, EventVerdict verdict) =>
        draft with
        {
            HomeTeam = EventNormalizer.NormalizeTeamName(verdict.HomeTeam),
            AwayTeam = EventNormalizer.NormalizeTeamName(verdict.AwayTeam),
            Sport = verdict.Sport,
            League = verdict.League == ClassificationSchema.UnknownLeague ? "Other" : verdict.League,
        };
```

- [ ] **Step 7: Modify `Api/Program.cs`** — after `builder.Services.AddHttpClient<TicketmasterClient>();` add:

```csharp
// LLM verdict layer: without a Gemini key the classifier reports disabled and
// the whole layer (including blob reads) is inert — exact pre-LLM behavior.
builder.Services.AddHttpClient<IEventClassifier, GeminiEventClassifier>();
builder.Services.AddSingleton<IVerdictStore>(_ =>
{
    var geminiEnabled = !string.IsNullOrWhiteSpace(builder.Configuration["Gemini:ApiKey"]);
    var storageConn = builder.Configuration["Storage:ConnectionString"];
    if (!geminiEnabled)
        return new BlobVerdictStore(null);
    if (string.IsNullOrWhiteSpace(storageConn))
    {
        Console.WriteLine("Gemini enabled but Storage:ConnectionString missing - verdicts kept in memory only");
        return new BlobVerdictStore(null);
    }
    return new BlobVerdictStore(new AzureBlobStorage(storageConn));
});
```

- [ ] **Step 8: Run the full test suite**

Run: `dotnet test`
Expected: everything PASSES — new integration tests plus all pre-existing suites (`EventFilterTests`, `EventNormalizerTests`, `TicketmasterClientParseTests`, `TicketmasterRawDataTests`, `MinorLeagueBaseballTests`).

- [ ] **Step 9: Commit**

```bash
git add Api/Models/ParsedEvent.cs Api/Services/EventFilter.cs Api/Services/TicketmasterClient.cs Api/Program.cs Api.Tests/PipelineIntegrationTests.cs
git commit -m "Wire verdict layer into the event pipeline"
```

---

### Task 7: Env-gated live test + docs (Wave 2 — Haiku agent or orchestrator)

**Files:**
- Create: `Api.Tests/GeminiLiveIntegrationTests.cs`
- Modify: `CLAUDE.md`
- Modify: `DEPLOYMENT.md`

- [ ] **Step 1: Create `Api.Tests/GeminiLiveIntegrationTests.cs`**

```csharp
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

/// <summary>
/// Hits the real Gemini API. Inconclusive (skipped) unless GEMINI_API_KEY is
/// set in the environment. Costs 2 free-tier requests per run.
/// </summary>
[TestClass]
public class GeminiLiveIntegrationTests
{
    private static GeminiEventClassifier? MakeRealClassifier()
    {
        var key = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(key)) return null;
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Gemini:ApiKey"] = key,
        }).Build();
        return new GeminiEventClassifier(new HttpClient(), config);
    }

    private static ClassificationInput Input(string name, string home, string away, string genre, string subGenre) =>
        new(
            EventId: "live-test", EventName: name,
            RawHomeTeam: home, RawAwayTeam: away,
            RawSport: genre, RawLeague: subGenre,
            DraftHomeTeam: home, DraftAwayTeam: away,
            DraftSport: genre == "" ? "Other" : genre, DraftLeague: "Other",
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-06");

    [TestMethod]
    public async Task BlockParty_IsJudgedNotAGame()
    {
        var classifier = MakeRealClassifier();
        if (classifier == null) { Assert.Inconclusive("Set GEMINI_API_KEY to run live tests."); return; }

        var verdict = await classifier.ClassifyAsync(
            Input("Utah Jazz Block Party", "Utah Jazz", "", "Basketball", "NBA"), CancellationToken.None);

        Assert.IsNotNull(verdict, "expected a verdict from the live API");
        Assert.IsFalse(verdict.IsSpectatorGame, $"expected junk verdict, got: {verdict.Reason}");
    }

    [TestMethod]
    public async Task RealGame_IsJudgedAGameWithLeague()
    {
        var classifier = MakeRealClassifier();
        if (classifier == null) { Assert.Inconclusive("Set GEMINI_API_KEY to run live tests."); return; }

        var verdict = await classifier.ClassifyAsync(
            Input("Utah Grizzlies vs. Idaho Steelheads", "Utah Grizzlies", "Idaho Steelheads", "Hockey", "Minor League"),
            CancellationToken.None);

        Assert.IsNotNull(verdict, "expected a verdict from the live API");
        Assert.IsTrue(verdict.IsSpectatorGame, $"expected real-game verdict, got: {verdict.Reason}");
        Assert.AreEqual("ECHL", verdict.League, $"reason: {verdict.Reason}");
    }
}
```

- [ ] **Step 2: Run without a key (skip path), then with one if available**

Run: `dotnet test --filter GeminiLiveIntegrationTests`
Expected: 2 tests report **Inconclusive/Skipped** without `GEMINI_API_KEY`; with a key exported, 2 PASS.

- [ ] **Step 3: Update `CLAUDE.md`**

Add to the **What's Working** table: `| AI event classification | Done | Gemini verdict layer: 4 triggers, blob-cached verdicts, junk-drop + relabel |`

Add to **Key Technical Notes**:

```markdown
- **AI classifier:** borderline events (unknown team, unclassified, would-be-dropped, no-matchup pass) get a one-time Gemini verdict (`gemini-2.5-flash-lite`, structured output with closed league/sport enums). Verdicts persist in blob `verdicts/verdicts.json` and always win over the rules. No `Gemini__ApiKey` → layer fully inert. Regenerate `Api/Data/known-teams.json` with `cd scripts && node export-known-teams.mjs` whenever `teams.js` changes. Spec: `docs/superpowers/specs/2026-07-07-llm-event-classification-design.md`
- **Gemini API key:** local dev in `appsettings.Development.json` (`Gemini:ApiKey`); Azure uses `Gemini__ApiKey`. Verdict blob needs `Storage__ConnectionString`
```

Add the new files to the **File Structure** listing (`EventVerdict.cs`, `ClassificationInput.cs`, `ParsedEvent.cs`, `GeminiEventClassifier.cs`, `BlobVerdictStore.cs`, `AzureBlobStorage.cs`, `ClassificationTriggers.cs`, `KnownTeams.cs`, `Api/Data/known-teams.json`, `scripts/export-known-teams.mjs`).

- [ ] **Step 4: Update `DEPLOYMENT.md`** — add a "Classifier secrets" subsection with the two `az` commands from the Prerequisites section of this plan.

- [ ] **Step 5: Commit**

```bash
git add Api.Tests/GeminiLiveIntegrationTests.cs CLAUDE.md DEPLOYMENT.md
git commit -m "Add env-gated Gemini live test and classifier docs"
```

---

### Task 8: Final verification (orchestrator)

- [ ] **Step 1: Full suite**

Run: `dotnet test`
Expected: all PASS (live tests Inconclusive without key).

- [ ] **Step 2: Behavior-unchanged check (no key)**

Ensure `appsettings.Development.json` has no `Gemini:ApiKey`, then `cd Api && dotnet run`. Fetch `http://localhost:5068/api/games?stateCode=UT`.
Expected: normal feed; logs show **no** "Classifying" lines and no blob access.

- [ ] **Step 3: End-to-end with key (needs Prereqs 1–3)**

Add `Gemini:ApiKey` (and optionally `Storage:ConnectionString`) to `appsettings.Development.json`, restart, fetch `/api/games?stateCode=UT`.
Expected: logs show `Classifying <id> "<name>" (triggers: ...)` for borderline events only, token counts per call, any junk drops logged with reasons; with the connection string set, blob `verdicts/verdicts.json` appears in `stadarstorage`.

- [ ] **Step 4: Verdict-cache check**

Wait ~5 min (response cache expiry) or restart the app; fetch again.
Expected: with blob storage configured, zero "Classifying" lines (verdict hits only, surviving the restart).

- [ ] **Step 5: Commit any stragglers, push the branch**

```bash
git status   # should be clean
git push -u stadar feature/AI-classifier
```

Merging to `main` (and the deploy that triggers) is a separate, explicit decision for Brady — not part of this plan.
