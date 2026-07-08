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
        string name = "Utah Jazz Block Party",
        string draftLeague = "NBA") =>
        new(
            EventId: "evt-1", EventName: name,
            RawHomeTeam: "Utah Jazz", RawAwayTeam: "",
            RawSport: "Basketball", RawLeague: "NBA",
            DraftHomeTeam: "Utah Jazz", DraftAwayTeam: "",
            DraftSport: "Basketball", DraftLeague: draftLeague,
            Venue: "Delta Center", City: "Salt Lake City", State: "UT",
            LocalDate: "2026-08-01");

    private static string GeminiResponse(object verdict) => JsonSerializer.Serialize(new
    {
        candidates = new[] { new { content = new { parts = new[] { new { text = JsonSerializer.Serialize(verdict) } } } } },
        usageMetadata = new { promptTokenCount = 850, candidatesTokenCount = 90 },
    });

    private static HttpResponseMessage Ok(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    private static GeminiEventClassifier Make(FakeHttpMessageHandler handler, string? apiKey = "test-key") =>
        new(new HttpClient(handler), Config(apiKey));

    [TestMethod]
    public async Task Disabled_WithoutKey_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("{}"));
        var classifier = Make(handler, apiKey: null);

        Assert.IsFalse(classifier.IsEnabled);
        Assert.IsNull(await classifier.ClassifyAsync(MakeInput(), CancellationToken.None));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Success_ReturnsVerdictWithMetadata()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = false,
            sport = "Basketball",
            league = "NBA",
            home_team = "Utah Jazz",
            away_team = "",
            reason = "Fan event, not a game.",
        })));
        var verdict = await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        Assert.IsNotNull(verdict);
        Assert.IsFalse(verdict.IsSpectatorGame);
        Assert.AreEqual("NBA", verdict.League);
        Assert.AreEqual("2026-08-01", verdict.EventDate);
        Assert.AreEqual(ClassificationSchema.Version, verdict.SchemaVersion);
    }

    [TestMethod]
    public async Task Request_CarriesSchemaKeyAndEventData()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = true, sport = "Basketball", league = "NBA",
            home_team = "Utah Jazz", away_team = "", reason = "ok",
        })));
        await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        var request = handler.Requests.Single();
        Assert.IsTrue(request.RequestUri!.ToString().Contains("gemini-2.5-flash-lite"));
        Assert.AreEqual("test-key", request.Headers.GetValues("x-goog-api-key").Single());
        StringAssert.Contains(handler.LastRequestBody, "\"enum\"");
        StringAssert.Contains(handler.LastRequestBody, "Utah Jazz Block Party");
        StringAssert.Contains(handler.LastRequestBody, "\"responseMimeType\":\"application/json\"");
    }

    [TestMethod]
    public async Task Non200_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.TooManyRequests));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task EmptyCandidates_SafetyBlock_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok("""{"candidates":[]}"""));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task MalformedInnerJson_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(JsonSerializer.Serialize(new
        {
            candidates = new[] { new { content = new { parts = new[] { new { text = "not json {" } } } } },
        })));
        Assert.IsNull(await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None));
    }

    [TestMethod]
    public async Task LeagueOutsideEnum_MapsToUnknown()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(GeminiResponse(new
        {
            is_spectator_game = true, sport = "Quidditch", league = "XFL",
            home_team = "A", away_team = "B", reason = "r",
        })));
        var verdict = await Make(handler).ClassifyAsync(MakeInput(), CancellationToken.None);

        Assert.IsNotNull(verdict);
        Assert.AreEqual(ClassificationSchema.UnknownLeague, verdict.League);
        Assert.AreEqual("Other", verdict.Sport);
    }
}
