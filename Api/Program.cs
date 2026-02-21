var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

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

app.MapGet("/api/events", () =>
{
    var events = new List<SportEvent>
    {
        new(1, "Utah Jazz", "Los Angeles Lakers", new DateTime(2026, 2, 24, 19, 0, 0), "Delta Center", "Basketball", "NBA", "Salt Lake City", 40.7683, -111.9011),
        new(2, "Utah Jazz", "Golden State Warriors", new DateTime(2026, 2, 28, 20, 30, 0), "Delta Center", "Basketball", "NBA", "Salt Lake City", 40.7683, -111.9011),
        new(3, "Real Salt Lake", "LAFC", new DateTime(2026, 3, 1, 19, 30, 0), "America First Field", "Soccer", "MLS", "Sandy", 40.5829, -111.8933),
        new(4, "Utah Utes", "BYU Cougars", new DateTime(2026, 3, 5, 18, 0, 0), "Jon M. Huntsman Center", "Basketball", "NCAA", "Salt Lake City", 40.7627, -111.8310),
        new(5, "Utah Hockey Club", "Colorado Avalanche", new DateTime(2026, 3, 7, 19, 0, 0), "Delta Center", "Hockey", "NHL", "Salt Lake City", 40.7683, -111.9011),
        new(6, "Real Salt Lake", "Portland Timbers", new DateTime(2026, 3, 8, 18, 0, 0), "America First Field", "Soccer", "MLS", "Sandy", 40.5829, -111.8933),
        new(7, "Utah Utes", "Arizona Wildcats", new DateTime(2026, 3, 12, 20, 0, 0), "Rice-Eccles Stadium", "Football", "NCAA", "Salt Lake City", 40.7600, -111.8492),
        new(8, "Utah Jazz", "Denver Nuggets", new DateTime(2026, 3, 14, 19, 0, 0), "Delta Center", "Basketball", "NBA", "Salt Lake City", 40.7683, -111.9011),
        new(9, "Utah Mammoth", "San Diego Seals", new DateTime(2026, 3, 15, 18, 0, 0), "Maverik Center", "Lacrosse", "NLL", "West Valley City", 40.6840, -111.9511),
        new(10, "Utah Hockey Club", "Vegas Golden Knights", new DateTime(2026, 3, 20, 19, 30, 0), "Delta Center", "Hockey", "NHL", "Salt Lake City", 40.7683, -111.9011),
    };

    return events.OrderBy(e => e.DateTime).ToArray();
})
.WithName("GetEvents");

app.Run();

record SportEvent(
    int Id,
    string HomeTeam,
    string AwayTeam,
    DateTime DateTime,
    string Venue,
    string Sport,
    string League,
    string City,
    double Latitude,
    double Longitude
);
