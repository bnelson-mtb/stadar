using System.Text.Json;

namespace Api.Services;

/// <summary>
/// Canonical team names exported from the client data layer
/// (scripts/export-known-teams.mjs -> Api/Data/known-teams.json).
/// A missing/broken file degrades to an empty set: the unknown-team trigger
/// then fires more often, which costs quota but never breaks the feed.
/// </summary>
public static class KnownTeams
{
    private static readonly Lazy<IReadOnlySet<string>> Loaded = new(Load);

    public static IReadOnlySet<string> Names => Loaded.Value;

    private static IReadOnlySet<string> Load()
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Data", "known-teams.json");
            var names = JsonSerializer.Deserialize<string[]>(File.ReadAllText(path)) ?? [];
            return new HashSet<string>(names, StringComparer.OrdinalIgnoreCase);
        }
        catch (Exception e)
        {
            Console.WriteLine($"known-teams.json load failed ({e.Message}) - unknown-team trigger will fire for every team");
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }
    }
}
