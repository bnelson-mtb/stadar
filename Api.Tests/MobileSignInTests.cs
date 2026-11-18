using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Api.Auth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

[TestClass]
public class MobileSignInTests
{
    private static readonly string[] Origins = ["http://localhost:5173", "http://localhost:8081"];

    // RFC 7636 appendix B test vector.
    private const string Verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    private const string Challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    [TestMethod]
    public void ChallengeFor_MatchesTheRfc7636Example()
    {
        Assert.AreEqual(Challenge, MobileSignIn.ChallengeFor(Verifier));
        Assert.IsTrue(MobileSignIn.VerifierMatches(Verifier, Challenge));
    }

    [TestMethod]
    [DataRow(null)]
    [DataRow("")]
    [DataRow("too-short")]
    [DataRow("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXX")] // one character off
    public void VerifierMatches_RejectsAnythingElse(string? verifier)
    {
        Assert.IsFalse(MobileSignIn.VerifierMatches(verifier, Challenge));
    }

    [TestMethod]
    [DataRow("stadar://auth")]
    [DataRow("STADAR://auth")]
    [DataRow("http://localhost:8081/auth")]
    public void IsAllowedRedirect_AcceptsTheAppAndAllowedWebOrigins(string redirect)
    {
        Assert.IsTrue(MobileSignIn.IsAllowedRedirect(redirect, Origins));
    }

    // Anything else would hand a sign-in code to someone else.
    [TestMethod]
    [DataRow(null)]
    [DataRow("")]
    [DataRow("stadar://evil")]
    [DataRow("evil://auth")]
    [DataRow("exp://192.168.1.5:8081/--/auth")]
    [DataRow("https://evil.example/auth")]
    [DataRow("http://localhost:8081/other")]
    [DataRow("http://localhost:8081/auth?x=1")]
    [DataRow("http://evil@localhost:8081/auth")]
    [DataRow("stadar://auth\r\nX: y")]
    public void IsAllowedRedirect_RejectsEverythingElse(string? redirect)
    {
        Assert.IsFalse(MobileSignIn.IsAllowedRedirect(redirect, Origins));
    }

    [TestMethod]
    public void IsValidChallenge_RequiresABase64UrlSha256()
    {
        Assert.IsTrue(MobileSignIn.IsValidChallenge(Challenge));
        Assert.IsFalse(MobileSignIn.IsValidChallenge(null));
        Assert.IsFalse(MobileSignIn.IsValidChallenge(Challenge[..42]));
        Assert.IsFalse(MobileSignIn.IsValidChallenge(Challenge[..42] + "="));
    }

    [TestMethod]
    public void FailureRedirect_SendsAFailedAppSignInBackToTheApp()
    {
        var mobile = MobileSignIn.CompleteUrl(Challenge, "stadar://auth");
        Assert.AreEqual("stadar://auth?error=failed", MobileSignIn.FailureRedirect(mobile, Origins));
        Assert.IsNull(MobileSignIn.FailureRedirect("/saved", Origins));
        Assert.IsNull(MobileSignIn.FailureRedirect(null, Origins));
        Assert.IsNull(MobileSignIn.FailureRedirect(MobileSignIn.CompleteUrl(Challenge, "https://evil.example/auth"), Origins));
    }

