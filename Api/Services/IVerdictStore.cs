using Api.Models;

namespace Api.Services;

public interface IVerdictStore
{
    /// <summary>Hydrates from persistence once per app lifetime. Safe to call repeatedly.</summary>
    Task EnsureLoadedAsync(CancellationToken cancellationToken);

    bool TryGet(string eventId, out EventVerdict verdict);

    void Add(string eventId, EventVerdict verdict);

    /// <summary>Persists if anything was added since the last save. Failures are logged, never thrown.</summary>
    Task SaveAsync(CancellationToken cancellationToken);
}
