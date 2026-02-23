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

app.MapGet("/api/events", async (IHttpClientFactory httpClientFactory, IConfiguration config, HttpContext ctx) =>
{
    var apiKey = config["Ticketmaster:ApiKey"];
    if (string.IsNullOrEmpty(apiKey))
        return Results.Problem("Ticketmaster API key not configured");

    var stateCode = ctx.Request.Query["stateCode"].FirstOrDefault() ?? "UT";
    if (stateCode.Length != 2 || !stateCode.All(char.IsLetter))
        stateCode = "UT";
    stateCode = stateCode.ToUpperInvariant();

    var client = httpClientFactory.CreateClient();
    var url = $"https://app.ticketmaster.com/discovery/v2/events.json?apikey={apiKey}&stateCode={stateCode}&classificationName=sports&size=50&sort=date,asc";

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

// ---------- Normalization (location-agnostic) ----------

static (string HomeTeam, string AwayTeam, string Sport, string League) NormalizeEvent(
    string eventName,
    string homeTeam,
    string awayTeam,
    string rawSport,
    string rawLeague)
{
    var normalizedHome = NormalizeTeamName(homeTeam ?? "");
    var normalizedAway = NormalizeTeamName(awayTeam ?? "");
    (string, string, string, string) Result(string sport, string league)
        => (normalizedHome, normalizedAway, sport, league);

    var title = (eventName ?? "").ToLowerInvariant();
    var lowerHome = normalizedHome.ToLowerInvariant();
    var lowerAway = normalizedAway.ToLowerInvariant();
    var lowerLeague = (rawLeague ?? "").Trim();
    var lowerSport = (rawSport ?? "").Trim();

    // 1. Direct pro league match from TM subGenre
    var proMatch = MatchProLeague(lowerLeague);
    if (proMatch.Sport != null)
        return Result(proMatch.Sport, proMatch.League!);

    // 2. Minor league hockey
    if (lowerLeague.Contains("echl", StringComparison.OrdinalIgnoreCase)
        || lowerLeague.Contains("ahl", StringComparison.OrdinalIgnoreCase)
        || lowerLeague.Contains("minor league", StringComparison.OrdinalIgnoreCase))        
        return Result("Hockey", "Minor League");

    // 3. LOVB (name-based, but not location-specific)
    if (lowerHome.Contains("lovb") || lowerAway.Contains("lovb"))
        return Result("Volleyball", "LOVB");

    // 4. College detection — TM tags these with "College" in subGenre
    bool isCollege = lowerLeague.Contains("college", StringComparison.OrdinalIgnoreCase)
                  || lowerLeague.Contains("ncaa", StringComparison.OrdinalIgnoreCase);

    if (isCollege)
    {
        var sport = ResolveSport(lowerSport, title);
        var league = ResolveCollegeLeague(sport, title);
        return Result(sport, league);
    }

    // 5. Resolve sport from TM genre
    var mappedSport = MapSport(lowerSport);
    if (mappedSport != null)
        return Result(mappedSport, mappedSport);

    // 6. Miscellaneous / missing genre — try to parse from event title
    if (string.IsNullOrWhiteSpace(lowerSport)
        || lowerSport.Equals("miscellaneous", StringComparison.OrdinalIgnoreCase))
    {
        var guessed = ResolveSport("", title);
        if (guessed != "Misc") return Result(guessed, guessed);
    }

    return Result("Misc", "Misc");
}

static (string? Sport, string? League) MatchProLeague(string subGenre)
{
    return subGenre.ToLowerInvariant() switch
    {
        "nba"                              => ("Basketball", "NBA"),
        "wnba"                             => ("Basketball", "WNBA"),
        "nhl"                              => ("Hockey", "NHL"),
        "nfl"                              => ("Football", "NFL"),
        "mlb"                              => ("Baseball", "MLB"),
        "major league baseball"            => ("Baseball", "MLB"),
        "mls"                              => ("Soccer", "MLS"),
        "major league soccer"              => ("Soccer", "MLS"),
        "nwsl"                             => ("Soccer", "NWSL"),
        "national women's soccer league"   => ("Soccer", "NWSL"),
        "premier lacrosse league"          => ("Lacrosse", "PLL"),
        "pll"                              => ("Lacrosse", "PLL"),
        _                                  => (null, null),
    };
}

static string? MapSport(string genre)
{
    return genre.ToLowerInvariant() switch
    {
        "basketball" => "Basketball",
        "football"   => "Football",
        "baseball"   => "Baseball",
        "softball"   => "Softball",
        "hockey"     => "Hockey",
        "ice hockey" => "Hockey",
        "soccer"     => "Soccer",
        "volleyball" => "Volleyball",
        "lacrosse"   => "Lacrosse",
        _            => null,
    };
}

static string ResolveSport(string rawSport, string title)
{
    var mapped = MapSport(rawSport);
    if (mapped != null) return mapped;

    // Guess from event title keywords
    if (title.Contains("basketball")) return "Basketball";
    if (title.Contains("football"))   return "Football";
    if (title.Contains("baseball"))   return "Baseball";
    if (title.Contains("softball"))   return "Softball";
    if (title.Contains("hockey"))     return "Hockey";
    if (title.Contains("soccer") || title.Contains(" fc")) return "Soccer";
    if (title.Contains("volleyball")) return "Volleyball";
    if (title.Contains("lacrosse"))   return "Lacrosse";
    return "Misc";
}

static string ResolveCollegeLeague(string sport, string title)
{
    bool mentionsWomens = title.Contains("women's") || title.Contains("womens") || title.Contains("women ");
    bool mentionsMens = title.Contains("men's") || title.Contains("mens") || title.Contains("men ");

    return sport switch
    {
        "Basketball" => mentionsWomens ? "NCAAW" : "NCAAM",
        "Football"   => "NCAAF",
        "Baseball"   => "NCAA Baseball",
        "Softball"   => "NCAA Softball",
        "Volleyball" => mentionsWomens ? "Women's VB" : mentionsMens ? "Men's VB" : "NCAA VB",
        "Soccer"     => mentionsWomens ? "Women's Soccer" : mentionsMens ? "Men's Soccer" : "NCAA Soccer",
        _            => "NCAA",
    };
}

static string NormalizeTeamName(string teamName)
{
    if (string.IsNullOrWhiteSpace(teamName)) return "";

    var normalized = teamName.Trim();
    normalized = Regex.Replace(normalized, @"^LOVB\s+(.+?)\s+Volleyball$", "LOVB $1", RegexOptions.IgnoreCase);
    normalized = Regex.Replace(normalized, @"\s+(Men'?s|Women'?s|Mens|Womens)\s+(Basketball|Volleyball|Soccer|Softball|Baseball|Football)\s*$", "", RegexOptions.IgnoreCase);
    normalized = Regex.Replace(normalized, @"\s+(Football|Baseball|Softball|Gymnastics)\s*$", "", RegexOptions.IgnoreCase);
    return normalized.Trim();
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
