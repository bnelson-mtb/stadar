using Api.Services;

namespace Api.Tests;

[TestClass]
public class MinorLeagueBaseballTests
{
    [TestMethod]
    [DataRow("Salt Lake Bees", "Triple-A")]
    [DataRow("Reno Aces", "Triple-A")]
    [DataRow("Toledo Mud Hens", "Triple-A")]
    [DataRow("Portland Sea Dogs", "Double-A")]
    [DataRow("Tulsa Drillers", "Double-A")]
    [DataRow("Dayton Dragons", "High-A")]
    [DataRow("Lake Elsinore Storm", "Single-A")]
    public void MatchLevel_KnownTeams_ReturnsLevel(string team, string expected)
    {
        Assert.AreEqual(expected, MinorLeagueBaseball.MatchLevel(team));
    }

    [TestMethod]
    [DataRow("Some Random Team")]
    [DataRow("")]
    [DataRow(null)]
    public void MatchLevel_UnknownOrEmpty_ReturnsNull(string? team)
    {
        Assert.IsNull(MinorLeagueBaseball.MatchLevel(team!));
    }
}
