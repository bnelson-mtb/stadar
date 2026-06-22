using System.Text.RegularExpressions;

namespace Api.Services;

/// <summary>
/// Detects common team-vs-team separators in event titles and can split a
/// title into home/away team segments using the first recognized separator.
/// </summary>
public static partial class MatchupTitleParser
{
    [GeneratedRegex(@"\s(?:@|vs?\.?)\s", RegexOptions.IgnoreCase)]
    private static partial Regex MatchupSeparatorRegex();

    public static bool LooksLikeMatchup(string? eventName)
    {
        if (string.IsNullOrWhiteSpace(eventName))
            return false;

        return MatchupSeparatorRegex().IsMatch(eventName);
    }

    public static bool TrySplitTeams(string? eventName, out string homeTeam, out string awayTeam)
    {
        homeTeam = "";
        awayTeam = "";

        if (string.IsNullOrWhiteSpace(eventName))
            return false;

        var match = MatchupSeparatorRegex().Match(eventName);
        if (!match.Success)
            return false;

        homeTeam = eventName[..match.Index].Trim();
        awayTeam = eventName[(match.Index + match.Length)..].Trim();

        return !string.IsNullOrWhiteSpace(homeTeam) && !string.IsNullOrWhiteSpace(awayTeam);
    }
}
