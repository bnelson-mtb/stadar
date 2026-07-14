# Logo Blob Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Download team logos from third-party CDNs into a committed `scripts/logos/` folder, upload them to Azure Blob Storage, and serve all logos from stable blob URLs — eliminating dependency on ESPN/NWSL CDNs that silently break.

**Architecture:** Two standalone Node scripts (`seed-logos.mjs`, `upload-logos.mjs`) handle the pipeline. The upload script writes `client/src/data/logoManifest.json`, which `getTeamData()` checks before falling back to the CDN `logo` field in `teams.js`. The `scripts/logos/` folder is committed to git as the curated source-of-truth; it is never bundled into the app.

**Tech Stack:** Node.js (ESM, `.mjs`), `@azure/storage-blob`, `dotenv`, Azure Blob Storage (anonymous public read container), Vite/React (unchanged — only `teams.js` is modified).

---

## File Map

| File | Status | Purpose |
|---|---|---|
| `scripts/package.json` | Create | Dependencies for the two scripts |
| `scripts/.env` | Create (gitignored) | `AZURE_STORAGE_CONNECTION_STRING` |
| `scripts/.env.example` | Create | Template showing required vars |
| `scripts/logos/` | Create (empty, committed) | Curated logo images — source of truth |
| `scripts/seed-logos.mjs` | Create | Download logos from CDN URLs in teams.js → scripts/logos/ |
| `scripts/upload-logos.mjs` | Create | Upload scripts/logos/ → blob storage, write manifest |
| `client/src/data/logoManifest.json` | Create | Generated map: team name → blob URL |
| `client/src/data/teams.js` | Modify (line 3748) | `getTeamData` checks manifest before CDN logo |
| `.gitignore` | Modify | Add `scripts/.env` |
| `CLAUDE.md` | Modify | Document logo workflow |

---

## Task 1: Azure Storage Setup

**Files:** none (Azure CLI only)

- [ ] **Step 1: Create storage account**

```powershell
az storage account create `
  --name stadarstorage `
  --resource-group stadar-rg `
  --location eastus `
  --sku Standard_LRS `
  --allow-blob-public-access true
```

Expected output: JSON blob with `"provisioningState": "Succeeded"`.

- [ ] **Step 2: Create public-read logos container**

```powershell
az storage container create `
  --name logos `
  --account-name stadarstorage `
  --public-access blob
```

Expected output: `{"created": true}`.

- [ ] **Step 3: Set CORS so browsers can load logo images**

```powershell
az storage cors add `
  --account-name stadarstorage `
  --services b `
  --methods GET `
  --origins "*" `
  --allowed-headers "*" `
  --exposed-headers "*" `
  --max-age 3600
```

- [ ] **Step 4: Get the connection string and save it**

```powershell
az storage account show-connection-string `
  --name stadarstorage `
  --resource-group stadar-rg `
  --query connectionString `
  --output tsv
```

Copy the output — you'll paste it into `scripts/.env` in Task 2.

---

## Task 2: Scripts Scaffolding

**Files:**
- Create: `scripts/package.json`
- Create: `scripts/.env`
- Create: `scripts/.env.example`
- Create: `scripts/logos/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Create `scripts/package.json`**

```json
{
  "name": "stadar-scripts",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@azure/storage-blob": "^12.26.0",
    "dotenv": "^16.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```powershell
