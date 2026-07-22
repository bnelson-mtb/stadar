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
