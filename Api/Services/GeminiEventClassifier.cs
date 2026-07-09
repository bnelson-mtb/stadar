using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Classifies borderline Ticketmaster events with the Gemini API using a
/// closed-enum structured-output schema. Events are sent in batches — one
/// request classifies many listings, keyed back by event_id. Returns null on
/// any failure (except 429, which is flagged so the caller can stop sending)
/// so the pipeline falls back to the deterministic rules.
/// </summary>
public class GeminiEventClassifier : IEventClassifier
{
    private const string SystemInstruction = """
        You classify Ticketmaster listings for a sports-discovery app that only
        shows real, ticketed spectator games. You receive one or more listings;
        return a JSON array with exactly one verdict per listing, copying each
        listing's event_id into the matching verdict.

        Set is_spectator_game=true ONLY for a competitive spectator sporting
        event where one identifiable team faces another identifiable team.
        Set it false for: fan fests, watch/viewing parties, block parties,
        draft parties, "An Evening With..." shows, camps, clinics, tryouts,
        autograph or meet-and-greet sessions, parking or hospitality passes,
        season-ticket packages, rodeos, concerts, monster trucks, motorsports, and combat sports (boxing, MMA,
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
        _http.Timeout = TimeSpan.FromSeconds(30); // batches produce longer outputs than single calls
        _apiKey = config["Gemini:ApiKey"];
        _model = config["Classifier:Model"] ?? "gemini-2.5-flash-lite";
    }

    public bool IsEnabled => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<BatchClassificationResult?> ClassifyBatchAsync(
        IReadOnlyList<ClassificationInput> inputs, CancellationToken cancellationToken)
    {
        if (!IsEnabled || inputs.Count == 0) return null;
        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent";
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("x-goog-api-key", _apiKey);
            request.Content = new StringContent(BuildRequestJson(inputs), Encoding.UTF8, "application/json");

            using var response = await _http.SendAsync(request, cancellationToken);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                Console.WriteLine($"Gemini batch of {inputs.Count}: HTTP 429 (rate limited)");
                return new BatchClassificationResult(new Dictionary<string, EventVerdict>(), RateLimited: true);
            }
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Gemini batch of {inputs.Count}: HTTP {(int)response.StatusCode}");
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var verdicts = ParseVerdicts(json, inputs);
            return verdicts == null ? null : new BatchClassificationResult(verdicts, RateLimited: false);
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException)
        {
            Console.WriteLine($"Gemini batch of {inputs.Count} failed: {e.Message}");
            return null;
        }
    }

    /// <summary>Convenience batch-of-one, used by the live integration tests.</summary>
    public async Task<EventVerdict?> ClassifyAsync(ClassificationInput input, CancellationToken cancellationToken)
    {
        var result = await ClassifyBatchAsync([input], cancellationToken);
        return result != null && result.Verdicts.TryGetValue(input.EventId, out var verdict) ? verdict : null;
    }

    public static string BuildRequestJson(IReadOnlyList<ClassificationInput> inputs)
    {
        var payload = new
        {
            systemInstruction = new { parts = new[] { new { text = SystemInstruction } } },
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[] { new { text = string.Join("\n\n", inputs.Select(BuildEventText)) } },
                },
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = new
                {
                    type = "ARRAY",
                    items = new
                    {
                        type = "OBJECT",
                        properties = new Dictionary<string, object>
                        {
                            ["event_id"] = new { type = "STRING" },
                            ["is_spectator_game"] = new { type = "BOOLEAN" },
                            ["sport"] = new { type = "STRING", @enum = ClassificationSchema.Sports },
                            ["league"] = new { type = "STRING", @enum = ClassificationSchema.Leagues },
                            ["home_team"] = new { type = "STRING" },
                            ["away_team"] = new { type = "STRING" },
                            ["reason"] = new { type = "STRING" },
                        },
                        required = new[]
                        {
                            "event_id", "is_spectator_game", "sport", "league",
                            "home_team", "away_team", "reason",
                        },
                    },
                },
                maxOutputTokens = 300 + 200 * inputs.Count,
                temperature = 0,
            },
        };
        return JsonSerializer.Serialize(payload);
    }

    private static string BuildEventText(ClassificationInput input) =>
        $"""
        event_id: {input.EventId}
        Event name: {input.EventName}
        Attractions: {input.RawHomeTeam} | {input.RawAwayTeam}
        Ticketmaster genre: {input.RawSport} / subGenre: {input.RawLeague}
        Venue: {input.Venue}, {input.City}, {input.State}
        Local date: {input.LocalDate}
        Rules draft: sport={input.DraftSport}, league={input.DraftLeague}, home={input.DraftHomeTeam}, away={input.DraftAwayTeam}
        """;

    public static Dictionary<string, EventVerdict>? ParseVerdicts(
        JsonElement response, IReadOnlyList<ClassificationInput> inputs)
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

        JsonElement array;
        try { array = JsonSerializer.Deserialize<JsonElement>(textProp.GetString() ?? ""); }
        catch (JsonException) { return null; }

        if (array.ValueKind != JsonValueKind.Array)
            return null;

        var inputsById = inputs.ToDictionary(i => i.EventId);
        var verdicts = new Dictionary<string, EventVerdict>();
        foreach (var v in array.EnumerateArray())
        {
            var verdict = ParseOneVerdict(v, inputsById);
            if (verdict != null)
                verdicts[verdict.Value.EventId] = verdict.Value.Verdict;
        }

        LogUsage(response, verdicts.Count);
        return verdicts;
    }

    private static (string EventId, EventVerdict Verdict)? ParseOneVerdict(
        JsonElement v, Dictionary<string, ClassificationInput> inputsById)
    {
        if (v.ValueKind != JsonValueKind.Object ||
            !v.TryGetProperty("is_spectator_game", out var isGameProp) ||
            (isGameProp.ValueKind != JsonValueKind.True && isGameProp.ValueKind != JsonValueKind.False))
            return null;

        string GetStr(string name) =>
            v.TryGetProperty(name, out var p) && p.ValueKind == JsonValueKind.String ? p.GetString()! : "";

        // Only accept verdicts for events we actually asked about.
        if (!inputsById.TryGetValue(GetStr("event_id"), out var input))
            return null;

        // Belt-and-suspenders: the schema constrains these, but never trust output blindly.
        var sport = ClassificationSchema.Sports.Contains(GetStr("sport")) ? GetStr("sport") : "Other";
        var league = ClassificationSchema.Leagues.Contains(GetStr("league"))
            ? GetStr("league")
            : ClassificationSchema.UnknownLeague;

        return (input.EventId, new EventVerdict(
            IsSpectatorGame: isGameProp.GetBoolean(),
            Sport: sport,
            League: league,
            HomeTeam: GetStr("home_team"),
            AwayTeam: GetStr("away_team"),
            Reason: GetStr("reason"),
            EventDate: input.LocalDate,
            SchemaVersion: ClassificationSchema.Version,
            ClassifiedAt: DateTime.UtcNow));
    }

    private static void LogUsage(JsonElement response, int verdictCount)
    {
        if (!response.TryGetProperty("usageMetadata", out var usage)) return;
        var prompt = usage.TryGetProperty("promptTokenCount", out var p) ? p.GetInt32() : 0;
        var output = usage.TryGetProperty("candidatesTokenCount", out var c) ? c.GetInt32() : 0;
        Console.WriteLine($"Gemini batch: {verdictCount} verdicts, {prompt} in / {output} out tokens");
    }
}
