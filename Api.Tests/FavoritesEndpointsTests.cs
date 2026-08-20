using System.Net;
using System.Net.Http.Json;

namespace Api.Tests;

[TestClass]
public class FavoritesEndpointsTests
{
    private static HttpClient ClientFor(AccountsTestFactory factory, string? userId)
    {
        if (userId is not null) factory.SeedUser(userId);
        var client = factory.CreateClient();
        if (userId is not null) client.DefaultRequestHeaders.Add("Test-User", userId);
        return client;
    }

    [TestMethod]
    public async Task Favorites_Anonymous_Returns401()
    {
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, null);

        using var response = await client.GetAsync("/api/me/favorites");
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Favorites_PutThenGet_RoundTrips()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        using var put = await client.PutAsJsonAsync("/api/me/favorites",
            new[] { "Utah Jazz", "Real Salt Lake" });
        Assert.AreEqual(HttpStatusCode.OK, put.StatusCode);

        var teams = await client.GetFromJsonAsync<string[]>("/api/me/favorites");
        CollectionAssert.AreEquivalent(new[] { "Utah Jazz", "Real Salt Lake" }, teams);
    }

    [TestMethod]
    public async Task Favorites_Put_ReplacesWholeSet()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        await client.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Jazz", "Utah Mammoth" });
        await client.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Royals" });

        var teams = await client.GetFromJsonAsync<string[]>("/api/me/favorites");
        CollectionAssert.AreEquivalent(new[] { "Utah Royals" }, teams);
    }

    [TestMethod]
    public async Task Favorites_AreIsolatedPerUser()
    {
        using var factory = new AccountsTestFactory();
        var userA = Guid.NewGuid().ToString();
        var userB = Guid.NewGuid().ToString();

        using (var a = ClientFor(factory, userA))
            await a.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Jazz" });

        using var b = ClientFor(factory, userB);
        var teamsB = await b.GetFromJsonAsync<string[]>("/api/me/favorites");
        Assert.AreEqual(0, teamsB!.Length);
    }
}
