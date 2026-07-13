using Api.Models;
using Api.Services;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient<TicketmasterClient>();
builder.Services.AddHttpClient<SeatGeekClient>();
builder.Services.AddMemoryCache();

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

// Extra origins (e.g. a separately hosted client) via Cors:AllowedOrigins
// (env: Cors__AllowedOrigins__0, Cors__AllowedOrigins__1, ...).
// Not needed when the API serves the client from wwwroot (same origin).
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "https://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // In production the container sits behind the host's TLS-terminating
    // proxy, which enforces HTTPS; the app itself only listens on HTTP.
    app.UseHttpsRedirection();
}

app.UseCors();

// Serve the built client (copied into wwwroot by the Dockerfile).
// index.html must revalidate on every load (no-cache) or browsers cache it
// heuristically and returning visitors keep the previous deploy's bundle.
// Hashed /assets/ files never change content, so they cache forever.
var staticFiles = new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl =
            ctx.Context.Request.Path.StartsWithSegments("/assets")
                ? "public, max-age=31536000, immutable"
                : "no-cache";
    }
};
app.UseDefaultFiles();
app.UseStaticFiles(staticFiles);

// Log every API request so failures can be traced to "reached the app or
// not" from container logs. Static/SPA traffic is excluded to keep noise down.
app.Use(async (ctx, next) =>
{
    await next();
    if (ctx.Request.Path.StartsWithSegments("/api"))
        Console.WriteLine(
            $"{ctx.Request.Method} {ctx.Request.Path}{ctx.Request.QueryString} " +
            $"-> {ctx.Response.StatusCode} [{ctx.Request.Protocol}, ua: {ctx.Request.Headers.UserAgent.ToString()[..Math.Min(40, ctx.Request.Headers.UserAgent.ToString().Length)]}]");
});

// Liveness probe for hosting platforms.
app.MapGet("/healthz", () => Results.Ok("ok"));

// Path says "games", not "events": ad-block filter lists (EasyPrivacy,
// AdGuard) match "/api/event" URL fragments and kill the fetch client-side.
app.MapGet("/api/games", async (TicketmasterClient ticketmaster, IMemoryCache cache, HttpContext ctx) =>
{
    // Validate state code, default to "UT"
    var stateCode = ctx.Request.Query["stateCode"].FirstOrDefault() ?? "UT";
    if (stateCode.Length != 2 || !stateCode.All(char.IsLetter))
        stateCode = "UT";
    stateCode = stateCode.ToUpperInvariant();

    // Serve from cache when fresh; otherwise fetch from Ticketmaster.
    // Failed fetches are not cached, so a Ticketmaster hiccup doesn't stick for 5 minutes.
    var cacheKey = $"events:{stateCode}";
    if (!cache.TryGetValue(cacheKey, out List<SportEvent>? events))
    {
        Console.WriteLine($"Cache miss — fetching events from Ticketmaster for state: {stateCode}");
        events = await ticketmaster.GetEventsAsync(stateCode);
        if (events != null)
            cache.Set(cacheKey, events, TimeSpan.FromMinutes(5));
    }

    if (events == null)
        return Results.Problem("Failed to fetch events from Ticketmaster");

    return Results.Ok(events);
})
.WithName("GetEvents");

app.MapGet("/api/games/{id}", async (string id, TicketmasterClient ticketmaster, IMemoryCache cache) =>
{
    var cacheKey = $"event:{id}";
    if (!cache.TryGetValue(cacheKey, out SportEvent? ev))
    {
        ev = await ticketmaster.GetEventByIdAsync(id);
        if (ev != null)
            cache.Set(cacheKey, ev, TimeSpan.FromMinutes(5));
    }

    return ev == null ? Results.NotFound() : Results.Ok(ev);
})
.WithName("GetEventById");

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

// Client-side routing: send unmatched non-API paths to the SPA.
app.MapFallbackToFile("index.html", staticFiles);

app.Run();
