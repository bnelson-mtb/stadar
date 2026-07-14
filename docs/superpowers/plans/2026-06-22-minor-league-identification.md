# Minor-League Identification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the specific minor league (AHL/ECHL for hockey, Triple-A/Double-A/High-A/Single-A for baseball) in the event detail page's *About the League* section, while the card badge keeps reading "Minor League".

**Architecture:** Ticketmaster's `subGenre` only says "Minor League Baseball/Hockey", so the specific level is mapped from the team name. Hockey already works via `IsAhlTeam`/`IsEchlTeam`. We add a parallel `MinorLeagueBaseball.MatchLevel` team→level lookup, hook it into `EventNormalizer`, and add frontend `LEAGUE_INFO` entries. Unrecognized teams fall back to today's generic "Minor League" behavior.

**Tech Stack:** ASP.NET Core (.NET 10) backend, MSTest tests, React (Vite) frontend.

---

## Parallelization Strategy (Claude Haiku agents)

The work splits into **two agents that share NO files**, so they run fully in parallel with no merge conflicts:

| Agent | Owns these files (exclusive) | Tasks |
|-------|------------------------------|-------|
| **Agent A — Backend** (Haiku) | `Api/Services/EventNormalizer.cs`, `Api/Services/MinorLeagueBaseball.cs`, `Api.Tests/EventNormalizerTests.cs`, `Api.Tests/MinorLeagueBaseballTests.cs` | A1, A2, A3 (sequential within the agent) |
| **Agent B — Frontend** (Haiku) | `client/src/data/leagueInfo.js`, `client/src/pages/EventDetailPage.jsx` | B1, B2 (sequential within the agent) |

**Shared contract — both agents MUST use these exact league-key strings** (any drift breaks the lookup):

```
"Triple-A"   "Double-A"   "High-A"   "Single-A"
```

Backend returns one of these strings as `league`; frontend keys `LEAGUE_INFO` and `MINOR_BADGE_LEAGUES` on the identical strings. Sport is always `"Baseball"`.

**Execution order:** Dispatch Agent A and Agent B concurrently. After both report done, run the **Integration** task (I1) in the main session. Hockey changes (A1) and baseball changes (A2/A3) both touch `EventNormalizer.cs`, so they are deliberately assigned to the *same* agent (A) to avoid same-file conflicts; they run sequentially A1 → A2 → A3.

---

## File Structure

- `Api/Services/MinorLeagueBaseball.cs` — **new.** Static class holding the team→level table and `MatchLevel(team)`.
- `Api/Services/EventNormalizer.cs` — **modified.** Hook `MatchLevel` into the existing minor-league branch; audit AHL/ECHL arrays.
- `Api.Tests/MinorLeagueBaseballTests.cs` — **new.** Direct unit tests for `MatchLevel`.
- `Api.Tests/EventNormalizerTests.cs` — **modified.** Update the existing baseball test (now expects "Triple-A"); add fallback + integration tests.
- `client/src/data/leagueInfo.js` — **modified.** Add `Triple-A`/`Double-A`/`High-A`/`Single-A` entries.
- `client/src/pages/EventDetailPage.jsx` — **modified.** Add the four levels to `MINOR_BADGE_LEAGUES`.

---

# AGENT A — Backend

### Task A1: Audit AHL / ECHL team lists

**Files:**
- Modify (only if reconciliation finds differences): `Api/Services/EventNormalizer.cs` — `IsAhlTeam` (~lines 191-208), `IsEchlTeam` (~lines 210-226)

- [ ] **Step 1: Compare the existing arrays against the canonical current membership below**

Canonical **AHL** (32 clubs) — the existing array should already contain all of these:

```
Abbotsford Canucks, Bakersfield Condors, Belleville Senators, Bridgeport Islanders,
Calgary Wranglers, Charlotte Checkers, Chicago Wolves, Cleveland Monsters,
Coachella Valley Firebirds, Colorado Eagles, Grand Rapids Griffins, Hartford Wolf Pack,
Henderson Silver Knights, Hershey Bears, Iowa Wild, Laval Rocket, Lehigh Valley Phantoms,
Manitoba Moose, Milwaukee Admirals, Ontario Reign, Providence Bruins, Rochester Americans,
Rockford IceHogs, San Diego Gulls, San Jose Barracuda, Springfield Thunderbirds,
Syracuse Crunch, Texas Stars, Toronto Marlies, Tucson Roadrunners, Utica Comets,
Wilkes-Barre/Scranton Penguins
```

