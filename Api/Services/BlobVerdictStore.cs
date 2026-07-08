using System.Collections.Concurrent;
using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// In-memory verdict cache backed by an optional blob. Null storage means
/// memory-only mode (classifier enabled but no connection string configured).
/// Only LLM-classified events are ever stored — rules-confident events never
/// enter the store.
/// </summary>
public class BlobVerdictStore(IBlobStorage? storage) : IVerdictStore
{
    private readonly ConcurrentDictionary<string, EventVerdict> _verdicts = new();
    private readonly SemaphoreSlim _loadLock = new(1, 1);
    private volatile bool _loaded;
    private volatile bool _dirty;

    public async Task EnsureLoadedAsync(CancellationToken cancellationToken)
    {
        if (_loaded) return;
        if (storage == null) { _loaded = true; return; }

        await _loadLock.WaitAsync(cancellationToken);
        try
        {
            if (_loaded) return;
            var json = await storage.DownloadIfExistsAsync(cancellationToken);
            if (json != null)
            {
                var map = JsonSerializer.Deserialize<Dictionary<string, EventVerdict>>(json) ?? [];
                foreach (var (id, verdict) in map)
                    if (verdict.SchemaVersion == ClassificationSchema.Version)
                        _verdicts[id] = verdict;
                Console.WriteLine($"Verdict store loaded: {_verdicts.Count} entries");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Verdict store load failed ({e.Message}) - starting empty");
        }
        finally
        {
            _loaded = true;
            _loadLock.Release();
        }
    }

    public bool TryGet(string eventId, out EventVerdict verdict) =>
        _verdicts.TryGetValue(eventId, out verdict!);

    public void Add(string eventId, EventVerdict verdict)
    {
        _verdicts[eventId] = verdict;
        _dirty = true;
    }

    public async Task SaveAsync(CancellationToken cancellationToken)
    {
        if (!_dirty || storage == null) return;
        try
        {
            Prune();
            var json = JsonSerializer.Serialize(_verdicts.ToDictionary(kv => kv.Key, kv => kv.Value));
            await storage.UploadAsync(json, cancellationToken);
            _dirty = false;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Verdict store save failed ({e.Message}) - will retry on next save");
        }
    }

    // Verdicts for events safely in the past are dead weight; drop them so the
    // blob stays bounded. Unparseable dates fall back to a 90-day age limit.
    private void Prune()
    {
        var dateCutoff = DateTime.UtcNow.Date.AddDays(-7);
        var ageCutoff = DateTime.UtcNow.AddDays(-90);
        foreach (var (id, v) in _verdicts)
        {
            var expired = DateTime.TryParse(v.EventDate, out var d)
                ? d < dateCutoff
                : v.ClassifiedAt < ageCutoff;
            if (expired) _verdicts.TryRemove(id, out _);
        }
    }
}
