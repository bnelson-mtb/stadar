import { BlobServiceClient } from '@azure/storage-blob'
import { createReadStream, readdirSync, statSync } from 'fs'
import { extname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { writeFileSync } from 'fs'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')
const MANIFEST_PATH = join(__dirname, '..', 'client', 'src', 'data', 'logoManifest.json')
const CONTAINER = 'logos'
const ACCOUNT_NAME = 'stadarstorage'
const BASE_URL = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER}`

const CONTENT_TYPES = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const force = process.argv.includes('--force')

async function main() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connStr) {
    console.error('Missing AZURE_STORAGE_CONNECTION_STRING in .env')
    process.exit(1)
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connStr)
  const containerClient = blobServiceClient.getContainerClient(CONTAINER)

  const files = readdirSync(LOGOS_DIR).filter(f => {
    const ext = extname(f).toLowerCase()
    return CONTENT_TYPES[ext] && statSync(join(LOGOS_DIR, f)).isFile()
  })

  let uploaded = 0, skipped = 0, failed = 0

  for (const file of files) {
    const blobName = file
    const filePath = join(LOGOS_DIR, file)
    const ext = extname(file).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'
    const blobClient = containerClient.getBlockBlobClient(blobName)

    if (!force) {
      try {
        await blobClient.getProperties()
        console.log(`⟳ skipped (exists)  ${blobName}`)
        skipped++
        continue
      } catch {
        // blob doesn't exist, proceed to upload
      }
    }

    try {
      const stream = createReadStream(filePath)
      const size = statSync(filePath).size
      await blobClient.uploadStream(stream, size, undefined, {
        blobHTTPHeaders: { blobContentType: contentType },
      })
      console.log(`✓ uploaded          ${blobName}`)
      uploaded++
    } catch (err) {
      console.error(`✗ failed            ${blobName}  (${err.message})`)
      failed++
    }
  }

  console.log(`\nUpload: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`)

  // Rebuild manifest: map every team name whose slug file exists to its blob URL
  const { default: TEAMS } = await import('../client/src/data/teams.js')

  // Build slug→blobUrl map from what's in logos/
  const slugToUrl = {}
  for (const file of files) {
    const slug = basename(file, extname(file))
    slugToUrl[slug] = `${BASE_URL}/${file}`
  }

  const manifest = {}
  const seen = new Set()
  for (const [name] of Object.entries(TEAMS)) {
    const slug = toSlug(name)
    if (slugToUrl[slug] && !seen.has(slug)) {
      manifest[name] = slugToUrl[slug]
      seen.add(slug)
    }
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\nManifest written: ${Object.keys(manifest).length} teams → ${MANIFEST_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
