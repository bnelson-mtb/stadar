namespace Api.Services;

/// <summary>Thin blob wrapper so the verdict store is unit-testable without Azure.</summary>
public interface IBlobStorage
{
    Task<string?> DownloadIfExistsAsync(CancellationToken cancellationToken);
    Task UploadAsync(string content, CancellationToken cancellationToken);
}
