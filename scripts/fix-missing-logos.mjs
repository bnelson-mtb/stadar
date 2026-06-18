/**
 * Downloads the 66 logos that failed in seed-logos.mjs,
 * using corrected source URLs for each league category.
 * Run: node fix-missing-logos.mjs
 */
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')
mkdirSync(LOGOS_DIR, { recursive: true })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

// [slug, url]
const TARGETS = [
  // MLS — correct ESPN soccer IDs (from ESPN API)
  ['atlanta-united.png',         'https://a.espncdn.com/i/teamlogos/soccer/500/18418.png'],
  ['chicago-fire-fc.png',        'https://a.espncdn.com/i/teamlogos/soccer/500/182.png'],
  ['fc-cincinnati.png',          'https://a.espncdn.com/i/teamlogos/soccer/500/18267.png'],
  ['fc-dallas.png',              'https://a.espncdn.com/i/teamlogos/soccer/500/185.png'],
  ['houston-dynamo-fc.png',      'https://a.espncdn.com/i/teamlogos/soccer/500/6077.png'],
  ['sporting-kansas-city.png',   'https://a.espncdn.com/i/teamlogos/soccer/500/186.png'],
  ['la-galaxy.png',              'https://a.espncdn.com/i/teamlogos/soccer/500/187.png'],
  ['los-angeles-fc.png',         'https://a.espncdn.com/i/teamlogos/soccer/500/18966.png'],
  ['inter-miami-cf.png',         'https://a.espncdn.com/i/teamlogos/soccer/500/20232.png'],
  ['cf-montral.png',             'https://a.espncdn.com/i/teamlogos/soccer/500/9720.png'],
  ['nashville-sc.png',           'https://a.espncdn.com/i/teamlogos/soccer/500/18986.png'],
  ['new-england-revolution.png', 'https://a.espncdn.com/i/teamlogos/soccer/500/189.png'],
  ['new-york-city-fc.png',       'https://a.espncdn.com/i/teamlogos/soccer/500/17606.png'],
  ['red-bull-new-york.png',      'https://a.espncdn.com/i/teamlogos/soccer/500/190.png'],
  ['orlando-city.png',           'https://a.espncdn.com/i/teamlogos/soccer/500/12011.png'],
  ['philadelphia-union.png',     'https://a.espncdn.com/i/teamlogos/soccer/500/10739.png'],
  ['portland-timbers.png',       'https://a.espncdn.com/i/teamlogos/soccer/500/9723.png'],
  ['san-jose-earthquakes.png',   'https://a.espncdn.com/i/teamlogos/soccer/500/191.png'],
  ['san-diego-fc.png',           'https://a.espncdn.com/i/teamlogos/soccer/500/22529.png'],
  ['vancouver-whitecaps-fc.png', 'https://a.espncdn.com/i/teamlogos/soccer/500/9727.png'],
  ['st-louis-city-sc.png',       'https://a.espncdn.com/i/teamlogos/soccer/500/21812.png'],

  // PWHL — leaguestat CDN (IDs confirmed by visual inspection)
  ['boston-fleet.png',       'https://assets.leaguestat.com/pwhl/logos/1.png'],
  ['minnesota-frost.png',    'https://assets.leaguestat.com/pwhl/logos/2.png'],
  ['montral-victoire.png',   'https://assets.leaguestat.com/pwhl/logos/3.png'],
  ['new-york-sirens.png',    'https://assets.leaguestat.com/pwhl/logos/4.png'],
  ['ottawa-charge.png',      'https://assets.leaguestat.com/pwhl/logos/5.png'],
  ['toronto-sceptres.png',   'https://assets.leaguestat.com/pwhl/logos/6.png'],

  // AAA Minor League — mlbstatic.com with correct numeric IDs (MLB Stats API)
  ['sacramento-river-cats.svg',       'https://www.mlbstatic.com/team-logos/105.svg'],
  ['las-vegas-aviators.svg',          'https://www.mlbstatic.com/team-logos/400.svg'],
  ['reno-aces.svg',                   'https://www.mlbstatic.com/team-logos/2310.svg'],
  ['el-paso-chihuahuas.svg',          'https://www.mlbstatic.com/team-logos/4904.svg'],
  ['albuquerque-isotopes.svg',        'https://www.mlbstatic.com/team-logos/342.svg'],
  ['round-rock-express.svg',          'https://www.mlbstatic.com/team-logos/102.svg'],
  ['oklahoma-city-baseball-club.svg', 'https://www.mlbstatic.com/team-logos/238.svg'],
  ['sugar-land-space-cowboys.svg',    'https://www.mlbstatic.com/team-logos/5434.svg'],
  ['tacoma-rainiers.svg',             'https://www.mlbstatic.com/team-logos/529.svg'],
  ['iowa-cubs.svg',                   'https://www.mlbstatic.com/team-logos/451.svg'],
  ['omaha-storm-chasers.svg',         'https://www.mlbstatic.com/team-logos/541.svg'],
  ['durham-bulls.svg',                'https://www.mlbstatic.com/team-logos/234.svg'],
  ['nashville-sounds.svg',            'https://www.mlbstatic.com/team-logos/556.svg'],
  ['memphis-redbirds.svg',            'https://www.mlbstatic.com/team-logos/235.svg'],
  ['st-paul-saints.svg',              'https://www.mlbstatic.com/team-logos/1960.svg'],
  ['indianapolis-indians.svg',        'https://www.mlbstatic.com/team-logos/484.svg'],
  ['toledo-mud-hens.svg',             'https://www.mlbstatic.com/team-logos/512.svg'],
  ['louisville-bats.svg',             'https://www.mlbstatic.com/team-logos/416.svg'],
  ['buffalo-bisons.svg',              'https://www.mlbstatic.com/team-logos/422.svg'],
  ['syracuse-mets.svg',               'https://www.mlbstatic.com/team-logos/552.svg'],
  ['rochester-red-wings.svg',         'https://www.mlbstatic.com/team-logos/534.svg'],
  ['scrantonwb-railriders.svg',       'https://www.mlbstatic.com/team-logos/531.svg'],
  ['lehigh-valley-ironpigs.svg',      'https://www.mlbstatic.com/team-logos/1410.svg'],
  ['norfolk-tides.svg',               'https://www.mlbstatic.com/team-logos/568.svg'],
  ['charlotte-knights.svg',           'https://www.mlbstatic.com/team-logos/494.svg'],
  ['gwinnett-stripers.svg',           'https://www.mlbstatic.com/team-logos/431.svg'],
  ['jacksonville-jumbo-shrimp.svg',   'https://www.mlbstatic.com/team-logos/564.svg'],
  ['worcester-red-sox.svg',           'https://www.mlbstatic.com/team-logos/533.svg'],

  // PLL 2024 — confirmed 200 OK, just timed out during initial seed
  ['utah-archers.png',          'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_archers_primary_color.png'],
  ['california-redwoods.png',   'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_redwoods_primary_color.png'],
  ['carolina-chaos.png',        'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_chaos_primary_color.png'],
  ['denver-outlaws.png',        'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_outlaws_primary_color.png'],
  ['boston-cannons.png',        'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_cannons_primary_color.png'],
  ['maryland-whipsnakes.png',   'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_whipsnakes_primary_color.png'],
  ['new-york-atlas.png',        'https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_atlas_primary_color.png'],
  ['philadelphia-waterdogs.png','https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_waterdogs_primary_color.png'],

  // LOVB — confirmed 200 OK, just timed out during initial seed
  ['lovb-austin.webp',   'https://upload.wikimedia.org/wikipedia/commons/3/34/LOVB_Austin_logo.webp'],
  ['lovb-atlanta.webp',  'https://upload.wikimedia.org/wikipedia/commons/a/ae/LOVB_Atlanta_logo.webp'],
  ['lovb-madison.webp',  'https://upload.wikimedia.org/wikipedia/commons/5/5a/LOVB_Madison_logo.webp'],
]

let ok = 0, skipped = 0, failed = 0

for (const [filename, url] of TARGETS) {
  const destPath = join(LOGOS_DIR, filename)
  if (existsSync(destPath)) {
    console.log(`⟳ exists    ${filename}`)
    skipped++
    continue
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await pipeline(res.body, createWriteStream(destPath))
    console.log(`✓ downloaded ${filename}`)
    ok++
  } catch (err) {
    console.log(`✗ failed     ${filename}  (${err.message})`)
    failed++
  } finally {
    clearTimeout(timer)
  }
}

console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed`)