Canonical **ECHL** (the existing array also includes Greensboro Gargoyles as a future expansion club — keep it):

```
Adirondack Thunder, Allen Americans, Atlanta Gladiators, Bloomington Bison,
Cincinnati Cyclones, Florida Everblades, Fort Wayne Komets, Greenville Swamp Rabbits,
Idaho Steelheads, Indy Fuel, Iowa Heartlanders, Jacksonville Icemen, Kalamazoo Wings,
Kansas City Mavericks, Maine Mariners, Norfolk Admirals, Orlando Solar Bears,
Rapid City Rush, Reading Royals, Savannah Ghost Pirates, South Carolina Stingrays,
Tahoe Knight Monsters, Toledo Walleye, Trois-Rivières Lions, Tulsa Oilers, Utah Grizzlies,
Wheeling Nailers, Wichita Thunder, Worcester Railers
```

Add any club present in a canonical list but missing from the array. Do not remove clubs (defunct entries are harmless to a `Contains` match). **Expected outcome: no changes needed** — this step is a confirmation.

- [ ] **Step 2: Run the existing hockey tests to confirm AHL/ECHL still resolve**

Run: `cd Api.Tests && dotnet test --filter "FullyQualifiedName~NormalizeEvent_AhlTeam|FullyQualifiedName~NormalizeEvent_EchlTeam"`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit (only if Step 1 changed the arrays; otherwise skip)**

```bash
git add Api/Services/EventNormalizer.cs
git commit -m "chore: audit AHL/ECHL team lists for current membership"
```

---

### Task A2: Create `MinorLeagueBaseball` team→level lookup (TDD)

**Files:**
- Create: `Api/Services/MinorLeagueBaseball.cs`
- Test: `Api.Tests/MinorLeagueBaseballTests.cs`

- [ ] **Step 1: Write the failing test**

Create `Api.Tests/MinorLeagueBaseballTests.cs`:

```csharp
using Api.Services;

namespace Api.Tests;

[TestClass]
public class MinorLeagueBaseballTests
{
    [TestMethod]
    [DataRow("Salt Lake Bees", "Triple-A")]
    [DataRow("Reno Aces", "Triple-A")]
    [DataRow("Toledo Mud Hens", "Triple-A")]
    [DataRow("Portland Sea Dogs", "Double-A")]
    [DataRow("Tulsa Drillers", "Double-A")]
    [DataRow("Dayton Dragons", "High-A")]
    [DataRow("Lake Elsinore Storm", "Single-A")]
    public void MatchLevel_KnownTeams_ReturnsLevel(string team, string expected)
    {
        Assert.AreEqual(expected, MinorLeagueBaseball.MatchLevel(team));
    }

    [TestMethod]
    [DataRow("Some Random Team")]
    [DataRow("")]
    [DataRow(null)]
    public void MatchLevel_UnknownOrEmpty_ReturnsNull(string? team)
    {
        Assert.IsNull(MinorLeagueBaseball.MatchLevel(team!));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Api.Tests && dotnet test --filter "FullyQualifiedName~MinorLeagueBaseballTests"`
Expected: FAIL — build error, `MinorLeagueBaseball` does not exist.

- [ ] **Step 3: Create the implementation**

Create `Api/Services/MinorLeagueBaseball.cs`:

```csharp
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Api.Tests && dotnet test --filter "FullyQualifiedName~MinorLeagueBaseballTests"`
Expected: PASS (10 test cases).

- [ ] **Step 5: Commit**

```bash
git add Api/Services/MinorLeagueBaseball.cs Api.Tests/MinorLeagueBaseballTests.cs
git commit -m "feat: add MinorLeagueBaseball team-to-level lookup"
```

---

### Task A3: Hook level lookup into `EventNormalizer` (TDD)

