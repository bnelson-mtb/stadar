using Api.Models;

namespace Api.Services;

/// <summary>
/// Decides whether an event needs an LLM verdict. Triggers gate verdict
/// creation only — a stored verdict is always applied regardless of triggers.
/// All checks are free (no I/O).
/// </summary>
public static class ClassificationTriggers
{
    public static IReadOnlyList<string> Evaluate(ClassificationInput input, IReadOnlySet<string> knownTeams)
    {
        var fired = new List<string>();

        // 1. A non-empty team name the client data layer doesn't know —
        //    mangled extraction or a genuinely unknown team (the no-logo cases).
        var homeUnknown = !string.IsNullOrWhiteSpace(input.DraftHomeTeam) && !knownTeams.Contains(input.DraftHomeTeam);
        var awayUnknown = !string.IsNullOrWhiteSpace(input.DraftAwayTeam) && !knownTeams.Contains(input.DraftAwayTeam);
        if (homeUnknown || awayUnknown)
            fired.Add("unknown-team");

        var leagueUnresolved = IsOtherOrEmpty(input.DraftLeague);
        var looksLikeMatchup = MatchupTitleParser.LooksLikeMatchup(input.EventName);

        // 2. The rules admit they can't classify it.
        if (leagueUnresolved || IsOtherOrEmpty(input.DraftSport))
            fired.Add("unclassified");

        // 3. No recognized league and no matchup-shaped title — the shape the
        //    heuristic keep-rules exist to drop.
        if (leagueUnresolved && !looksLikeMatchup)
            fired.Add("would-be-dropped");

        // 4. Passed on league alone: single attraction wearing a real league
        //    tag ("Utah Jazz Block Party" tagged NBA).
        if (!leagueUnresolved && string.IsNullOrWhiteSpace(input.DraftAwayTeam) && !looksLikeMatchup)
            fired.Add("no-matchup-pass");

        return fired;
    }

    private static bool IsOtherOrEmpty(string value) =>
        string.IsNullOrWhiteSpace(value) || value.Equals("Other", StringComparison.OrdinalIgnoreCase);
}
