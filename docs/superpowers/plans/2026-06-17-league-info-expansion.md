# League Info Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WNBA + AHL team data with logos, fix AHL/ECHL league classification in the backend normalizer, and surface a collapsible "About the League" section on every event detail page.

**Architecture:** Three independent changes shipped together — team data (`teams.js`), classification (`EventNormalizer.cs`), and UI (`EventDetailPage.jsx` + new `leagueInfo.js`). Logo pipeline runs after data is wired in. Backend and frontend changes are independent.

**Tech Stack:** JavaScript (Vite/React), C# (ASP.NET Core / MSTest), Azure Blob Storage, Wikipedia REST API for AHL logos, ESPN CDN for WNBA logos.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `client/src/data/teams.js` | Modify | Populate WNBA (15 teams) + AHL (32 teams), add both to builder loop |
| `scripts/seed-ahl-logos.mjs` | Create | Downloads AHL logos from Wikipedia with rate-limit delays |
| `client/src/data/logoManifest.json` | Regenerate | Run upload-logos.mjs after seeding |
| `Api/Services/EventNormalizer.cs` | Modify | Add `IsAhlTeam` + `IsEchlTeam`, reorder classification logic |
| `Api.Tests/EventNormalizerTests.cs` | Modify | Update stale test, add 2 new AHL/ECHL tests |
| `client/src/data/leagueInfo.js` | Create | Static league metadata (fullName, tier, description, website) |
| `client/src/pages/EventDetailPage.jsx` | Modify | Badge label mapping + collapsible "About the League" section |

---

## Task 1: Populate WNBA in teams.js

**Files:** Modify `client/src/data/teams.js` at lines 226–227 and 3721.

All 15 ESPN WNBA logo IDs confirmed returning HTTP 200.

- [ ] **Step 1: Replace the empty WNBA block (lines 226–227)**

```js
const WNBA = {
  'Atlanta Dream':           { color: '#C8102E', logo: espnLogo('wnba', 'atl'), shortName: 'Dream' },
  'Chicago Sky':             { color: '#418FDE', logo: espnLogo('wnba', 'chi'), shortName: 'Sky' },
  'Connecticut Sun':         { color: '#F05023', logo: espnLogo('wnba', 'con'), shortName: 'Sun' },
  'Dallas Wings':            { color: '#002B5C', logo: espnLogo('wnba', 'dal'), shortName: 'Wings' },
  'Golden State Valkyries':  { color: '#006BB6', logo: espnLogo('wnba', 'gs'),  shortName: 'Valkyries' },
  'Indiana Fever':           { color: '#041E42', logo: espnLogo('wnba', 'ind'), shortName: 'Fever' },
  'Las Vegas Aces':          { color: '#000000', logo: espnLogo('wnba', 'lv'),  shortName: 'Aces' },
  'Los Angeles Sparks':      { color: '#702F8A', logo: espnLogo('wnba', 'la'),  shortName: 'Sparks' },
  'Minnesota Lynx':          { color: '#236192', logo: espnLogo('wnba', 'min'), shortName: 'Lynx' },
  'New York Liberty':        { color: '#006241', logo: espnLogo('wnba', 'ny'),  shortName: 'Liberty' },
  'Phoenix Mercury':         { color: '#CB6015', logo: espnLogo('wnba', 'phx'), shortName: 'Mercury' },
  'Portland Fire':           { color: '#8B1A1A', logo: espnLogo('wnba', 'por'), shortName: 'Fire' },
  'Seattle Storm':           { color: '#2C5234', logo: espnLogo('wnba', 'sea'), shortName: 'Storm' },
  'Toronto Tempo':           { color: '#7B2D8B', logo: espnLogo('wnba', 'tor'), shortName: 'Tempo' },
  'Washington Mystics':      { color: '#0C2340', logo: espnLogo('wnba', 'wsh'), shortName: 'Mystics' },
}
```

- [ ] **Step 2: Add WNBA to the builder loop (line 3721)**

Find:
```js
for (const league of [NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AAA, PLL, LOVB_TEAMS]) {
```
Replace with:
```js
for (const league of [NBA, WNBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AHL, AAA, PLL, LOVB_TEAMS]) {
```