**Files:**
- Modify: `Api/Services/EventNormalizer.cs` (minor-league branch, ~lines 41-47)
- Modify: `Api.Tests/EventNormalizerTests.cs` (existing baseball test + new tests)

- [ ] **Step 1: Update the existing test and add new ones**

In `Api.Tests/EventNormalizerTests.cs`, **replace** the existing
`NormalizeEvent_MinorLeagueBaseball_UsesGenreForSport` method (currently asserts
`"Minor League"`) with the following block:

```csharp
    [TestMethod]
    public void NormalizeEvent_MinorLeagueBaseball_KnownTeam_ReturnsLevel()
    {
        // Salt Lake Bees + Reno Aces are both Triple-A — detected by team name
        var result = EventNormalizer.NormalizeEvent("Bees vs Aces", "Salt Lake Bees", "Reno Aces", "Baseball", "Minor League Baseball");
        Assert.AreEqual("Baseball", result.Sport);
        Assert.AreEqual("Triple-A", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_MinorLeagueBaseball_DoubleATeam_ReturnsDoubleA()
    {
        var result = EventNormalizer.NormalizeEvent("Drillers vs Travelers", "Tulsa Drillers", "Arkansas Travelers", "Baseball", "Minor League Baseball");
        Assert.AreEqual("Baseball", result.Sport);
        Assert.AreEqual("Double-A", result.League);
    }

    [TestMethod]
    public void NormalizeEvent_MinorLeagueBaseball_UnknownTeam_FallsBackToMinorLeague()
    {
        // No recognized team → generic fallback preserved
        var result = EventNormalizer.NormalizeEvent("Foo vs Bar", "Foo Sluggers", "Bar Batters", "Baseball", "Minor League Baseball");
        Assert.AreEqual("Baseball", result.Sport);
        Assert.AreEqual("Minor League", result.League);
    }
```

- [ ] **Step 2: Run tests to verify the new known-team tests fail**

Run: `cd Api.Tests && dotnet test --filter "FullyQualifiedName~NormalizeEvent_MinorLeagueBaseball"`
Expected: `KnownTeam_ReturnsLevel` and `DoubleATeam_ReturnsDoubleA` FAIL (return "Minor League" instead of the level); `UnknownTeam_FallsBackToMinorLeague` PASSES.

- [ ] **Step 3: Modify the minor-league branch in `EventNormalizer.cs`**

Find this block (around lines 41-47):

```csharp
        if (subGenre.Contains("minor league", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("echl", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("ahl", StringComparison.OrdinalIgnoreCase))
        {
            var minorSport = MapSport(genre) ?? "Hockey";
            return Result(minorSport, "Minor League");
        }
```

Replace it with:

```csharp
        if (subGenre.Contains("minor league", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("echl", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("ahl", StringComparison.OrdinalIgnoreCase))
        {
            var minorSport = MapSport(genre) ?? "Hockey";
            if (minorSport == "Baseball")
            {
                var level = MinorLeagueBaseball.MatchLevel(normalizedHome)
                         ?? MinorLeagueBaseball.MatchLevel(normalizedAway);
                if (level != null)
                    return Result("Baseball", level);
            }
            return Result(minorSport, "Minor League");
        }
```

- [ ] **Step 4: Run the full normalizer test suite to verify all pass**

Run: `cd Api.Tests && dotnet test --filter "FullyQualifiedName~EventNormalizerTests"`
Expected: PASS (all tests, including the three baseball cases and existing AHL/ECHL/college/fallback tests).

- [ ] **Step 5: Commit**

```bash
git add Api/Services/EventNormalizer.cs Api.Tests/EventNormalizerTests.cs
git commit -m "feat: resolve minor-league baseball level in EventNormalizer"
```

---

# AGENT B — Frontend

### Task B1: Add level entries to `LEAGUE_INFO`

**Files:**
- Modify: `client/src/data/leagueInfo.js`

- [ ] **Step 1: Add the four level entries**

In `client/src/data/leagueInfo.js`, add these entries to the `LEAGUE_INFO`
object (place them just after the existing `'Minor League'` entry, before the
NCAA entries — exact position does not matter functionally):

