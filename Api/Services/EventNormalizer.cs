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

        // 2. AHL/ECHL — team-name detection fires before generic minor-league fallback
        if (IsAhlTeam(normalizedHome) || IsAhlTeam(normalizedAway))
            return Result("Hockey", "AHL");

        if (IsEchlTeam(normalizedHome) || IsEchlTeam(normalizedAway))
            return Result("Hockey", "ECHL");

        if (subGenre.Contains("minor league", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("echl", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("ahl", StringComparison.OrdinalIgnoreCase))
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
            if (guessed != "Misc")
            {
                // If we detected a sport from title, check if it's a college matchup
                // (e.g., "Utah Tech Football" + "Montana State Football" suggests college)
                if (guessed == "Football" && LooksLikeCollegeFootball(title, normalizedHome, normalizedAway))
                    return Result("Football", "NCAAF");
                return Result(guessed, "");
            }
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
            "international arena league"       => ("Football", "IAL"),
            "ial"                              => ("Football", "IAL"),
            "usl championship" or "usl league one" or "united soccer league" => ("Soccer", "USL"),
            "liga mx"                          => ("Soccer", "Liga MX"),
            "fifa world cup" or "world cup"    => ("Soccer", "World Cup"),
            "international soccer"             => ("Soccer", "International"),
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

    public static bool IsAhlTeam(string team)
    {
        string[] ahlTeams =
        [
            "Abbotsford Canucks", "Bakersfield Condors", "Belleville Senators",
            "Bridgeport Islanders", "Calgary Wranglers", "Charlotte Checkers",
            "Chicago Wolves", "Cleveland Monsters", "Coachella Valley Firebirds",
            "Colorado Eagles", "Grand Rapids Griffins", "Hartford Wolf Pack",
            "Henderson Silver Knights", "Hershey Bears", "Iowa Wild",
            "Laval Rocket", "Lehigh Valley Phantoms", "Manitoba Moose",
            "Milwaukee Admirals", "Ontario Reign", "Providence Bruins",
            "Rochester Americans", "Rockford IceHogs", "San Diego Gulls",
            "San Jose Barracuda", "Springfield Thunderbirds", "Syracuse Crunch",
            "Texas Stars", "Toronto Marlies", "Tucson Roadrunners",
            "Utica Comets", "Wilkes-Barre/Scranton Penguins",
        ];
        return ahlTeams.Any(n => team.Contains(n, StringComparison.OrdinalIgnoreCase));
    }

    public static bool IsEchlTeam(string team)
    {
        string[] echlTeams =
        [
            "Utah Grizzlies", "Adirondack Thunder", "Allen Americans",
            "Atlanta Gladiators", "Bloomington Bison", "Cincinnati Cyclones",
            "Florida Everblades", "Fort Wayne Komets", "Greensboro Gargoyles",
            "Greenville Swamp Rabbits", "Idaho Steelheads", "Jacksonville Icemen",
            "Indy Fuel", "Iowa Heartlanders", "Kalamazoo Wings",
            "Kansas City Mavericks", "Maine Mariners", "Norfolk Admirals",
            "Orlando Solar Bears", "Rapid City Rush", "Reading Royals",
            "Savannah Ghost Pirates", "South Carolina Stingrays", "Tahoe Knight Monsters",
            "Toledo Walleye", "Trois-Rivières Lions", "Tulsa Oilers",
            "Wheeling Nailers", "Wichita Thunder", "Worcester Railers",
        ];
        return echlTeams.Any(n => team.Contains(n, StringComparison.OrdinalIgnoreCase));
    }

    public static bool LooksLikeCollegeFootball(string title, string homeTeam, string awayTeam)
    {
        // When Ticketmaster miscategorizes college football as "Miscellaneous",
        // we detect it from known college team names and patterns.
        // Examples: "Utah Tech Trailblazers Football vs Montana State Bobcats Football"
        
        var knownCollegeTeams = new[]
        {
            // FBS (Power 5 + Group of 5)
            "alabama", "arizona", "arizona state", "colorado", "oregon", "utah", "washington",
            "usc", "byu", "stanford", "cal", "northwestern", "iowa", "illinois", "purdue",
            "wisconsin", "minnesota", "nebraska", "kansas", "oklahoma", "texas", "lsu",
            "florida", "georgia", "miami", "florida state", "clemson", "virginia tech",
            "nc state", "wake forest", "boston college", "syracuse", "pitt", "penn state",
            "michigan", "ohio state", "indiana", "maryland", "rutgers", "duke",
            "uga", "tennessee", "kentucky", "vanderbilt", "mississippi", "mississippi state",
            "louisiana", "ark state", "south carolina", "texas a&m", "missouri", "tulsa",
            "smu", "houston", "ucf", "memphis", "navy", "air force", "army", "boise state",
            "wyoming", "new mexico", "nevada", "san diego state", "unlv",
            "fresno state", "san jose state", "hawaii", "unlv",
            // FCS / other college football
            "utah tech", "southern utah", "weber state", "montana", "montana state", "idaho",
            "idaho state", "portland state", "eastern washington", "northern arizona",
            "north dakota", "south dakota", "south dakota state", "north dakota state",
            "missouri state", "eastern illinois", "western carolina", "furman", "samford",
            "app state", "appalachian state", "eastern kentucky", "liberty", "jmu", "james madison",
            "villanova", "yale", "harvard", "princeton", "penn", "cornell", "brown", "dartmouth",
        };
        
        var titleLower = title.ToLowerInvariant();
        var homeLower = homeTeam.ToLowerInvariant();
        var awayLower = awayTeam.ToLowerInvariant();
        
        // Check if both teams are known college teams
        var homeIsCollege = knownCollegeTeams.Any(t => homeLower.Contains(t));
        var awayIsCollege = knownCollegeTeams.Any(t => awayLower.Contains(t));
        
        // If both are college teams, or if the title explicitly says "football" with college indicator
        if ((homeIsCollege && awayIsCollege) || (homeIsCollege && titleLower.Contains("football")))
            return true;
            
        return false;
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
