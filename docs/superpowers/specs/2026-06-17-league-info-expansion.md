# League Info Expansion — Design Spec
_2026-06-17_

## Goal

Add WNBA and AHL team data (with logos), fix AHL/ECHL league classification so events get proper league strings, and surface a collapsible "About the League" section on the event detail page for every event.

---

## Scope

Three independent changes that ship together:

1. **Team data** — populate `WNBA` and `AHL` in `teams.js`, wire into TEAMS loop, seed + upload logos
2. **Classification** — EventNormalizer correctly emits `"AHL"` or `"ECHL"` instead of `"Minor League"`
3. **UI** — `leagueInfo.js` static metadata file + collapsible section on `EventDetailPage`

---

## 1. Team Data (`client/src/data/teams.js`)

### WNBA — 13 teams

Add to the existing empty `const WNBA = {}` block using `espnLogo('wnba', id)`:

| Team | ESPN ID | Primary Color |
|---|---|---|
| Indiana Fever | ind | #041E42 |
| Las Vegas Aces | lv | #000000 |
| Los Angeles Sparks | la | #702F8A |
| New York Liberty | ny | #86CEBC |
| Connecticut Sun | conn | #F05023 |
| Chicago Sky | chi | #418FDE |
| Seattle Storm | sea | #2C5234 |
| Phoenix Mercury | phx | #CB6015 |
| Atlanta Dream | atl | #C8102E |
| Washington Mystics | wsh | #0C2340 |
| Minnesota Lynx | min | #236192 |
| Dallas Wings | dal | #002B5C |
| Golden State Valkyries | gsv | #006BB6 |

Add `WNBA` to the builder loop directly after `NBA`:
```js
for (const league of [NBA, WNBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AHL, AAA, PLL, LOVB_TEAMS]) {
```

### AHL — 32 teams

Add to the existing empty `const AHL = {}` block using `espnLogo('ahl', id)`. Fetch correct ESPN AHL IDs via `https://site.api.espn.com/apis/site/v2/sports/hockey/ahl/teams?limit=40` during implementation. Add `AHL` to builder loop after `ECHL`.

---

## 2. Classification (`Api/Services/EventNormalizer.cs`)

### Problem

Ticketmaster returns `subGenre: "Minor League Hockey"` for both AHL and ECHL events. The current code maps both to `("Hockey", "Minor League")`.

### Fix

Replace the generic AHL/ECHL subGenre check with team-name-based detection, using the same pattern as `IsNwslTeam()`.

**Add two helpers:**

```csharp
public static bool IsAhlTeam(string team)
{
    string[] ahlTeams = [ /* all 32 AHL team names, populated from teams.js AHL block */ ];
    return ahlTeams.Any(n => team.Contains(n, StringComparison.OrdinalIgnoreCase));
}

public static bool IsEchlTeam(string team)
{
    string[] echlTeams = [ /* all 30 ECHL team names, from teams.js ECHL block */ ];
    return echlTeams.Any(n => team.Contains(n, StringComparison.OrdinalIgnoreCase));
}
```

**Update `NormalizeEvent` — insert after the NWSL check (step 3), before LOVB (step 4):**

```csharp
if (IsAhlTeam(normalizedHome) || IsAhlTeam(normalizedAway))
    return Result("Hockey", "AHL");

if (IsEchlTeam(normalizedHome) || IsEchlTeam(normalizedAway))
    return Result("Hockey", "ECHL");
```

**Remove the now-redundant early subGenre check:**
```csharp
// DELETE this block:
if (subGenre.Contains("echl", ...) || subGenre.Contains("ahl", ...))
    return Result("Hockey", "Minor League");
```

`event.league` now correctly carries `"AHL"` or `"ECHL"`.

### Tests

Add two MSTest cases to `Api.Tests/TicketmasterClientParseTests.cs` (or a new `EventNormalizerTests.cs`):
- `NormalizeEvent_AhlTeamName_ReturnsAhlLeague` — home team "Milwaukee Admirals", subGenre "Minor League Hockey" → league = "AHL"
- `NormalizeEvent_EchlTeamName_ReturnsEchlLeague` — home team "Utah Grizzlies", subGenre "Minor League Hockey" → league = "ECHL"

---

## 3. Frontend

### 3a. Badge display (`EventDetailPage.jsx`)

The badge continues to show `"Minor League"` for AHL and ECHL (and existing "Minor League" events) so pro leagues visually stand out. Map at display time only — the underlying `event.league` value is unchanged:

```js
const MINOR_LEAGUE_DISPLAY = new Set(['AHL', 'ECHL', 'Minor League'])
const badgeLabel = MINOR_LEAGUE_DISPLAY.has(event.league) ? 'Minor League' : event.league
```

Replace the existing `{event.league}` in the badge span with `{badgeLabel}`.

### 3b. League metadata (`client/src/data/leagueInfo.js`)

New file — a plain JS object Brady can edit freely to update blurbs:

```js
export const LEAGUE_INFO = {
  'NBA':          { fullName: 'National Basketball Association',   tier: 'Pro',                      description: '...', website: 'nba.com' },
  'WNBA':         { fullName: "Women's National Basketball Association", tier: 'Pro',                description: '...', website: 'wnba.com' },
  'NHL':          { fullName: 'National Hockey League',            tier: 'Pro',                      description: '...', website: 'nhl.com' },
  'NFL':          { fullName: 'National Football League',          tier: 'Pro',                      description: '...', website: 'nfl.com' },
  'MLB':          { fullName: 'Major League Baseball',             tier: 'Pro',                      description: '...', website: 'mlb.com' },
  'MLS':          { fullName: 'Major League Soccer',               tier: 'Pro',                      description: '...', website: 'mlssoccer.com' },
  'NWSL':         { fullName: 'National Women\'s Soccer League',   tier: 'Pro',                      description: '...', website: 'nwslsoccer.com' },
  'PWHL':         { fullName: 'Professional Women\'s Hockey League', tier: 'Pro',                    description: '...', website: 'thepwhl.com' },
  'PLL':          { fullName: 'Premier Lacrosse League',           tier: 'Pro',                      description: '...', website: 'premierlacrosseleague.com' },
  'LOVB':         { fullName: 'League One Volleyball',             tier: 'Pro',                      description: '...', website: 'lovb.com' },
  'AHL':          { fullName: 'American Hockey League',            tier: 'Minor League (NHL Affiliate)', description: '...', website: 'theahl.com' },
  'ECHL':         { fullName: 'ECHL',                              tier: 'Minor League (Tier II)',   description: '...', website: 'echl.com' },
  'Minor League': { fullName: 'Minor League Baseball',             tier: 'Minor League',             description: '...', website: 'milb.com' },
  'NCAAM':        { fullName: 'NCAA Men\'s Basketball',            tier: 'College',                  description: '...', website: 'ncaa.com' },
  'NCAAW':        { fullName: 'NCAA Women\'s Basketball',          tier: 'College',                  description: '...', website: 'ncaa.com' },
  'NCAAF':        { fullName: 'NCAA Football',                     tier: 'College',                  description: '...', website: 'ncaa.com' },
  'NCAA Baseball':{ fullName: 'NCAA Baseball',                     tier: 'College',                  description: '...', website: 'ncaa.com' },
  'NCAA':         { fullName: 'NCAA',                              tier: 'College',                  description: '...', website: 'ncaa.com' },
}
```

`description` fields are 1–2 sentences of plain English. Brady edits these directly in the file — no build step, no CMS.

### 3c. Collapsible section (`EventDetailPage.jsx`)

Add a `leagueExpanded` state variable (default `false`). Insert a new collapsible block **below the Tickets section**, following the same visual pattern as the Venue section.

Only render the section when `LEAGUE_INFO[event.league]` exists. If `event.league` is `""` or `"Misc"`, no section is shown.

**Visual structure (expanded):**

```
┌─────────────────────────────────────────────────┐
│  About the League                          ▲    │
├─────────────────────────────────────────────────┤
│  American Hockey League                         │
│  [Minor League (NHL Affiliate)]  ← tier pill    │
│                                                 │
│  The AHL is the top development league for      │
│  NHL teams, featuring rising stars and          │
│  veterans fighting for roster spots.            │
│                                                 │
│  theahl.com →                                   │
└─────────────────────────────────────────────────┘
```

The tier pill uses the same color scheme as the league badge (`LEAGUE_COLORS` from `teams.js` if available, gray fallback).

**Implementation in JSX:**
```jsx
const leagueInfo = LEAGUE_INFO[event.league]

{leagueInfo && (
  <div className="bg-white rounded-xl shadow-sm mb-4">
    <button onClick={() => setLeagueExpanded(!leagueExpanded)} ...>
      <span className="font-semibold text-gray-900">About the League</span>
      <ChevronIcon rotated={leagueExpanded} />
    </button>
    {leagueExpanded && (
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <p className="text-xl font-bold text-gray-900 mb-2">{leagueInfo.fullName}</p>
        <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700 mb-3">
          {leagueInfo.tier}
        </span>
        <p className="text-gray-600 text-sm mb-4">{leagueInfo.description}</p>
        <a href={`https://${leagueInfo.website}`} target="_blank" rel="noopener noreferrer"
           className="text-sm font-medium text-blue-600 hover:text-blue-800">
          {leagueInfo.website} →
        </a>
      </div>
    )}
  </div>
)}
```

---

## Files Changed

| File | Change |
|---|---|
| `client/src/data/teams.js` | Populate WNBA + AHL, add both to builder loop |
| `client/src/data/leagueInfo.js` | New — static league metadata |
| `client/src/pages/EventDetailPage.jsx` | Badge label mapping + league collapsible section |
| `Api/Services/EventNormalizer.cs` | IsAhlTeam + IsEchlTeam helpers, updated NormalizeEvent |
| `Api.Tests/` | 2 new normalizer tests |
| `scripts/logos/` + `logoManifest.json` | New WNBA + AHL logo files after seed/upload run |

---

## Out of Scope

- Dynamic league descriptions from an external API
- League standings or records
- NBA G League, USL, AA baseball (can be added later with same pattern)
