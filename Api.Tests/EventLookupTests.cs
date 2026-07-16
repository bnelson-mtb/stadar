using System.Net;
using System.Text;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

/// <summary>
/// GetEventByIdAsync must distinguish definitive answers (TM 404, parsed
/// event, parsed-and-rejected) from transient trouble (network failure,
/// 5xx, 429, missing key) so the endpoint only negative-caches the former.
/// </summary>
[TestClass]
public class EventLookupTests
{
    private sealed class DisabledClassifier : IEventClassifier
    {
        public bool IsEnabled => false;
        public Task<BatchClassificationResult?> ClassifyBatchAsync(
            IReadOnlyList<ClassificationInput> inputs, CancellationToken ct) =>
            Task.FromResult<BatchClassificationResult?>(null);
    }

    private sealed class StatusHandler(HttpStatusCode status, string body = "{}") : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json"),
            });
    }

    private sealed class ThrowingHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            throw new HttpRequestException("connection reset");
    }

    private static IConfiguration Config(string? apiKey = "tm-key") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Ticketmaster:ApiKey"] = apiKey,
        }).Build();

    private static TicketmasterClient Make(HttpMessageHandler handler, string? apiKey = "tm-key") =>
        new(new HttpClient(handler), Config(apiKey), new DisabledClassifier(), new BlobVerdictStore(null),
            new HashSet<string>(StringComparer.OrdinalIgnoreCase));

    private static string ValidEventJson()
    {
        var date = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ");
        var localDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");
        return $$"""
        {
          "id": "ev1",
          "name": "Utah Jazz vs. Denver Nuggets",
          "dates": { "start": { "dateTime": "{{date}}", "localDate": "{{localDate}}", "localTime": "19:00:00" } },
          "classifications": [
            { "genre": { "name": "Basketball" }, "subGenre": { "name": "NBA" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Jazz" },
              { "name": "Denver Nuggets" }
            ]
          }
        }
        """;
    }

    [TestMethod]
    public async Task NotFoundFromTicketmaster_IsDefinitive()
    {
        var (ev, definitive) = await Make(new StatusHandler(HttpStatusCode.NotFound)).GetEventByIdAsync("nope");

        Assert.IsNull(ev);
        Assert.IsTrue(definitive, "TM 404 means the event does not exist - cacheable");
    }

    [TestMethod]
    public async Task ServerErrorFromTicketmaster_IsNotDefinitive()
    {
        var (ev, definitive) = await Make(new StatusHandler(HttpStatusCode.InternalServerError)).GetEventByIdAsync("ev1");

        Assert.IsNull(ev);
        Assert.IsFalse(definitive, "a TM hiccup must not pin a 404 on a real event");
    }

    [TestMethod]
    public async Task NetworkFailure_IsNotDefinitive()
    {
        var (ev, definitive) = await Make(new ThrowingHandler()).GetEventByIdAsync("ev1");

        Assert.IsNull(ev);
        Assert.IsFalse(definitive);
    }

    [TestMethod]
    public async Task MissingApiKey_IsNotDefinitive()
    {
        var (ev, definitive) = await Make(new StatusHandler(HttpStatusCode.OK), apiKey: null).GetEventByIdAsync("ev1");

        Assert.IsNull(ev);
        Assert.IsFalse(definitive);
    }

    [TestMethod]
    public async Task ParsedEvent_IsDefinitive()
    {
        var (ev, definitive) = await Make(new StatusHandler(HttpStatusCode.OK, ValidEventJson())).GetEventByIdAsync("ev1");

        Assert.IsNotNull(ev);
        Assert.IsTrue(definitive);
        Assert.AreEqual("Utah Jazz", ev.HomeTeam);
    }
}
