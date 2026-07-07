using Api.Models;
using Api.Services;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient<TicketmasterClient>();
builder.Services.AddMemoryCache();

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
app.UseDefaultFiles();
app.UseStaticFiles();

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

// Client-side routing: send unmatched non-API paths to the SPA.
app.MapFallbackToFile("index.html");

app.Run();
