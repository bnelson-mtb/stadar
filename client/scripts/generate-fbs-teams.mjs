// Fetches all D1 NCAA schools from ESPN and prints NCAA section entries for teams.js
// Combines: FBS football (groups=80), FCS football (groups=81), D1 basketball (groups=50)
// Run with: node client/scripts/generate-fbs-teams.mjs

// Schools currently in the NCAA section of teams.js at git HEAD
const ALREADY_ADDED = new Set([
  'Utah', 'BYU', 'Utah State', 'Weber State', 'Southern Utah', 'Utah Tech', 'Utah Valley',
  'Arizona', 'Arizona State', 'Colorado', 'Iowa State', 'Kansas', 'Kansas State',
  'Baylor', 'UCF', 'Cincinnati', 'Houston', 'Oklahoma State', 'TCU', 'Texas Tech', 'West Virginia',
])

// Helper to extract ESPN team ID from a $ref URL
const extractId = ref => ref.match(/teams\/(\d+)/)?.[1]

// Fetch a set of team IDs from an ESPN core API groups endpoint
async function fetchGroupTeamIds(sport, league, groupId) {
  const url = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/2025/types/2/groups/${groupId}/teams?limit=500`
  try {
    const res = await fetch(url)
    const data = await res.json()
    return new Set((data.items || []).map(i => extractId(i.$ref)).filter(Boolean))
  } catch {
    return new Set()
  }
}

// Fetch all teams from the ESPN site API (paginated)
async function fetchAllSiteTeams(sport, league) {
  const teams = []
  for (let page = 1; page <= 10; page++) {
    const url = `https://site.web.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=200&page=${page}`
    const res = await fetch(url)
    const data = await res.json()
    const batch = data.sports?.[0]?.leagues?.[0]?.teams?.map(t => t.team) ?? []
    teams.push(...batch)
    if (batch.length < 200) break
  }
  return teams
}

// Build team ID -> conference name map
async function buildConfMap(sport, league, topGroupId) {
  const idToConf = {}
  try {
    const url = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/2025/types/2/groups/${topGroupId}/children?limit=100`
    const res = await fetch(url)
    const data = await res.json()
    for (const confRef of (data.items || [])) {
      const confDetail = await fetch(confRef.$ref).then(r => r.json())
      const confName = confDetail.name || 'Other'
      const teamsRef = confDetail.teams?.$ref
      if (!teamsRef) continue
      const teamsData = await fetch(teamsRef + '&limit=100').then(r => r.json())
      for (const t of (teamsData.items || [])) {
        const tid = extractId(t.$ref)
        if (tid) idToConf[tid] = confName
      }
    }
  } catch {}
  return idToConf
}

// Escape single quotes for use in single-quoted JS strings
const esc = s => s.replace(/'/g, "\\'")

console.error('Fetching D1 team IDs from ESPN core API...')
const [fbsIds, fcsIds, basketballIds] = await Promise.all([
  fetchGroupTeamIds('football', 'college-football', 80),
  fetchGroupTeamIds('football', 'college-football', 81),
  fetchGroupTeamIds('basketball', 'mens-college-basketball', 50),
])
const allD1Ids = new Set([...fbsIds, ...fcsIds, ...basketballIds])
console.error(`FBS: ${fbsIds.size}, FCS: ${fcsIds.size}, D1 Basketball: ${basketballIds.size}, Combined: ${allD1Ids.size}`)

console.error('Fetching rich team data...')
const [footballTeams, basketballTeams] = await Promise.all([
  fetchAllSiteTeams('football', 'college-football'),
  fetchAllSiteTeams('basketball', 'mens-college-basketball'),
])

// Merge by ID (prefer football data if available)
const teamById = {}
for (const team of [...basketballTeams, ...footballTeams]) {
  teamById[team.id] = team
}
const d1Teams = Object.values(teamById).filter(t => allD1Ids.has(t.id))
console.error(`Matched ${d1Teams.length} / ${allD1Ids.size} D1 teams`)

console.error('Fetching conference info...')
const [footballConfs, basketballConfs] = await Promise.all([
  buildConfMap('football', 'college-football', 80),
  buildConfMap('basketball', 'mens-college-basketball', 50),
])
function getConf(team) {
  return footballConfs[team.id] || basketballConfs[team.id] || 'Other'
}

// Group by conference
const byConf = {}
for (const team of d1Teams) {
  const school = team.shortDisplayName
  if (ALREADY_ADDED.has(school)) continue
  const conf = getConf(team)
  if (!byConf[conf]) byConf[conf] = []
  byConf[conf].push(team)
}

const totalNew = Object.values(byConf).reduce((s, a) => s + a.length, 0)
console.error(`New schools to add: ${totalNew}`)

for (const [conf, teams] of Object.entries(byConf).sort()) {
  console.log(`\n  // --- ${conf} ---`)
  for (const team of teams.sort((a, b) => a.shortDisplayName.localeCompare(b.shortDisplayName))) {
    const school = esc(team.shortDisplayName)
    const mascot = esc(team.name)
    const rawSchool = team.shortDisplayName
    const rawMascot = team.name
    const id = team.id
    const color = '#' + (team.color || '333333')

    console.log(`  '${school}': {`)
    console.log(`    color: '${color}',`)
    console.log(`    logo: espnLogo('ncaa', '${id}'),`)
    console.log(`    shortName: '${mascot}',`)
    console.log(`    tmNames: [`)
    console.log(`      '${school} ${mascot}',`)
    console.log(`      "${rawSchool} ${rawMascot} Men's Basketball", "${rawSchool} ${rawMascot} Women's Basketball",`)
    console.log(`    ],`)
    console.log(`  },`)
  }
}
