using Api.Models;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class EventFilterTests
{
    // ---------- Helpers ----------

    private static SportEvent MakeEvent(
        string name,
        string homeTeam = "Home Team",
        string awayTeam = "Away Team",
        DateTime? dateTime = null,
        string sport = "Basketball",
        string league = "NBA") =>
        new SportEvent(
            Id: "test-id",
            Name: name,
            HomeTeam: homeTeam,
            AwayTeam: awayTeam,
            DateTime: dateTime ?? DateTime.UtcNow.AddDays(1),
            Venue: "Test Arena",
            Sport: sport,
            League: league,
            City: "Test City",
            State: "UT",
            Latitude: 40.76,
            Longitude: -111.89,
            TicketUrl: "https://example.com/tickets",
            ImageUrl: "https://example.com/image.jpg"
        );

    // ---------- Must FAIL IsSpectatorEvent (dropped) ----------

    [TestMethod]
    public void IsSpectatorEvent_CancelledWatchParty_ReturnsFalse()
    {
        // CA snapshot fixture 1: Cancelled watch party — fails on status code
        var evt = MakeEvent(
            name: "World Cup 26 Watch Party (England v Croatia) - CANCELLED",
            sport: "Soccer",
            league: "");

        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, statusCode: "canceled"));
    }

    [TestMethod]
    public void IsSpectatorEvent_FishingEvent_ReturnsFalse()
    {
        // CA snapshot fixture 2: Denylist match — "fishing"
        var evt = MakeEvent(
            name: "Barrett Lake Fishing",
            sport: "Misc",
            league: "");

        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_NonSportingSingleAct_ReturnsFalse()
    {
        // CA snapshot fixture 3: Unrecognized sport (Misc), single act
        var evt = MakeEvent(
            name: "Todd Edwards",
            sport: "Misc",
            league: "");

        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_PlaceholderHomeTeamNoLeague_ReturnsFalse()
    {
        // CA snapshot fixture 4: HomeTeam contains "World Cup" — placeholder team, no league
        var evt = MakeEvent(
            name: "2026 World Cup vs Bosnia & Herzegovina National Football Team",
            homeTeam: "2026 World Cup",
            awayTeam: "Bosnia & Herzegovina National Football Team",
            sport: "Soccer",
            league: "");

        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_PastEvent_ReturnsFalse()
    {
        // CA snapshot fixture 6: DateTime in the past
        var evt = MakeEvent(
            name: "Past NBA Game",
            homeTeam: "Utah Jazz",
            awayTeam: "Denver Nuggets",
            dateTime: DateTime.UtcNow.AddDays(-1),
            sport: "Basketball",
            league: "NBA");

        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    // ---------- Must PASS IsSpectatorEvent (kept) ----------

    [TestMethod]
    public void IsSpectatorEvent_WnbaGame_ReturnsTrue()
    {
        // CA snapshot fixture 7: WNBA — recognized league
        var evt = MakeEvent(
            name: "Golden State Valkyries vs Dallas Wings",
            homeTeam: "Golden State Valkyries",
            awayTeam: "Dallas Wings",
            sport: "Basketball",
            league: "WNBA");

        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_NhlGame_ReturnsTrue()
    {
        // CA snapshot fixture 8: NHL — recognized league
        var evt = MakeEvent(
            name: "Anaheim Ducks vs Opposing Team",
            homeTeam: "Anaheim Ducks",
            awayTeam: "Opposing Team",
            sport: "Hockey",
            league: "NHL");

        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_SingleABaseballGame_ReturnsTrue()
    {
        // Single-A affiliated game — level-specific league passes
        var evt = MakeEvent(
            name: "Stockton Ports vs Visalia Rawhide",
            homeTeam: "Stockton Ports",
            awayTeam: "Visalia Rawhide",
            sport: "Baseball",
            league: "Single-A");

        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_ClubVsClubSoccerNoLeague_ReturnsTrue()
    {
        // CA snapshot fixture 10: No league, but clear club-vs-club matchup with "vs" in name
        var evt = MakeEvent(
            name: "Oakland Roots vs Birmingham Legion FC",
            homeTeam: "Oakland Roots",
            awayTeam: "Birmingham Legion FC",
            sport: "Soccer",
            league: "");

        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }

    [TestMethod]
    public void IsSpectatorEvent_ClubVClubSoccerNoLeague_ReturnsTrue()
    {
        var evt = MakeEvent(
            name: "Oakland Roots v Birmingham Legion FC",
            homeTeam: "Oakland Roots",
            awayTeam: "Birmingham Legion FC",
            sport: "Soccer",
            league: "");

        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, statusCode: "onsale"));
    }
}
