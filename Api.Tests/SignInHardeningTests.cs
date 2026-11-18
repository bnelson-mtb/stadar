using System.Net;
using System.Xml.Linq;
using Api.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Api.Tests;

[TestClass]
public class SignInHardeningTests
{
    private static readonly string[] Origins = ["http://localhost:5173", "https://localhost:5173"];

    [TestMethod]
    [DataRow("/")]
    [DataRow("/saved?tab=past")]
    [DataRow("/event/vvG1zZ9KxYabc")]
    public void SafeReturnUrl_KeepsSameSitePaths(string returnUrl)
    {
        Assert.AreEqual(returnUrl, AccountsStartup.SafeReturnUrl(returnUrl, Origins));
    }

    // Each of these would send the visitor to another site after Google sign-in.
    [TestMethod]
    [DataRow(null)]
    [DataRow("")]
    [DataRow("//evil.example")]
    [DataRow("/\\evil.example")]
    [DataRow("https://evil.example/")]
    [DataRow("https://localhost:5173.evil.example/")]
    [DataRow("https://evil.example@localhost:5173/")]
    [DataRow("javascript:alert(1)")]
    [DataRow("saved")]
    [DataRow("/saved\r\nSet-Cookie: x=1")]
    public void SafeReturnUrl_RejectsEverythingElse(string? returnUrl)
    {
        Assert.AreEqual("/", AccountsStartup.SafeReturnUrl(returnUrl, Origins));
    }

    [TestMethod]
    public void SafeReturnUrl_AllowsAConfiguredClientOrigin()
    {
        Assert.AreEqual(
            "http://localhost:5173/saved?tab=past",
            AccountsStartup.SafeReturnUrl("http://localhost:5173/saved?tab=past", Origins));
    }

    [TestMethod]
    public void SignInFailedUrl_LandsOnTheProfilePageOfTheStartingOrigin()
    {
        Assert.AreEqual("/profile?signin=failed", AccountsStartup.SignInFailedUrl("/saved", Origins));
        Assert.AreEqual("/profile?signin=failed", AccountsStartup.SignInFailedUrl(null, Origins));
        Assert.AreEqual(
            "http://localhost:5173/profile?signin=failed",
            AccountsStartup.SignInFailedUrl("http://localhost:5173/saved", Origins));
    }

    // Google sends the visitor back with ?error=access_denied when they cancel
    // the consent screen. That used to surface as an unhandled exception (500).
    [TestMethod]
    public async Task Callback_WhenSignInFails_RedirectsBackToTheApp()
    {
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=file:remotefailure?mode=memory&cache=shared");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
        });
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });

        using var response = await client.GetAsync("/api/auth/callback?error=access_denied");

        Assert.AreEqual(HttpStatusCode.Redirect, response.StatusCode);
        Assert.AreEqual("/profile?signin=failed", response.Headers.Location!.ToString());
    }

    private sealed class FakeKeyBlobs : IKeyBlobs
    {
        public Dictionary<string, string> Blobs { get; } = [];
        public IEnumerable<string> ReadAll() => Blobs.Values;
        public void Write(string name, string content) => Blobs[name] = content;
    }

    // A second repository over the same blobs stands in for the next container:
    // it must see the keys the first one wrote.
    [TestMethod]
    public void BlobKeyRepository_KeysSurviveANewInstance()
    {
        var blobs = new FakeKeyBlobs();
        new BlobKeyRepository(blobs).StoreElement(new XElement("key", new XAttribute("id", "abc")), "key-abc");

        var reloaded = new BlobKeyRepository(blobs).GetAllElements();

        Assert.AreEqual(1, reloaded.Count);
        Assert.AreEqual("abc", reloaded.Single().Attribute("id")!.Value);
        Assert.IsTrue(blobs.Blobs.ContainsKey("key-abc"));
    }

    [TestMethod]
    public void BlobKeyRepository_NeverUsesAnUnsafeNameAsABlobPath()
    {
        var blobs = new FakeKeyBlobs();
        new BlobKeyRepository(blobs).StoreElement(new XElement("key"), "../../verdicts/verdicts");

        Assert.AreEqual(1, blobs.Blobs.Count);
        Assert.IsFalse(blobs.Blobs.Keys.Single().Contains('/'));
    }
}
