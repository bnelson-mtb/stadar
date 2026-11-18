using System.Xml.Linq;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.DataProtection.Repositories;

namespace Api.Auth;

/// <summary>Thin blob wrapper so the key repository is unit-testable without Azure.</summary>
public interface IKeyBlobs
{
    IEnumerable<string> ReadAll();
    void Write(string name, string content);
}

/// <summary>
/// Data Protection key ring kept outside the container, one document per key.
/// The auth cookie and the OAuth state are encrypted with these keys; on the
/// container's own disk they are lost on every scale-to-zero wake and every
/// deploy, which signs everyone out.
/// </summary>
public class BlobKeyRepository(IKeyBlobs blobs) : IXmlRepository
{
    public IReadOnlyCollection<XElement> GetAllElements() =>
        blobs.ReadAll().Select(XElement.Parse).ToList();

    public void StoreElement(XElement element, string friendlyName) =>
        blobs.Write(SafeName(friendlyName), element.ToString(SaveOptions.DisableFormatting));

    // friendlyName is normally "key-{guid}"; anything else gets a fresh name
    // rather than becoming part of a blob path.
    private static string SafeName(string? friendlyName) =>
        !string.IsNullOrEmpty(friendlyName)
        && friendlyName.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_')
            ? friendlyName
            : Guid.NewGuid().ToString("N");
}

/// <summary>Blob-backed IKeyBlobs: every blob under "keys/" in the given container.</summary>
public class AzureKeyBlobs(BlobContainerClient container) : IKeyBlobs
{
    private const string Prefix = "keys/";

    public IEnumerable<string> ReadAll()
    {
        foreach (var item in container.GetBlobs(prefix: Prefix))
            yield return container.GetBlobClient(item.Name).DownloadContent().Value.Content.ToString();
    }

    public void Write(string name, string content) =>
        container.GetBlobClient($"{Prefix}{name}.xml")
            .Upload(BinaryData.FromString(content), overwrite: true);
}
