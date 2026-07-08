// Exports the canonical team names known to the client data layer into
// Api/Data/known-teams.json so the API's unknown-team trigger can use them.
// Rerun whenever client/src/data/teams.js changes:
//   cd scripts && node export-known-teams.mjs
// Requires Node >= 20.10 (teams.js uses JSON import attributes).
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import TEAMS, {
  NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AAA, AA, PLL, LOVB_TEAMS,
} from '../client/src/data/teams.js'

// Merge the named league maps and the default TEAMS map so nothing is missed.
const merged = Object.assign(
  {}, NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AAA, AA, PLL, LOVB_TEAMS, TEAMS,
)
const names = Object.keys(merged).sort((a, b) => a.localeCompare(b))

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'Api', 'Data', 'known-teams.json')
writeFileSync(outPath, JSON.stringify(names, null, 2) + '\n')
console.log(`Wrote ${names.length} team names to ${outPath}`)
