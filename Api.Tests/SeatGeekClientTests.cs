using System.Net;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

[TestClass]
public class SeatGeekClientTests
{
    private sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Requests.Add(request);
            return Task.FromResult(responder(request));
        }
    }

    private static IConfiguration Config(string? clientId = "test-client-id") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["SeatGeek:ClientId"] = clientId,
        }).Build();

    private static SportEvent MakeEvent(
        string home = "Utah Jazz", string away = "Denver Nuggets",
        string city = "Salt Lake City", string state = "UT",
        string localDate = "2026-10-01") =>
        new(
            Id: "tm-1", Name: $"{home} vs. {away}",
            HomeTeam: home, AwayTeam: away,
            DateTime: new DateTime(2026, 10, 1, 19, 0, 0),
            Venue: "Delta Center", Sport: "Basketball", League: "NBA",
            City: city, State: state, Latitude: 40.77, Longitude: -111.89,
            TicketUrl: "https://www.ticketmaster.com/event/tm-1", ImageUrl: "",
            LocalDate: localDate, LocalTime: "19:00:00");

    // Shapes candidates the way the SeatGeek /2/events response does.
    private static object SgEvent(string url, string datetimeLocal, string title, string city, params string[] performers) => new
    {
        title,
        url,
        datetime_local = datetimeLocal,
        venue = new { city },
        performers = performers.Select(name => new { name }).ToArray(),
    };

    private static JsonElement SgJson(params object[] events) =>
        JsonSerializer.SerializeToElement(new { events });

    private static HttpResponseMessage Ok(object body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json") };

    // ---------- Matcher (pure) ----------

    [TestMethod]
    public void Match_SameDateAndHomeTeamInTitle_ReturnsUrl()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.AreEqual("https://seatgeek.com/e/1", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_HomeTeamInPerformersOnly_ReturnsUrl()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "NBA Preseason Game 3", "Salt Lake City", "Utah Jazz", "Denver Nuggets"));

        Assert.AreEqual("https://seatgeek.com/e/1", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_CityBreaksTieBetweenSameDayCandidates()
    {
        var json = SgJson(
            SgEvent("https://seatgeek.com/e/vegas", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Las Vegas"),
            SgEvent("https://seatgeek.com/e/slc", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.AreEqual("https://seatgeek.com/e/slc", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_NoCityMatch_UsesFirstHardMatch()
    {
        var json = SgJson(
            SgEvent("https://seatgeek.com/e/a", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "West Valley City"),
            SgEvent("https://seatgeek.com/e/b", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Las Vegas"));

        Assert.AreEqual("https://seatgeek.com/e/a", SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_WrongDate_ReturnsNull()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-02T19:00:00",
            "Denver Nuggets at Utah Jazz", "Salt Lake City"));

        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_HomeTeamAbsentEverywhere_ReturnsNull()
    {
        var json = SgJson(SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00",
            "Some Other Game", "Salt Lake City", "Team A", "Team B"));

        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(json, MakeEvent()));
    }

    [TestMethod]
    public void Match_EmptyOrMissingEventsArray_ReturnsNull()
    {
        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(SgJson(), MakeEvent()));
        Assert.IsNull(SeatGeekClient.PickBestMatchUrl(
            JsonSerializer.SerializeToElement(new { message = "no events key" }), MakeEvent()));
    }

    // ---------- HTTP behavior ----------

    [TestMethod]
    public async Task Disabled_WithoutClientId_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config(clientId: null));

        Assert.IsFalse(client.IsEnabled);
        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Lookup_SendsExpectedQuery()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        await client.FindEventUrlAsync(MakeEvent());

        var uri = handler.Requests.Single().RequestUri!;
        Assert.AreEqual("api.seatgeek.com", uri.Host);
        Assert.AreEqual("/2/events", uri.AbsolutePath);
        StringAssert.Contains(uri.Query, "client_id=test-client-id");
        // Home team only: SeatGeek's q= search returns zero results when the
        // away team is included (verified live 2026-07-13).
        StringAssert.Contains(uri.Query, "q=Utah%20Jazz&");
        StringAssert.Contains(uri.Query, "venue.state=UT");
        StringAssert.Contains(uri.Query, "datetime_local.gte=2026-10-01T00:00:00");
        StringAssert.Contains(uri.Query, "datetime_local.lte=2026-10-01T23:59:59");
        StringAssert.Contains(uri.Query, "per_page=10");
    }

    [TestMethod]
    public async Task Lookup_ReturnsMatchedUrl()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new
        {
            events = new[]
            {
                SgEvent("https://seatgeek.com/e/1", "2026-10-01T19:00:00", "Denver Nuggets at Utah Jazz", "Salt Lake City"),
            },
        }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.AreEqual("https://seatgeek.com/e/1", await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_ServerError_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_MalformedJson_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("not json", Encoding.UTF8, "application/json"),
        });
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_NetworkFailure_ReturnsNull()
    {
        var handler = new FakeHttpMessageHandler(_ => throw new HttpRequestException("boom"));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent()));
    }

    [TestMethod]
    public async Task Lookup_MissingLocalDate_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent(localDate: "")));
        Assert.AreEqual(0, handler.Requests.Count);
    }

    [TestMethod]
    public async Task Lookup_MissingHomeTeam_NoRequestSent()
    {
        var handler = new FakeHttpMessageHandler(_ => Ok(new { events = Array.Empty<object>() }));
        var client = new SeatGeekClient(new HttpClient(handler), Config());

        Assert.IsNull(await client.FindEventUrlAsync(MakeEvent(home: "")));
        Assert.AreEqual(0, handler.Requests.Count);
    }
}
