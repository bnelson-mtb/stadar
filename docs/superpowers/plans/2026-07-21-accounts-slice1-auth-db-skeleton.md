# Accounts Slice 1: Auth + Database Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Google OAuth sign-in with an Azure SQL–backed user store and a `GET /api/me` endpoint, plus a client auth context and sign-in/out UI, while leaving the anonymous path completely unchanged and DB-free.

**Architecture:** EF Core (`AppDbContext`) owns three thin tables (`Users`, `Favorites`, `SavedEvents`); this slice only reads/writes `Users`. A `UserAccountService` does find-or-create by `(Provider, ProviderSubject)`. ASP.NET Core's built-in cookie + Google handlers own the OAuth flow. Every account feature is fail-soft: with no `Google` credentials or `ConnectionStrings:Default`, the auth/DB layer never registers and the app behaves exactly as today. The client gets an `AuthContext` that calls `/api/me` on mount and a minimal sign-in/out control.

**Tech Stack:** .NET 10, EF Core 10 (SqlServer provider in prod, Sqlite in tests), `Microsoft.AspNetCore.Authentication.Google`, MSTest + `WebApplicationFactory`, React 19 + Context, node:test for client logic.

**Spec:** `docs/superpowers/specs/2026-07-21-accounts-oauth-sync-design.md`

**Scope note:** This is slice 1 of 3. Favorites sync (slice 2) and saved-events sync + import prompt (slice 3) get their own plans once this foundation lands. This slice deliberately does **not** add `/api/me/favorites`, `/api/me/saved`, the API storage adapter, hook conversion, or the import prompt.

---

## File Structure

**Server — create:**
- `Api/Models/User.cs` — user entity
- `Api/Models/Favorite.cs` — favorite entity (schema defined now; used in slice 2)
- `Api/Models/SavedEventRow.cs` — saved-event entity (schema defined now; used in slice 3)
- `Api/Data/AppDbContext.cs` — EF Core context + model config
- `Api/Services/UserAccountService.cs` — find-or-create
- `Api/Auth/AccountsStartup.cs` — extension methods that register the DB + auth layer only when configured, and map the auth endpoints
- `Api/Migrations/*` — generated SqlServer migration

**Server — modify:**
- `Api/Api.csproj` — EF Core + Google auth package references
- `Api/Program.cs` — call the accounts startup extensions; add auth middleware
- `Api/appsettings.Development.json` — local Google + connection string keys (values left blank/placeholder)

**Server — tests (create):**
- `Api.Tests/Api.Tests.csproj` — add EF Core Sqlite reference
- `Api.Tests/TestDb.cs` — SQLite in-memory `AppDbContext` factory for tests
- `Api.Tests/UserAccountServiceTests.cs` — find-or-create behavior
- `Api.Tests/AuthEndpointsTests.cs` — `/api/me` 401 vs authenticated, inert-when-unconfigured
- `Api.Tests/TestAuthHandler.cs` — injects a fake authenticated user for integration tests

**Client — create:**
- `client/src/utils/authApi.js` — pure fetch helpers (`fetchMe`, `logout`)
- `client/src/utils/authApi.test.js` — tests for the helpers
- `client/src/context/AuthContext.jsx` — provider + `useAuth` hook
- `client/src/components/AuthButton.jsx` — sign-in / account control

**Client — modify:**
- `client/src/main.jsx` — wrap app in `AuthProvider`
- `client/src/App.jsx` — render `AuthButton` in the layout

**Ops — modify:**
- `.github/workflows/deploy.yml` — pass Google + SQL secrets to the Container App
- `CLAUDE.md` — document the new endpoints, keys, and DB

---

## Task 1: EF Core packages and the database context

