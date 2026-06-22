namespace Api.Services;

/// <summary>
/// Maps Minor League Baseball team names to their classification level.
/// Ticketmaster's subGenre only says "Minor League Baseball"; the specific
/// level (Triple-A / Double-A / High-A / Single-A) is mapped from the team here.
/// AAA/AA lists are reliable; A+/A are best-effort and should be verified
/// against milb.com. Unrecognized teams return null (caller falls back to
/// generic "Minor League").
/// </summary>
public static class MinorLeagueBaseball
{
    private static readonly Dictionary<string, string> Levels = new(StringComparer.OrdinalIgnoreCase)
    {
        // ---------- Triple-A (AAA) ----------
        // International League
        ["Buffalo Bisons"] = "Triple-A",
        ["Charlotte Knights"] = "Triple-A",
        ["Columbus Clippers"] = "Triple-A",
        ["Durham Bulls"] = "Triple-A",
        ["Gwinnett Stripers"] = "Triple-A",
        ["Indianapolis Indians"] = "Triple-A",
        ["Iowa Cubs"] = "Triple-A",
        ["Jacksonville Jumbo Shrimp"] = "Triple-A",
        ["Lehigh Valley IronPigs"] = "Triple-A",
        ["Louisville Bats"] = "Triple-A",
        ["Memphis Redbirds"] = "Triple-A",
        ["Nashville Sounds"] = "Triple-A",
        ["Norfolk Tides"] = "Triple-A",
        ["Omaha Storm Chasers"] = "Triple-A",
        ["Rochester Red Wings"] = "Triple-A",
        ["Scranton/Wilkes-Barre RailRiders"] = "Triple-A",
        ["St. Paul Saints"] = "Triple-A",
        ["Syracuse Mets"] = "Triple-A",
        ["Toledo Mud Hens"] = "Triple-A",
        ["Worcester Red Sox"] = "Triple-A",
        // Pacific Coast League
        ["Albuquerque Isotopes"] = "Triple-A",
        ["El Paso Chihuahuas"] = "Triple-A",
        ["Las Vegas Aviators"] = "Triple-A",
        ["Oklahoma City Comets"] = "Triple-A",
        ["Reno Aces"] = "Triple-A",
        ["Round Rock Express"] = "Triple-A",
        ["Sacramento River Cats"] = "Triple-A",
        ["Salt Lake Bees"] = "Triple-A",
        ["Sugar Land Space Cowboys"] = "Triple-A",
        ["Tacoma Rainiers"] = "Triple-A",

        // ---------- Double-A (AA) ----------
        // Eastern League
        ["Akron RubberDucks"] = "Double-A",
        ["Altoona Curve"] = "Double-A",
        ["Binghamton Rumble Ponies"] = "Double-A",
        ["Chesapeake Baysox"] = "Double-A",
        ["Erie SeaWolves"] = "Double-A",
        ["Harrisburg Senators"] = "Double-A",
        ["Hartford Yard Goats"] = "Double-A",
        ["New Hampshire Fisher Cats"] = "Double-A",
        ["Portland Sea Dogs"] = "Double-A",
        ["Reading Fightin Phils"] = "Double-A",
        ["Richmond Flying Squirrels"] = "Double-A",
        ["Somerset Patriots"] = "Double-A",
        // Southern League
        ["Biloxi Shuckers"] = "Double-A",
        ["Birmingham Barons"] = "Double-A",
        ["Chattanooga Lookouts"] = "Double-A",
        ["Columbus Clingstones"] = "Double-A",
        ["Knoxville Smokies"] = "Double-A",
        ["Montgomery Biscuits"] = "Double-A",
        ["Pensacola Blue Wahoos"] = "Double-A",
        ["Rocket City Trash Pandas"] = "Double-A",
        // Texas League
        ["Amarillo Sod Poodles"] = "Double-A",
        ["Arkansas Travelers"] = "Double-A",
        ["Corpus Christi Hooks"] = "Double-A",
        ["Frisco RoughRiders"] = "Double-A",
        ["Midland RockHounds"] = "Double-A",
        ["Northwest Arkansas Naturals"] = "Double-A",
        ["San Antonio Missions"] = "Double-A",
        ["Springfield Cardinals"] = "Double-A",
        ["Tulsa Drillers"] = "Double-A",
        ["Wichita Wind Surge"] = "Double-A",

        // ---------- High-A (A+) ---------- (best-effort; verify against milb.com)
        // Midwest League
        ["Beloit Sky Carp"] = "High-A",
        ["Cedar Rapids Kernels"] = "High-A",
        ["Dayton Dragons"] = "High-A",
        ["Fort Wayne TinCaps"] = "High-A",
        ["Great Lakes Loons"] = "High-A",
        ["Lake County Captains"] = "High-A",
        ["Lansing Lugnuts"] = "High-A",
        ["Peoria Chiefs"] = "High-A",
        ["Quad Cities River Bandits"] = "High-A",
        ["South Bend Cubs"] = "High-A",
        ["West Michigan Whitecaps"] = "High-A",
        ["Wisconsin Timber Rattlers"] = "High-A",
        // Northwest League
        ["Eugene Emeralds"] = "High-A",
        ["Everett AquaSox"] = "High-A",
        ["Hillsboro Hops"] = "High-A",
        ["Spokane Indians"] = "High-A",
        ["Tri-City Dust Devils"] = "High-A",
        ["Vancouver Canadians"] = "High-A",
        // South Atlantic League
        ["Aberdeen IronBirds"] = "High-A",
        ["Asheville Tourists"] = "High-A",
        ["Bowling Green Hot Rods"] = "High-A",
        ["Brooklyn Cyclones"] = "High-A",
        ["Greensboro Grasshoppers"] = "High-A",
        ["Greenville Drive"] = "High-A",
        ["Hickory Crawdads"] = "High-A",
        ["Hudson Valley Renegades"] = "High-A",
        ["Jersey Shore BlueClaws"] = "High-A",
        ["Rome Emperors"] = "High-A",
        ["Wilmington Blue Rocks"] = "High-A",
        ["Winston-Salem Dash"] = "High-A",

        // ---------- Single-A (A) ---------- (best-effort; verify against milb.com)
        // California League
        ["Fresno Grizzlies"] = "Single-A",
        ["Inland Empire 66ers"] = "Single-A",
        ["Lake Elsinore Storm"] = "Single-A",
        ["Modesto Nuts"] = "Single-A",
        ["Rancho Cucamonga Quakes"] = "Single-A",
        ["San Jose Giants"] = "Single-A",
        ["Stockton Ports"] = "Single-A",
        ["Visalia Rawhide"] = "Single-A",
        // Carolina League
        ["Augusta GreenJackets"] = "Single-A",
        ["Carolina Mudcats"] = "Single-A",
        ["Charleston RiverDogs"] = "Single-A",
        ["Columbia Fireflies"] = "Single-A",
        ["Down East Wood Ducks"] = "Single-A",
        ["Fayetteville Woodpeckers"] = "Single-A",
        ["Fredericksburg Nationals"] = "Single-A",
        ["Kannapolis Cannon Ballers"] = "Single-A",
        ["Lynchburg Hillcats"] = "Single-A",
        ["Myrtle Beach Pelicans"] = "Single-A",
        ["Salem Red Sox"] = "Single-A",
        // Florida State League
        ["Bradenton Marauders"] = "Single-A",
        ["Clearwater Threshers"] = "Single-A",
        ["Daytona Tortugas"] = "Single-A",
        ["Dunedin Blue Jays"] = "Single-A",
        ["Fort Myers Mighty Mussels"] = "Single-A",
        ["Jupiter Hammerheads"] = "Single-A",
        ["Lakeland Flying Tigers"] = "Single-A",
        ["Palm Beach Cardinals"] = "Single-A",
        ["St. Lucie Mets"] = "Single-A",
        ["Tampa Tarpons"] = "Single-A",
    };

    /// <summary>Returns the level for a team, or null if not recognized.</summary>
    public static string? MatchLevel(string team)
    {
        if (string.IsNullOrWhiteSpace(team)) return null;
        foreach (var kvp in Levels)
        {
            if (team.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                return kvp.Value;
        }
        return null;
    }
}
