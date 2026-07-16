using System.Text.Json;
using System.Globalization;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Fetches sports events from the Ticketmaster Discovery API and parses
/// the raw JSON into clean SportEvent records.
/// </summary>
public class TicketmasterClient(
    HttpClient httpClient,
    IConfiguration config,
    IEventClassifier classifier,
    IVerdictStore verdictStore,
    IReadOnlySet<string>? knownTeams = null)
{
    // Keeps one Gemini request's output comfortably inside its token cap.
    private const int ClassificationBatchSize = 10;

    // Tests inject a fixed set; production falls back to the generated file.
    private readonly IReadOnlySet<string> _knownTeams = knownTeams ?? KnownTeams.Names;

    public async Task<List<SportEvent>?> GetEventsAsync(string stateCode)
    {
        var apiKey = config["Ticketmaster:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var url = $"https://app.ticketmaster.com/discovery/v2/events.json?apikey={apiKey}&stateCode={stateCode}&classificationName=sports&size=50&sort=date,asc";

        var response = await GetOrDefaultAsync(url);
        if (response == null || !response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (!json.TryGetProperty("_embedded", out var embedded) ||
            !embedded.TryGetProperty("events", out var eventsArray))
        {
            return [];
        }

        var parsed = new List<ParsedEvent>();
        foreach (var ev in eventsArray.EnumerateArray())
        {
            var p = ParseRawEvent(ev);
            if (p != null)
                parsed.Add(p);
        }
        return await ApplyVerdictsAsync(parsed);
    }

    public async Task<SportEvent?> GetEventByIdAsync(string eventId)
    {
        var apiKey = config["Ticketmaster:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return null;

        var url = $"https://app.ticketmaster.com/discovery/v2/events/{eventId}.json?apikey={apiKey}";

        var response = await GetOrDefaultAsync(url);
        if (response == null || !response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var single = ParseRawEvent(json);
        if (single == null)
            return null;
        var enriched = await ApplyVerdictsAsync([single]);
        return enriched.FirstOrDefault();
    }

    // Network failures and timeouts surface the same as a non-success status:
    // callers return null and the endpoint responds with a Problem result
    // instead of an unhandled 500.
    private async Task<HttpResponseMessage?> GetOrDefaultAsync(string url)
    {
        try
        {
            return await httpClient.GetAsync(url);
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException)
        {
            Console.WriteLine($"Ticketmaster request failed: {e.Message}");
            return null;
        }
    }

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

        var draft = new SportEvent(
            tmId, eventName, normalized.HomeTeam, normalized.AwayTeam, dateTime, venue,
            normalized.Sport, normalized.League, city, state, lat, lng, ticketUrl, imageUrl,
            localDate, localTime);

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
            // One request classifies a whole chunk (free-tier friendly: a
            // state fetch costs 1-3 requests instead of one per event). A 429
            // means every further call this minute is doomed, so stop and let
            // the affected events keep the rules draft; they retry next fetch.
            using var budget = new CancellationTokenSource(TimeSpan.FromSeconds(20));
            var newVerdicts = 0;

            foreach (var chunk in toClassify.Chunk(ClassificationBatchSize))
            {
                if (budget.IsCancellationRequested)
                {
                    Console.WriteLine("Classification budget exhausted - remaining events keep the rules draft this fetch");
                    break;
                }

                foreach (var x in chunk)
                    Console.WriteLine(
                        $"Classifying {x.Parsed.Input.EventId} \"{x.Parsed.Input.EventName}\" (triggers: {string.Join(",", x.Triggers)})");

                var result = await classifier.ClassifyBatchAsync(
                    chunk.Select(x => x.Parsed.Input).ToList(), budget.Token);
                if (result == null)
                    continue; // isolated failure - the next chunk may still succeed

                foreach (var (eventId, verdict) in result.Verdicts)
                {
                    verdictStore.Add(eventId, verdict);
                    newVerdicts++;
                }

                if (result.RateLimited)
                {
                    Console.WriteLine("Gemini rate limited - stopping classification for this fetch");
                    break;
                }
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
                // End of day at the *venue* (dates.timezone) so date-only
                // events survive until venue-local midnight instead of
                // dropping when UTC rolls over (~5-6 PM Mountain). Unknown
                // timezone: pad 12h past UTC midnight — covers every US offset.
                var endOfLocalDay = localDateOnly.Date.AddDays(1).AddTicks(-1);
                dateTime = ConvertVenueLocalToUtc(ev, endOfLocalDay)
                    ?? DateTime.SpecifyKind(endOfLocalDay.AddHours(12), DateTimeKind.Utc);
            }
        }

        return (dateTime, localDateStr, localTimeStr);
    }

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
                    if (first.ValueKind != JsonValueKind.Object) continue;
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

    private static string GetString(JsonElement el, string prop)
        => el.TryGetProperty(prop, out var val) ? val.GetString() ?? "" : "";
}