**Files:**
- Modify: `Api/Api.csproj`
- Modify: `Api.Tests/Api.Tests.csproj`
- Create: `Api/Models/User.cs`
- Create: `Api/Models/Favorite.cs`
- Create: `Api/Models/SavedEventRow.cs`
- Create: `Api/Data/AppDbContext.cs`
- Create: `Api.Tests/TestDb.cs`
- Test: `Api.Tests/UserAccountServiceTests.cs` (first test only in this task)

- [ ] **Step 1: Add EF Core packages to the API project**

Edit `Api/Api.csproj`, adding to the existing package `ItemGroup`:

```xml
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Google" Version="10.0.0" />
```

- [ ] **Step 2: Add the Sqlite provider to the test project**

Edit `Api.Tests/Api.Tests.csproj`, adding to the package `ItemGroup`:

```xml
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.0" />
```

- [ ] **Step 3: Restore to confirm packages resolve**

Run: `cd Api && dotnet restore`
Expected: `Restore succeeded` (no version-resolution errors).

- [ ] **Step 4: Create the entities**

Create `Api/Models/User.cs`:

```csharp
namespace Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = "";
    public string ProviderSubject { get; set; } = "";
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public DateTime CreatedAt { get; set; }

    public List<Favorite> Favorites { get; set; } = [];
    public List<SavedEventRow> SavedEvents { get; set; } = [];
}
```

Create `Api/Models/Favorite.cs`:

```csharp
namespace Api.Models;

// Schema defined in slice 1; endpoints that read/write it arrive in slice 2.
public class Favorite
{
    public Guid UserId { get; set; }
    public string TeamName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
```

Create `Api/Models/SavedEventRow.cs`:

```csharp
namespace Api.Models;

// SnapshotJson holds the client saved-record shape verbatim (opaque to the
// server). Schema defined in slice 1; endpoints arrive in slice 3.
public class SavedEventRow
{
    public Guid UserId { get; set; }
    public string EventId { get; set; } = "";
    public string SnapshotJson { get; set; } = "";
    public DateTime UpdatedAt { get; set; }
}
```

- [ ] **Step 5: Create the DbContext**

Create `Api/Data/AppDbContext.cs`:

```csharp
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<SavedEventRow> SavedEvents => Set<SavedEventRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => new { u.Provider, u.ProviderSubject }).IsUnique();
        });

        b.Entity<Favorite>(e =>
        {
            e.HasKey(f => new { f.UserId, f.TeamName });
            e.HasOne<User>().WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<SavedEventRow>(e =>
        {
            e.HasKey(s => new { s.UserId, s.EventId });
            e.HasOne<User>().WithMany(u => u.SavedEvents)
                .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

- [ ] **Step 6: Create the test DB factory**

Create `Api.Tests/TestDb.cs`:

```csharp
using Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Api.Tests;

// A SQLite in-memory AppDbContext for tests. The connection must stay open for
// the lifetime of the DB (in-memory SQLite is discarded when the last
// connection closes), so callers dispose the returned handle at test end.
// Schema is built with EnsureCreated (tests never run the SqlServer migrations).
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection _connection;
    public AppDbContext Context { get; }

    public TestDb()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;
        Context = new AppDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        _connection.Dispose();
    }
}
```

- [ ] **Step 7: Write the failing round-trip test**

Create `Api.Tests/UserAccountServiceTests.cs`:

```csharp
using Api.Models;

namespace Api.Tests;

