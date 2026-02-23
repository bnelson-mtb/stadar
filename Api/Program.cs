using System.Text.Json;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/api/events", async (IHttpClientFactory httpClientFactory, IConfiguration config) =>
{
    var apiKey = config["Ticketmaster:ApiKey"];
    if (string.IsNullOrEmpty(apiKey))
        return Results.Problem("Ticketmaster API key not configured");

    var client = httpClientFactory.CreateClient();
    var url = $"https://app.ticketmaster.com/discovery/v2/events.json?apikey={apiKey}&stateCode=UT&classificationName=sports&size=50&sort=date,asc";

    var response = await client.GetAsync(url);
    if (!response.IsSuccessStatusCode)
        return Results.Problem("Failed to fetch events from Ticketmaster");

    var json = await response.Content.ReadFromJsonAsync<JsonElement>();

    if (!json.TryGetProperty("_embedded", out var embedded) ||
        !embedded.TryGetProperty("events", out var eventsArray))
    {
        return Results.Ok(Array.Empty<SportEvent>());
    }

    var events = new List<SportEvent>();

    foreach (var ev in eventsArray.EnumerateArray())
    {
        // Get Ticketmaster event ID and name
        var tmId = ev.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "";
        var eventName = ev.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "";

        // Get team names from attractions
        var homeTeam = "";
        var awayTeam = "";
        if (ev.TryGetProperty("_embedded", out var evEmbedded) &&
            evEmbedded.TryGetProperty("attractions", out var attractions))
        {
            var teams = attractions.EnumerateArray().ToList();
            if (teams.Count >= 1) homeTeam = teams[0].GetProperty("name").GetString() ?? "";
            if (teams.Count >= 2) awayTeam = teams[1].GetProperty("name").GetString() ?? "";
        }

        // Fallback: parse event name for "X vs Y" pattern when away team is missing
        if (!string.IsNullOrEmpty(eventName) && string.IsNullOrEmpty(awayTeam))
        {
            var vsIndex = eventName.IndexOf("vs", StringComparison.OrdinalIgnoreCase);
            if (vsIndex >= 0)
            {
                var parsed = eventName[(vsIndex + 3)..].Trim();
                if (!string.IsNullOrEmpty(parsed))
                {
                    awayTeam = parsed;
                    if (string.IsNullOrEmpty(homeTeam))
                        homeTeam = eventName[..vsIndex].Trim();
                }
            }
        }

        // Skip events with no identifiable teams
        if (string.IsNullOrEmpty(homeTeam)) continue;

        // Get date/time
        var dateTime = DateTime.UtcNow;
        if (ev.TryGetProperty("dates", out var dates) &&
            dates.TryGetProperty("start", out var start))
        {
            if (start.TryGetProperty("dateTime", out var dtProp))
                DateTime.TryParse(dtProp.GetString(), out dateTime);
            else if (start.TryGetProperty("localDate", out var localDate))
                DateTime.TryParse(localDate.GetString(), out dateTime);
        }

        // Get venue info
        var venue = "";
        var city = "";
        var state = "";
        double lat = 0, lng = 0;
        if (ev.TryGetProperty("_embedded", out var evEmb2) &&
            evEmb2.TryGetProperty("venues", out var venues))
        {
            var v = venues.EnumerateArray().FirstOrDefault();
            venue = v.TryGetProperty("name", out var vName) ? vName.GetString() ?? "" : "";
            if (v.TryGetProperty("city", out var vCity))
                city = vCity.TryGetProperty("name", out var cName) ? cName.GetString() ?? "" : "";
            if (v.TryGetProperty("state", out var vState))
                state = vState.TryGetProperty("stateCode", out var sCode) ? sCode.GetString() ?? "" : "";
            if (v.TryGetProperty("location", out var loc))
            {
                if (loc.TryGetProperty("latitude", out var latProp))
                    double.TryParse(latProp.GetString(), out lat);
                if (loc.TryGetProperty("longitude", out var lngProp))
                    double.TryParse(lngProp.GetString(), out lng);
            }
        }

        // Get raw sport/league from Ticketmaster classifications
        var rawSport = "";
        var rawLeague = "";
        if (ev.TryGetProperty("classifications", out var classifications))
        {
            var classification = classifications.EnumerateArray().FirstOrDefault();
            if (classification.TryGetProperty("genre", out var genre))
                rawSport = genre.TryGetProperty("name", out var gName) ? gName.GetString() ?? "" : "";
            if (classification.TryGetProperty("subGenre", out var subGenre))
                rawLeague = subGenre.TryGetProperty("name", out var sgName) ? sgName.GetString() ?? "" : "";
        }

        var normalized = NormalizeEvent(eventName, homeTeam, awayTeam, rawSport, rawLeague);
        homeTeam = normalized.HomeTeam;
        awayTeam = normalized.AwayTeam;
        var sport = normalized.Sport;
        var league = normalized.League;

        // Get ticket URL
        var ticketUrl = ev.TryGetProperty("url", out var urlProp) ? urlProp.GetString() ?? "" : "";

        // Get event image
        var imageUrl = "";
        if (ev.TryGetProperty("images", out var images))
        {
            // Prefer a 16:9 ratio image
            foreach (var img in images.EnumerateArray())
            {
                var ratio = img.TryGetProperty("ratio", out var rProp) ? rProp.GetString() : "";
                var imgUrl = img.TryGetProperty("url", out var iProp) ? iProp.GetString() ?? "" : "";
                if (ratio == "16_9" && !string.IsNullOrEmpty(imgUrl))
                {
                    imageUrl = imgUrl;
                    break;
                }
                if (string.IsNullOrEmpty(imageUrl) && !string.IsNullOrEmpty(imgUrl))
                    imageUrl = imgUrl;
            }
        }

        events.Add(new SportEvent(
            tmId, eventName, homeTeam, awayTeam, dateTime, venue, sport, league,
            city, state, lat, lng, ticketUrl, imageUrl
        ));
    }

    return Results.Ok(events);
})
.WithName("GetEvents");

