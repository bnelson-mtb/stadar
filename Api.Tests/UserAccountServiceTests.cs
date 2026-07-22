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
}