```javascript
  'Triple-A': {
    fullName: 'Triple-A (AAA)',
    tier: 'Minor League — MLB Affiliate',
    description: 'Triple-A is the highest level of Minor League Baseball, one step below MLB — rosters are stocked with prospects on the cusp of the majors and veterans on rehab or call-up.',
    website: 'milb.com',
  },
  'Double-A': {
    fullName: 'Double-A (AA)',
    tier: 'Minor League — MLB Affiliate',
    description: 'Double-A is widely regarded as the level where the best prospects separate themselves, featuring many of the top young players in each MLB organization.',
    website: 'milb.com',
  },
  'High-A': {
    fullName: 'High-A (A+)',
    tier: 'Minor League — MLB Affiliate',
    description: 'High-A is an advanced level of Class A baseball where developing prospects face stronger competition on their way up the affiliate ladder.',
    website: 'milb.com',
  },
  'Single-A': {
    fullName: 'Single-A (A)',
    tier: 'Minor League — MLB Affiliate',
    description: 'Single-A is an entry level of full-season Minor League Baseball, where many recently drafted and signed players begin their professional development.',
    website: 'milb.com',
  },
```

- [ ] **Step 2: Confirm the four keys are present**

Run: `grep -c -E "'(Triple-A|Double-A|High-A|Single-A)':" client/src/data/leagueInfo.js`
Expected: `4` (full parse/syntax validation happens via the client build in Task B2).

- [ ] **Step 3: Commit**

```bash
git add client/src/data/leagueInfo.js
git commit -m "feat: add Triple-A/Double-A/High-A/Single-A league info"
```

---

### Task B2: Keep the badge reading "Minor League" for the new levels

**Files:**
- Modify: `client/src/pages/EventDetailPage.jsx` (the `MINOR_BADGE_LEAGUES` line, ~line 119)

- [ ] **Step 1: Add the four levels to `MINOR_BADGE_LEAGUES`**

Find this line:

```javascript
  const MINOR_BADGE_LEAGUES = new Set(['AHL', 'ECHL', 'Minor League'])
```

Replace it with:

```javascript
  const MINOR_BADGE_LEAGUES = new Set(['AHL', 'ECHL', 'Minor League', 'Triple-A', 'Double-A', 'High-A', 'Single-A'])
```

No other change is needed: `leagueKey` already passes any non-`'Minor League'`
value straight through to `LEAGUE_INFO`, so `'Triple-A'` resolves to the entry
added in Task B1, while the badge label stays "Minor League".

- [ ] **Step 2: Verify the client builds**

Run: `cd client && npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/EventDetailPage.jsx
git commit -m "feat: keep Minor League badge for AAA/AA/A+/A on detail page"
```

---

# INTEGRATION (main session, after Agent A and Agent B both finish)

### Task I1: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the entire backend test suite**

Run: `cd Api.Tests && dotnet test`
Expected: PASS — all tests green, including `MinorLeagueBaseballTests` and `EventNormalizerTests`.

- [ ] **Step 2: Build the frontend**

Run: `cd client && npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Manual smoke check (optional but recommended)**

Start the API (`cd Api && dotnet watch`) and client (`cd client && npm run dev`),
open an event detail page for a Triple-A club (e.g. a Salt Lake Bees game if one
is live in the feed). Confirm: card badge reads "Minor League", and *About the
League* reads "Triple-A (AAA)". If no minor-league baseball game is currently in
the Ticketmaster feed, this step can be skipped — the unit tests cover the logic.

- [ ] **Step 4: Final integration commit (only if any merge fix-ups were needed; otherwise skip)**

```bash
git add -A
git commit -m "chore: integrate minor-league identification feature"
```

---

## Notes

- **Data freshness:** AAA/AA lists are reliable; High-A/Single-A are best-effort at the knowledge cutoff. Because unrecognized teams fall back to generic "Minor League", a stale or missing entry never shows a *wrong* level — only a less specific card. Refreshing is a data-only edit to `MinorLeagueBaseball.cs`.
- **No TM request changes:** this feature only re-classifies data already returned; nothing about the Ticketmaster proxy, caching, or filtering changes.
