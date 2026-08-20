using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

[TestClass]
public class SavedEventsEndpointsTests
{
    private static HttpClient ClientFor(AccountsTestFactory factory, string? userId)
    {
        if (userId is not null) factory.SeedUser(userId);
        var client = factory.CreateClient();
        if (userId is not null) client.DefaultRequestHeaders.Add("Test-User", userId);
        return client;
    }

    // Mirrors the client saved-record shape: { event:{id,...}, savedAt, notes, score }.
    private static object Record(string id, string notes = "", string home = "", string away = "") => new
    {
        @event = new { id, name = $"Event {id}", homeTeam = "Utah Jazz", awayTeam = "Denver Nuggets" },
        savedAt = "2026-08-14T00:00:00.000Z",
        notes,
        score = new { home, away },
    };

    [TestMethod]
    public async Task Saved_Anonymous_Returns401()
    {
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, null);

        using var response = await client.GetAsync("/api/me/saved");
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Saved_PutThenGet_PreservesSnapshotVerbatim()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        using var put = await client.PutAsJsonAsync("/api/me/saved",
            new[] { Record("evt1", notes: "great seats", home: "2", away: "1") });
        Assert.AreEqual(HttpStatusCode.OK, put.StatusCode);

        var records = await client.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(1, records!.Length);
        var rec = records[0];
        Assert.AreEqual("evt1", rec.GetProperty("event").GetProperty("id").GetString());
        Assert.AreEqual("great seats", rec.GetProperty("notes").GetString());
        Assert.AreEqual("2", rec.GetProperty("score").GetProperty("home").GetString());
        Assert.AreEqual("1", rec.GetProperty("score").GetProperty("away").GetString());
    }

    [TestMethod]
    public async Task Saved_Put_ReplacesWholeSet()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        await client.PutAsJsonAsync("/api/me/saved", new[] { Record("evt1"), Record("evt2") });
        await client.PutAsJsonAsync("/api/me/saved", new[] { Record("evt3") });

        var records = await client.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(1, records!.Length);
        Assert.AreEqual("evt3", records[0].GetProperty("event").GetProperty("id").GetString());
    }

    [TestMethod]
    public async Task Saved_AreIsolatedPerUser()
    {
        using var factory = new AccountsTestFactory();
        var userA = Guid.NewGuid().ToString();
        var userB = Guid.NewGuid().ToString();

        using (var a = ClientFor(factory, userA))
            await a.PutAsJsonAsync("/api/me/saved", new[] { Record("evt1") });

        using var b = ClientFor(factory, userB);
        var recordsB = await b.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(0, recordsB!.Length);
    }
}