Note: AHL is added here too (it will be an empty object until Task 2, which is fine).

- [ ] **Step 3: Verify in browser**

Run `cd client && npm run dev`. Open `http://localhost:5173`, set state to a state with a WNBA team (e.g., TX for Dallas Wings). Confirm the team card shows the Wings logo. If no WNBA events are currently on TM, the check is: open the browser console and run:
```js
import { getTeamData } from '/src/data/teams.js'
getTeamData('Indiana Fever')
// should return { color: '#041E42', logo: 'https://a.espncdn.com/i/teamlogos/wnba/500/ind.png', shortName: 'Fever' }
```

- [ ] **Step 4: Commit**

```bash
git add client/src/data/teams.js
git commit -m "feat: add 15 WNBA teams to teams.js"
```

---

## Task 2: Populate AHL in teams.js

**Files:** Modify `client/src/data/teams.js` at lines 275–276.

Logos are `null` initially — the fallback is team-color initials, which works fine until logos are downloaded in Task 3.

- [ ] **Step 1: Replace the empty AHL block (lines 275–276)**

```js
const AHL = {
  // Eastern — Atlantic
  'Bridgeport Islanders':          { color: '#00539B', logo: null, shortName: 'Islanders' },
  'Charlotte Checkers':            { color: '#CC0000', logo: null, shortName: 'Checkers' },
  'Hartford Wolf Pack':            { color: '#0038A8', logo: null, shortName: 'Wolf Pack' },
  'Hershey Bears':                 { color: '#041E42', logo: null, shortName: 'Bears' },
  'Lehigh Valley Phantoms':        { color: '#F74902', logo: null, shortName: 'Phantoms' },
  'Providence Bruins':             { color: '#FCB514', logo: null, shortName: 'Bruins' },
  'Springfield Thunderbirds':      { color: '#002F87', logo: null, shortName: 'Thunderbirds' },
  'Utica Comets':                  { color: '#CE1126', logo: null, shortName: 'Comets' },
  'Wilkes-Barre/Scranton Penguins':{ color: '#000000', logo: null, shortName: 'Penguins' },
  // Eastern — North
  'Belleville Senators':           { color: '#C52032', logo: null, shortName: 'Senators' },
  'Cleveland Monsters':            { color: '#002654', logo: null, shortName: 'Monsters' },
  'Grand Rapids Griffins':         { color: '#CE1126', logo: null, shortName: 'Griffins' },
  'Laval Rocket':                  { color: '#AF1E2D', logo: null, shortName: 'Rocket' },
  'Manitoba Moose':                { color: '#004C97', logo: null, shortName: 'Moose' },
  'Milwaukee Admirals':            { color: '#FFB81C', logo: null, shortName: 'Admirals' },
  'Rochester Americans':           { color: '#002654', logo: null, shortName: 'Americans' },
  'Syracuse Crunch':               { color: '#002868', logo: null, shortName: 'Crunch' },
  'Toronto Marlies':               { color: '#003E7E', logo: null, shortName: 'Marlies' },
  // Western — Central
  'Chicago Wolves':                { color: '#CC0000', logo: null, shortName: 'Wolves' },
  'Colorado Eagles':               { color: '#6F263D', logo: null, shortName: 'Eagles' },
  'Iowa Wild':                     { color: '#154734', logo: null, shortName: 'Wild' },
  'Rockford IceHogs':              { color: '#CF0A2C', logo: null, shortName: 'IceHogs' },
  'Texas Stars':                   { color: '#006847', logo: null, shortName: 'Stars' },
  // Western — Pacific
  'Abbotsford Canucks':            { color: '#00843D', logo: null, shortName: 'Canucks' },
  'Bakersfield Condors':           { color: '#041E42', logo: null, shortName: 'Condors' },
  'Calgary Wranglers':             { color: '#C8102E', logo: null, shortName: 'Wranglers' },
  'Coachella Valley Firebirds':    { color: '#355464', logo: null, shortName: 'Firebirds' },
  'Henderson Silver Knights':      { color: '#B4975A', logo: null, shortName: 'Silver Knights' },
  'Ontario Reign':                 { color: '#111111', logo: null, shortName: 'Reign' },
  'San Diego Gulls':               { color: '#FC4C02', logo: null, shortName: 'Gulls' },
  'San Jose Barracuda':            { color: '#006D75', logo: null, shortName: 'Barracuda' },
  'Tucson Roadrunners':            { color: '#8C2633', logo: null, shortName: 'Roadrunners' },
}
```