cd C:\Users\brady\Repos\stadar\scripts
npm install
```

Expected: `node_modules/` created inside `scripts/`.

- [ ] **Step 3: Create `scripts/.env`**

```
AZURE_STORAGE_CONNECTION_STRING=<paste the connection string from Task 1 Step 4>
AZURE_STORAGE_ACCOUNT_NAME=stadarstorage
AZURE_CONTAINER_NAME=logos
```

- [ ] **Step 4: Create `scripts/.env.example`**

```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=stadarstorage
AZURE_CONTAINER_NAME=logos
```

- [ ] **Step 5: Create `scripts/logos/.gitkeep`**

Create an empty file at `scripts/logos/.gitkeep` so the folder is committed even before any logos are downloaded.

- [ ] **Step 6: Update `.gitignore` — add scripts/.env**

Add these two lines at the bottom of `.gitignore`:

```
scripts/.env
scripts/node_modules/
```

- [ ] **Step 7: Commit scaffolding**

```powershell
cd C:\Users\brady\Repos\stadar
git add scripts/package.json scripts/.env.example scripts/logos/.gitkeep .gitignore
git commit -m "Add scripts scaffolding for logo blob storage pipeline"
```

---

## Task 3: `seed-logos.mjs`

**Files:**
- Create: `scripts/seed-logos.mjs`

This script reads every `logo` URL from the TEAMS map in `teams.js`, derives a slug filename, and downloads the logo to `scripts/logos/` if it doesn't already exist there.

- [ ] **Step 1: Create `scripts/seed-logos.mjs`**

```js
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')

// Import the TEAMS map from teams.js
const { default: teamsModule } = await import('../client/src/data/teams.js').catch(() => {
  console.error('Could not import teams.js — run from repo root or scripts/ directory')
  process.exit(1)
})

// teams.js doesn't export TEAMS directly, so we re-derive it by importing
// the named league exports and running the same build loop used in the file.
import {
  NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AAA, PLL, LOVB_TEAMS
} from '../client/src/data/teams.js'

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
}

function inferExt(url) {
  const u = url.split('?')[0]
  const ext = extname(u)
  return ['.png', '.svg', '.webp', '.jpg', '.jpeg'].includes(ext) ? ext : '.png'
}

async function downloadLogo(name, url) {
  const slug = toSlug(name)
  const ext = inferExt(url)
  const dest = join(LOGOS_DIR, `${slug}${ext}`)

  if (existsSync(dest)) {
    return { status: 'skipped', slug }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(dest, buf)
    return { status: 'downloaded', slug }
  } catch (err) {
    return { status: 'failed', slug, url, reason: err.message }
  }
}

// Build the same TEAMS map as teams.js
const seen = new Map() // name → logo URL, deduped by canonical key

for (const league of [NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AAA, PLL, LOVB_TEAMS]) {
  for (const [name, data] of Object.entries(league)) {
    if (data?.logo && !seen.has(name)) seen.set(name, data.logo)
  }
}
for (const [schoolName, school] of Object.entries(NCAA)) {
  const canonicalName = school.displayName || `${schoolName} ${school.shortName}`
  if (school?.logo && !seen.has(canonicalName)) seen.set(canonicalName, school.logo)
}

const entries = [...seen.entries()]
console.log(`\nSeeding ${entries.length} logos into scripts/logos/\n`)

let downloaded = 0, skipped = 0, failed = 0
const failures = []

for (const [name, url] of entries) {
  const result = await downloadLogo(name, url)
  if (result.status === 'downloaded') {
    downloaded++
    console.log(`  ✓ ${result.slug}`)
  } else if (result.status === 'skipped') {
    skipped++
  } else {
    failed++
    failures.push(result)
    console.log(`  ✗ ${result.slug}  (${result.reason})`)
  }
}

