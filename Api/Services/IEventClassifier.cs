using Api.Models;

namespace Api.Services;

public interface IEventClassifier
{
    /// <summary>False when no API key is configured — the verdict layer is then fully inert.</summary>
    bool IsEnabled { get; }

    /// <summary>Returns null on any failure (disabled, timeout, HTTP error, unparseable response).</summary>
    Task<EventVerdict?> ClassifyAsync(ClassificationInput input, CancellationToken cancellationToken);
}