- [ ] **Step 2: Verify builder loop includes AHL** (already added in Task 1 Step 2)

Confirm the builder loop line reads:
```js
for (const league of [NBA, WNBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AHL, AAA, PLL, LOVB_TEAMS]) {
```

- [ ] **Step 3: Commit**

```bash
git add client/src/data/teams.js
git commit -m "feat: add 32 AHL teams to teams.js (logos pending)"
```

---

## Task 3: AHL + WNBA Logo Pipeline

**Files:** Create `scripts/seed-ahl-logos.mjs`. Then run it + upload-logos.mjs.

WNBA logos are seeded via seed-logos.mjs (ESPN CDN). AHL logos come from Wikipedia REST API which requires ≥ 2s between requests to avoid 429 rate limits.

- [ ] **Step 1: Run seed-logos.mjs to download WNBA logos**

```bash
cd scripts && node seed-logos.mjs
```

Expected: 15 new WNBA files downloaded to `scripts/logos/` (e.g., `indiana-fever.png`, `las-vegas-aces.png`, etc.).

- [ ] **Step 2: Create `scripts/seed-ahl-logos.mjs`**

```js
/**
 * Downloads AHL team logos from Wikipedia REST API.
 * Uses 2s delay between requests to stay under rate limits.
 * Run: node seed-ahl-logos.mjs
 */
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')
mkdirSync(LOGOS_DIR, { recursive: true })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// [output-filename, Wikipedia article slug]
const AHL_TEAMS = [
  ['abbotsford-canucks.png',             'Abbotsford_Canucks'],
  ['bakersfield-condors.png',            'Bakersfield_Condors'],
  ['belleville-senators.png',            'Belleville_Senators'],
  ['bridgeport-islanders.png',           'Bridgeport_Islanders'],
  ['calgary-wranglers.png',              'Calgary_Wranglers'],
  ['charlotte-checkers.png',             'Charlotte_Checkers_(AHL)'],
  ['chicago-wolves.png',                 'Chicago_Wolves'],
  ['cleveland-monsters.png',             'Cleveland_Monsters'],
  ['coachella-valley-firebirds.png',     'Coachella_Valley_Firebirds'],
  ['colorado-eagles.png',                'Colorado_Eagles_(AHL)'],
  ['grand-rapids-griffins.png',          'Grand_Rapids_Griffins'],
  ['hartford-wolf-pack.png',             'Hartford_Wolf_Pack'],
  ['henderson-silver-knights.png',       'Henderson_Silver_Knights'],
  ['hershey-bears.png',                  'Hershey_Bears'],
  ['iowa-wild.png',                      'Iowa_Wild'],
  ['laval-rocket.png',                   'Laval_Rocket'],
  ['lehigh-valley-phantoms.png',         'Lehigh_Valley_Phantoms'],
  ['manitoba-moose.png',                 'Manitoba_Moose'],
  ['milwaukee-admirals.png',             'Milwaukee_Admirals'],
  ['ontario-reign.png',                  'Ontario_Reign_(AHL)'],
  ['providence-bruins.png',              'Providence_Bruins'],
  ['rochester-americans.png',            'Rochester_Americans'],
  ['rockford-icehogs.png',               'Rockford_IceHogs'],
  ['san-diego-gulls.png',                'San_Diego_Gulls'],
  ['san-jose-barracuda.png',             'San_Jose_Barracuda'],
  ['springfield-thunderbirds.png',       'Springfield_Thunderbirds'],
  ['syracuse-crunch.png',                'Syracuse_Crunch'],
  ['texas-stars.png',                    'Texas_Stars_(AHL)'],
  ['toronto-marlies.png',                'Toronto_Marlies'],
  ['tucson-roadrunners.png',             'Tucson_Roadrunners'],
  ['utica-comets.png',                   'Utica_Comets_(2021)'],
  ['wilkes-barrescranton-penguins.png',  'Wilkes-Barre/Scranton_Penguins'],
]

let ok = 0, skipped = 0, failed = 0

for (const [filename, wikiSlug] of AHL_TEAMS) {
  const destPath = join(LOGOS_DIR, filename)
  if (existsSync(destPath)) {
    console.log(`⟳ exists    ${filename}`)
    skipped++
    continue
  }

  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`
  try {
    const meta = await fetch(apiUrl, {
      headers: { 'User-Agent': 'stadar-logo-seeder/1.0 (bradyscottnelson@gmail.com)' },
    })
    if (!meta.ok) throw new Error(`summary HTTP ${meta.status}`)
    const json = await meta.json()
    const imgUrl = json?.thumbnail?.source
    if (!imgUrl) throw new Error('no thumbnail in API response')

    const img = await fetch(imgUrl)
    if (!img.ok) throw new Error(`image HTTP ${img.status}`)
    await pipeline(img.body, createWriteStream(destPath))
    console.log(`✓ downloaded ${filename}  (${wikiSlug})`)
    ok++
  } catch (err) {
    console.log(`✗ failed     ${filename}  (${err.message})`)
    failed++
  }

  await sleep(2000)
}