    [TestMethod]
    public void Codes_WorkOnceWithTheRightVerifierAndExpire()
    {
        var clock = new FakeClock();
        var codes = new MobileSignInCodes(clock);
        var user = User("user-1");

        var code = codes.Issue(user, Challenge);
        Assert.IsNull(codes.Redeem(code, "wrong-verifier-wrong-verifier-wrong-verifier"), "wrong verifier");
        Assert.IsNull(codes.Redeem(code, Verifier), "a failed attempt burns the code");

        var second = codes.Issue(user, Challenge);
        var principal = codes.Redeem(second, Verifier);
        Assert.AreEqual("user-1", principal?.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.IsNull(codes.Redeem(second, Verifier), "codes are single use");

        var late = codes.Issue(user, Challenge);
        clock.Advance(TimeSpan.FromMinutes(2));
        Assert.IsNull(codes.Redeem(late, Verifier), "expired");
    }

    [TestMethod]
    public async Task Probe_SaysAppSignInIsAvailable()
    {
        using var factory = Factory("probe");
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/api/auth/mobile");
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
    }

    [TestMethod]
    public async Task Login_RejectsABadChallengeOrRedirect()
    {
        using var factory = Factory("badlogin");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        using var noChallenge = await client.GetAsync("/api/auth/mobile/login?redirect=stadar%3A%2F%2Fauth");
        Assert.AreEqual(HttpStatusCode.BadRequest, noChallenge.StatusCode);

        using var evil = await client.GetAsync($"/api/auth/mobile/login?challenge={Challenge}&redirect=https%3A%2F%2Fevil.example%2Fauth");
        Assert.AreEqual(HttpStatusCode.BadRequest, evil.StatusCode);
    }

    [TestMethod]
    public async Task Login_SendsTheBrowserToGoogleAndBackThroughComplete()
    {
        using var factory = Factory("login");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        using var response = await client.GetAsync($"/api/auth/mobile/login?challenge={Challenge}&redirect=stadar%3A%2F%2Fauth");

        Assert.AreEqual(HttpStatusCode.Redirect, response.StatusCode);
        var location = response.Headers.Location!;
        Assert.AreEqual("accounts.google.com", location.Host);
        // Google returns to the usual registered callback; no new redirect URI to register.
        var query = QueryHelpers.ParseQuery(location.Query);
        StringAssert.EndsWith(query["redirect_uri"].ToString(), "/api/auth/callback");
    }

    [TestMethod]
    public async Task Complete_WithoutAGoogleSession_TellsTheAppItFailed()
    {
        using var factory = Factory("complete");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        using var response = await client.GetAsync(MobileSignIn.CompleteUrl(Challenge, "stadar://auth"));

        Assert.AreEqual(HttpStatusCode.Redirect, response.StatusCode);
        // HttpClient parses Location into a Uri, which normalizes stadar://auth to
        // stadar://auth/; compare as URIs.
        Assert.AreEqual(new Uri("stadar://auth?error=failed"), response.Headers.Location);
    }

    [TestMethod]
    public async Task Exchange_SignsTheAppIn()
    {
        using var factory = Factory("exchange");
        var code = factory.Services.GetRequiredService<MobileSignInCodes>().Issue(User("00000000-0000-0000-0000-000000000042"), Challenge);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        using var wrong = await client.PostAsJsonAsync("/api/auth/mobile/exchange", new { code, verifier = Verifier[..^1] + "Y" });
        Assert.AreEqual(HttpStatusCode.BadRequest, wrong.StatusCode);
        using var reused = await client.PostAsJsonAsync("/api/auth/mobile/exchange", new { code, verifier = Verifier });
        Assert.AreEqual(HttpStatusCode.BadRequest, reused.StatusCode, "the failed attempt burned the code");

        var fresh = factory.Services.GetRequiredService<MobileSignInCodes>().Issue(User("00000000-0000-0000-0000-000000000042"), Challenge);
        using var response = await client.PostAsJsonAsync("/api/auth/mobile/exchange", new { code = fresh, verifier = Verifier });
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.AreEqual("00000000-0000-0000-0000-000000000042", user.GetProperty("id").GetString());
        Assert.AreEqual("fan@example.com", user.GetProperty("email").GetString());

        // The cookie the exchange set is a real session.
        using var me = await client.GetAsync("/api/me");
        Assert.AreEqual(HttpStatusCode.OK, me.StatusCode);
    }

    private static WebApplicationFactory<Program> Factory(string name) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", $"DataSource=file:mobile-{name}?mode=memory&cache=shared");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
        });

    private static ClaimsPrincipal User(string id) =>
        new(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(ClaimTypes.Email, "fan@example.com"),
                new Claim(ClaimTypes.Name, "A Fan"),
            ],
            CookieAuthenticationDefaults.AuthenticationScheme));

    private sealed class FakeClock : TimeProvider
    {
        private DateTimeOffset _now = new(2026, 11, 18, 12, 0, 0, TimeSpan.Zero);
        public override DateTimeOffset GetUtcNow() => _now;
        public void Advance(TimeSpan by) => _now += by;
    }
}
