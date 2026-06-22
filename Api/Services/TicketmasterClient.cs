using System.Text.Json;
using System.Globalization;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Fetches sports events from the Ticketmaster Discovery API and parses
/// the raw JSON into clean SportEvent records.
/// </summary>
public class TicketmasterClient(HttpClient httpClient, IConfiguration config)
{
    public async Task<List<SportEvent>?> GetEventsAsync(string stateCode)
    {
        var apiKey = config["Ticketmaster:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var url = $"https://app.ticketmaster.com/discovery/v2/events.json?apikey={apiKey}&stateCode={stateCode}&classificationName=sports&size=50&sort=date,asc";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (!json.TryGetProperty("_embedded", out var embedded) ||
            !embedded.TryGetProperty("events", out var eventsArray))
        {
            return [];
        }

        var events = new List<SportEvent>();
        foreach (var ev in eventsArray.EnumerateArray())
        {
            var parsed = ParseEvent(ev);
            if (parsed != null)
                events.Add(parsed);
        }
        return events;
    }

    public async Task<SportEvent?> GetEventByIdAsync(string eventId)
    {
        var apiKey = config["Ticketmaster:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var url = $"https://app.ticketmaster.com/discovery/v2/events/{eventId}.json?apikey={apiKey}";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return ParseEvent(json);
    }

    /// <summary>
    /// Parses a single Ticketmaster event JSON object into a SportEvent.
    /// Returns null when no home team can be identified, or when EventFilter rejects the event.
    /// Public + static so it can be unit-tested with fixture JSON.
    /// </summary>
    public static SportEvent? ParseEvent(JsonElement ev)
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

        var sportEvent = new SportEvent(
            tmId, eventName, normalized.HomeTeam, normalized.AwayTeam, dateTime, venue,
            normalized.Sport, normalized.League, city, state, lat, lng, ticketUrl, imageUrl,
            priceMin, priceMax, currency, localDate, localTime
        );

        var statusCode = ev.TryGetProperty("dates", out var dates) &&
                         dates.TryGetProperty("status", out var status) &&
                         status.TryGetProperty("code", out var codeProp)
            ? codeProp.GetString() ?? ""
            : "";

        if (!EventFilter.IsSpectatorEvent(sportEvent, statusCode))
            return null;

        return sportEvent;
    }

    private static (string HomeTeam, string AwayTeam) ExtractTeams(JsonElement ev, string eventName)
    {
        var homeTeam = "";
        var awayTeam = "";

        // Ticketmaster tags non-matchup events (e.g. Monster Jam) with multiple
        // series/sub-brand attractions that aren't opposing teams. Only trust a
        // second attraction as an "away team" when the title actually reads like
        // a matchup ("X v Y" / "X vs Y" / "X @ Y").
        var looksLikeMatchup = MatchupTitleParser.LooksLikeMatchup(eventName);

        if (ev.TryGetProperty("_embedded", out var embedded) &&
            embedded.TryGetProperty("attractions", out var attractions))
        {
            var teams = attractions.EnumerateArray().ToList();
            if (teams.Count >= 1) homeTeam = GetString(teams[0], "name");
            if (teams.Count >= 2 && looksLikeMatchup) awayTeam = GetString(teams[1], "name");
        }

        // Fallback: parse event name for "X v Y" / "X vs Y" when away team is missing
        if (string.IsNullOrEmpty(awayTeam) &&
            MatchupTitleParser.TrySplitTeams(eventName, out var parsedHomeTeam, out var parsedAwayTeam))
        {
            awayTeam = parsedAwayTeam;
            if (string.IsNullOrEmpty(homeTeam))
                homeTeam = parsedHomeTeam;
        }

        return (homeTeam, awayTeam);
    }

    private static (DateTime utcDateTime, string localDate, string? localTime) ExtractDateTime(JsonElement ev)
    {
        // Default to MaxValue so events with no date info are not dropped by the past-event filter
        var dateTime = DateTime.MaxValue;
        var localDateStr = "";
        string? localTimeStr = null;

        if (ev.TryGetProperty("dates", out var dates) &&
            dates.TryGetProperty("start", out var start))
        {
            // Extract localDate
            if (start.TryGetProperty("localDate", out var localDateProp))
                localDateStr = localDateProp.GetString() ?? "";

            // Extract localTime (only if timeTBA and noSpecificTime are both false)
            var timeTBA = start.TryGetProperty("timeTBA", out var timeTBAVal) && timeTBAVal.GetBoolean();
            var noSpecificTime = start.TryGetProperty("noSpecificTime", out var noSpecificTimeVal) && noSpecificTimeVal.GetBoolean();

            if (!timeTBA && !noSpecificTime && start.TryGetProperty("localTime", out var localTimeProp))
                localTimeStr = localTimeProp.GetString();

            // Prefer Ticketmaster UTC dateTime when present. If only a calendar
            // date exists, use end-of-day so date-only events do not get dropped
            // early by the past-event filter.
            if (start.TryGetProperty("dateTime", out var dtProp) &&
                DateTime.TryParse(dtProp.GetString(), null, DateTimeStyles.RoundtripKind, out var parsedUtc))
            {
                dateTime = parsedUtc;
            }
            else if (!string.IsNullOrWhiteSpace(localDateStr) &&
                     DateTime.TryParse(localDateStr, out var localDateOnly))
            {
                dateTime = DateTime.SpecifyKind(
                    localDateOnly.Date.AddDays(1).AddTicks(-1),
                    DateTimeKind.Utc
                );
            }
        }

        return (dateTime, localDateStr, localTimeStr);
    }

