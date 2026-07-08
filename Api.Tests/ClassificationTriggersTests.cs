using Api.Models;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class ClassificationTriggersTests
{
    private static readonly IReadOnlySet<string> Teams =
        new HashSet<string>(["Utah Jazz", "Denver Nuggets"], StringComparer.OrdinalIgnoreCase);

    private static ClassificationInput MakeInput(
        string name = "Utah Jazz vs. Denver Nuggets",
        string home = "Utah Jazz",
        string away = "Denver Nuggets",
        string sport = "Basketball",
        string league = "NBA") =>
        new(
            EventId: "evt-1", EventName: name,
            RawHomeTeam: home, RawAwayTeam: away,
            RawSport: sport, RawLeague: league,
            DraftHomeTeam: home, DraftAwayTeam: away,
            DraftSport: sport, DraftLeague: league,
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-01");

    [TestMethod]
    public void CleanMajorLeagueMatchup_FiresNothing()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void UnknownHomeTeam_FiresUnknownTeam()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Springville Flyers vs. Denver Nuggets", home: "Springville Flyers"), Teams);
        CollectionAssert.Contains(fired.ToList(), "unknown-team");
    }

    [TestMethod]
    public void TeamMatch_IsCaseInsensitive()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(home: "UTAH JAZZ"), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void EmptyAwayTeam_WithMatchupTitle_DoesNotFireUnknownTeamOrNoMatchup()
    {
        // Away extracted as empty but the title still reads like a matchup.
        var fired = ClassificationTriggers.Evaluate(MakeInput(away: ""), Teams);
        Assert.AreEqual(0, fired.Count);
    }

    [TestMethod]
    public void OtherLeague_FiresUnclassified()
    {
        var fired = ClassificationTriggers.Evaluate(MakeInput(league: "Other"), Teams);
        CollectionAssert.Contains(fired.ToList(), "unclassified");
    }

    [TestMethod]
    public void OtherLeague_NonMatchupTitle_AlsoFiresWouldBeDropped()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Monster Truck Showdown", home: "Monster Trucks", away: "", league: "Other", sport: "Other"),
            Teams).ToList();
        CollectionAssert.Contains(fired, "unclassified");
        CollectionAssert.Contains(fired, "would-be-dropped");
    }

    [TestMethod]
    public void BlockParty_KnownTeamRealLeagueNoMatchup_FiresNoMatchupPass()
    {
        var fired = ClassificationTriggers.Evaluate(
            MakeInput(name: "Utah Jazz Block Party", away: ""), Teams).ToList();
        CollectionAssert.Contains(fired, "no-matchup-pass");
        CollectionAssert.DoesNotContain(fired, "unknown-team");
    }

    [TestMethod]
    public void SchemaLeagues_CoverEverythingTheNormalizerCanProduce()
    {
        string[] normalizerLeagues =
        [
            "NBA", "WNBA", "NHL", "NFL", "MLB", "MLS", "NWSL", "PLL", "IAL",
            "USL", "Liga MX", "World Cup", "International", "AHL", "ECHL", "LOVB",
            "NCAAM", "NCAAW", "NCAAF", "NCAA Baseball", "NCAA Softball",
            "NCAA WVB", "NCAA MVB", "NCAA VB",
            "Women's Soccer", "Men's Soccer", "NCAA Soccer", "NCAA",
            "Triple-A", "Double-A", "High-A", "Single-A", "Other",
        ];
        foreach (var league in normalizerLeagues)
            Assert.IsTrue(ClassificationSchema.Leagues.Contains(league), $"schema missing league: {league}");
    }

    [TestMethod]
    public void KnownTeams_LoadsWithoutThrowing()
    {
        // Placeholder or generated file — either way loading must not throw.
        Assert.IsNotNull(KnownTeams.Names);
    }
}