console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed`)
```

- [ ] **Step 3: Run the AHL logo script**

```bash
cd scripts && node seed-ahl-logos.mjs
```

Expected output: downloads ~32 PNG files to `scripts/logos/`. Takes ~65 seconds (32 × 2s delay). Any 404s mean the Wikipedia slug is wrong — check `https://en.wikipedia.org/wiki/{slug}` in a browser and update the slug in the script.

- [ ] **Step 4: Upload all new logos to Azure Blob + regenerate manifest**

Requires `scripts/.env` with `AZURE_STORAGE_CONNECTION_STRING` set (see `scripts/.env.example`).

```bash
cd scripts && node upload-logos.mjs
```

Expected: WNBA and AHL logos uploaded to `stadarstorage/logos`, `client/src/data/logoManifest.json` regenerated with new entries.

- [ ] **Step 5: Verify manifest entries**

```bash
node -e "
const m = JSON.parse(require('fs').readFileSync('../client/src/data/logoManifest.json','utf8'))
console.log(m['Indiana Fever'])
console.log(m['Milwaukee Admirals'])
"
```

Both should print `https://stadarstorage.blob.core.windows.net/logos/...`.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-ahl-logos.mjs scripts/logos/ client/src/data/logoManifest.json
git commit -m "feat: add WNBA and AHL logos to blob storage"
```

---

## Task 4: Fix EventNormalizer — AHL/ECHL Team-Name Classification (TDD)

**Files:**
- Modify: `Api/Services/EventNormalizer.cs`
- Modify: `Api.Tests/EventNormalizerTests.cs`

**Context:** Ticketmaster sends `subGenre: "Minor League Hockey"` for both AHL and ECHL events. The current normalizer maps all minor-league hockey to `"Minor League"`. After this task, events with known AHL team names return `league: "AHL"` and ECHL team names return `league: "ECHL"`. Team-name checks are inserted BEFORE the generic minor-league subGenre fallback so they fire regardless of the TM subGenre value.

### Part A — Update the stale test

The existing test `NormalizeEvent_HockeyMinorLeagues_DefaultToHockey` uses "Utah Grizzlies" (an ECHL team) and asserts `"Minor League"`. After this fix, "Utah Grizzlies" will correctly return `"ECHL"`, so the test assertion must be updated.

- [ ] **Step 1: Update the existing minor-league hockey test in `EventNormalizerTests.cs`**

Find and replace the existing test at lines 47–55:

Old:
```csharp
[TestMethod]
[DataRow("ECHL")]
[DataRow("AHL")]
public void NormalizeEvent_HockeyMinorLeagues_DefaultToHockey(string subGenre)
{
    var result = EventNormalizer.NormalizeEvent("Grizzlies vs Steelheads", "Utah Grizzlies", "Idaho Steelheads", "", subGenre);
    Assert.AreEqual("Hockey", result.Sport);
    Assert.AreEqual("Minor League", result.League);
}
```

New:
```csharp
[TestMethod]
public void NormalizeEvent_UnknownMinorLeagueSubgenre_ReturnsMinorLeague()
{
    // Generic "Minor League Hockey" with no known team names → falls back to Minor League
    var result = EventNormalizer.NormalizeEvent("Some Game", "Team A", "Team B", "Hockey", "Minor League Hockey");
    Assert.AreEqual("Hockey", result.Sport);
    Assert.AreEqual("Minor League", result.League);
}
```

- [ ] **Step 2: Run existing tests — confirm the old test is gone and suite still passes**

```bash
cd Api.Tests && dotnet test --filter "EventNormalizerTests" -v quiet
```

Expected: all existing tests pass (the `NormalizeEvent_HockeyMinorLeagues_DefaultToHockey` tests are now replaced by the new one).

### Part B — Write failing tests first (TDD)

- [ ] **Step 3: Add two failing tests to `EventNormalizerTests.cs` — at the end of the `// ---------- Minor league ----------` section**