[TestClass]
public class UserAccountServiceTests
{
    [TestMethod]
    public async Task DbContext_CanRoundTripAUser()
    {
        using var db = new TestDb();
        db.Context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Provider = "google",
            ProviderSubject = "sub-123",
            Email = "a@b.com",
            DisplayName = "Ada",
            CreatedAt = DateTime.UtcNow,
        });
        await db.Context.SaveChangesAsync();

        var found = db.Context.Users.Single();
        Assert.AreEqual("sub-123", found.ProviderSubject);
        Assert.AreEqual("Ada", found.DisplayName);
    }
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd Api.Tests && dotnet test --filter DbContext_CanRoundTripAUser`
Expected: PASS (1 passed). Confirms EF Core + SQLite wiring works.

- [ ] **Step 9: Commit**

```bash
git add Api/Api.csproj Api.Tests/Api.Tests.csproj Api/Models/User.cs Api/Models/Favorite.cs Api/Models/SavedEventRow.cs Api/Data/AppDbContext.cs Api.Tests/TestDb.cs Api.Tests/UserAccountServiceTests.cs
git commit -m "feat: add EF Core AppDbContext and account entities"
```

---

## Task 2: Find-or-create user service

**Files:**
- Create: `Api/Services/UserAccountService.cs`
- Test: `Api.Tests/UserAccountServiceTests.cs` (add tests)

- [ ] **Step 1: Write the failing test for creating an unknown user**

Add to `Api.Tests/UserAccountServiceTests.cs`:

```csharp
[TestMethod]
public async Task FindOrCreate_UnknownSubject_InsertsNewUser()
{
    using var db = new TestDb();
    var service = new Api.Services.UserAccountService(db.Context);

    var user = await service.FindOrCreateAsync("google", "sub-new", "new@x.com", "New Person");

    Assert.AreNotEqual(Guid.Empty, user.Id);
    Assert.AreEqual(1, db.Context.Users.Count());
    Assert.AreEqual("new@x.com", user.Email);
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd Api.Tests && dotnet test --filter FindOrCreate_UnknownSubject_InsertsNewUser`
Expected: FAIL — build error, `UserAccountService` does not exist.

- [ ] **Step 3: Implement the service**

Create `Api/Services/UserAccountService.cs`:

```csharp
using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class UserAccountService(AppDbContext db)
{
    // Identity is (provider, subject) — email can change and is not a key.
    // A known subject reuses the id and refreshes email/display name; an
    // unknown one inserts a new user.
    public async Task<User> FindOrCreateAsync(
        string provider, string subject, string email, string displayName)
    {
        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Provider == provider && u.ProviderSubject == subject);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Provider = provider,
                ProviderSubject = subject,
                Email = email,
                DisplayName = displayName,
                CreatedAt = DateTime.UtcNow,
            };
            db.Users.Add(user);
        }
        else
        {
            user.Email = email;
            user.DisplayName = displayName;
        }

        await db.SaveChangesAsync();
        return user;
    }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd Api.Tests && dotnet test --filter FindOrCreate_UnknownSubject_InsertsNewUser`
Expected: PASS.

- [ ] **Step 5: Write the failing test for a known subject reusing the id**

Add to `Api.Tests/UserAccountServiceTests.cs`:

```csharp
[TestMethod]
public async Task FindOrCreate_KnownSubject_ReusesIdAndUpdatesProfile()
{
    using var db = new TestDb();
    var service = new Api.Services.UserAccountService(db.Context);

    var first = await service.FindOrCreateAsync("google", "sub-1", "old@x.com", "Old Name");
    var second = await service.FindOrCreateAsync("google", "sub-1", "new@x.com", "New Name");

    Assert.AreEqual(first.Id, second.Id);
    Assert.AreEqual(1, db.Context.Users.Count());
    Assert.AreEqual("new@x.com", second.Email);
    Assert.AreEqual("New Name", second.DisplayName);
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `cd Api.Tests && dotnet test --filter FindOrCreate_KnownSubject_ReusesIdAndUpdatesProfile`
Expected: PASS (the service already handles this; the test locks the behavior).

- [ ] **Step 7: Commit**

```bash
git add Api/Services/UserAccountService.cs Api.Tests/UserAccountServiceTests.cs
git commit -m "feat: find-or-create user by provider subject"
```

---

## Task 3: Register DB + auth, fail-soft, behind a single flag

**Files:**
- Create: `Api/Auth/AccountsStartup.cs`
- Modify: `Api/Program.cs`
- Modify: `Api/appsettings.Development.json`

- [ ] **Step 1: Create the startup extension**

Create `Api/Auth/AccountsStartup.cs`:

```csharp
using System.Security.Claims;
using Api.Data;
using Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
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

        services.AddAuthentication(o =>
            {
                o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = "Google";
            })
            .AddCookie(o =>
            {
                o.Cookie.HttpOnly = true;
                o.Cookie.SameSite = SameSiteMode.Lax;
                o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
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
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
    }
}
```

- [ ] **Step 2: Wire it into Program.cs (service registration)**

In `Api/Program.cs`, add the using at the top with the other usings:

```csharp
using Api.Auth;
```

Then, immediately after the rate limiter registration block (after the `builder.Services.AddRateLimiter(...)` call, before `var app = builder.Build();`), add:

```csharp
// Optional accounts layer (Google OAuth + Azure SQL). Fully inert unless both
// a connection string and Google credentials are configured.
builder.Services.AddAccounts(builder.Configuration);
```

- [ ] **Step 3: Wire it into Program.cs (middleware + migration)**

In `Api/Program.cs`, immediately after `app.UseRateLimiter();`, add:

```csharp
if (app.Configuration.AccountsEnabled())
{
    app.UseAuthentication();
    app.UseAuthorization();
}
app.MigrateAccountsDb();
```

- [ ] **Step 4: Add local config placeholders**

In `Api/appsettings.Development.json`, add these keys (leave values empty so local dev stays accounts-disabled until a developer fills them in):

```json
"ConnectionStrings": {
  "Default": ""
},
"Google": {
  "ClientId": "",
  "ClientSecret": ""
}
```

(Merge into the existing JSON object — do not create a second root object.)

- [ ] **Step 5: Verify the app still builds and runs accounts-disabled**

Run: `cd Api && dotnet build`
Expected: `Build succeeded`.

Run: `cd Api.Tests && dotnet test`
Expected: all existing tests PASS (accounts disabled in the test host — no connection string — so nothing changed for them).

- [ ] **Step 6: Commit**

```bash
git add Api/Auth/AccountsStartup.cs Api/Program.cs Api/appsettings.Development.json
git commit -m "feat: register optional accounts layer, fail-soft when unconfigured"
```

---

## Task 4: The `/api/me` endpoint with a test auth handler

**Files:**
- Create: `Api.Tests/TestAuthHandler.cs`
- Modify: `Api/Auth/AccountsStartup.cs` (add endpoint mapping)
- Modify: `Api/Program.cs` (call the mapping)
- Test: `Api.Tests/AuthEndpointsTests.cs`

- [ ] **Step 1: Add the auth endpoint mapper (stub `/api/me`)**

In `Api/Auth/AccountsStartup.cs`, add this method to the `AccountsStartup` class:

```csharp
public static void MapAccountEndpoints(this WebApplication app)
{
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
}
```

- [ ] **Step 2: Call the mapper in Program.cs**

In `Api/Program.cs`, immediately before `app.MapFallbackToFile("index.html", staticFiles);`, add:

```csharp
app.MapAccountEndpoints();
```

- [ ] **Step 3: Create the test auth handler**

Create `Api.Tests/TestAuthHandler.cs`:

```csharp
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Api.Tests;

// A stand-in auth scheme for integration tests. When a request carries the
// header "Test-User: <id>", it is treated as an authenticated user with that
// id; otherwise the request is anonymous (no ticket).
public class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Test-User", out var id))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(ClaimTypes.Email, $"{id}@test.local"),
            new Claim(ClaimTypes.Name, "Test User"),
        };
        var ticket = new AuthenticationTicket(
            new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName)), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
```

- [ ] **Step 4: Write the failing tests for `/api/me`**

Create `Api.Tests/AuthEndpointsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using Api.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Api.Tests;

[TestClass]
public class AuthEndpointsTests
{
    // Boots the app with accounts ENABLED (SQLite connection + fake Google
    // creds), then swaps the real cookie/Google schemes for the Test scheme so
    // integration tests can authenticate without a browser OAuth round-trip.
    private static WebApplicationFactory<Program> EnabledFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=file:me?mode=memory&cache=shared");
            builder.UseSetting("Google:ClientId", "test-client");
            builder.UseSetting("Google:ClientSecret", "test-secret");
            builder.ConfigureTestServices(services =>
            {
                services.AddAuthentication(TestAuthHandler.SchemeName)
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

    private record MeResponse(string Id, string Email, string DisplayName);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd Api.Tests && dotnet test --filter AuthEndpointsTests`
Expected: 3 passed. (`Me_Anonymous` → 401 via the cookie `OnRedirectToLogin` override that the Test scheme's authorization also honors; `Me_Authenticated` → 200; `Me_AccountsDisabled` → 404 because the route isn't mapped.)

Note: `Me_Anonymous_Returns401` relies on `RequireAuthorization()` returning 401. If the default authorization returns 404 instead under the Test scheme, the endpoint mapping still requires auth — verify the status is 401; if it is 403, adjust the assertion to `Forbidden`. Do not weaken the "must not be 200" guarantee.

- [ ] **Step 6: Commit**

```bash
git add Api.Tests/TestAuthHandler.cs Api.Tests/AuthEndpointsTests.cs Api/Auth/AccountsStartup.cs Api/Program.cs
git commit -m "feat: add GET /api/me with authenticated/anonymous coverage"
```

---

## Task 5: OAuth login / callback / logout endpoints

**Files:**
- Modify: `Api/Auth/AccountsStartup.cs` (extend `MapAccountEndpoints`)
- Test: `Api.Tests/AuthEndpointsTests.cs` (add login-challenge test)

- [ ] **Step 1: Add login, callback, and logout to the endpoint mapper**

In `Api/Auth/AccountsStartup.cs`, inside `MapAccountEndpoints` (after the `/api/me` mapping), add:

```csharp
    // Kicks off the Google OAuth challenge. returnUrl is validated as a local
    // path so it can't be used as an open redirect after sign-in.
    app.MapGet("/api/auth/login", (HttpContext ctx, string? returnUrl) =>
    {
        var target = (returnUrl is not null && Uri.IsWellFormedUriString(returnUrl, UriKind.Relative))
            ? returnUrl
            : "/";
        return Results.Challenge(
            new AuthenticationProperties { RedirectUri = target },
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
```

Add the using at the top of the file:

```csharp
using Microsoft.AspNetCore.Authentication;
```

- [ ] **Step 2: Wire find-or-create into the Google ticket creation**

In `Api/Auth/AccountsStartup.cs`, replace the `.AddGoogle("Google", o => { ... })` block from Task 3 with this version that persists the user on sign-in:

```csharp
            .AddGoogle("Google", o =>
            {
                o.ClientId = config["Google:ClientId"]!;
                o.ClientSecret = config["Google:ClientSecret"]!;
                o.CallbackPath = "/api/auth/callback";
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
```

Add these usings at the top of the file if not already present:

```csharp
using Microsoft.AspNetCore.Authentication.Google;
```

- [ ] **Step 3: Write the failing test that login issues a Google challenge**

Add to `Api.Tests/AuthEndpointsTests.cs`. This test uses a factory with the **real** Google handler (not the Test scheme) so the challenge is exercised:

```csharp
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd Api.Tests && dotnet test --filter Login_RedirectsToGoogle`
Expected: PASS — the challenge produces a 302 to `accounts.google.com`.

- [ ] **Step 5: Run the full API suite**

Run: `cd Api.Tests && dotnet test`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add Api/Auth/AccountsStartup.cs Api.Tests/AuthEndpointsTests.cs
git commit -m "feat: add OAuth login/callback/logout and persist user on sign-in"
```

---

## Task 6: Generate the initial SqlServer migration

**Files:**
- Create: `Api/Data/DesignTimeDbContextFactory.cs`
- Create: `Api/Migrations/*` (generated)

- [ ] **Step 1: Install the EF Core tool (if not already present)**

Run: `dotnet tool install --global dotnet-ef --version 10.0.0`
Expected: `dotnet-ef` installed, or "already installed" — either is fine.

- [ ] **Step 2: Create the design-time factory (required)**

Because `AddAccounts` only registers `AppDbContext` when a connection string and Google credentials are present, `dotnet ef` (which runs with no such config) cannot resolve the context through DI. A design-time factory gives EF the SqlServer provider it needs to emit the migration — it never opens a connection during `migrations add`.

Create `Api/Data/DesignTimeDbContextFactory.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Api.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Connection string is only used to select the provider for migration
        // scaffolding; no connection is opened during `migrations add`.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost;Database=stadar;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        return new AppDbContext(options);
    }
}
```

- [ ] **Step 3: Generate the migration**

Run from the repo root:

Run: `dotnet ef migrations add InitialAccounts --project Api --startup-project Api --context AppDbContext`

Expected: `Build succeeded` and a new `Api/Migrations/<timestamp>_InitialAccounts.cs` plus `Api/Migrations/AppDbContextModelSnapshot.cs`. The migration should create `Users` (with a unique index on `Provider, ProviderSubject`), `Favorites`, and `SavedEvents`.

- [ ] **Step 4: Confirm the migration compiles**

Run: `cd Api && dotnet build`
Expected: `Build succeeded`.

- [ ] **Step 5: Confirm tests still pass (they use EnsureCreated, not the migration)**

Run: `cd Api.Tests && dotnet test`
Expected: all PASS. The SQLite tests build schema via `EnsureCreated`; the SqlServer migration is unused by tests and only runs in production via `MigrateAccountsDb`.

- [ ] **Step 6: Commit**

```bash
git add Api/Migrations Api/Data/DesignTimeDbContextFactory.cs
git commit -m "feat: add initial accounts EF Core migration"
```

---

## Task 7: Client auth API helpers

**Files:**
- Modify: `client/src/utils/api.js` (make env access node-safe)
- Create: `client/src/utils/authApi.js`
- Test: `client/src/utils/authApi.test.js`

- [ ] **Step 1: Make `api.js`'s env access node-safe**

`authApi.js` imports `API_BASE` from `api.js`, and `authApi.test.js` runs under `node --test` (no Vite). Today `api.js` does `import.meta.env.VITE_API_URL`, but under plain Node `import.meta.env` is `undefined`, so that line throws at import time and would break the test before any assertion. Guard it — this is behavior-preserving under Vite, where `import.meta.env` is always defined.

In `client/src/utils/api.js`, replace the `API_BASE` export:

```js
const env = import.meta.env ?? {}
export const API_BASE =
  env.VITE_API_URL ??
  (env.DEV ? 'http://localhost:5068' : '')
```

Run: `cd client && npm test`
Expected: existing tests still PASS (this change is invisible to them).

- [ ] **Step 2: Write the failing tests**

Create `client/src/utils/authApi.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchMe, logout } from './authApi.js'

test('fetchMe returns the user on 200', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'u1', email: 'a@b.com', displayName: 'A' }) })
  const user = await fetchMe(fakeFetch)
  assert.equal(user.id, 'u1')
})

test('fetchMe returns null on 401 (anonymous)', async () => {
  const fakeFetch = async () => ({ ok: false, status: 401 })
  const user = await fetchMe(fakeFetch)
  assert.equal(user, null)
})

test('fetchMe returns null on network error', async () => {
  const fakeFetch = async () => { throw new Error('offline') }
  const user = await fetchMe(fakeFetch)
  assert.equal(user, null)
})

test('logout POSTs to the logout endpoint', async () => {
  let calledWith = null
  const fakeFetch = async (url, opts) => { calledWith = { url, opts }; return { ok: true } }
  await logout(fakeFetch)
  assert.match(calledWith.url, /\/api\/auth\/logout$/)
  assert.equal(calledWith.opts.method, 'POST')
})
```

- [ ] **Step 3: Run to verify they fail**

Run: `cd client && node --test src/utils/authApi.test.js`
Expected: FAIL — cannot find module `./authApi.js`.

- [ ] **Step 4: Implement the helpers**

Create `client/src/utils/authApi.js`:

```js
import { API_BASE } from './api.js'

// Returns the signed-in user object, or null when anonymous (401) or on any
// network/parse failure — callers treat null as "anonymous tier".
export async function fetchMe(fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`${API_BASE}/api/me`, { credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function logout(fetchImpl = fetch) {
  try {
    await fetchImpl(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
    // best-effort; the client clears local auth state regardless
  }
}

// The login flow is a full-page navigation (OAuth redirect), not a fetch.
export function loginUrl(returnUrl = window.location.pathname) {
  return `${API_BASE}/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `cd client && node --test src/utils/authApi.test.js`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/utils/api.js client/src/utils/authApi.js client/src/utils/authApi.test.js
git commit -m "feat: add client auth API helpers"
```

---

## Task 8: Auth context and sign-in/out UI

**Files:**
- Create: `client/src/context/AuthContext.jsx`
- Create: `client/src/components/AuthButton.jsx`
- Modify: `client/src/main.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create the auth context**

Create `client/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { fetchMe, logout as logoutRequest, loginUrl } from '../utils/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | anonymous | authenticated

  useEffect(() => {
    let cancelled = false
    fetchMe().then(me => {
      if (cancelled) return
      setUser(me)
      setStatus(me ? 'authenticated' : 'anonymous')
    })
    return () => { cancelled = true }
  }, [])

  function login() {
    window.location.href = loginUrl()
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
    setStatus('anonymous')
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Create the auth button**

Create `client/src/components/AuthButton.jsx`:

```jsx
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthButton() {
  const { user, status, login, logout } = useAuth()

  if (status === 'loading') return null

  if (status === 'authenticated') {
    return (
      <button
        onClick={logout}
        className="text-xs text-slate-400 hover:text-slate-200"
        title={user?.email}
      >
        Sign out{user?.displayName ? ` (${user.displayName})` : ''}
      </button>
    )
  }

  return (
    <button
      onClick={login}
      className="text-xs text-slate-300 hover:text-white"
    >
      Sign in with Google
    </button>
  )
}
```

- [ ] **Step 3: Wrap the app in the provider**

Replace the entire body of `client/src/main.jsx` with (adds the `AuthProvider` import and nests `<App />` inside it, within `BrowserRouter`):

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 4: Render the auth button in the layout**

In `client/src/App.jsx`, import and place `AuthButton` inside `AppLayout` so it appears on the main shell:

```jsx
import AuthButton from './components/AuthButton.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen bg-night-950 pb-16">
      <div className="flex justify-end px-4 pt-3">
        <AuthButton />
      </div>
      <Outlet />
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 5: Verify lint and build pass**

Run: `cd client && npm run lint`
Expected: no errors.

Run: `cd client && npm run build`
Expected: `built in ...` with no errors.

- [ ] **Step 6: Run the full client test suite**

Run: `cd client && npm test`
Expected: all tests PASS (existing + new `authApi` tests).

- [ ] **Step 7: Commit**

```bash
git add client/src/context/AuthContext.jsx client/src/components/AuthButton.jsx client/src/main.jsx client/src/App.jsx
git commit -m "feat: add auth context and sign-in/out control"
```

---

## Task 9: CI secrets and documentation

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Pass the new secrets in the deploy workflow**

In `.github/workflows/deploy.yml`, replace the "Deploy to Azure Container Apps" step's `az containerapp update` command with this version that adds the three env vars to the existing `--set-env-vars` list:

```yaml
      - name: Deploy to Azure Container Apps
        run: |
          az containerapp update \
            --name stadar \
            --resource-group stadar-rg \
            --image $IMAGE:${{ github.sha }} \
            --set-env-vars \
              Ticketmaster__ApiKey=${{ secrets.TICKETMASTER_API_KEY }} \
              Google__ClientId=${{ secrets.GOOGLE_CLIENT_ID }} \
              Google__ClientSecret=${{ secrets.GOOGLE_CLIENT_SECRET }} \
              ConnectionStrings__Default="${{ secrets.SQL_CONNECTION_STRING }}"
```

The SQL connection string contains spaces and semicolons, so it **must** stay double-quoted or `--set-env-vars` (which parses a space-separated `KEY=VALUE` list) will split it into broken pairs. When all three account secrets are empty (not yet created), the app sees blank values and `AccountsEnabled()` is false — a safe anonymous-only deploy, not a broken one.

- [ ] **Step 2: Note the required GitHub secrets**

No command — record for the operator that three new repo secrets must be created before the next deploy that enables accounts: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SQL_CONNECTION_STRING`. Until they exist, `AccountsEnabled()` is false in production and the app runs anonymous-only (safe default — no broken deploy).

- [ ] **Step 3: Update CLAUDE.md**

In `CLAUDE.md`, update the API section to add the new endpoints under the endpoint list:

```text
GET  /api/me
GET  /api/auth/login
GET  /api/auth/callback
POST /api/auth/logout
```

Add a bullet to Key Technical Notes:

```markdown
- **Accounts (optional):** Google OAuth via ASP.NET Core built-in handlers + Azure SQL (EF Core). Fully inert unless BOTH `ConnectionStrings:Default` and `Google:ClientId`/`Google:ClientSecret` are set (`Google__*` / `ConnectionStrings__Default` in Azure). Anonymous browsing never touches SQL. Migrations apply at startup when enabled; tests use SQLite in-memory via `EnsureCreated`. Spec: `docs/superpowers/specs/2026-07-21-accounts-oauth-sync-design.md`
```

Update the Deployment table row for Azure SQL from "Not yet" to reflect the schema landing (serverless, auto-pause), and add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SQL_CONNECTION_STRING` to the "GitHub repo secrets used by CI" list.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml CLAUDE.md
git commit -m "docs: wire accounts secrets into CI and document the accounts layer"
```

---

## Final Verification

- [ ] **Step 1: Full API test suite**

Run: `cd Api.Tests && dotnet test`
Expected: all PASS, including `UserAccountServiceTests` (3), `AuthEndpointsTests` (4), and every pre-existing test unchanged.

- [ ] **Step 2: Full client test suite + lint + build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no lint errors, successful build.

- [ ] **Step 3: Manual OAuth smoke test (requires real Google credentials)**

With a real Google OAuth client configured locally (`ConnectionStrings:Default` pointing at a local SQL Server / Azure SQL and `Google:ClientId`/`Secret` filled in `appsettings.Development.json`), and the redirect URI `http://localhost:5068/api/auth/callback` registered in the Google Cloud console:

1. `cd Api && dotnet watch` and `cd client && npm run dev`.
2. Visit the client, click "Sign in with Google", complete consent.
3. Confirm you land back in the SPA and the button now reads "Sign out (<name>)".
4. Confirm a row exists in the `Users` table.
5. Reload the page — the button still shows signed-in (cookie persisted, `/api/me` returns the user).
6. Click "Sign out" — the button returns to "Sign in with Google".
7. In a private window with no cookie, confirm the app works anonymously and `/api/me` returns 401 with no error surfaced to the user.

- [ ] **Step 4: Confirm anonymous path is DB-free**

With accounts **disabled** (blank connection string), confirm `cd Api.Tests && dotnet test` passes and that no `/api/me` or `/api/auth/*` route resolves (all 404). This proves the anonymous deployment never registers the DB.
```