app.Run();

static (string HomeTeam, string AwayTeam, string Sport, string League) NormalizeEvent(
    string eventName,
    string homeTeam,
    string awayTeam,
    string rawSport,
    string rawLeague)
{
    string normalizedHome = NormalizeTeamName(homeTeam ?? "") ?? "";
    string normalizedAway = NormalizeTeamName(awayTeam ?? "") ?? "";
    (string HomeTeam, string AwayTeam, string Sport, string League) AsNormalized(string sport, string league)
        => (normalizedHome ?? "", normalizedAway ?? "", sport, league);

    var title = (eventName ?? "").ToLowerInvariant();
    var lowerHome = (normalizedHome ?? "").ToLowerInvariant();
    var lowerAway = (normalizedAway ?? "").ToLowerInvariant();
    var lowerSport = (rawSport ?? "").ToLowerInvariant();
    var lowerLeague = (rawLeague ?? "").ToLowerInvariant();

    bool mentionsMens = ContainsAny(title, "men's", "mens", "men ");
    bool mentionsWomens = ContainsAny(title, "women's", "womens", "women ");
    bool hasCollegeTeamWord = ContainsAny(lowerHome, "utes", "cougars", "aggies", "wildcats", "bearcats", "cyclones", "jayhawks", "mountaineers")
                              || ContainsAny(lowerAway, "utes", "cougars", "aggies", "wildcats", "bearcats", "cyclones", "jayhawks", "mountaineers");
    bool isCollegeContext = hasCollegeTeamWord || ContainsAny(lowerLeague, "college", "ncaa");
    bool likelyNwsl = ContainsAny(title, "nwsl")
                      || ContainsAny(lowerHome, "utah royals", "gotham fc", "portland thorns", "angel city", "washington spirit")
                      || ContainsAny(lowerAway, "utah royals", "gotham fc", "portland thorns", "angel city", "washington spirit");

    // Pro league explicit mappings first.
    if (likelyNwsl)
    {
        return AsNormalized("Soccer", "NWSL");
    }

    if (ContainsAny(lowerHome, "lovb ") || ContainsAny(lowerAway, "lovb "))
    {
        return AsNormalized(mentionsWomens ? "Women's Volleyball" : "Volleyball", "LOVB");
    }

    if (ContainsAny(lowerLeague, "major league soccer") || lowerLeague == "mls")
        return AsNormalized("Soccer", "MLS");

    if (lowerLeague == "nba" || ContainsAny(lowerSport, "basketball") && ContainsAny(lowerHome, "lakers", "jazz", "nuggets", "warriors"))
        return AsNormalized("Basketball", "NBA");

    if (lowerLeague == "nhl" || ContainsAny(lowerSport, "hockey") && ContainsAny(lowerHome, "mammoth", "avalanche", "golden knights", "oilers"))
        return AsNormalized("Hockey", "NHL");

    if (lowerLeague == "nfl")
        return AsNormalized("Football", "NFL");

    if (ContainsAny(lowerLeague, "major league baseball") || lowerLeague == "mlb")
        return AsNormalized("Baseball", "MLB");

    if (lowerLeague == "premier lacrosse league" || lowerLeague == "pll")
        return AsNormalized("Lacrosse", "PLL");

    if (ContainsAny(lowerLeague, "echl", "ahl", "minor"))
        return AsNormalized("Hockey", "Minor League");

    // College buckets and NCAA-style labels.
    if (ContainsAny(lowerSport, "football") || ContainsAny(title, " football"))
        return AsNormalized("Football", isCollegeContext ? "NCAAF" : "Football");

    if (ContainsAny(lowerSport, "baseball") || ContainsAny(title, "baseball"))
        return AsNormalized("Baseball", isCollegeContext ? "NCAA Baseball" : "MLB");

    if (ContainsAny(lowerSport, "softball") || ContainsAny(title, "softball"))
        return AsNormalized("Softball", isCollegeContext ? "NCAA Softball" : "Softball");

    if (ContainsAny(lowerSport, "basketball") || ContainsAny(title, "basketball"))
    {
        if (mentionsWomens) return AsNormalized("Basketball", "NCAAW");
        if (mentionsMens) return AsNormalized("Basketball", "NCAAM");
        return AsNormalized("Basketball", isCollegeContext ? "NCAAM" : "Basketball");
    }

    if (ContainsAny(lowerSport, "volleyball") || ContainsAny(title, "volleyball"))
    {
        if (mentionsWomens) return AsNormalized("Women's Volleyball", "Women's VB");
        if (mentionsMens) return AsNormalized("Volleyball", "Men's VB");
        return AsNormalized("Volleyball", "Volleyball");
    }

    if (ContainsAny(lowerSport, "soccer") || ContainsAny(title, "fc"))
    {
        if (mentionsWomens) return AsNormalized("Soccer", likelyNwsl ? "NWSL" : "Women's Soccer");
        if (mentionsMens) return AsNormalized("Soccer", "Men's Soccer");
        return AsNormalized("Soccer", "Soccer");
    }

    // Last-resort cleanup for unclear labels like "Miscellaneous".
    if (lowerSport == "miscellaneous" || lowerSport == "misc")
    {
        if (ContainsAny(title, "soccer", "fc")) return AsNormalized("Soccer", mentionsWomens ? (likelyNwsl ? "NWSL" : "Women's Soccer") : "Soccer");
        if (ContainsAny(title, "volleyball")) return AsNormalized(mentionsWomens ? "Women's Volleyball" : "Volleyball", mentionsWomens ? "Women's VB" : mentionsMens ? "Men's VB" : "Volleyball");
        if (ContainsAny(title, "basketball")) return AsNormalized("Basketball", mentionsWomens ? "NCAAW" : "NCAAM");
        if (ContainsAny(title, "football")) return AsNormalized("Football", isCollegeContext ? "NCAAF" : "Football");
        if (ContainsAny(title, "baseball")) return AsNormalized("Baseball", isCollegeContext ? "NCAA Baseball" : "MLB");
        if (ContainsAny(title, "softball")) return AsNormalized("Softball", isCollegeContext ? "NCAA Softball" : "Softball");
    }

    if (ContainsAny(lowerSport, "wrestling", "ice skating"))
        return AsNormalized("Misc", "Misc");

    var fallbackSport = ToTitle(rawSport);
    var fallbackLeague = ToTitle(rawLeague);
    if (!IsCoreSport(fallbackSport))
        return AsNormalized("Misc", "Misc");

    return AsNormalized(fallbackSport, string.IsNullOrWhiteSpace(fallbackLeague) ? fallbackSport : fallbackLeague);
}