```csharp
[TestMethod]
public void NormalizeEvent_AhlTeamByName_ReturnsAhlLeague()
{
    // Milwaukee Admirals is an AHL team — should be detected by name even when TM says "Minor League Hockey"
    var result = EventNormalizer.NormalizeEvent(
        "Admirals vs Wolves", "Milwaukee Admirals", "Chicago Wolves", "Hockey", "Minor League Hockey");
    Assert.AreEqual("Hockey", result.Sport);
    Assert.AreEqual("AHL", result.League);
}

[TestMethod]
public void NormalizeEvent_EchlTeamByName_ReturnsEchlLeague()
{
    // Utah Grizzlies is an ECHL team — should be detected by name
    var result = EventNormalizer.NormalizeEvent(
        "Grizzlies vs Steelheads", "Utah Grizzlies", "Idaho Steelheads", "Hockey", "Minor League Hockey");
    Assert.AreEqual("Hockey", result.Sport);
    Assert.AreEqual("ECHL", result.League);
}
```

- [ ] **Step 4: Run tests — confirm the two new tests FAIL**

```bash
cd Api.Tests && dotnet test --filter "NormalizeEvent_AhlTeamByName_ReturnsAhlLeague|NormalizeEvent_EchlTeamByName_ReturnsEchlLeague" -v quiet
```

Expected: both fail with `Assert.AreEqual failed. Expected:<AHL>. Actual:<Minor League>` (or similar).

### Part C — Implement

- [ ] **Step 5: Add `IsAhlTeam` and `IsEchlTeam` helpers to `EventNormalizer.cs` — after the `IsNwslTeam` method (line 172)**

```csharp
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
```

- [ ] **Step 6: Update `NormalizeEvent` — remove old ECHL/AHL subGenre check and insert team-name checks before the generic minor-league block**

In `NormalizeEvent`, find and replace this exact block (lines 34–37):

Old:
```csharp
        // 2. Minor league — use genre to determine sport, default to hockey for ECHL/AHL
        if (subGenre.Contains("echl", StringComparison.OrdinalIgnoreCase)
            || subGenre.Contains("ahl", StringComparison.OrdinalIgnoreCase))
            return Result("Hockey", "Minor League");

        if (subGenre.Contains("minor league", StringComparison.OrdinalIgnoreCase))
        {
            var minorSport = MapSport(genre) ?? "Hockey";
            return Result(minorSport, "Minor League");
        }
```

New:
```csharp
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
```

The `echl`/`ahl` subGenre checks are kept as a fallback for events where TM sends those exact strings but neither team name is recognized.

- [ ] **Step 7: Run all tests**

```bash
cd Api.Tests && dotnet test -v quiet
```

Expected: all tests pass including the two new AHL/ECHL tests.

- [ ] **Step 8: Commit**

```bash
git add Api/Services/EventNormalizer.cs Api.Tests/EventNormalizerTests.cs
git commit -m "feat: classify AHL and ECHL events by team name in EventNormalizer"
```

---

