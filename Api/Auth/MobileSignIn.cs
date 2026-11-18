using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.WebUtilities;

namespace Api.Auth;

// Google sign-in for the mobile app.
//
// The app can't use the browser's session cookie: sign-in happens in an
// in-app browser tab whose cookies the app never sees. So the API hands the
// session over with a one-time code, PKCE-style:
//   1. GET  /api/auth/mobile/login?challenge=C&redirect=stadar://auth
//      C = base64url(SHA-256(verifier)); the verifier never leaves the app.
//   2. Google sign-in, then GET /api/auth/mobile/complete creates a code
//      bound to the signed-in user and C, signs the browser tab back out,
//      and redirects to stadar://auth?code=…
//   3. POST /api/auth/mobile/exchange { code, verifier } checks
//      SHA-256(verifier) == C, burns the code and signs the app in; the
//      session cookie lands in the app's own cookie store.
// A code intercepted by another app is useless without the verifier, codes
// work once, and they expire after two minutes.
public static class MobileSignIn
{
    public const string AppRedirect = "stadar://auth";
    public const string CompletePath = "/api/auth/mobile/complete";

    // Where the API may send the code: the app's own scheme, or /auth on an
    // allowed client origin (the app's web build in local development).
    public static bool IsAllowedRedirect(string? redirect, IReadOnlyCollection<string> allowedOrigins)
    {
        if (string.IsNullOrEmpty(redirect) || redirect.Any(char.IsControl)) return false;
        if (string.Equals(redirect, AppRedirect, StringComparison.OrdinalIgnoreCase)) return true;
        if (!Uri.TryCreate(redirect, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            || !string.IsNullOrEmpty(uri.UserInfo)
            || !string.IsNullOrEmpty(uri.Query)
            || !string.IsNullOrEmpty(uri.Fragment)
            || uri.AbsolutePath != "/auth")
            return false;
        var origin = uri.GetLeftPart(UriPartial.Authority);
        return allowedOrigins.Any(o => string.Equals(o.TrimEnd('/'), origin, StringComparison.OrdinalIgnoreCase));
    }

    // A base64url SHA-256 digest: exactly 43 characters from the URL-safe alphabet.
    public static bool IsValidChallenge(string? challenge) =>
        challenge is { Length: 43 } && challenge.All(c => char.IsAsciiLetterOrDigit(c) || c == '-' || c == '_');

    public static string ChallengeFor(string verifier) =>
        WebEncoders.Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(verifier)));

    public static bool VerifierMatches(string? verifier, string challenge)
    {
        // RFC 7636: 43-128 characters.
        if (verifier is null || verifier.Length < 43 || verifier.Length > 128) return false;
        var expected = Encoding.ASCII.GetBytes(challenge);
        var actual = Encoding.ASCII.GetBytes(ChallengeFor(verifier));
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    // Appends one query parameter without re-parsing the URL (System.Uri would
    // turn stadar://auth into stadar://auth/).
    public static string WithQuery(string redirect, string key, string value) =>
        $"{redirect}{(redirect.Contains('?') ? '&' : '?')}{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value)}";

    public static string CompleteUrl(string challenge, string redirect) =>
        QueryHelpers.AddQueryString(CompletePath, new Dictionary<string, string?>
        {
            ["challenge"] = challenge,
            ["redirect"] = redirect,
        });

    // For OnRemoteFailure: if a failed Google sign-in was a mobile one, the
    // app's redirect with ?error=failed (so the in-app browser closes), else null.
    public static string? FailureRedirect(string? redirectUri, IReadOnlyCollection<string> allowedOrigins)
    {
        if (redirectUri is null || !redirectUri.StartsWith(CompletePath, StringComparison.Ordinal)) return null;
        var query = QueryHelpers.ParseQuery(new Uri("http://x" + redirectUri).Query);
        var redirect = query.TryGetValue("redirect", out var r) ? r.ToString() : null;
        return IsAllowedRedirect(redirect, allowedOrigins) ? WithQuery(redirect!, "error", "failed") : null;
    }

    public static void MapMobileSignIn(this WebApplication app, IReadOnlyCollection<string> allowedOrigins)
    {
        // Lets the app tell whether this API supports app sign-in at all.
        app.MapGet("/api/auth/mobile", () => Results.NoContent());

        app.MapGet("/api/auth/mobile/login", (string? challenge, string? redirect) =>
        {
            if (!IsValidChallenge(challenge) || !IsAllowedRedirect(redirect, allowedOrigins))
                return Results.BadRequest();
            return Results.Challenge(
                new AuthenticationProperties { RedirectUri = CompleteUrl(challenge!, redirect!) },
                ["Google"]);
        });

        app.MapGet(CompletePath, async (HttpContext ctx, MobileSignInCodes codes, string? challenge, string? redirect) =>
        {
            if (!IsAllowedRedirect(redirect, allowedOrigins)) return Results.BadRequest();
            if (!IsValidChallenge(challenge) || ctx.User.Identity?.IsAuthenticated != true)
                return Results.Redirect(WithQuery(redirect!, "error", "failed"));

            var code = codes.Issue(ctx.User, challenge!);
            // The session now belongs to the app; don't leave the browser tab signed in too.
            await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Redirect(WithQuery(redirect!, "code", code));
        });

        app.MapPost("/api/auth/mobile/exchange", async (HttpContext ctx, MobileSignInCodes codes, ExchangeRequest body) =>
        {
            var principal = codes.Redeem(body.Code, body.Verifier);
            if (principal is null) return Results.BadRequest();

            await ctx.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties { IsPersistent = true });

            return Results.Ok(new
            {
                id = principal.FindFirstValue(ClaimTypes.NameIdentifier),
                email = principal.FindFirstValue(ClaimTypes.Email),
                displayName = principal.FindFirstValue(ClaimTypes.Name),
            });
        });
    }

    public sealed record ExchangeRequest(string? Code, string? Verifier);
}

// One-time sign-in codes, held in memory. The app runs as a single replica,
// and a code only has to live the few seconds between the browser tab
// closing and the app's exchange call.
public sealed class MobileSignInCodes(TimeProvider clock)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(2);
    private readonly ConcurrentDictionary<string, Entry> _entries = new();

    private sealed record Entry(ClaimsPrincipal Principal, string Challenge, DateTimeOffset Expires);

    public string Issue(ClaimsPrincipal user, string challenge)
    {
        Prune();
        var code = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        // Copy just the account claims into a fresh cookie identity.
        var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme);
        foreach (var type in new[] { ClaimTypes.NameIdentifier, ClaimTypes.Email, ClaimTypes.Name })
        {
            var value = user.FindFirstValue(type);
            if (value is not null) identity.AddClaim(new Claim(type, value));
        }
        _entries[code] = new Entry(new ClaimsPrincipal(identity), challenge, clock.GetUtcNow() + Lifetime);
        return code;
    }

    // The principal for a valid, unexpired code whose challenge the verifier
    // matches; null otherwise. A code is consumed by any attempt to use it.
    public ClaimsPrincipal? Redeem(string? code, string? verifier)
    {
        if (string.IsNullOrEmpty(code) || !_entries.TryRemove(code, out var entry)) return null;
        if (entry.Expires <= clock.GetUtcNow()) return null;
        return MobileSignIn.VerifierMatches(verifier, entry.Challenge) ? entry.Principal : null;
    }

    private void Prune()
    {
        var now = clock.GetUtcNow();
        foreach (var (key, entry) in _entries)
            if (entry.Expires <= now) _entries.TryRemove(key, out _);
    }
}
