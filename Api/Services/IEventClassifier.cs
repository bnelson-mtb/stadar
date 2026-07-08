using Api.Models;

namespace Api.Services;

/// <summary>
/// Verdicts keyed by event id. Events missing from the map got no verdict
/// (they fall back to the rules and retry next fetch). RateLimited means the
/// request was rejected with HTTP 429 — stop sending batches this fetch.
/// </summary>
public record BatchClassificationResult(
    IReadOnlyDictionary<string, EventVerdict> Verdicts,
    bool RateLimited);

public interface IEventClassifier
{
    /// <summary>False when no API key is configured — the verdict layer is then fully inert.</summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Classifies a batch of events in one model call. Returns null on any
    /// failure other than rate limiting (disabled, timeout, HTTP error,
    /// unparseable response).
    /// </summary>
    Task<BatchClassificationResult?> ClassifyBatchAsync(IReadOnlyList<ClassificationInput> inputs, CancellationToken cancellationToken);
}
