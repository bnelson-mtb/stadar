using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class PipelineIntegrationTests
{
    // ---------- Fakes ----------

    private sealed class FakeClassifier : IEventClassifier
    {
        public bool Enabled { get; set; } = true;
        public bool RateLimited { get; set; }
        public Dictionary<string, EventVerdict> Verdicts { get; } = [];
        public List<string> ClassifiedIds { get; } = [];
        public int BatchCalls { get; private set; }

        public bool IsEnabled => Enabled;

        public Task<BatchClassificationResult?> ClassifyBatchAsync(IReadOnlyList<ClassificationInput> inputs, CancellationToken ct)
        {
            BatchCalls++;
            if (RateLimited)
                return Task.FromResult<BatchClassificationResult?>(
                    new(new Dictionary<string, EventVerdict>(), RateLimited: true));

            ClassifiedIds.AddRange(inputs.Select(i => i.EventId));
            var found = inputs
                .Where(i => Verdicts.ContainsKey(i.EventId))
                .ToDictionary(i => i.EventId, i => Verdicts[i.EventId]);
            return Task.FromResult<BatchClassificationResult?>(new(found, RateLimited: false));
        }
    }

    private sealed class FakeTicketmasterHandler(string json) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            });
    }

    // ---------- Fixture data ----------

    private static string TmEvent(string id, string name, string[] attractions, string genre, string subGenre)
    {
        var attractionJson = string.Join(",", attractions.Select(a => $$"""{"name":"{{a}}","classifications":[]}"""));
        var date = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ");
        return $$"""
        {
          "id": "{{id}}",
          "name": "{{name}}",
          "url": "https://example.com/t",
          "dates": { "start": { "localDate": "2026-08-06", "localTime": "19:00:00", "dateTime": "{{date}}" }, "status": { "code": "onsale" } },
          "classifications": [{ "genre": { "name": "{{genre}}" }, "subGenre": { "name": "{{subGenre}}" } }],
          "_embedded": {
            "attractions": [{{attractionJson}}],
            "venues": [{ "name": "Delta Center", "city": { "name": "Salt Lake City" }, "state": { "stateCode": "UT" }, "location": { "latitude": "40.76", "longitude": "-111.89" } }]
          }
        }
        """;
    }

    private static string DiscoveryPayload() => $$"""
        { "_embedded": { "events": [
          {{TmEvent("nba-game", "Utah Jazz vs. Denver Nuggets", ["Utah Jazz", "Denver Nuggets"], "Basketball", "NBA")}},
          {{TmEvent("block-party", "Utah Jazz Block Party", ["Utah Jazz"], "Basketball", "NBA")}},
          {{TmEvent("weird", "Springville Flyers vs. Ogden Hawks", ["Springville Flyers", "Ogden Hawks"], "", "")}}
        ] } }
        """;

    private static readonly IReadOnlySet<string> KnownTeamsSet =
        new HashSet<string>(["Utah Jazz", "Denver Nuggets"], StringComparer.OrdinalIgnoreCase);

    private static IConfiguration Config() =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Ticketmaster:ApiKey"] = "tm-key",
        }).Build();

    private static TicketmasterClient MakeClient(FakeClassifier classifier, IVerdictStore? store = null) =>
        new(
            new HttpClient(new FakeTicketmasterHandler(DiscoveryPayload())),
            Config(),
            classifier,
            store ?? new BlobVerdictStore(null),
            KnownTeamsSet);

    private static EventVerdict Verdict(bool isGame, string sport = "Basketball", string league = "NBA",
        string home = "Utah Jazz", string away = "", string reason = "test") =>
        new(isGame, sport, league, home, away, reason, "2026-08-06", ClassificationSchema.Version, DateTime.UtcNow);

    // ---------- Tests ----------

    [TestMethod]
    public async Task DisabledClassifier_BehavesExactlyLikeToday()
    {
        var classifier = new FakeClassifier { Enabled = false };
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.IsNotNull(events);
        Assert.AreEqual(3, events.Count); // all pass today's filter
        Assert.AreEqual(0, classifier.ClassifiedIds.Count);
    }

    [TestMethod]
    public async Task CleanMatchup_IsNeverSentToTheClassifier()
    {
        var classifier = new FakeClassifier();
        await MakeClient(classifier).GetEventsAsync("UT");

        CollectionAssert.DoesNotContain(classifier.ClassifiedIds, "nba-game");
        CollectionAssert.Contains(classifier.ClassifiedIds, "block-party"); // no-matchup-pass
        CollectionAssert.Contains(classifier.ClassifiedIds, "weird");       // unknown-team + unclassified
    }

    [TestMethod]
    public async Task JunkVerdict_DropsTheEvent()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["block-party"] = Verdict(isGame: false, reason: "Fan event, not a game.");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.IsNotNull(events);
        Assert.IsFalse(events.Any(e => e.Id == "block-party"));
        Assert.IsTrue(events.Any(e => e.Id == "nba-game"));
    }

    [TestMethod]
    public async Task Verdict_OverridesRulesLabels()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey", league: "ECHL",
            home: "Springville Flyers", away: "Ogden Hawks");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        var weird = events!.Single(e => e.Id == "weird");
        Assert.AreEqual("ECHL", weird.League);
        Assert.AreEqual("Hockey", weird.Sport);
        Assert.AreEqual("Springville Flyers", weird.HomeTeam);
    }

    [TestMethod]
    public async Task UnknownLeagueVerdict_DisplaysAsOther()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey",
            league: ClassificationSchema.UnknownLeague, home: "Springville Flyers", away: "Ogden Hawks");
        var events = await MakeClient(classifier).GetEventsAsync("UT");

        Assert.AreEqual("Other", events!.Single(e => e.Id == "weird").League);
    }

    [TestMethod]
    public async Task FailedClassification_ServesRulesDraftAndStoresNothing()
    {
        var classifier = new FakeClassifier(); // returns null for everything
        var store = new BlobVerdictStore(null);
        var events = await MakeClient(classifier, store).GetEventsAsync("UT");

        Assert.AreEqual(3, events!.Count); // same as today's behavior
        Assert.IsFalse(store.TryGet("block-party", out _));
    }

    [TestMethod]
    public async Task BorderlineEvents_ShareOneBatchCall()
    {
        var classifier = new FakeClassifier();
        await MakeClient(classifier).GetEventsAsync("UT");

        Assert.AreEqual(1, classifier.BatchCalls); // block-party + weird ride together
    }

    [TestMethod]
    public async Task RateLimit_FallsBackToRulesAndStoresNothing()
    {
        var classifier = new FakeClassifier { RateLimited = true };
        var store = new BlobVerdictStore(null);
        var events = await MakeClient(classifier, store).GetEventsAsync("UT");

        Assert.AreEqual(3, events!.Count); // rules-only feed, same as today
        Assert.IsFalse(store.TryGet("block-party", out _));

        // Quota recovers -> next fetch classifies and the verdicts stick.
        classifier.RateLimited = false;
        classifier.Verdicts["block-party"] = Verdict(isGame: false);
        var retried = await MakeClient(classifier, store).GetEventsAsync("UT");
        Assert.IsFalse(retried!.Any(e => e.Id == "block-party"));
    }

    [TestMethod]
    public async Task SecondFetch_UsesStoredVerdicts_NoReclassification()
    {
        var classifier = new FakeClassifier();
        classifier.Verdicts["block-party"] = Verdict(isGame: false);
        classifier.Verdicts["weird"] = Verdict(isGame: true, sport: "Hockey", league: "ECHL",
            home: "Springville Flyers", away: "Ogden Hawks");
        var store = new BlobVerdictStore(null);

        await MakeClient(classifier, store).GetEventsAsync("UT");
        await MakeClient(classifier, store).GetEventsAsync("UT");

        Assert.AreEqual(1, classifier.ClassifiedIds.Count(id => id == "block-party"));
        Assert.AreEqual(1, classifier.ClassifiedIds.Count(id => id == "weird"));
    }
}
