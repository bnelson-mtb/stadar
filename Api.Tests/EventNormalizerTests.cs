using Api.Services;

namespace Api.Tests;

[TestClass]
public class EventNormalizerTests
{
    // ---------- NormalizeTeamName ----------

    [TestMethod]
    [DataRow("Utah Men's Basketball", "Utah")]
    [DataRow("Utah Women's Basketball", "Utah")]
    [DataRow("BYU Cougars Football", "BYU Cougars")]
    [DataRow("Utah Utes Womens Soccer", "Utah Utes")]
    [DataRow("LOVB Salt Lake Volleyball", "LOVB Salt Lake")]
    [DataRow("Utah Jazz", "Utah Jazz")]
    [DataRow("  Real Salt Lake  ", "Real Salt Lake")]
    [DataRow("", "")]
    public void NormalizeTeamName_StripsSuffixes(string input, string expected)
    {
        Assert.AreEqual(expected, EventNormalizer.NormalizeTeamName(input));
    }

    // ---------- Pro league classification ----------

    [TestMethod]
    [DataRow("NBA", "Basketball", "NBA")]
    [DataRow("nba", "Basketball", "NBA")]
    [DataRow("NHL", "Hockey", "NHL")]
    [DataRow("NFL", "Football", "NFL")]
    [DataRow("MLB", "Baseball", "MLB")]
    [DataRow("Major League Baseball", "Baseball", "MLB")]
    [DataRow("MLS", "Soccer", "MLS")]
    [DataRow("Major League Soccer", "Soccer", "MLS")]
    [DataRow("NWSL", "Soccer", "NWSL")]
    [DataRow("PLL", "Lacrosse", "PLL")]
    [DataRow("WNBA", "Basketball", "WNBA")]
    public void NormalizeEvent_ProLeague_FromSubGenre(string subGenre, string expectedSport, string expectedLeague)
    {
        var result = EventNormalizer.NormalizeEvent("Some Game", "Home", "Away", "", subGenre);
        Assert.AreEqual(expectedSport, result.Sport);
        Assert.AreEqual(expectedLeague, result.League);
    }

    // ---------- Minor league ----------

    [TestMethod]
    public void NormalizeEvent_UnknownMinorLeagueSubgenre_ReturnsMinorLeague()
    {
        // Generic "Minor League Hockey" with no known team names → falls back to Minor League
        var result = EventNormalizer.NormalizeEvent("Some Game", "Team A", "Team B", "Hockey", "Minor League Hockey");
        Assert.AreEqual("Hockey", result.Sport);
        Assert.AreEqual("Minor League", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_AhlTeamByName_ReturnsAhlLeague()
    {
        // Milwaukee Admirals is an AHL team — detected by name even when TM says "Minor League Hockey"
        var result = EventNormalizer.NormalizeEvent(
            "Admirals vs Wolves", "Milwaukee Admirals", "Chicago Wolves", "Hockey", "Minor League Hockey");
        Assert.AreEqual("Hockey", result.Sport);
        Assert.AreEqual("AHL", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_EchlTeamByName_ReturnsEchlLeague()
    {
        // Utah Grizzlies is an ECHL team — detected by name
        var result = EventNormalizer.NormalizeEvent(
            "Grizzlies vs Steelheads", "Utah Grizzlies", "Idaho Steelheads", "Hockey", "Minor League Hockey");
        Assert.AreEqual("Hockey", result.Sport);
        Assert.AreEqual("ECHL", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_MinorLeagueBaseball_UsesGenreForSport()
    {
        var result = EventNormalizer.NormalizeEvent("Bees vs Aces", "Salt Lake Bees", "Reno Aces", "Baseball", "Minor League Baseball");
        Assert.AreEqual("Baseball", result.Sport);
        Assert.AreEqual("Minor League", result.League);
    }

    // ---------- NWSL by team name ----------

    [TestMethod]
    public void NormalizeEvent_NwslTeam_DetectedByName()
    {
        // TM often mislabels NWSL games — detection falls back to team name
        var result = EventNormalizer.NormalizeEvent("Utah Royals vs Portland Thorns", "Utah Royals", "Portland Thorns", "Soccer", "");
        Assert.AreEqual("Soccer", result.Sport);
        Assert.AreEqual("NWSL", result.League);
    }

    // ---------- LOVB ----------

    [TestMethod]
    public void NormalizeEvent_Lovb_DetectedByName()
    {
        var result = EventNormalizer.NormalizeEvent("LOVB Salt Lake Volleyball vs LOVB Austin Volleyball", "LOVB Salt Lake Volleyball", "LOVB Austin Volleyball", "", "");
        Assert.AreEqual("Volleyball", result.Sport);
        Assert.AreEqual("LOVB", result.League);
        Assert.AreEqual("LOVB Salt Lake", result.HomeTeam);
        Assert.AreEqual("LOVB Austin", result.AwayTeam);
    }

    // ---------- College ----------

    [TestMethod]
    public void NormalizeEvent_CollegeBasketball_MensByDefault()
    {
        var result = EventNormalizer.NormalizeEvent("Utah Men's Basketball vs BYU", "Utah Men's Basketball", "BYU", "Basketball", "College");
        Assert.AreEqual("Basketball", result.Sport);
        Assert.AreEqual("NCAAM", result.League);
        Assert.AreEqual("Utah", result.HomeTeam);
    }

    [TestMethod]
    public void NormalizeEvent_CollegeBasketball_WomensFromTitle()
    {
        var result = EventNormalizer.NormalizeEvent("Utah Women's Basketball vs BYU", "Utah Women's Basketball", "BYU", "Basketball", "College");
        Assert.AreEqual("NCAAW", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_CollegeFootball()
    {
        var result = EventNormalizer.NormalizeEvent("Utah Utes Football vs USC", "Utah Utes Football", "USC", "Football", "College");
        Assert.AreEqual("Football", result.Sport);
        Assert.AreEqual("NCAAF", result.League);
        Assert.AreEqual("Utah Utes", result.HomeTeam);
    }

    [TestMethod]
    public void NormalizeEvent_CollegeSport_GuessedFromTitleWhenGenreMissing()
    {
        var result = EventNormalizer.NormalizeEvent("Utah Softball vs Arizona Softball", "Utah Softball", "Arizona Softball", "", "NCAA");
        Assert.AreEqual("Softball", result.Sport);
        Assert.AreEqual("NCAA Softball", result.League);
    }

    // ---------- Fallbacks ----------

    [TestMethod]
    public void NormalizeEvent_KnownGenre_NoLeague()
    {
        var result = EventNormalizer.NormalizeEvent("Some Hockey Game", "Team A", "Team B", "Ice Hockey", "");
        Assert.AreEqual("Hockey", result.Sport);
        Assert.AreEqual("", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_MiscellaneousGenre_GuessesFromTitle()
    {
        var result = EventNormalizer.NormalizeEvent("Champions Volleyball Classic", "Team A", "Team B", "Miscellaneous", "");
        Assert.AreEqual("Volleyball", result.Sport);
    }

    [TestMethod]
    public void NormalizeEvent_NothingRecognizable_ReturnsMisc()
    {
        var result = EventNormalizer.NormalizeEvent("Monster Truck Rally", "Truck A", "Truck B", "Motorsports", "");
        Assert.AreEqual("Misc", result.Sport);
        Assert.AreEqual("", result.League);
    }
}
