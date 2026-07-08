using Azure.Storage.Blobs;

namespace Api.Services;

/// <summary>Blob-backed IBlobStorage: container "verdicts", blob "verdicts.json".</summary>
public class AzureBlobStorage(string connectionString) : IBlobStorage
{
    private readonly BlobContainerClient _container = new(connectionString, "verdicts");

    public async Task<string?> DownloadIfExistsAsync(CancellationToken cancellationToken)
    {
        var blob = _container.GetBlobClient("verdicts.json");
        if (!await blob.ExistsAsync(cancellationToken))
            return null;
        var result = await blob.DownloadContentAsync(cancellationToken);
        return result.Value.Content.ToString();
    }

    public async Task UploadAsync(string content, CancellationToken cancellationToken)
    {
        await _container.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        await _container.GetBlobClient("verdicts.json")
            .UploadAsync(BinaryData.FromString(content), overwrite: true, cancellationToken);
    }
}
