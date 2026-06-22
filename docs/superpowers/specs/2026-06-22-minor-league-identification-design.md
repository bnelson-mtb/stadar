# Sharpen Minor-League Identification

**Date:** 2026-06-22
**Status:** Design approved, pending spec review

## Problem

Stadar's vision is to give the user as much information as possible about an event.
Today, every minor-league baseball game collapses to a generic "Minor League
Baseball" entry in the *About the League* section of the event detail page, even
though the user wants to see the specific classification level (Triple-A,
Double-A, etc.). Minor-league hockey (AHL/ECHL) already shows its specific league.

We are constrained to the Ticketmaster (TM) Discovery API, whose `subGenre`
classification only distinguishes "Minor League Baseball" / "Minor League
Hockey" — it does **not** carry the specific level (AAA/AA, AHL/ECHL). The level
therefore cannot be derived from TM data and must be mapped from the team.

## Goal

On the event **detail** page's *About the League* section, show the specific
minor league:

- Hockey: **AHL**, **ECHL** (already working — verify only)
- Baseball: **Triple-A (AAA)**, **Double-A (AA)**, **High-A (A+)**, **Single-A (A)** (new)

The initial card/detail **badge** continues to read "Minor League" for all of
these — only the *About the League* section becomes specific. This matches the
existing AHL/ECHL behavior.

## Non-Goals

- No MLB-affiliate parent club display (e.g. "Triple-A — Dodgers affiliate"). Level only.
- No best-guess inference from city/venue. Unrecognized teams fall back to generic.
- No new minor-hockey leagues beyond AHL/ECHL.
- No changes to the discovery page, badges, filtering, or any TM request behavior.

## Current State (verified)

Identification lives in `Api/Services/EventNormalizer.cs`:

1. Direct pro-league match from TM `subGenre` (`MatchProLeague`).
2. **AHL / ECHL detection by hardcoded team-name lists** (`IsAhlTeam`,
   `IsEchlTeam`) — fires *before* the generic minor-league fallback. `IsAhlTeam`
   lists all 32 current AHL clubs; `IsEchlTeam` lists ~29 ECHL clubs.
3. Generic minor-league fallback: `subGenre` contains "minor league" / "ahl" /
   "echl" → `league = "Minor League"`, sport from TM genre (default Hockey).
4. NWSL, LOVB, college, etc.

Frontend `client/src/pages/EventDetailPage.jsx`:

- `MINOR_BADGE_LEAGUES = {AHL, ECHL, Minor League}` → badge label forced to "Minor League".
- `leagueKey`: if `league === "Minor League"`, map by sport to
  `"Minor League Hockey"` / `"Minor League Basketball"` / `"Minor League"`;
  otherwise pass `league` straight through.
- `LEAGUE_INFO[leagueKey]` (`client/src/data/leagueInfo.js`) drives the
  *About the League* card (fullName, tier, description, website). It already has
  full `AHL` and `ECHL` entries, so AHL/ECHL games already render specifically.

**Conclusion:** hockey already does what we want. The only new build is baseball
levels, using the exact same team-name lookup pattern.

## Design

### Backend

**New file `Api/Services/MinorLeagueBaseball.cs`** — a static lookup class:

```csharp
public static class MinorLeagueBaseball
{
    // Team display name (as normalized) -> level: "Triple-A" | "Double-A" | "High-A" | "Single-A"
    private static readonly Dictionary<string, string> Levels = new(StringComparer.OrdinalIgnoreCase) { ... };

    // Returns the level for a team, or null if not in the table.
    public static string? MatchLevel(string team) =>
        Levels.FirstOrDefault(kvp => team.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase)).Value;
}
```

The ~120-entry table lives here, not inline in `EventNormalizer`, to keep the
normalizer readable. (The existing AHL/ECHL inline arrays are left as-is for now
to stay focused; they could move here later.)

**`EventNormalizer.NormalizeEvent` minor-league branch** (currently the
`subGenre.Contains("minor league")` block): when the resolved minor sport is
Baseball, attempt level resolution:

```csharp
var minorSport = MapSport(genre) ?? "Hockey";
if (minorSport == "Baseball")
{
    var level = MinorLeagueBaseball.MatchLevel(normalizedHome)
             ?? MinorLeagueBaseball.MatchLevel(normalizedAway);
    if (level != null)
        return Result("Baseball", level);
}
return Result(minorSport, "Minor League");
```

Hockey path is unchanged. Unrecognized baseball teams return `"Minor League"`
exactly as today (graceful degradation).

### Frontend

`client/src/pages/EventDetailPage.jsx`:

- Add the four levels to `MINOR_BADGE_LEAGUES` so the badge still reads
  "Minor League":
  `new Set(['AHL', 'ECHL', 'Minor League', 'Triple-A', 'Double-A', 'High-A', 'Single-A'])`.
- No change to `leagueKey` needed: the four level strings are not
  `"Minor League"`, so they already pass straight through to `LEAGUE_INFO`.

`client/src/data/leagueInfo.js` — add entries (all `tier: "Minor League — MLB Affiliate"`, `website: "milb.com"`):

| key         | fullName           |
|-------------|--------------------|
| `Triple-A`  | `Triple-A (AAA)`   |
| `Double-A`  | `Double-A (AA)`    |
| `High-A`    | `High-A (A+)`      |
| `Single-A`  | `Single-A (A)`     |

Each gets a short level-appropriate description.

### Tests

Add to `Api.Tests/EventNormalizerTests.cs`:

- Known AAA team (e.g. **Salt Lake Bees**) with `subGenre = "Minor League Baseball"` → `league = "Triple-A"`, `sport = "Baseball"`.
- Known AA team → `league = "Double-A"`.
- Unrecognized minor-league baseball row → `league = "Minor League"` (fallback intact).
- (Optional regression) An AHL team still → `league = "AHL"`.

## Data Sourcing & Caveat

The team→level table is curated from current MiLB membership.

- **AAA and AA** lists are reliable.
- **High-A / Single-A** rosters and affiliations shift more often and sit at the
  knowledge cutoff; curate all four but treat the lower two as "verify against
  milb.com." Because unrecognized teams degrade gracefully to the generic
  "Minor League Baseball" card, a stale/missing entry never shows a *wrong*
  level — it just shows the generic card.
- Priority local club: **Salt Lake Bees (Triple-A)** must be present and correct.

## Risks

- **Stale team data** — mitigated by generic fallback (no wrong levels, only
  missing specificity). Refreshing is a data-only edit to one file.
- **Name-match collisions** — `MatchLevel` uses substring `Contains`; team names
  are distinctive enough that collisions are unlikely, but tests guard the
  known cases.
