using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

[TestClass]
public class AuthEndpointsTests
{
    // Boots the app with accounts ENABLED (SQLite connection + fake Google creds),
    // then swaps in a fake auth scheme so integration tests can authenticate via a
    // header instead of a browser OAuth round-trip. Both DefaultScheme and
    // DefaultChallengeScheme point at the Test scheme: an authenticated request
    // (Test-User header) succeeds; an anonymous one challenges Test → 401.
    private static WebApplicationFactory<Program> EnabledFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=:memory:");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
            builder.ConfigureTestServices(services =>
            {
                services.AddAuthentication(o =>
                    {
                        o.DefaultScheme = TestAuthHandler.SchemeName;
                        o.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                    })
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                        TestAuthHandler.SchemeName, _ => { });
            });
        });

    [TestMethod]
    public async Task Me_Anonymous_Returns401()
    {
        using var factory = EnabledFactory();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/me");
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Me_Authenticated_ReturnsProfile()
    {
        using var factory = EnabledFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("Test-User", "user-42");

        using var response = await client.GetAsync("/api/me");
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<MeResponse>();
        Assert.AreEqual("user-42", body!.Id);
        Assert.AreEqual("user-42@test.local", body.Email);
    }

    [TestMethod]
    public async Task Me_AccountsDisabled_IsNotAnActiveEndpoint()
    {
        // Escape the Development environment so appsettings.Development.json (which
        // may hold real local Google/SQL creds for a smoke test) isn't loaded. The
        // base appsettings has no accounts config, so the layer stays inert and
        // /api/me is never mapped — the request then falls through to the SPA
        // fallback (200 with index.html present locally, 404 without in CI). Either
        // way it is NOT the 401 that the mapped, auth-required endpoint returns when
        // accounts are enabled.
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/me");
        Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Login_RedirectsToGoogle()
    {
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=file:login?mode=memory&cache=shared");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
        });
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });

        using var response = await client.GetAsync("/api/auth/login");

        Assert.AreEqual(HttpStatusCode.Redirect, response.StatusCode);
        StringAssert.Contains(response.Headers.Location!.ToString(), "accounts.google.com");
    }

    // Pins the OAuth redirect_uri, which is a DEPLOYMENT CONTRACT rather than an
    // internal detail: Google rejects any redirect_uri not registered verbatim on
    // the OAuth client ("Access blocked / Error 400: redirect_uri_mismatch"). Two
    // things must hold, and breaking either fails only in production while every
    // other test stays green — changing CallbackPath, or losing the forwarded-proto
    // handling that makes the scheme https behind the TLS-terminating ingress.
    // If this assertion ever has to change, register the new URI under
    // "Authorized redirect URIs" in the Google Cloud console FIRST (see
    // docs/DEPLOYMENT.md → Google OAuth).
    [TestMethod]
    public async Task Login_RedirectUri_UsesForwardedSchemeAndRegisteredCallbackPath()
    {
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=file:redirecturi?mode=memory&cache=shared");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
        });
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
        // Mirror the Container Apps ingress: it terminates TLS and forwards the
        // original scheme. If that hop is not honored the app hands Google an
        // http:// URI, which is not what is registered.
        client.DefaultRequestHeaders.Add("X-Forwarded-Proto", "https");
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.7");

        using var response = await client.GetAsync("/api/auth/login");

        var query = QueryHelpers.ParseQuery(new Uri(response.Headers.Location!.ToString()).Query);
        Assert.AreEqual("https://localhost/api/auth/callback", query["redirect_uri"].ToString());
    }

    private record MeResponse(string Id, string Email, string DisplayName);
}
