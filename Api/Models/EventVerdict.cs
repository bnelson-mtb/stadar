namespace Api.Models;

/// <summary>
/// The LLM's ruling on one Ticketmaster event. Stored verdicts always win
/// over the rules pipeline; only LLM-classified events are ever stored.
/// </summary>
public record EventVerdict(
    bool IsSpectatorGame,
    string Sport,
    string League,      // from ClassificationSchema.Leagues; "Unknown" is mapped to "Other" at display time
    string HomeTeam,
    string AwayTeam,
    string Reason,      // one short sentence, logged when an event is dropped
    string EventDate,   // event's local date (yyyy-MM-dd), used for pruning
    int SchemaVersion,  // verdicts from older schema versions are re-classified
    DateTime ClassifiedAt);

/// <summary>
/// Closed vocabularies for the classifier's structured output. Bump Version
/// whenever the prompt, enums, or verdict semantics change — stored verdicts
/// with an older version are lazily re-classified.
/// </summary>
public static class ClassificationSchema
{
    public const int Version = 1;
    public const string UnknownLeague = "Unknown";

    public static readonly string[] Sports =
    [
        "Basketball", "Football", "Baseball", "Softball", "Hockey",
        "Soccer", "Volleyball", "Lacrosse", "Other",
    ];

    // Every league the pipeline or the client data layer knows, plus Unknown.
    public static readonly string[] Leagues =
    [
        "NBA", "WNBA", "NHL", "NFL", "MLB", "MLS", "NWSL", "PLL", "IAL",
        "USL", "Liga MX", "World Cup", "International", "AHL", "ECHL",
        "LOVB", "PWHL",
        "NCAAM", "NCAAW", "NCAAF", "NCAA Baseball", "NCAA Softball",
        "NCAA WVB", "NCAA MVB", "NCAA VB",
        "Women's Soccer", "Men's Soccer", "NCAA Soccer", "NCAA",
        "Triple-A", "Double-A", "High-A", "Single-A",
        "Other", UnknownLeague,
    ];
}
