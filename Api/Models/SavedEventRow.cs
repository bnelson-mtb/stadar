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
