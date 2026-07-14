// Venue knowledge base — "the stadium in the radar."
//
// One entry per major venue across the five pro leagues (NFL, NBA, NHL, MLB,
// MLS) plus Power 4 college football stadiums and basketball arenas. Each
// entry follows the shape in docs/superpowers/userprompts/venue-knowledge.md:
// display name, aliases (critical for matching Ticketmaster's varying venue
// names), a punchy summary, and structured arrival / seating / food / fan-tips
// blocks, capped with a `confidence` marker so the UI never presents manual
// notes as absolute truth.
//
// Shared buildings are listed exactly once to avoid duplicate keys:
//   - NBA/NHL co-tenants (MSG, TD Garden, United Center, Ball Arena, ...) live
//     in nba.js; nhl.js only holds NHL-exclusive arenas.
//   - NFL stadiums that also host MLS / college football (Mercedes-Benz, Bank
//     of America, Gillette, Lumen, Soldier Field, ...) live in nfl.js.
//   - Miami (Hard Rock) and Pitt (Acrisure) college football sit in nfl.js;
//     NC State (Lenovo Center) hoops sits in nhl.js; Syracuse (JMA Dome) sits
//     in cfbAcc.js.

import { NFL_VENUES } from './nfl.js'
import { NBA_VENUES } from './nba.js'
import { NHL_VENUES } from './nhl.js'
import { MLB_VENUES } from './mlb.js'
import { MLS_VENUES } from './mls.js'
import { CFB_SEC_VENUES } from './cfbSec.js'
import { CFB_BIG_TEN_VENUES } from './cfbBigTen.js'
import { CFB_BIG_12_VENUES } from './cfbBig12.js'
import { CFB_ACC_VENUES } from './cfbAcc.js'
import { CBB_SEC_VENUES } from './cbbSec.js'
import { CBB_BIG_TEN_VENUES } from './cbbBigTen.js'
import { CBB_BIG_12_VENUES } from './cbbBig12.js'
import { CBB_ACC_VENUES } from './cbbAcc.js'

// Grouped exports, in case a caller wants a single league/conference slice.
export const VENUE_GROUPS = {
  nfl: NFL_VENUES,
  nba: NBA_VENUES,
  nhl: NHL_VENUES,
  mlb: MLB_VENUES,
  mls: MLS_VENUES,
  cfbSec: CFB_SEC_VENUES,
  cfbBigTen: CFB_BIG_TEN_VENUES,
  cfbBig12: CFB_BIG_12_VENUES,
  cfbAcc: CFB_ACC_VENUES,
  cbbSec: CBB_SEC_VENUES,
  cbbBigTen: CBB_BIG_TEN_VENUES,
  cbbBig12: CBB_BIG_12_VENUES,
  cbbAcc: CBB_ACC_VENUES,
}

// The full merged map: slug -> venue entry. Each entry is augmented with its
// own `slug` so callers that only hold the object can still identify it.
export const VENUE_KNOWLEDGE = {}
for (const group of Object.values(VENUE_GROUPS)) {
  for (const [slug, entry] of Object.entries(group)) {
    VENUE_KNOWLEDGE[slug] = { slug, ...entry }
  }
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

// Ticketmaster venue names vary in punctuation, casing, corporate prefixes,
// and stale sponsor names. Normalize aggressively so "AT&T Stadium",
// "at&t stadium", and "ATT Stadium" all collapse to the same key.
export function normalizeVenueName(name) {
  if (!name) return ''
  return String(name)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’.]/g, '')       // drop apostrophes and periods
    .replace(/[-–—/]/g, ' ')     // hyphens and slashes become spaces
    .replace(/[^a-z0-9 ]/g, ' ') // any other punctuation to space
    .replace(/\s+/g, ' ')
    .trim()
}

function stateKey(state) {
  return state ? String(state).trim().toUpperCase() : ''
}

// normalized name/alias -> array of entries (arrays handle real collisions
// like the several "Memorial Stadium" venues).
const NAME_INDEX = new Map()

function registerName(name, entry) {
  const key = normalizeVenueName(name)
  if (!key) return
  const existing = NAME_INDEX.get(key)
  if (existing) {
    if (!existing.includes(entry)) existing.push(entry)
  } else {
    NAME_INDEX.set(key, [entry])
  }
}

for (const entry of Object.values(VENUE_KNOWLEDGE)) {
  registerName(entry.name, entry)
  for (const alias of entry.aliases || []) registerName(alias, entry)
}

// Pick the best entry from a candidate list using city/state hints.
//
// The state hint is a hard verifier, not just a tie-breaker: Ticketmaster's
// stateCode is reliable, so a candidate in a different state is a different
// building that happens to share the name — it is rejected even when it is
// the only candidate. The city hint only breaks ties (it never rejects a
// lone candidate) because city naming is fuzzy: Ticketmaster may use the
// metro name where the entry uses the suburb.
function disambiguate(entries, city, state) {
  const wantState = stateKey(state)
  const candidates = wantState
    ? entries.filter((e) => stateKey(e.state) === wantState)
    : entries
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const wantCity = city ? normalizeVenueName(city) : ''
  if (wantCity) {
    const byCity = candidates.filter((e) => normalizeVenueName(e.city) === wantCity)
    if (byCity.length >= 1) return byCity[0]
  }
  // Ambiguous and no usable hints — refuse to guess.
  return null
}

/**
 * Look up venue knowledge by name (and optional city/state to break ties).
 *
 * @param {string} name          venue name as it comes from Ticketmaster
 * @param {object} [opts]
 * @param {string} [opts.city]   venue city (disambiguates name collisions)
 * @param {string} [opts.state]  venue state code (disambiguates name collisions)
 * @returns {object|null} the venue entry (with `slug`) or null if unknown
 */
export function getVenueKnowledge(name, { city, state } = {}) {
  if (!name) return null

  // 1. exact slug hit (callers that already hold a slug).
  if (VENUE_KNOWLEDGE[name]) return VENUE_KNOWLEDGE[name]

  // 2. exact normalized name/alias match.
  const key = normalizeVenueName(name)
  const direct = NAME_INDEX.get(key)
  if (direct) {
    const picked = disambiguate(direct, city, state)
    if (picked) return picked
  }

  // 3a. query is a subset of one or more stored names ("Memorial Stadium"
  //     matching several full names). This is a genuine same-name family, so
  //     collect every candidate and let city/state break the tie.
  const subsetMatches = []
  for (const [indexKey, entries] of NAME_INDEX) {
    if (indexKey.length < 5) continue
    if (indexKey !== key && indexKey.includes(key)) subsetMatches.push(...entries)
  }
  if (subsetMatches.length) {
    const picked = disambiguate([...new Set(subsetMatches)], city, state)
    if (picked) return picked
  }

  // 3b. a stored name is a subset of the query — Ticketmaster appended a city
  //     or sponsor tag ("Lambeau Field - Green Bay"). Keep only the most
  //     specific (longest) matching key so a short generic token can't win.
  let bestEntries = null
  let bestLen = 0
  for (const [indexKey, entries] of NAME_INDEX) {
    if (indexKey.length < 5) continue
    if (key.includes(indexKey) && indexKey.length > bestLen) {
      bestLen = indexKey.length
      bestEntries = entries
    }
  }
  if (bestEntries) {
    const picked = disambiguate([...new Set(bestEntries)], city, state)
    if (picked) return picked
  }

  return null
}

// Total count of distinct venues in the knowledge base (handy for tests/UI).
export const VENUE_COUNT = Object.keys(VENUE_KNOWLEDGE).length

export default VENUE_KNOWLEDGE
