using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
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
    public async Task Me_AccountsDisabled_Returns404()
    {
        // Default factory has no connection string / Google creds → the
        // endpoint is never mapped, so the route does not exist.
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/me");
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
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

    private record MeResponse(string Id, string Email, string DisplayName);
}
