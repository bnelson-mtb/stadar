using System.Data.Common;
using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

// Boots the app with accounts ENABLED, the fake Test auth scheme, and a real
// working SQLite database (shared open connection) in place of SqlServer.
// Requests authenticate by sending the "Test-User: <guid>" header.
public sealed class AccountsTestFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Default", "DataSource=:memory:");
        builder.UseSetting("Google:ClientId", "test-client");
        builder.UseSetting("Google:ClientSecret", "test-secret");

        builder.ConfigureTestServices(services =>
        {
            // Fake auth scheme (default + challenge) so anonymous → 401,
            // "Test-User" header → authenticated.
            services.AddAuthentication(o =>
                {
                    o.DefaultScheme = TestAuthHandler.SchemeName;
                    o.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName, _ => { });

            // Replace the SqlServer AppDbContext with a shared open SQLite one.
            // Remove every AppDbContext-related registration — not just
            // DbContextOptions, but also IDbContextOptionsConfiguration<AppDbContext>
            // (which .NET 10's AddDbContext accumulates; leaving the SqlServer one
            // in place makes EF see two providers → "Only a single database provider
            // can be registered").
            var toRemove = services.Where(d =>
                d.ServiceType == typeof(AppDbContext) ||
                d.ServiceType == typeof(DbContextOptions) ||
                (d.ServiceType.IsGenericType &&
                 d.ServiceType.GetGenericArguments().Contains(typeof(AppDbContext)))).ToList();
            foreach (var d in toRemove) services.Remove(d);

            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            services.AddSingleton<DbConnection>(connection);
            services.AddDbContext<AppDbContext>((sp, o) =>
                o.UseSqlite(sp.GetRequiredService<DbConnection>()));
        });
    }

    // Inserts a Users row so favorites (which FK to Users) can be written.
    // Mirrors production, where OAuth find-or-create makes the user first.
    public void SeedUser(string userId)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var id = Guid.Parse(userId);
        if (!db.Users.Any(u => u.Id == id))
        {
            db.Users.Add(new User
            {
                Id = id,
                Provider = "test",
                ProviderSubject = userId,
                Email = $"{userId}@test.local",
                DisplayName = "Test User",
                CreatedAt = DateTime.UtcNow,
            });
            db.SaveChanges();
        }
    }
}
