using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class GeminiEventClassifierTests
{
    private sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = [];
        public string? LastRequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Requests.Add(request);
            LastRequestBody = request.Content == null ? null : await request.Content.ReadAsStringAsync(ct);
            return responder(request);
        }
    }

    private static IConfiguration Config(string? apiKey = "test-key") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Gemini:ApiKey"] = apiKey,
        }).Build();

    private static ClassificationInput MakeInput(
        string eventId = "evt-1",
        string name = "Utah Jazz Block Party",
        string draftLeague = "NBA",
        string localDate = "2026-08-01") =>
        new(
            EventId: eventId, EventName: name,
            RawHomeTeam: "Utah Jazz", RawAwayTeam: "",
            RawSport: "Basketball", RawLeague: "NBA",
            DraftHomeTeam: "Utah Jazz", DraftAwayTeam: "",
            DraftSport: "Basketball", DraftLeague: draftLeague,
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: localDate);

    // Wraps verdict objects the way Gemini returns them: a JSON array in the
    // first candidate's text part.
    private static string GeminiResponse(params object[] verdicts) => JsonSerializer.Serialize(new
    {
        candidates = new[] { new { content = new { parts = new[] { new { text = JsonSerializer.Serialize(verdicts) } } } } },
        usageMetadata = new { promptTokenCount = 850, candidatesTokenCount = 90 },
    });

    private static object Verdict(string eventId, bool isGame = true, string sport = "Basketball",
        string league = "NBA", string home = "Utah Jazz", string away = "", string reason = "ok") => new
    {
        event_id = eventId,
        is_spectator_game = isGame,
        sport,
        league,
        home_team = home,
        away_team = away,
        reason,
    };

    private static HttpResponseMessage Ok(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    private static GeminiEventClassifier Make(FakeHttpMessageHandler handler, string? apiKey = "test-key") =>
        new(new HttpClient(handler), Config(apiKey));

    [TestMethod]
    public async Task Disabled_WithoutKey_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("[]"));
        var classifier = Make(handler, apiKey: null);

        Assert.IsFalse(classifier.IsEnabled);
        Assert.IsNull(await classifier.ClassifyBatchAsync([MakeInput()], CancellationToken.None));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Batch_MapsVerdictsByEventId()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(
            Verdict("evt-2", isGame: true, sport: "Hockey", league: "ECHL", home: "Utah Grizzlies"),
            Verdict("evt-1", isGame: false, reason: "Fan event, not a game."))));
        var result = await Make(handler).ClassifyBatchAsync(
            [MakeInput("evt-1", localDate: "2026-08-01"), MakeInput("evt-2", name: "Grizzlies Game", localDate: "2026-09-02")],
            CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.IsFalse(result.RateLimited);
        Assert.AreEqual(2, result.Verdicts.Count);
        Assert.IsFalse(result.Verdicts["evt-1"].IsSpectatorGame);
        Assert.AreEqual("2026-08-01", result.Verdicts["evt-1"].EventDate);
        Assert.AreEqual("ECHL", result.Verdicts["evt-2"].League);
        Assert.AreEqual("2026-09-02", result.Verdicts["evt-2"].EventDate);
        Assert.AreEqual(ClassificationSchema.Version, result.Verdicts["evt-1"].SchemaVersion);
        Assert.AreEqual(1, handler.Requests.Count); // one call for the whole batch
    }

    [TestMethod]
    public async Task SingleClassify_ReturnsVerdict()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(
            Verdict("evt-1", isGame: false, reason: "Fan event, not a game."))));
        var verdict = await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        Assert.IsNotNull(verdict);
        Assert.IsFalse(verdict.IsSpectatorGame);
        Assert.AreEqual("NBA", verdict.League);
    }

    [TestMethod]
    public async Task Request_CarriesSchemaKeyAndEventData()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(Verdict("evt-1"), Verdict("evt-2"))));
        await Make(handler).ClassifyBatchAsync(
            [MakeInput("evt-1"), MakeInput("evt-2", name: "Utah Grizzlies vs. Idaho Steelheads")],
            CancellationToken.None);

        var request = handler.Requests.Single();
        Assert.IsTrue(request.RequestUri!.ToString().Contains("gemini-2.5-flash-lite"));
        Assert.AreEqual("test-key", request.Headers.GetValues("x-goog-api-key").Single());
        StringAssert.Contains(handler.LastRequestBody, "\"enum\"");
        StringAssert.Contains(handler.LastRequestBody, "\"ARRAY\"");
        StringAssert.Contains(handler.LastRequestBody, "event_id");
        StringAssert.Contains(handler.LastRequestBody, "Utah Jazz Block Party");
        StringAssert.Contains(handler.LastRequestBody, "Utah Grizzlies vs. Idaho Steelheads");
        StringAssert.Contains(handler.LastRequestBody, "\"responseMimeType\":\"application/json\"");
    }

    [TestMethod]
    public async Task RateLimited_ReturnsEmptyResultWithFlag()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.TooManyRequests));
        var result = await Make(handler).ClassifyBatchAsync([MakeInput()], CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.RateLimited);
        Assert.AreEqual(0, result.Verdicts.Count);
    }

    [TestMethod]
    public async Task NonRateLimitError_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError));
        Assert.IsNull(await Make(handler).ClassifyBatchAsync([MakeInput()], CancellationToken.None));
    }

    [TestMethod]
    public async Task EmptyCandidates_SafetyBlock_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("""{"candidates":[]}"""));
        Assert.IsNull(await Make(handler).ClassifyBatchAsync([MakeInput()], CancellationToken.None));
    }

    [TestMethod]
    public async Task MalformedInnerJson_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(JsonSerializer.Serialize(new
        {
            candidates = new[] { new { content = new { parts = new[] { new { text = "not json {" } } } } },
        })));
        Assert.IsNull(await Make(handler).ClassifyBatchAsync([MakeInput()], CancellationToken.None));
    }

    [TestMethod]
    public async Task UnknownOrMissingEventIds_AreHandled()
    {
        // Model returns one verdict for an id we never sent and none for evt-1:
        // the bogus one is ignored, evt-1 is simply absent (retried next fetch).
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(Verdict("bogus-id"))));
        var result = await Make(handler).ClassifyBatchAsync([MakeInput("evt-1")], CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual(0, result.Verdicts.Count);
    }

    [TestMethod]
    public async Task LeagueOutsideEnum_MapsToUnknown()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(
            Verdict("evt-1", sport: "Quidditch", league: "XFL", home: "A", away: "B", reason: "r"))));
        var result = await Make(handler).ClassifyBatchAsync([MakeInput()], CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual(ClassificationSchema.UnknownLeague, result.Verdicts["evt-1"].League);
        Assert.AreEqual("Other", result.Verdicts["evt-1"].Sport);
    }
}
