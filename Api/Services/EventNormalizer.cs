using System.Text.RegularExpressions;

namespace Api.Services;

/// <summary>
/// Cleans up raw Ticketmaster data: strips suffixes from team names and
/// classifies events into a canonical sport + league. Location-agnostic.
/// </summary>
public static class EventNormalizer
{
    public static (string HomeTeam, string AwayTeam, string Sport, string League) NormalizeEvent(
        string eventName,
        string homeTeam,
        string awayTeam,
        string rawSport,
        string rawLeague)
    {
        var normalizedHome = NormalizeTeamName(homeTeam ?? "");
        var normalizedAway = NormalizeTeamName(awayTeam ?? "");
        (string, string, string, string) Result(string sport, string league)
            => (normalizedHome, normalizedAway, sport, league);

        var title = (eventName ?? "").ToLowerInvariant();
        var lowerHome = normalizedHome.ToLowerInvariant();
        var lowerAway = normalizedAway.ToLowerInvariant();
        var subGenre = (rawLeague ?? "").Trim();
        var genre = (rawSport ?? "").Trim();

        // 1. Direct pro league match from TM subGenre
        var proMatch = MatchProLeague(subGenre);
        if (proMatch.Sport != null)
            return Result(proMatch.Sport, proMatch.League!);

        // 2. Minor league — use genre to determine sport, default to hockey for ECHL/AHL
        if (subGenre.Contains("echl", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("ahl", StringComparison.OrdinalIgnoreCase))
            return Result("Hockey", "Minor League");

        if (subGenre.Contains("minor league", StringComparison.OrdinalIgnoreCase))
        {
            var minorSport = MapSport(genre) ?? "Hockey";
            return Result(minorSport, "Minor League");
        }

        // 3. NWSL by team name (TM doesn't always tag these correctly)
        if (IsNwslTeam(normalizedHome) || IsNwslTeam(normalizedAway))
            return Result("Soccer", "NWSL");

        // 4. LOVB (name-based, but not location-specific)
        if (lowerHome.Contains("lovb") || lowerAway.Contains("lovb"))
            return Result("Volleyball", "LOVB");

        // 5. College detection — TM tags these with "College" in subGenre
        bool isCollege = subGenre.Contains("college", StringComparison.OrdinalIgnoreCase)
                      || subGenre.Contains("ncaa", StringComparison.OrdinalIgnoreCase);

        if (isCollege)
        {
            var sport = ResolveSport(genre, title);
            var league = ResolveCollegeLeague(sport, title);
            return Result(sport, league);
        }

        // 6. Resolve sport from TM genre
        var mappedSport = MapSport(genre);
        if (mappedSport != null)
            return Result(mappedSport, "");

        // 7. Miscellaneous / missing genre — try to parse from event title
        if (string.IsNullOrWhiteSpace(genre)
            || genre.Equals("miscellaneous", StringComparison.OrdinalIgnoreCase))
        {
            var guessed = ResolveSport("", title);
            if (guessed != "Misc") return Result(guessed, "");
        }

        return Result("Misc", "");
    }

    public static (string? Sport, string? League) MatchProLeague(string subGenre)
    {
        return subGenre.ToLowerInvariant() switch
        {
            "nba"                              => ("Basketball", "NBA"),
            "wnba"                             => ("Basketball", "WNBA"),
            "nhl"                              => ("Hockey", "NHL"),
            "nfl"                              => ("Football", "NFL"),
            "mlb"                              => ("Baseball", "MLB"),
            "major league baseball"            => ("Baseball", "MLB"),
            "mls"                              => ("Soccer", "MLS"),
            "major league soccer"              => ("Soccer", "MLS"),
            "nwsl"                             => ("Soccer", "NWSL"),
            "national women's soccer league"   => ("Soccer", "NWSL"),
            "premier lacrosse league"          => ("Lacrosse", "PLL"),
            "pll"                              => ("Lacrosse", "PLL"),
            _                                  => (null, null),
        };
    }

    public static string? MapSport(string genre)
    {
        return genre.ToLowerInvariant() switch
        {
            "basketball" => "Basketball",
            "football"   => "Football",
            "baseball"   => "Baseball",
            "softball"   => "Softball",
            "hockey"     => "Hockey",
            "ice hockey" => "Hockey",
            "soccer"     => "Soccer",
            "volleyball" => "Volleyball",
            "lacrosse"   => "Lacrosse",
            _            => null,
        };
    }

    public static string ResolveSport(string rawSport, string title)
    {
        var mapped = MapSport(rawSport);
        if (mapped != null) return mapped;

        // Guess from event title keywords
        if (title.Contains("basketball")) return "Basketball";
        if (title.Contains("football"))   return "Football";
        if (title.Contains("baseball"))   return "Baseball";
        if (title.Contains("softball"))   return "Softball";
        if (title.Contains("hockey"))     return "Hockey";
        if (title.Contains("soccer") || title.Contains(" fc")) return "Soccer";
        if (title.Contains("volleyball")) return "Volleyball";
        if (title.Contains("lacrosse"))   return "Lacrosse";
        return "Misc";
    }

    public static string ResolveCollegeLeague(string sport, string title)
    {
        bool mentionsWomens = title.Contains("women's") || title.Contains("womens") || title.Contains("women ");
        bool mentionsMens = title.Contains("men's") || title.Contains("mens") || title.Contains("men ");

        return sport switch
        {
            "Basketball" => mentionsWomens ? "NCAAW" : "NCAAM",
            "Football"   => "NCAAF",
            "Baseball"   => "NCAA Baseball",
            "Softball"   => "NCAA Softball",
            "Volleyball" => mentionsWomens ? "NCAA WVB" : mentionsMens ? "NCAA MVB" : "NCAA VB",
            "Soccer"     => mentionsWomens ? "Women's Soccer" : mentionsMens ? "Men's Soccer" : "NCAA Soccer",
            _            => "NCAA",
        };
    }

    public static bool IsNwslTeam(string team)
    {
        // Add NWSL teams here as the league expands
        string[] nwslTeams =
        [
            "Utah Royals",
            "Portland Thorns",
            "North Carolina Courage",
            "Chicago Red Stars",
            "Washington Spirit",
            "OL Reign",
            "Houston Dash",
            "Kansas City Current",
            "Angel City",
            "San Diego Wave",
            "Racing Louisville",
            "Gotham FC",
            "Orlando Pride",
            "Seattle Reign",
        ];
        return nwslTeams.Any(n => team.Contains(n, StringComparison.OrdinalIgnoreCase));
    }

    public static string NormalizeTeamName(string teamName)
    {
        if (string.IsNullOrWhiteSpace(teamName)) return "";

        var normalized = teamName.Trim();
        normalized = Regex.Replace(normalized, @"^LOVB\s+(.+?)\s+Volleyball$", "LOVB $1", RegexOptions.IgnoreCase);
        normalized = Regex.Replace(normalized, @"\s+(Men'?s|Women'?s|Mens|Womens)\s+(Basketball|Volleyball|Soccer|Softball|Baseball|Football)\s*$", "", RegexOptions.IgnoreCase);
        normalized = Regex.Replace(normalized, @"\s+(Football|Baseball|Softball|Gymnastics)\s*$", "", RegexOptions.IgnoreCase);
        return normalized.Trim();
    }
}
