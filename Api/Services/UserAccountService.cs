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