## Task 5: Create leagueInfo.js

**Files:** Create `client/src/data/leagueInfo.js`.

Brady can freely edit the `description` field for any league — it's plain JS, no build step, no CMS.

- [ ] **Step 1: Create `client/src/data/leagueInfo.js`**

```js
export const LEAGUE_INFO = {
  NBA: {
    fullName: 'National Basketball Association',
    tier: 'Pro',
    description: 'The NBA is the premier men\'s professional basketball league in the world, featuring 30 franchises across the US and Canada.',
    website: 'nba.com',
  },
  WNBA: {
    fullName: "Women's National Basketball Association",
    tier: 'Pro',
    description: 'The WNBA is the top women\'s professional basketball league in the US, with 15 teams as of 2025 including expansion clubs in Portland and Toronto.',
    website: 'wnba.com',
  },
  NHL: {
    fullName: 'National Hockey League',
    tier: 'Pro',
    description: 'The NHL is the top professional ice hockey league in North America, with 32 teams competing for the Stanley Cup each spring.',
    website: 'nhl.com',
  },
  NFL: {
    fullName: 'National Football League',
    tier: 'Pro',
    description: 'The NFL is the premier professional American football league, with 32 teams playing an 18-week regular season capped by the Super Bowl.',
    website: 'nfl.com',
  },
  MLB: {
    fullName: 'Major League Baseball',
    tier: 'Pro',
    description: 'MLB is the oldest major professional sports league in the US, with 30 teams split between the American and National Leagues.',
    website: 'mlb.com',
  },
  MLS: {
    fullName: 'Major League Soccer',
    tier: 'Pro',
    description: 'MLS is the top professional soccer league in the US and Canada, with 30+ clubs competing across three conferences.',
    website: 'mlssoccer.com',
  },
  NWSL: {
    fullName: "National Women's Soccer League",
    tier: 'Pro',
    description: "The NWSL is the top professional women's soccer league in the US, home to many of the world's best players including US Women's National Team stars.",
    website: 'nwslsoccer.com',
  },
  PWHL: {
    fullName: "Professional Women's Hockey League",
    tier: 'Pro',
    description: 'The PWHL is the top women\'s professional ice hockey league in North America, launched in 2024 with six original teams.',
    website: 'thepwhl.com',
  },
  PLL: {
    fullName: 'Premier Lacrosse League',
    tier: 'Pro',
    description: 'The PLL is the top professional men\'s lacrosse league, featuring the world\'s best players competing in a city-based format.',
    website: 'premierlacrosseleague.com',
  },
  LOVB: {
    fullName: 'League One Volleyball',
    tier: 'Pro',
    description: 'LOVB is a professional women\'s volleyball league launched in 2024, building a new fan base around the sport in major US markets.',
    website: 'lovb.com',
  },
  AHL: {
    fullName: 'American Hockey League',
    tier: 'Minor League — NHL Affiliate',
    description: 'The AHL is the top development league for NHL franchises, serving as the primary proving ground for future NHL stars and an elite league in its own right.',
    website: 'theahl.com',
  },
  ECHL: {
    fullName: 'ECHL',
    tier: 'Minor League — Tier II',
    description: 'The ECHL is a mid-level professional ice hockey league and the primary affiliate league for many AHL and NHL clubs across North America.',
    website: 'echl.com',
  },
  'Minor League': {
    fullName: 'Minor League Baseball',
    tier: 'Minor League — MLB Affiliate',
    description: 'Minor League Baseball encompasses dozens of affiliate leagues where players develop skills on their path to the major leagues.',
    website: 'milb.com',
  },
  NCAAM: {
    fullName: "NCAA Men's Basketball",
    tier: 'College',
    description: 'NCAA Men\'s Basketball features hundreds of college programs competing for the national championship every March — one of the most watched sporting events in the US.',
    website: 'ncaa.com',
  },
  NCAAW: {
    fullName: "NCAA Women's Basketball",
    tier: 'College',
    description: "NCAA Women's Basketball is one of the fastest-growing sports in the US, with elite programs competing for a national title each spring.",
    website: 'ncaa.com',
  },
  NCAAF: {
    fullName: 'NCAA Football',
    tier: 'College',
    description: 'College football is one of the most popular sports in America, with storied programs competing in rivalry games, conference championships, and the College Football Playoff.',
    website: 'ncaa.com',
  },
  'NCAA Baseball': {
    fullName: 'NCAA Baseball',
    tier: 'College',
    description: 'NCAA Baseball features hundreds of college programs competing for the College World Series title in Omaha each June.',
    website: 'ncaa.com',
  },
  NCAA: {
    fullName: 'NCAA',
    tier: 'College',
    description: 'NCAA events are college sports competitions sanctioned by the National Collegiate Athletic Association.',
    website: 'ncaa.com',
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/data/leagueInfo.js
git commit -m "feat: add leagueInfo.js with descriptions for all supported leagues"
```

