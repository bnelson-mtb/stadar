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