console.log(`\nDone. Downloaded: ${downloaded}  Skipped: ${skipped}  Failed: ${failed}`)
if (failures.length) {
  console.log('\nFailed logos (fix source URL or drop file manually):')
  failures.forEach(f => console.log(`  ${f.slug}: ${f.url}`))
}
```

- [ ] **Step 2: Run the seed script**

```powershell
cd C:\Users\brady\Repos\stadar\scripts
node seed-logos.mjs
```

Expected: progress lines like `✓ utah-jazz`, `✗ some-team (HTTP 404)`, then a summary. This takes a few minutes — there are ~300+ teams. Note which ones failed; you'll drop replacements into `scripts/logos/` manually.

- [ ] **Step 3: Commit whatever was downloaded**

```powershell
cd C:\Users\brady\Repos\stadar
git add scripts/logos/
git commit -m "Seed team logos from CDN sources"
```

---

## Task 4: `upload-logos.mjs`

**Files:**
- Create: `scripts/upload-logos.mjs`
- Create: `client/src/data/logoManifest.json` (written by script)

This script uploads everything in `scripts/logos/` to Azure Blob Storage and writes `client/src/data/logoManifest.json`.

- [ ] **Step 1: Create `scripts/upload-logos.mjs`**

```js
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { extname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { BlobServiceClient } from '@azure/storage-blob'
import 'dotenv/config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const LOGOS_DIR = join(__dirname, 'logos')
const MANIFEST_PATH = join(__dirname, '../client/src/data/logoManifest.json')

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName = process.env.AZURE_CONTAINER_NAME || 'logos'
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'stadarstorage'
const force = process.argv.includes('--force')

if (!connectionString) {
  console.error('Missing AZURE_STORAGE_CONNECTION_STRING in scripts/.env')
  process.exit(1)
}

// Import the same league exports to rebuild name→slug map
import {
  NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AAA, PLL, LOVB_TEAMS
} from '../client/src/data/teams.js'

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function contentType(ext) {
  return { '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
           '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }[ext] ?? 'application/octet-stream'
}

// Build slug → canonical team name map (reverse of toSlug)
const slugToName = new Map()
for (const league of [NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, ECHL, AAA, PLL, LOVB_TEAMS]) {
  for (const [name] of Object.entries(league)) {
    slugToName.set(toSlug(name), name)
  }
}
for (const [schoolName, school] of Object.entries(NCAA)) {
  const canonicalName = school.displayName || `${schoolName} ${school.shortName}`
  slugToName.set(toSlug(canonicalName), canonicalName)
}

const blobService = BlobServiceClient.fromConnectionString(connectionString)
const container = blobService.getContainerClient(containerName)

const files = readdirSync(LOGOS_DIR).filter(f => f !== '.gitkeep')
console.log(`\nUploading ${files.length} logos to ${containerName}...\n`)

let uploaded = 0, skipped = 0, failed = 0
const manifest = {}

// Load existing manifest to preserve entries not in this run
try {
  const existing = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  Object.assign(manifest, existing)
} catch {}

for (const file of files) {
  const ext = extname(file)
  const slug = basename(file, ext)
  const blobName = file
  const blobClient = container.getBlockBlobClient(blobName)
  const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
  const teamName = slugToName.get(slug)

  try {
    if (!force) {
      try {
        await blobClient.getProperties()
        skipped++
        if (teamName) manifest[teamName] = blobUrl
        continue
      } catch {}
    }

    const data = readFileSync(join(LOGOS_DIR, file))
    await blobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: contentType(ext) }
    })
    uploaded++
    if (teamName) manifest[teamName] = blobUrl
    console.log(`  ✓ ${file}`)
  } catch (err) {
    failed++
    console.log(`  ✗ ${file}  (${err.message})`)
  }
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\nDone. Uploaded: ${uploaded}  Skipped: ${skipped}  Failed: ${failed}`)
console.log(`Manifest written to client/src/data/logoManifest.json (${Object.keys(manifest).length} entries)`)
```

- [ ] **Step 2: Create the empty manifest file**

Create `client/src/data/logoManifest.json`:
```json
{}
```

- [ ] **Step 3: Run the upload script**

```powershell
cd C:\Users\brady\Repos\stadar\scripts
node upload-logos.mjs
```

Expected: `✓ utah-jazz.png` lines, then `Manifest written to client/src/data/logoManifest.json (N entries)`.

- [ ] **Step 4: Spot-check a blob URL**

Open one of the URLs printed in the manifest (e.g. `https://stadarstorage.blob.core.windows.net/logos/utah-jazz.png`) in a browser. You should see the logo image directly — no login, no redirect.

- [ ] **Step 5: Commit**

```powershell
cd C:\Users\brady\Repos\stadar
git add scripts/upload-logos.mjs client/src/data/logoManifest.json
git commit -m "Add upload script and initial logo manifest"
```

---

## Task 5: Wire manifest into `getTeamData`

**Files:**
- Modify: `client/src/data/teams.js` (lines 3748–3750)

- [ ] **Step 1: Add the manifest import at the top of `teams.js`**

