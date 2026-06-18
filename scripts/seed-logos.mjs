import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')
mkdirSync(LOGOS_DIR, { recursive: true })

// Derive slug from team name: lowercase, spaces→hyphens, strip non-alphanumeric except hyphens
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function downloadLogo(url, destPath) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await pipeline(res.body, createWriteStream(destPath))
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const { default: TEAMS } = await import('../client/src/data/teams.js')

  // Deduplicate: map canonical key → logo URL (skip aliases pointing to same data)
  const seen = new Set()
  const entries = []
  for (const [name, data] of Object.entries(TEAMS)) {
    if (!data?.logo) continue
    const key = data.logo
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({ name, logo: data.logo })
  }

  let downloaded = 0, skipped = 0, failed = 0

  for (const { name, logo } of entries) {
    const ext = extname(new URL(logo).pathname) || '.png'
    const slug = toSlug(name)
    const destPath = join(LOGOS_DIR, `${slug}${ext}`)

    if (existsSync(destPath)) {
      console.log(`⟳ skipped (exists)  ${slug}${ext}`)
      skipped++
      continue
    }

    try {
      await downloadLogo(logo, destPath)
      console.log(`✓ downloaded        ${slug}${ext}  ← ${logo}`)
      downloaded++
    } catch (err) {
      console.log(`✗ failed            ${slug}${ext}  ← ${logo}  (${err.message})`)
      failed++
    }
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`)
}

main().catch(err => { console.error(err); process.exit(1) })
