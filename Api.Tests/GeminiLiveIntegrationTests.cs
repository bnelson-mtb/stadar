using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

/// <summary>
/// Hits the real Gemini API. Inconclusive (skipped) unless GEMINI_API_KEY is
/// set in the environment. Costs 2 free-tier requests per run.
/// </summary>
[TestClass]
public class GeminiLiveIntegrationTests
{
    private static GeminiEventClassifier? MakeRealClassifier()
    {
        var key = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(key)) return null;
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Gemini:ApiKey"] = key,
        }).Build();
        return new GeminiEventClassifier(new HttpClient(), config);
    }

    private static ClassificationInput Input(string name, string home, string away, string genre, string subGenre) =>
        new(
            EventId: "live-test", EventName: name,
            RawHomeTeam: home, RawAwayTeam: away,
            RawSport: genre, RawLeague: subGenre,
            DraftHomeTeam: home, DraftAwayTeam: away,
            DraftSport: genre == "" ? "Other" : genre, DraftLeague: "Other",
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-06");

    [TestMethod]
    public async Task BlockParty_IsJudgedNotAGame()
    {
        var classifier = MakeRealClassifier();
        if (classifier == null) { Assert.Inconclusive("Set GEMINI_API_KEY to run live tests."); return; }

        var verdict = await classifier.ClassifyAsync(
            Input("Utah Jazz Block Party", "Utah Jazz", "", "Basketball", "NBA"), CancellationToken.None);

        Assert.IsNotNull(verdict, "expected a verdict from the live API");
        Assert.IsFalse(verdict.IsSpectatorGame, $"expected junk verdict, got: {verdict.Reason}");
    }

    [TestMethod]
    public async Task RealGame_IsJudgedAGameWithLeague()
    {
        var classifier = MakeRealClassifier();
        if (classifier == null) { Assert.Inconclusive("Set GEMINI_API_KEY to run live tests."); return; }

        var verdict = await classifier.ClassifyAsync(
            Input("Utah Grizzlies vs. Idaho Steelheads", "Utah Grizzlies", "Idaho Steelheads", "Hockey", "Minor League"),
            CancellationToken.None);

        Assert.IsNotNull(verdict, "expected a verdict from the live API");
        Assert.IsTrue(verdict.IsSpectatorGame, $"expected real-game verdict, got: {verdict.Reason}");
        Assert.AreEqual("ECHL", verdict.League, $"reason: {verdict.Reason}");
    }
}
