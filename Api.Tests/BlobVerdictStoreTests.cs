using System.Text.Json;
using Api.Models;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class BlobVerdictStoreTests
{
    private sealed class FakeBlobStorage : IBlobStorage
    {
        public string? Content;
        public int Downloads;
        public int Uploads;
        public bool ThrowOnDownload;
        public bool ThrowOnUpload;

        public Task<string?> DownloadIfExistsAsync(CancellationToken ct)
        {
            Downloads++;
            if (ThrowOnDownload) throw new InvalidOperationException("download boom");
            return Task.FromResult(Content);
        }

        public Task UploadAsync(string content, CancellationToken ct)
        {
            Uploads++;
            if (ThrowOnUpload) throw new InvalidOperationException("upload boom");
            Content = content;
            return Task.CompletedTask;
        }
    }

    private static EventVerdict MakeVerdict(
        string? eventDate = null,
        int schemaVersion = ClassificationSchema.Version) =>
        new(
            IsSpectatorGame: true, Sport: "Hockey", League: "ECHL",
            HomeTeam: "Utah Grizzlies", AwayTeam: "Idaho Steelheads",
            Reason: "Real ECHL game.",
            EventDate: eventDate ?? DateTime.UtcNow.Date.AddDays(30).ToString("yyyy-MM-dd"),
            SchemaVersion: schemaVersion,
            ClassifiedAt: DateTime.UtcNow);

    [TestMethod]
    public async Task SaveThenLoad_RoundTrips()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None);

        var reloaded = new BlobVerdictStore(blob);
        await reloaded.EnsureLoadedAsync(CancellationToken.None);
        Assert.IsTrue(reloaded.TryGet("e1", out var verdict));
        Assert.AreEqual("ECHL", verdict.League);
    }

    [TestMethod]
    public async Task EnsureLoaded_OnlyDownloadsOnce()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        await store.EnsureLoadedAsync(CancellationToken.None);
        Assert.AreEqual(1, blob.Downloads);
    }

    [TestMethod]
    public async Task OldSchemaVersion_TreatedAsMissing()
    {
        var blob = new FakeBlobStorage
        {
            Content = JsonSerializer.Serialize(new Dictionary<string, EventVerdict>
            {
                ["old"] = MakeVerdict(schemaVersion: ClassificationSchema.Version - 1),
            }),
        };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        Assert.IsFalse(store.TryGet("old", out _));
    }

    [TestMethod]
    public async Task Save_SkippedWhenNothingAdded()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        await store.SaveAsync(CancellationToken.None);
        Assert.AreEqual(0, blob.Uploads);
    }

    [TestMethod]
    public async Task Save_PrunesEventsMoreThanSevenDaysPast()
    {
        var blob = new FakeBlobStorage();
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("stale", MakeVerdict(eventDate: DateTime.UtcNow.Date.AddDays(-8).ToString("yyyy-MM-dd")));
        store.Add("recent", MakeVerdict(eventDate: DateTime.UtcNow.Date.AddDays(-1).ToString("yyyy-MM-dd")));
        store.Add("future", MakeVerdict());
        await store.SaveAsync(CancellationToken.None);

        Assert.IsFalse(store.TryGet("stale", out _));
        Assert.IsTrue(store.TryGet("recent", out _));
        Assert.IsTrue(store.TryGet("future", out _));
        StringAssert.Contains(blob.Content, "recent");
    }

    [TestMethod]
    public async Task DownloadFailure_StartsEmptyAndStillWorks()
    {
        var blob = new FakeBlobStorage { ThrowOnDownload = true };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        Assert.IsTrue(store.TryGet("e1", out _));
    }

    [TestMethod]
    public async Task UploadFailure_KeepsVerdictsAndRetriesNextSave()
    {
        var blob = new FakeBlobStorage { ThrowOnUpload = true };
        var store = new BlobVerdictStore(blob);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None); // fails, logged

        blob.ThrowOnUpload = false;
        await store.SaveAsync(CancellationToken.None); // dirty flag still set -> retries
        Assert.AreEqual(2, blob.Uploads);
        StringAssert.Contains(blob.Content, "e1");
    }

    [TestMethod]
    public async Task NullStorage_MemoryOnlyMode_Works()
    {
        var store = new BlobVerdictStore(null);
        await store.EnsureLoadedAsync(CancellationToken.None);
        store.Add("e1", MakeVerdict());
        await store.SaveAsync(CancellationToken.None); // no-op, no throw
        Assert.IsTrue(store.TryGet("e1", out _));
    }
}