Add this as the very first line of `client/src/data/teams.js` (before the logo URL helpers):

```js
import logoManifest from './logoManifest.json'
```

Vite handles JSON imports natively — no plugin or config change needed.

- [ ] **Step 2: Update `getTeamData`**

Replace the existing `getTeamData` function (currently lines 3748–3750):

```js
export function getTeamData(name) {
  if (!name) return null
  const data = TEAMS[name] || TEAMS[normalizeLookupName(name)] || null
  if (!data) return null
  const blobLogo = logoManifest[name] ?? logoManifest[normalizeLookupName(name)]
  return blobLogo ? { ...data, logo: blobLogo } : data
}
```

This spreads `data` into a new object so the original TEAMS entry is never mutated, and only overrides `logo` when a blob URL exists. Everything else (`color`, `shortName`, `displayName`, `aliases`) carries through unchanged.

- [ ] **Step 3: Start the dev server and verify**

```powershell
cd C:\Users\brady\Repos\stadar\client
npm run dev
```

Open `http://localhost:5173`, navigate to the Discover page. Open browser DevTools → Network tab, filter by `stadarstorage`. Team logos should now load from your blob storage URLs instead of ESPN CDN. Check a few cards — Utah Jazz, Real Salt Lake, Utah Royals FC.

- [ ] **Step 4: Commit**

```powershell
cd C:\Users\brady\Repos\stadar
git add client/src/data/teams.js
git commit -m "Wire logoManifest into getTeamData — serve logos from blob storage"
```

---

## Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add logo workflow section to CLAUDE.md**

Add the following section after the "To Redeploy API to Azure" block:

```markdown
### To Sync Team Logos

Logos are served from Azure Blob Storage (`stadarstorage` → `logos` container).
Source images live in `scripts/logos/` (committed to git).

**Seed new logos from CDN sources (skips existing files):**
```powershell
cd C:\Users\brady\Repos\stadar\scripts
node seed-logos.mjs
```

**Upload logos to blob storage (skips existing blobs):**
```powershell
cd C:\Users\brady\Repos\stadar\scripts
node upload-logos.mjs
```

**Force re-upload everything:**
```powershell
node upload-logos.mjs --force
```

**To fix a broken or updated logo:**
1. Drop the correct PNG into `scripts/logos/{slug}.png`
   (slug = team name lowercased, spaces→hyphens, special chars removed)
2. Run `node upload-logos.mjs --force`
3. Commit the updated file and the regenerated `client/src/data/logoManifest.json`

Requires `scripts/.env` with `AZURE_STORAGE_CONNECTION_STRING` (see `scripts/.env.example`).
```

- [ ] **Step 2: Update the What's Working table**

Add this row to the "What's Working" table in CLAUDE.md:

```markdown
| Logo blob storage | ✅ Done | Azure Blob `stadarstorage/logos`; manifest at `client/src/data/logoManifest.json` |
```

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\brady\Repos\stadar
git add CLAUDE.md
git commit -m "Document logo blob storage workflow in CLAUDE.md"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Azure storage account + public container + CORS — Task 1
- ✅ `scripts/package.json` with `@azure/storage-blob` + `dotenv` — Task 2
- ✅ `scripts/.env` + `.env.example` — Task 2
- ✅ `scripts/logos/` committed to git — Task 2 + Task 3
- ✅ `seed-logos.mjs` — skips existing, logs failures — Task 3
- ✅ `upload-logos.mjs` — skips existing blobs, `--force` flag, writes manifest — Task 4
- ✅ `logoManifest.json` empty initially, populated by upload script — Task 4
- ✅ `getTeamData` checks manifest first, falls back to CDN — Task 5
- ✅ `.gitignore` updated — Task 2
- ✅ CLAUDE.md updated — Task 6

**Placeholder scan:** No TBDs or incomplete steps found.

**Type consistency:** `toSlug()` is defined identically in both scripts. `logoManifest` keys match the same `name` strings used as TEAMS map keys. `blobLogo` fallback uses the same `normalizeLookupName` already in scope.