    private static (string Venue, string City, string State, double Lat, double Lng) ExtractVenue(JsonElement ev)
    {
        var venue = "";
        var city = "";
        var state = "";
        double lat = 0, lng = 0;

        if (ev.TryGetProperty("_embedded", out var embedded) &&
            embedded.TryGetProperty("venues", out var venues))
        {
            var v = venues.EnumerateArray().FirstOrDefault();
            venue = GetString(v, "name");
            if (v.TryGetProperty("city", out var vCity))
                city = GetString(vCity, "name");
            if (v.TryGetProperty("state", out var vState))
                state = GetString(vState, "stateCode");
            if (v.TryGetProperty("location", out var loc))
            {
                if (loc.TryGetProperty("latitude", out var latProp))
                    double.TryParse(latProp.GetString(), out lat);
                if (loc.TryGetProperty("longitude", out var lngProp))
                    double.TryParse(lngProp.GetString(), out lng);
            }
        }

        return (venue, city, state, lat, lng);
    }

    private static (string RawSport, string RawLeague) ExtractClassification(JsonElement ev)
    {
        var rawSport = "";
        var rawLeague = "";

        if (ev.TryGetProperty("classifications", out var classifications))
        {
            var classification = classifications.EnumerateArray().FirstOrDefault();
            if (classification.TryGetProperty("genre", out var genre))
                rawSport = GetString(genre, "name");
            if (classification.TryGetProperty("subGenre", out var subGenre))
                rawLeague = GetString(subGenre, "name");
        }

        // Fallback: if event-level genre is Miscellaneous, scan attractions for a better classification
        if (rawSport.Equals("Miscellaneous", StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(rawSport))
        {
            if (ev.TryGetProperty("_embedded", out var embedded) &&
                embedded.TryGetProperty("attractions", out var attractions))
            {
                foreach (var attr in attractions.EnumerateArray())
                {
                    if (!attr.TryGetProperty("classifications", out var attrClass)) continue;
                    var first = attrClass.EnumerateArray().FirstOrDefault();
                    var attrGenre = first.TryGetProperty("genre", out var g) ? GetString(g, "name") : "";
                    var attrSubGenre = first.TryGetProperty("subGenre", out var sg) ? GetString(sg, "name") : "";
                    if (!string.IsNullOrEmpty(attrGenre) && !attrGenre.Equals("Miscellaneous", StringComparison.OrdinalIgnoreCase))
                    {
                        rawSport = attrGenre;
                        rawLeague = attrSubGenre;
                        break;
                    }
                }
            }
        }

        return (rawSport, rawLeague);
    }

    private static string ExtractImageUrl(JsonElement ev)
    {
        var imageUrl = "";
        if (ev.TryGetProperty("images", out var images))
        {
            // Prefer a 16:9 ratio image
            foreach (var img in images.EnumerateArray())
            {
                var ratio = img.TryGetProperty("ratio", out var rProp) ? rProp.GetString() : "";
                var imgUrl = GetString(img, "url");
                if (ratio == "16_9" && !string.IsNullOrEmpty(imgUrl))
                    return imgUrl;
                if (string.IsNullOrEmpty(imageUrl) && !string.IsNullOrEmpty(imgUrl))
                    imageUrl = imgUrl;
            }
        }
        return imageUrl;
    }

    private static (double? PriceMin, double? PriceMax, string Currency) ExtractPriceRange(JsonElement ev)
    {
        double? priceMin = null;
        double? priceMax = null;
        var currency = "";

        if (ev.TryGetProperty("priceRanges", out var priceRanges))
        {
            var first = priceRanges.EnumerateArray().FirstOrDefault();
            if (first.ValueKind != JsonValueKind.Undefined)
            {
                if (first.TryGetProperty("min", out var minProp))
                    if (minProp.TryGetDouble(out var min))
                        priceMin = min;

                if (first.TryGetProperty("max", out var maxProp))
                    if (maxProp.TryGetDouble(out var max))
                        priceMax = max;

                currency = GetString(first, "currency");
            }
        }

        return (priceMin, priceMax, currency);
    }

    private static string GetString(JsonElement el, string prop)
        => el.TryGetProperty(prop, out var val) ? val.GetString() ?? "" : "";
}