---

## Task 6: Update EventDetailPage — Badge Label + League Collapsible

**Files:** Modify `client/src/pages/EventDetailPage.jsx`.

- [ ] **Step 1: Add `leagueExpanded` state and `leagueInfo` import**

At the top of `EventDetailPage.jsx`, add the import after the existing imports:

```js
import { LEAGUE_INFO } from '../data/leagueInfo'
```

In the component body, add `leagueExpanded` state alongside the existing `venueExpanded`:

```js
const [leagueExpanded, setLeagueExpanded] = useState(false)
```

- [ ] **Step 2: Add badge label mapping — after the `badgeColor` line (line 55)**

Find:
```js
  const badgeColor = LEAGUE_COLORS[event.league] || 'bg-gray-500'
  const icon = SPORT_ICONS[event.sport] || ''
```

Add after:
```js
  const MINOR_BADGE_LEAGUES = new Set(['AHL', 'ECHL', 'Minor League'])
  const badgeLabel = MINOR_BADGE_LEAGUES.has(event.league) ? 'Minor League' : event.league
  const leagueInfo = LEAGUE_INFO[event.league] ?? null
```

- [ ] **Step 3: Replace `{event.league}` in the badge span with `{badgeLabel}`**

Find (line 94):
```jsx
              {event.league}
```

Replace with:
```jsx
              {badgeLabel}
```

- [ ] **Step 4: Add the collapsible league section — after the closing `</div>` of the Tickets section (line 187)**

Insert this JSX block after the Tickets `</div>` and before the closing `</div>` of the page content wrapper:

```jsx
        {/* About the League */}
        {leagueInfo && (
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <button
              onClick={() => setLeagueExpanded(!leagueExpanded)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">About the League</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${leagueExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {leagueExpanded && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <p className="text-xl font-bold text-gray-900 mb-2">{leagueInfo.fullName}</p>
                <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700 mb-3">
                  {leagueInfo.tier}
                </span>
                <p className="text-gray-600 text-sm mb-4">{leagueInfo.description}</p>
                <a
                  href={`https://${leagueInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {leagueInfo.website} →
                </a>
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 5: Verify in browser**

Start the dev server: `cd client && npm run dev`. Open any event detail page.

Check:
1. Badge shows "Minor League" for AHL/ECHL events (not "AHL" or "ECHL")
2. Badge shows "NBA", "NHL", etc. for pro league events unchanged
3. "About the League" section appears below Tickets for ALL events with a known league
4. Clicking the section header expands/collapses it correctly
5. The league website link opens in a new tab
6. No JS errors in console

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/EventDetailPage.jsx
git commit -m "feat: add About the League collapsible section to event detail page"
```

---

## Done

All 6 tasks complete. The feature is live:
- 15 WNBA + 32 AHL teams in `TEAMS` with colors, logos either seeded or falling back to color initials
- `event.league` now correctly carries `"AHL"` or `"ECHL"` from the backend
- Every event detail page shows a collapsible "About the League" blurb Brady can edit in `leagueInfo.js`
- Pro league badges are unchanged; AHL/ECHL events display "Minor League" in the badge

**To update a league description:** edit the `description` field in `client/src/data/leagueInfo.js` directly.

**To update a logo later:** drop a new PNG into `scripts/logos/{slug}.png` and run `node scripts/upload-logos.mjs --force`.
