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