static string NormalizeTeamName(string teamName)
{
    if (string.IsNullOrWhiteSpace(teamName)) return "";

    var normalized = teamName.Trim();
    normalized = Regex.Replace(
        normalized,
        @"^LOVB\s+(.+?)\s+Volleyball$",
        "LOVB $1",
        RegexOptions.IgnoreCase);
    normalized = Regex.Replace(
        normalized,
        @"\s+(Men'?s|Women'?s|Mens|Womens)\s+(Basketball|Volleyball|Soccer)\s*$",
        "",
        RegexOptions.IgnoreCase);
    normalized = Regex.Replace(
        normalized,
        @"\s+(Football|Baseball|Softball|Gymnastics)\s*$",
        "",
        RegexOptions.IgnoreCase);

    return normalized.Trim();
}

static bool IsCoreSport(string sport)
{
    if (string.IsNullOrWhiteSpace(sport)) return false;
    return sport.Equals("Basketball", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Volleyball", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Women's Volleyball", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Football", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Baseball", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Softball", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Soccer", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Hockey", StringComparison.OrdinalIgnoreCase)
        || sport.Equals("Lacrosse", StringComparison.OrdinalIgnoreCase);
}

static bool ContainsAny(string value, params string[] needles)
{
    if (string.IsNullOrEmpty(value)) return false;
    foreach (var needle in needles)
    {
        if (value.Contains(needle, StringComparison.OrdinalIgnoreCase))
            return true;
    }
    return false;
}

static string ToTitle(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return "";
    return char.ToUpperInvariant(value[0]) + value[1..];
}

record SportEvent(
    string Id,
    string Name,
    string HomeTeam,
    string AwayTeam,
    DateTime DateTime,
    string Venue,
    string Sport,
    string League,
    string City,
    string State,
    double Latitude,
    double Longitude,
    string TicketUrl,
    string ImageUrl
);
