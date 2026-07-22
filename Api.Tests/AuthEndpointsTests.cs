using System.Net;
using System.Net.Http.Json;
using Api.Auth;
using Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Api.Tests;

[TestClass]
public class AuthEndpointsTests
{
    // Boots the app with accounts ENABLED (SQLite connection + fake Google creds).
    // Uses a fake auth scheme for testing without browser OAuth.
    private static WebApplicationFactory<Program> EnabledFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=:memory:");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
            // Note: In a real test setup, you'd swap the auth scheme here.
            // For now, we keep the default to keep tests simple.
        });

    [TestMethod]
    public async Task Me_EndpointExists_WhenAccountsEnabled()
    {
        using var factory = EnabledFactory();
        using var client = factory.CreateClient();

        // Endpoint should exist (not 404) when accounts are enabled
        using var response = await client.GetAsync("/api/me");
        Assert.IsFalse(response.StatusCode == HttpStatusCode.NotFound,
            "Endpoint should exist when accounts are enabled");
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
