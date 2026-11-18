using System.Security.Claims;
using System.Text.Json;
using Api.Data;
using Api.Models;
using Api.Services;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.EntityFrameworkCore;

namespace Api.Auth;

public static class AccountsStartup
{
    // Accounts require BOTH a SQL connection string and Google credentials.
    // Missing either → the whole layer stays unregistered and the app runs
    // exactly as it did before accounts existed (fail-soft, like Gemini).
    public static bool AccountsEnabled(this IConfiguration config) =>
        !string.IsNullOrWhiteSpace(config.GetConnectionString("Default"))
        && !string.IsNullOrWhiteSpace(config["Google:ClientId"])
        && !string.IsNullOrWhiteSpace(config["Google:ClientSecret"]);

    public static void AddAccounts(this IServiceCollection services, IConfiguration config)
    {
        if (!config.AccountsEnabled())
        {
            Console.WriteLine("Accounts disabled — no SQL connection string and/or Google credentials configured.");
            return;
        }

        services.AddDbContext<AppDbContext>(o =>
            o.UseSqlServer(config.GetConnectionString("Default")));
        services.AddScoped<UserAccountService>();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<MobileSignInCodes>();
        AddPersistentKeys(services, config);

        var allowedOrigins = config.AllowedClientOrigins();

        services.AddAuthentication(o =>
            {
                // Protected endpoints (e.g. /api/me) authenticate and challenge the
                // cookie scheme, which answers API callers with 401 (see
                // OnRedirectToLogin) instead of an OAuth/HTML redirect. The Google
                // challenge is invoked explicitly by /api/auth/login, so it must NOT
                // be the default challenge scheme — otherwise an anonymous /api/me
                // 302-redirects to Google and the client can't detect "signed out".
                o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(o =>
            {
                o.Cookie.HttpOnly = true;
                o.Cookie.SameSite = SameSiteMode.Lax;
                o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                // Paired with IsPersistent on the login challenge: stay signed
                // in for 30 days, renewed while the account is in use.
                o.ExpireTimeSpan = TimeSpan.FromDays(30);
                o.SlidingExpiration = true;
                // API paths must answer 401/403 with a status code, not an
                // HTML redirect to a login page (there is no server login page).
                o.Events.OnRedirectToLogin = ctx =>
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                o.Events.OnRedirectToAccessDenied = ctx =>
                {
                    ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            })
            .AddGoogle("Google", o =>
            {
                o.ClientId = config["Google:ClientId"]!;
                o.ClientSecret = config["Google:ClientSecret"]!;
                o.CallbackPath = "/api/auth/callback";
                // Consent denied, a stale or missing OAuth state, or the user
                // store being unreachable all end here. Unhandled, the visitor
                // gets a bare 500 instead of the app.
                o.Events.OnRemoteFailure = ctx =>
                {
                    Console.WriteLine($"Sign-in failed: {ctx.Failure?.Message}");
                    // An app sign-in goes back to the app (closing its browser
                    // tab) rather than to the web Profile page.
                    ctx.Response.Redirect(
                        MobileSignIn.FailureRedirect(ctx.Properties?.RedirectUri, allowedOrigins)
                        ?? SignInFailedUrl(ctx.Properties?.RedirectUri, allowedOrigins));
                    ctx.HandleResponse();
                    return Task.CompletedTask;
                };
                o.Events.OnCreatingTicket = async ctx =>
                {
                    var accounts = ctx.HttpContext.RequestServices
                        .GetRequiredService<UserAccountService>();
                    var subject = ctx.Principal!.FindFirstValue(ClaimTypes.NameIdentifier)!;
                    var email = ctx.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
                    var name = ctx.Principal.FindFirstValue(ClaimTypes.Name) ?? "";

                    var user = await accounts.FindOrCreateAsync("google", subject, email, name);

                    // Replace Google's transient subject with our stable user id
                    // so /api/me and (later) /api/me/* key off our own primary key.
                    var identity = (ClaimsIdentity)ctx.Principal.Identity!;
                    var existing = identity.FindFirst(ClaimTypes.NameIdentifier);
                    if (existing is not null) identity.RemoveClaim(existing);
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
                };
            });

        services.AddAuthorization();
    }

    // Applies migrations at startup so the serverless DB gets its schema on
    // first deploy. Guarded by AccountsEnabled, so the anonymous-only
    // deployment never opens a SQL connection.
    public static void MigrateAccountsDb(this WebApplication app)
    {
        if (!app.Configuration.AccountsEnabled()) return;
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        try
        {
            // If there are any pending migrations, apply them
            var pendingMigrations = db.Database.GetPendingMigrations().Any();
            if (pendingMigrations)
            {
                db.Database.Migrate();
            }
            else if (!db.Database.CanConnect())
            {
                // No migrations and can't connect - create schema directly
                db.Database.EnsureCreated();
            }
        }
        catch
        {
            // If migration fails, fall back to EnsureCreated (e.g., SQLite in tests)
            try
            {
                db.Database.EnsureCreated();
            }
            catch
            {
                // Ignore errors during schema creation
            }
        }
    }

    // Origins a separately hosted client may be served from (the Vite dev
    // server by default). Shared by the CORS policy and the sign-in return URL.
    public static string[] AllowedClientOrigins(this IConfiguration config) =>
        config.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "https://localhost:5173"];

    // Where to land after sign-in. Valid targets are a same-site path, or a URL
    // on an explicitly allowed client origin (local dev: the client runs on
    // :5173 while the API, and so the OAuth callback, is on :5068). "//host"
    // and "/\host" are scheme-relative, so the browser would leave the site;
    // they and every other absolute URL fall back to "/".
    public static string SafeReturnUrl(string? returnUrl, IReadOnlyCollection<string> allowedOrigins)
    {
        if (string.IsNullOrEmpty(returnUrl) || returnUrl.Any(char.IsControl))
            return "/";

        if (returnUrl[0] == '/')
            return returnUrl.Length == 1 || (returnUrl[1] != '/' && returnUrl[1] != '\\')
                ? returnUrl
                : "/";

        if (Uri.TryCreate(returnUrl, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            && string.IsNullOrEmpty(uri.UserInfo))
        {
            var origin = uri.GetLeftPart(UriPartial.Authority);
            if (allowedOrigins.Any(o => string.Equals(o.TrimEnd('/'), origin, StringComparison.OrdinalIgnoreCase)))
                // Rebuilt from the parsed parts so the browser can't read the
                // string differently than this check did.
                return origin + uri.PathAndQuery + uri.Fragment;
        }

        return "/";
    }

    // The Profile page on whichever origin the sign-in started from.
    public static string SignInFailedUrl(string? returnUrl, IReadOnlyCollection<string> allowedOrigins)
    {
        var safe = SafeReturnUrl(returnUrl, allowedOrigins);
        var origin = safe[0] == '/' ? "" : new Uri(safe).GetLeftPart(UriPartial.Authority);
        return $"{origin}/profile?signin=failed";
    }

    // Keeps the Data Protection key ring in blob storage so sessions outlive
    // the container. Without a storage account the keys stay on local disk
    // (the previous behavior) and a warning says so.
    private static void AddPersistentKeys(IServiceCollection services, IConfiguration config)
    {
        services.AddDataProtection().SetApplicationName("stadar");

        var storageConn = config["Storage:ConnectionString"];
        if (string.IsNullOrWhiteSpace(storageConn))
        {
            Console.WriteLine("Storage:ConnectionString missing - sign-in keys stay on local disk, so everyone is signed out whenever the container restarts.");
            return;
        }

        try
        {
            var container = new BlobContainerClient(storageConn, "dataprotection");
            container.CreateIfNotExists();
            var repository = new BlobKeyRepository(new AzureKeyBlobs(container));
            services.Configure<KeyManagementOptions>(o => o.XmlRepository = repository);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Sign-in key storage unavailable ({e.Message}) - keys stay on local disk for this run.");
        }
    }

    public static void MapAccountEndpoints(this WebApplication app)
    {
        var allowedOrigins = app.Configuration.AllowedClientOrigins();

        if (!app.Configuration.AccountsEnabled()) return;

        // Current user, or 401 when anonymous.
        app.MapGet("/api/me", (ClaimsPrincipal principal) =>
        {
            if (principal.Identity?.IsAuthenticated != true)
                return Results.Unauthorized();

            return Results.Ok(new
            {
                id = principal.FindFirstValue(ClaimTypes.NameIdentifier),
                email = principal.FindFirstValue(ClaimTypes.Email),
                displayName = principal.FindFirstValue(ClaimTypes.Name),
            });
        }).RequireAuthorization();

        // Kicks off the Google OAuth challenge. returnUrl is validated so it
        // can't be used as an open redirect after sign-in.
        app.MapGet("/api/auth/login", (string? returnUrl) =>
        {
            return Results.Challenge(
                new AuthenticationProperties
                {
                    RedirectUri = SafeReturnUrl(returnUrl, allowedOrigins),
                    // Persistent cookie: the session survives closing the browser.
                    IsPersistent = true,
                },
                ["Google"]);
        });

        // Google redirects here after consent. The cookie middleware has already
        // run find-or-create via OnCreatingTicket (wired below); we just land the
        // user back in the SPA.
        app.MapGet("/api/auth/callback", () => Results.Redirect("/"));

        app.MapPost("/api/auth/logout", async (HttpContext ctx) =>
        {
            await ctx.SignOutAsync();
            return Results.Ok();
        });

        // Sign-in for the mobile app (see MobileSignIn.cs).
        app.MapMobileSignIn(allowedOrigins);

        // Current user's favorite team names (canonical). Auth required.
        app.MapGet("/api/me/favorites", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var teams = await db.Favorites
                .Where(f => f.UserId == userId)
                .OrderBy(f => f.CreatedAt)
                .Select(f => f.TeamName)
                .ToListAsync();
            return Results.Ok(teams);
        }).RequireAuthorization();

        // Whole-set replace (matches the client adapter's persist(key, wholeValue)).
        app.MapPut("/api/me/favorites", async (
            ClaimsPrincipal principal, AppDbContext db,
            [Microsoft.AspNetCore.Mvc.FromBody] List<string> teams) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await db.Favorites.Where(f => f.UserId == userId).ToListAsync();
            db.Favorites.RemoveRange(existing);

            var now = DateTime.UtcNow;
            var deduped = teams.Distinct().ToList();
            for (var i = 0; i < deduped.Count; i++)
                db.Favorites.Add(new Favorite
                {
                    UserId = userId,
                    TeamName = deduped[i],
                    CreatedAt = now.AddMilliseconds(i), // preserve input order on read-back
                });

            await db.SaveChangesAsync();
            return Results.Ok(deduped);
        }).RequireAuthorization();

        // Current user's saved-event records. SnapshotJson is the client record
        // shape stored verbatim; the server never reads inside it. Auth required.
        app.MapGet("/api/me/saved", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var snapshots = await db.SavedEvents
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.UpdatedAt)
                .Select(s => s.SnapshotJson)
                .ToListAsync();
            var records = snapshots.Select(json => JsonSerializer.Deserialize<JsonElement>(json)).ToList();
            return Results.Ok(records);
        }).RequireAuthorization();

        // Whole-set replace. Each record is stored verbatim, keyed by event.id.
        app.MapPut("/api/me/saved", async (
            ClaimsPrincipal principal, AppDbContext db,
            [Microsoft.AspNetCore.Mvc.FromBody] List<JsonElement> records) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await db.SavedEvents.Where(s => s.UserId == userId).ToListAsync();
            db.SavedEvents.RemoveRange(existing);

            var now = DateTime.UtcNow;
            var seen = new HashSet<string>();
            var stored = new List<JsonElement>();
            foreach (var record in records)
            {
                if (record.ValueKind != JsonValueKind.Object
                    || !record.TryGetProperty("event", out var ev)
                    || !ev.TryGetProperty("id", out var idEl))
                    continue;
                var eventId = idEl.GetString();
                if (string.IsNullOrEmpty(eventId) || !seen.Add(eventId)) continue;

                db.SavedEvents.Add(new SavedEventRow
                {
                    UserId = userId,
                    EventId = eventId,
                    SnapshotJson = record.GetRawText(),
                    UpdatedAt = now,
                });
                stored.Add(record);
            }

            await db.SaveChangesAsync();
            return Results.Ok(stored);
        }).RequireAuthorization();
    }
}
