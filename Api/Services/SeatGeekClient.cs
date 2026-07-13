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
