namespace Api.Models;

/// <summary>
/// Everything the trigger evaluator and the classifier prompt need about one
/// event — raw Ticketmaster fields plus the deterministic rules draft.
/// </summary>
public record ClassificationInput(
    string EventId,
    string EventName,
    string RawHomeTeam,   // first attraction name, as extracted
    string RawAwayTeam,   // second attraction / title-parsed, may be ""
    string RawSport,      // Ticketmaster genre
    string RawLeague,     // Ticketmaster subGenre
    string DraftHomeTeam, // post-NormalizeTeamName
    string DraftAwayTeam,
    string DraftSport,    // EventNormalizer output
    string DraftLeague,
    string Venue,
    string City,
    string State,
    string LocalDate);
