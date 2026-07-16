using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Api.Tests;

// In-memory integration tests. No Ticketmaster key is configured in the
// test host, so /api/games endpoints short-circuit without network calls
// (games -> 500 Problem, games/{id} -> 404) — which is all these tests need.
[TestClass]
public class RateLimitingTests
{
    [TestMethod]
    public async Task ApiRequests_Beyond60PerMinute_Get429()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 61; i++)
        {
            using var response = await client.GetAsync("/api/games?stateCode=UT");
            statuses.Add(response.StatusCode);
        }

        Assert.IsFalse(statuses.Take(60).Any(s => s == HttpStatusCode.TooManyRequests),
            "the first 60 requests must not be throttled");
        Assert.AreEqual(HttpStatusCode.TooManyRequests, statuses[60]);
    }

    [TestMethod]
    public async Task Healthz_IsNeverRateLimited()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        for (var i = 0; i < 70; i++)
        {
            using var response = await client.GetAsync("/healthz");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [TestMethod]
    public async Task GamesById_UnknownEvent_Returns404()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/games/no-such-id");
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }
}
