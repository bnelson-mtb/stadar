# Logo Blob Storage — Design Spec
_2026-06-17_

## Goal

Move team logo serving from unreliable third-party CDNs (ESPN, NWSL, etc.) to a stable Azure Blob Storage container that Brady controls. The web app and future React Native app both consume plain HTTPS blob URLs — identical call, no platform-specific logic.

---

## Architecture

```
scripts/logos/          ← curated source images (committed to git, never bundled)
      ↓  upload-logos.mjs
Azure Blob Storage      ← public-read HTTPS URLs (runtime source for all clients)
      ↓  logoManifest.json
client/src/data/        ← manifest imported by getTeamData()
      ↓
Web app / RN app        ← <img src> or <Image source> pointing at blob URLs
```

The CDN URLs in `teams.js` remain as seed sources only. Once a logo lives in `scripts/logos/`, the CDN URL is irrelevant.

---

## Azure Resources

| Resource | Value |
|---|---|
| Resource group | `stadar-rg` (existing) |
| Storage account | `stadarstorage` |
| Container | `logos` |
| Access level | Public read (anonymous blob read, no listing) |
| CORS | Allow `*` origins, GET method |
| Region | East US (same as existing resources) |

Connection string stored in `scripts/.env` (gitignored). Read at script runtime via `dotenv`.

---

## Slug Convention

Team name → filename: lowercase, spaces to hyphens, non-alphanumeric chars stripped (except hyphens), extension preserved from downloaded file.

Examples:
- `"Utah Jazz"` → `utah-jazz.png`
- `"NJ/NY Gotham FC"` → `njny-gotham-fc.png`
- `"CF Montréal"` → `cf-montreal.png`
- `"Portland Thorns FC"` → `portland-thorns-fc.png`

Slugs are derived from the canonical key in the `TEAMS` map (same string `getTeamData` receives). This ensures manifest lookup and file naming are always in sync.

---

## Scripts

### `scripts/seed-logos.mjs`

**Purpose:** Bulk-download logos from CDN URLs in `teams.js` into `scripts/logos/`. One-time seed, re-run to fill gaps.

**Behavior:**
- Imports the `TEAMS` map from `../client/src/data/teams.js` via dynamic `import()`
- For each team entry with a `logo` URL, derives the slug and checks if `scripts/logos/{slug}.{ext}` already exists
- Skips existing files (never overwrites — manual curation is the override mechanism)
- Downloads missing logos with a 5-second timeout per request
- Logs a summary: `✓ downloaded`, `⟳ skipped (exists)`, `✗ failed (url)`
- No Azure credentials needed

**Run:** `node scripts/seed-logos.mjs`

---

### `scripts/upload-logos.mjs`

**Purpose:** Upload `scripts/logos/` contents to Azure Blob Storage and write the manifest.

**Behavior:**
- Reads `scripts/.env` for `AZURE_STORAGE_CONNECTION_STRING`
- Reads all files in `scripts/logos/`
- For each file, checks if the blob already exists in the `logos` container (via `getProperties`)
- Skips existing blobs unless `--force` flag is passed
- Sets correct `Content-Type` header per file extension (`image/png`, `image/svg+xml`, `image/webp`)
- After uploading, writes `client/src/data/logoManifest.json`: an object mapping every team name in `TEAMS` to its blob URL (only for teams whose slug file exists in `scripts/logos/`)
- Logs `✓ uploaded`, `⟳ skipped (exists)`, `✗ failed`

**Run:** `node scripts/upload-logos.mjs` (skip existing)  
**Force re-upload:** `node scripts/upload-logos.mjs --force`

**Dependencies:** `@azure/storage-blob`, `dotenv` (added to root-level `package.json`)

---

## Manifest

`client/src/data/logoManifest.json` — generated, committed to git.

```json
{
  "Utah Jazz": "https://stadarstorage.blob.core.windows.net/logos/utah-jazz.png",
  "Portland Thorns FC": "https://stadarstorage.blob.core.windows.net/logos/portland-thorns-fc.png"
}
```

Only teams whose file exists in `scripts/logos/` appear in the manifest. Teams missing from the manifest fall back to their CDN `logo` field in `teams.js`.

---

## `getTeamData` Update

```js
import logoManifest from './logoManifest.json' assert { type: 'json' }

export function getTeamData(name) {
  if (!name) return null
  const data = TEAMS[name] || TEAMS[normalizeLookupName(name)] || null
  if (!data) return null
  const blobLogo = logoManifest[name] || logoManifest[normalizeLookupName(name)]
  return blobLogo ? { ...data, logo: blobLogo } : data
}
```

CDN URL in `teams.js` remains as fallback. No other code changes needed — `TeamLogo.jsx` already reads `team.logo`.

---

## File Checklist

**New files:**
- `scripts/seed-logos.mjs`
- `scripts/upload-logos.mjs`
- `scripts/.env` (gitignored)
- `scripts/.env.example` (committed, shows required vars)
- `scripts/logos/` (committed, populated after seed)
- `scripts/package.json` (for `@azure/storage-blob` + `dotenv`)
- `client/src/data/logoManifest.json` (generated, committed)

**Modified files:**
- `client/src/data/teams.js` — `getTeamData` checks manifest
- `.gitignore` — add `scripts/.env`
- `CLAUDE.md` — document the workflow

---

## Workflow

### Initial setup (one-time)
1. Create Azure storage account + container (az CLI or portal)
2. Add connection string to `scripts/.env`
3. `node scripts/seed-logos.mjs` — bulk download from CDNs, note failures
4. Manually drop replacement PNGs into `scripts/logos/` for failed ones
5. `node scripts/upload-logos.mjs` — upload all, generate manifest
6. Commit `scripts/logos/`, `client/src/data/logoManifest.json`

### Updating a single logo
1. Drop new PNG into `scripts/logos/{slug}.png`
2. `node scripts/upload-logos.mjs --force` (or delete the blob first, then run without --force)
3. Commit the updated file and regenerated manifest

---

## What's Out of Scope

- Converting SVGs to PNGs (download as-is; RN SVG support addressed at RN conversion time)
- Automatic CDN polling / scheduled re-sync
- Logo upload UI
