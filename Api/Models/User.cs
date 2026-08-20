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
