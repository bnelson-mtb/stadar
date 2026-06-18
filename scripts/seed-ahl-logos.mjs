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
