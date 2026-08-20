namespace Api.Models;

// Schema defined in slice 1; endpoints that read/write it arrive in slice 2.
public class Favorite
{
    public Guid UserId { get; set; }
    public string TeamName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
