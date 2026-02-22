using System.Text.Json;

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
                var parsed = eventName[(vsIndex + 4)..].Trim();
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

        // Get sport/league from classifications
        var sport = "";
        var league = "";
        if (ev.TryGetProperty("classifications", out var classifications))
        {
            var classification = classifications.EnumerateArray().FirstOrDefault();
            if (classification.TryGetProperty("genre", out var genre))
                sport = genre.TryGetProperty("name", out var gName) ? gName.GetString() ?? "" : "";
            if (classification.TryGetProperty("subGenre", out var subGenre))
                league = subGenre.TryGetProperty("name", out var sgName) ? sgName.GetString() ?? "" : "";
        }

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
