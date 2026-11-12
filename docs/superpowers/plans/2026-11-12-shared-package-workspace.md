# Shared Package and npm Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the web client's pure data, logic, copy and hooks into `packages/shared` (`@stadar/shared`) under an npm workspace, with the deployed web app behaving exactly as it does today.

**Architecture:** The repo root becomes an npm workspace (`client`, `packages/*`) with one root lockfile. `@stadar/shared` is plain ESM JavaScript with no build step; the web client imports it by subpath (`@stadar/shared/utils/api.js`). The folder layout inside the package mirrors `client/src`, so relative imports between moved files keep working untouched. Two small code changes ride along: `api.js` drops its Vite-only env read in favour of `setApiBase()`, and the `.ics` builder is extracted so the future mobile app can reuse it.

**Tech Stack:** npm workspaces (npm 11, Node 22 in CI/Docker, Node 24 locally), Vite 7, Tailwind CSS 4, `node:test`, ESLint 9, Docker, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-11-mobile-app-mvp-design.md` (Part A). The Expo app (Part B) gets its own plan after this lands.

## Ground rules for whoever executes this

- Work on the existing branch `feat/mobile-app`. Do **not** merge to `main` or push; pushing `main` deploys production. Task 10 stops and asks Brady.
- The git remote is named `stadar`, not `origin`.
- Brady's hook shows the `description` of every `git add` / `git commit` / `git push` tool call to him: write it as a short natural-language reason.
- End every commit message with `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.
- `CLAUDE.md` is gitignored on purpose. Edit it in Task 9 but never try to commit it.
- Never create `client/.env.production`.
- This is a **move**, not a refactor. Do not tidy, rename or "improve" moved code beyond what a step says. In particular, leave the 5 `no-dupe-keys` lint errors in `teams.js` alone.
- Commands are written for the Bash tool (Git Bash), run from the repo root `C:\Users\brady\Repos\stadar` unless a step says otherwise.

## Baseline (measured 2026-11-12 on `main` @ 53c1713)

| Check | Result today |
|---|---|
| `cd client && npm test` | 132 tests, 132 pass, 0 fail |
| `cd client && npx eslint .` | 7 errors: 2 parse errors in `client/scripts/*-output.js`, 5 `no-dupe-keys` in `src/data/teams.js` |
| `cd client && npm run build` | succeeds |

Every later "matches baseline" check refers to this table.

## File structure after this plan

```text
package.json                       NEW  workspace root
package-lock.json                  NEW  single lockfile (client/package-lock.json deleted)
packages/shared/
  package.json                     NEW  @stadar/shared
  eslint.config.js                 NEW
  data/      teams.js leagueInfo.js logoManifest.json usStates.js venues/   (moved from client/src/data)
  utils/     api.js storageAdapter.js reconcile.js accountLink.js feedFilters.js
             eventDisplay.js countdown.js savedHelpers.js savedEventRecords.js
             eventDetailState.js maps.js ticketLinks.js + their *.test.js    (moved from client/src/utils)
             api.test.js  ics.js  ics.test.js                               NEW
  copy/      profileCopy.js importPromptCopy.js authButtonCopy.js + tests   (moved from client/src/components)
  context/   AuthContextDef.js AccountLinkContextDef.js                     (moved from client/src/context)
  hooks/     useAuth.js useAccountLink.js useFavorites.js useSavedEvents.js
             useGames.js useCountdown.js                                    (moved from client/src/hooks)
client/src/
  apiBase.js                       NEW  sets the API base from Vite env
  utils/authApi.js (+ test)        STAYS (uses window.location)
  context/AuthContext.jsx, AccountLinkContext.jsx   STAY
  components/, pages/, main.jsx, App.jsx, index.css STAY (imports rewritten)
```

---

### Task 1: Create the workspace root and an empty shared package

**Files:**
- Create: `package.json`
- Create: `packages/shared/package.json`
- Modify: `client/package.json` (add one dependency)
- Delete: `client/package-lock.json`
- Create: `package-lock.json` (generated)

- [ ] **Step 1: Confirm the baseline before touching anything**

```bash
cd client && npm test 2>&1 | tail -8 && cd ..
```

Expected: `ℹ tests 132`, `ℹ pass 132`, `ℹ fail 0`. If not, stop and report; the baseline table is stale.

- [ ] **Step 2: Create the root `package.json`**

```json
{
  "name": "stadar",
  "private": true,
  "workspaces": [
    "client",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev -w client",
    "build": "npm run build -w client",
    "test": "npm test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

`scripts/` (the logo tooling) is deliberately **not** a workspace; it keeps its own `package.json` and `node_modules`.

- [ ] **Step 3: Create `packages/shared/package.json`**

```json
{
  "name": "@stadar/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./*": "./*"
  },
  "peerDependencies": {
    "react": "^19.2.0"
  }
}
```

The `exports` map means consumers must import full file paths with extensions, e.g. `@stadar/shared/data/teams.js`. There is no `test` script yet on purpose: the package has no test files until Task 2, and a test glob that matches nothing would make the root `npm test` fail.

- [ ] **Step 4: Add the dependency to `client/package.json`**

In `"dependencies"`, add this line before `"@tailwindcss/vite"`:

```json
    "@stadar/shared": "*",
```

- [ ] **Step 5: Un-ignore the workspace folder**

`.gitignore` carries the Visual Studio NuGet rule `**/[Pp]ackages/*`, which silently ignores `packages/shared`. Directly after the line `!**/[Pp]ackages/build/`, add:

```text
# The repo-root packages/ folder is the npm workspace (packages/shared), not NuGet.
!/packages/*
```

Check: `git check-ignore -v packages/shared/package.json; echo "exit=$?"` prints `exit=1`.

- [ ] **Step 5b: Replace the client lockfile with a root lockfile, keeping every version**

A plain `npm install` would re-resolve inside the semver ranges and move about 144 packages (React 19.2.4 → 19.3.1, React Router 7.13 → 7.18, Tailwind 4.2 → 4.3). Seed the root lockfile from the old one instead:

```bash
git show HEAD:client/package-lock.json > package-lock.json
git rm -q client/package-lock.json
rm -rf client/node_modules
npm install
```

Expected: `npm install` finishes without errors; `node_modules/@stadar/shared` is a link to `packages/shared` (`ls node_modules/@stadar/shared/package.json` prints the path).

Confirm no version moved:

```bash
node -e "
const {execSync}=require('child_process');
const old=JSON.parse(execSync('git show HEAD:client/package-lock.json',{maxBuffer:1e8})).packages, cur=require('./package-lock.json').packages;
let same=0,diff=[],added=[];
for(const [k,v] of Object.entries(cur)){ if(!k.startsWith('node_modules/'))continue; const o=old[k]; if(!o){added.push(k);continue} if(o.version===v.version)same++; else diff.push(k+' '+o.version+' -> '+v.version)}
console.log('same',same,'changed',diff.length,'new',added.length); console.log(diff.join('\n')); console.log(added.join('\n'))
"
```

Expected: `changed 0`; the only new entries are the workspace links `node_modules/@stadar/shared` and `node_modules/client`.

- [ ] **Step 6: Verify nothing changed for the web app**

```bash
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run build 2>&1 | tail -4
```

Expected: one block of counts (only the client has a `test` script so far) with `pass 132`, `fail 0`; build ends with `✓ built in …`.

- [ ] **Step 7: Commit**

```bash
git add .gitignore package.json package-lock.json packages/shared/package.json client/package.json
git commit -m "build: npm workspace root with empty @stadar/shared package

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 2: Move the shared files and repoint the client's imports

**Files:**
- Move: see the `git mv` commands in Step 1
- Create then delete: `client/rewrite-imports.mjs` (one-off codemod)
- Modify: every file under `client/src` that imports a moved file (done by the codemod)
- Modify: `client/src/index.css`

- [ ] **Step 1: Move the files with history**

```bash
mkdir -p packages/shared/copy packages/shared/context
git mv client/src/data packages/shared/data
git mv client/src/hooks packages/shared/hooks
git mv client/src/utils packages/shared/utils
mkdir -p client/src/utils
git mv packages/shared/utils/authApi.js packages/shared/utils/authApi.test.js client/src/utils/
git mv client/src/context/AuthContextDef.js client/src/context/AccountLinkContextDef.js packages/shared/context/
git mv client/src/components/profileCopy.js client/src/components/profileCopy.test.js \
       client/src/components/importPromptCopy.js client/src/components/importPromptCopy.test.js \
       client/src/components/authButtonCopy.js packages/shared/copy/
git mv client/src/components/AuthButton.test.js packages/shared/copy/authButtonCopy.test.js
```

Why this works without editing the moved files: `data/`, `utils/`, `hooks/` and `context/` keep the same positions relative to each other, so imports like `../data/teams.js` inside `utils/eventDisplay.js` and `../context/AuthContextDef.js` inside `hooks/useAuth.js` still resolve. The copy tests import `./xCopy.js` from their own folder.

- [ ] **Step 2: Add the test script and run the moved tests in their new home**

In `packages/shared/package.json`, add a `scripts` block between `exports` and `peerDependencies`:

```json
  "scripts": {
    "test": "node --test \"data/**/*.test.js\" \"utils/**/*.test.js\" \"copy/**/*.test.js\""
  },
```

Then:

```bash
npm test -w @stadar/shared 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

Expected: `fail 0` and a `pass` count above 100 (every moved test file; only `authApi.test.js` and `GameNotesSection.test.js` stayed in the client).

- [ ] **Step 3: Write the one-off codemod `client/rewrite-imports.mjs`**

```js
// One-off codemod for the shared-package move. Run once from the repo root:
//   node client/rewrite-imports.mjs
// then delete this file. It rewrites relative imports in client/src that
// point at files which now live in packages/shared.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(dirname(fileURLToPath(import.meta.url)), 'src')

// srcRelative: where the import used to point, relative to client/src, with
// forward slashes. Returns the @stadar/shared specifier, or null if the
// target did not move.
function sharedTarget(srcRelative) {
  const ext = srcRelative.endsWith('.json') ? '.json' : '.js'
  const p = srcRelative.replace(/\.(js|json)$/, '')
  if (p.startsWith('data/') || p.startsWith('hooks/')) return `@stadar/shared/${p}${ext}`
  if (p.startsWith('utils/') && p !== 'utils/authApi') return `@stadar/shared/${p}${ext}`
  if (/^context\/(AuthContextDef|AccountLinkContextDef)$/.test(p)) return `@stadar/shared/${p}${ext}`
  const copy = p.match(/^components\/(profileCopy|authButtonCopy|importPromptCopy)$/)
  if (copy) return `@stadar/shared/copy/${copy[1]}${ext}`
  return null
}

const IMPORT = /((?:from|import)\s*\(?\s*)(['"])(\.{1,2}\/[^'"]+)\2/g
let changed = 0

for (const entry of readdirSync(SRC, { recursive: true })) {
  if (!/\.(js|jsx)$/.test(entry)) continue
  const file = join(SRC, entry)
  const before = readFileSync(file, 'utf8')
  const after = before.replace(IMPORT, (match, prefix, quote, spec) => {
    const srcRelative = relative(SRC, resolve(dirname(file), spec)).replaceAll('\\', '/')
    const target = sharedTarget(srcRelative)
    if (!target) return match
    changed++
    console.log(`${entry}: ${spec} -> ${target}`)
    return `${prefix}${quote}${target}${quote}`
  })
  if (after !== before) writeFileSync(file, after)
}

console.log(`\n${changed} imports rewritten`)
```

It also adds the `.js` extension to the extensionless imports (`'../data/teams'`, `'../data/leagueInfo'`), which the package `exports` map requires, and it handles the dynamic `import('../data/venues/index.js')` in `EventDetailPage.jsx`.

- [ ] **Step 4: Run it, then delete it**

```bash
node client/rewrite-imports.mjs
rm client/rewrite-imports.mjs
```

Expected: one line per rewritten import and a final count (several dozen; every component, page and provider that used shared code). Spot-check three lines in the output:

```text
pages\EventDetailPage.jsx: ../data/teams -> @stadar/shared/data/teams.js
pages\ProfilePage.jsx: ../components/profileCopy.js -> @stadar/shared/copy/profileCopy.js
utils\authApi.js: ./api.js -> @stadar/shared/utils/api.js
```

- [ ] **Step 5: Confirm no client import still points at a moved file**

```bash
grep -rnE "'\.{1,2}/(data|hooks)/|'\.\./utils/|'\./api\.js'|Copy\.js'|ContextDef\.js'" client/src | grep -v "@stadar/shared" | grep -v "utils/authApi"
```

Expected: no output (`authApi.js` stayed in the client, so imports of it are legitimate).

- [ ] **Step 6: Tell Tailwind to scan the shared package**

`teams.js` holds Tailwind class names as strings (`'bg-rose-600'`, `'bg-emerald-700'`, …). Tailwind 4 only scans the project it is built from, so once `teams.js` leaves `client/`, those classes would silently drop out of the CSS. In `client/src/index.css`, change the first line from:

```css
@import "tailwindcss";
```

to:

```css
@import "tailwindcss";
/* teams.js and other shared files contain Tailwind class names as strings. */
@source "../../packages/shared";
```

- [ ] **Step 7: Verify tests, build and the league colour classes**

```bash
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run build 2>&1 | tail -4
grep -c "bg-rose-600" client/dist/assets/*.css
grep -c "bg-emerald-700" client/dist/assets/*.css
```

Expected:
- Two blocks of counts (client, shared). Both `fail 0`; the two `pass` numbers add up to **132**.
- Build ends with `✓ built in …`.
- Both `grep -c` print `1` or more. `0` means Step 6 is wrong.

- [ ] **Step 8: Commit**

```bash
git add -A client/src packages/shared
git commit -m "refactor: move data, logic, copy and hooks into @stadar/shared

Pure move: files keep their relative layout, so only the web client's
import specifiers change. Tailwind now scans packages/shared for the
class names stored in teams.js.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

Before committing, run `git status --short` and confirm the list contains only renames (`R`), modified files under `client/src`, and nothing from `docs/design_handoff_stadar_overhaul/` (untracked, not ours).

---

### Task 3: Make `api.js` independent of Vite

`api.js` reads `import.meta.env`, which only Vite provides. The shared version exposes a setter; each app sets the base URL once at startup. `API_BASE` stays an exported binding, so every existing `${API_BASE}` call site is untouched (ES module exports are live: importers see the new value). All current uses are inside function bodies — `useGames.js:18`, `storageAdapter.js:68,82`, `authApi.js:7,17,25`, `TicketSheet.jsx:38`, `EventDetailPage.jsx:456,475` — so setting it during startup is early enough.

**Files:**
- Create: `packages/shared/utils/api.test.js`
- Modify: `packages/shared/utils/api.js:1-9`
- Create: `client/src/apiBase.js`
- Modify: `client/src/main.jsx:1`

- [ ] **Step 1: Write the failing test `packages/shared/utils/api.test.js`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as api from './api.js'

test('API_BASE defaults to same-origin', () => {
  assert.equal(api.API_BASE, '')
})

test('setApiBase updates the live API_BASE binding', () => {
  api.setApiBase('https://example.test')
  assert.equal(api.API_BASE, 'https://example.test')
  api.setApiBase('')
  assert.equal(api.API_BASE, '')
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node --test packages/shared/utils/api.test.js 2>&1 | grep -E "✔|✖|not a function"
```

Expected: the default test passes (Node has no `import.meta.env`, so the value is already `''`); the second fails with `api.setApiBase is not a function`.

- [ ] **Step 3: Replace lines 1–9 of `packages/shared/utils/api.js`**

Replace this block:

```js
// API base URL for backend requests.
// - Set VITE_API_URL to point at a separately hosted API.
// - In production builds it defaults to '' (same-origin), for the
//   single-container deployment where the API serves the built client.
// - In dev it defaults to the local API from launchSettings.json.
const env = import.meta.env ?? {}
export const API_BASE =
  env.VITE_API_URL ??
  (env.DEV ? 'http://localhost:5068' : '')
```

with:

```js
// API base URL for backend requests. '' means same-origin.
// Each app sets it once at startup with setApiBase(): the web client from
// Vite env (client/src/apiBase.js), the mobile app from EXPO_PUBLIC_API_URL.
// API_BASE is a live binding, so importers always read the current value —
// read it inside functions, never capture it at module load.
export let API_BASE = ''

export function setApiBase(url) {
  API_BASE = url
}
```

Leave the rest of the file (`RETRY_DELAYS_MS`, `fetchJsonWithRetry`) exactly as it is.

- [ ] **Step 4: Run the test and watch it pass**

```bash
node --test packages/shared/utils/api.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

Expected: `pass 2`, `fail 0`.

- [ ] **Step 5: Create `client/src/apiBase.js`**

```js
// Sets the API base URL for the web client. Imported first in main.jsx so it
// runs before anything can fetch.
// - VITE_API_URL points at a separately hosted API.
// - Production builds default to '' (same-origin): the API serves the built client.
// - Dev defaults to the local API from launchSettings.json.
// Never add client/.env.production — it once baked a dead API URL into every bundle.
import { setApiBase } from '@stadar/shared/utils/api.js'

const env = import.meta.env ?? {}
setApiBase(env.VITE_API_URL ?? (env.DEV ? 'http://localhost:5068' : ''))
```

- [ ] **Step 6: Import it first in `client/src/main.jsx`**

Add this as the new line 1, above `import { StrictMode } from 'react'`:

```js
import './apiBase.js'
```

- [ ] **Step 7: Verify the production build calls same-origin**

```bash
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run build 2>&1 | tail -2
```

Expected: both blocks `fail 0`, pass counts add up to **134** (132 + 2 new).

Then check what the built bundle really calls (CLAUDE.md: trust the bundle, not the source). Start the preview server with the Browser pane (`preview_start` needs a `.claude/launch.json` entry: name `client-preview`, `runtimeExecutable` `npm`, `runtimeArgs` `["run", "preview", "-w", "client"]`, port `4173`), open `http://localhost:4173/`, wait about five seconds, and read the network requests filtered by `/api/games`.

Expected: requests go to `http://localhost:4173/api/games?stateCode=…` (they fail, since no API is behind the preview server; that is fine). A request to `localhost:5068` or any other host means the production base is wrong: stop and fix. Stop the preview server afterwards.

- [ ] **Step 8: Verify dev mode still calls the local API**

Start the API (`cd Api && dotnet watch`, background) and the dev client (launch.json entry `client-dev`: `npm`, `["run", "dev", "-w", "client"]`, port `5173`). Open `http://localhost:5173/`.

Expected: the Discover feed loads games; the `/api/games` request goes to `http://localhost:5068`. Stop both servers afterwards.

- [ ] **Step 9: Commit**

```bash
git add packages/shared/utils/api.js packages/shared/utils/api.test.js client/src/apiBase.js client/src/main.jsx
git commit -m "refactor: set API base via setApiBase so shared api.js has no Vite dependency

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

If `.claude/launch.json` was created or changed, do not add it: `.claude/` is gitignored.

---

### Task 4: Extract the `.ics` builder into the shared package

`buildIcsContent` is a pure function living inside `EventDetailPage.jsx` (lines 43–85). The mobile app needs the same text, so it moves to `packages/shared/utils/ics.js` verbatim and gains tests. `downloadIcs` (browser-only) stays in the page.

**Files:**
- Create: `packages/shared/utils/ics.test.js`
- Create: `packages/shared/utils/ics.js`
- Modify: `client/src/pages/EventDetailPage.jsx:43-85` (delete the function, add an import)

- [ ] **Step 1: Write the failing test `packages/shared/utils/ics.test.js`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildIcsContent } from './ics.js'

const base = {
  id: 'evt1',
  name: 'Utah Jazz vs. Denver Nuggets',
  venue: 'Delta Center',
  city: 'Salt Lake City',
  state: 'UT',
  localDate: '2026-11-20',
}

test('timed event: starts at the venue-local time and runs two hours', () => {
  const lines = buildIcsContent({ ...base, localTime: '19:00:00' }).split('\r\n')
  assert.ok(lines.includes('DTSTART:20261120T190000'))
  assert.ok(lines.includes('DTEND:20261120T210000'))
  assert.ok(lines.includes('UID:evt1@stadar'))
  assert.ok(lines.includes('SUMMARY:Utah Jazz vs. Denver Nuggets'))
  assert.ok(lines.includes('LOCATION:Delta Center, Salt Lake City, UT'))
  assert.equal(lines[0], 'BEGIN:VCALENDAR')
  assert.equal(lines.at(-1), 'END:VCALENDAR')
})

test('timed event crossing midnight ends on the next day', () => {
  const lines = buildIcsContent({ ...base, localDate: '2026-11-30', localTime: '23:00:00' }).split('\r\n')
  assert.ok(lines.includes('DTSTART:20261130T230000'))
  assert.ok(lines.includes('DTEND:20261201T010000'))
})

test('date-only event is an all-day entry ending the next day', () => {
  const lines = buildIcsContent(base).split('\r\n')
  assert.ok(lines.includes('DTSTART;VALUE=DATE:20261120'))
  assert.ok(lines.includes('DTEND;VALUE=DATE:20261121'))
})

test('ticket URL is included only when present', () => {
  const withUrl = buildIcsContent({ ...base, ticketUrl: 'https://tickets.example/evt1' })
  assert.ok(withUrl.includes('URL:https://tickets.example/evt1'))
  assert.ok(!buildIcsContent(base).includes('URL:'))
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node --test packages/shared/utils/ics.test.js 2>&1 | grep -E "ERR_MODULE_NOT_FOUND|^ℹ (pass|fail)"
```

Expected: fails with `ERR_MODULE_NOT_FOUND` for `ics.js`.

- [ ] **Step 3: Create `packages/shared/utils/ics.js`**

Cut the whole `buildIcsContent` function out of `client/src/pages/EventDetailPage.jsx` (it starts at `function buildIcsContent(event) {` on line 43 and ends at the closing `}` on line 85, just above `function downloadIcs`). Paste it into the new file unchanged, with a header comment and `export` in front:

```js
// Builds the text of an .ics calendar file for an event, using the venue-local
// date and time the API provides. Timed events are given a two-hour duration;
// events with no start time become all-day entries.
export function buildIcsContent(event) {
  const dateStr = (event.localDate || '').replace(/-/g, '')
  if (event.localTime) {
    const timeStr = event.localTime.replace(/:/g, '').padEnd(6, '0').slice(0, 6)
    const [hh, mm, ss] = event.localTime.split(':').map(Number)
    const totalMinutes = hh * 60 + mm + 120 // add 2 hours
    const endH = Math.floor(totalMinutes / 60) % 24
    const endM = totalMinutes % 60
    const rollover = totalMinutes >= 1440 // crossed midnight
    let endDateStr = dateStr
    if (rollover) {
      const [y, mo, d] = (event.localDate || '').split('-').map(Number)
      const next = new Date(y, mo - 1, d + 1)
      endDateStr = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`
    }
    const endStr = `${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}${String(ss ?? 0).padStart(2, '0')}`
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stadar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@stadar`,
      `DTSTART:${dateStr}T${timeStr}`,
      `DTEND:${endDateStr}T${endStr}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${event.venue}, ${event.city}, ${event.state}`,
      ...(event.ticketUrl ? [`URL:${event.ticketUrl}`] : []),
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
  } else {
    const [y, mo, d] = (event.localDate || '').split('-').map(Number)
    const next = new Date(y, mo - 1, d + 1)
    const nextDateStr = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stadar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@stadar`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDateStr}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${event.venue}, ${event.city}, ${event.state}`,
      ...(event.ticketUrl ? [`URL:${event.ticketUrl}`] : []),
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
  }
}
```

If the function body in `EventDetailPage.jsx` differs from the block above in any character, the page is the source of truth: use the page's text.

- [ ] **Step 4: Import it in `EventDetailPage.jsx`**

With the function deleted from the page, add this import directly below the existing `import { getVenueMapUrls } from '@stadar/shared/utils/maps.js'` line:

```js
import { buildIcsContent } from '@stadar/shared/utils/ics.js'
```

`downloadIcs` keeps calling `buildIcsContent(event)` as before.

- [ ] **Step 5: Run the tests and the build**

```bash
node --test packages/shared/utils/ics.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run build 2>&1 | tail -2
```

Expected: `pass 4`, `fail 0`; the workspace totals add up to **138**, both `fail 0`; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/utils/ics.js packages/shared/utils/ics.test.js client/src/pages/EventDetailPage.jsx
git commit -m "refactor: extract buildIcsContent into @stadar/shared with tests

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 5: Lint the shared package

The moved files were covered by the client's ESLint config (including the React hooks rules for the four hooks). Give the package its own config so that coverage is not lost.

**Files:**
- Create: `packages/shared/eslint.config.js`
- Modify: `packages/shared/package.json`

- [ ] **Step 1: Add the lint script and dev dependencies to `packages/shared/package.json`**

The file becomes:

```json
{
  "name": "@stadar/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./*": "./*"
  },
  "scripts": {
    "test": "node --test",
    "lint": "eslint ."
  },
  "peerDependencies": {
    "react": "^19.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "globals": "^16.5.0"
  }
}
```

The versions match `client/package.json`, so npm keeps one hoisted copy of each.

The `test` script also changes here, from three explicit globs to a bare `node --test` (review finding on Task 2): with no arguments Node finds every `*.test.js` under the package and skips `node_modules`, so a test added later under `hooks/` or `context/` cannot be silently missed. After the edit, `npm test -w @stadar/shared 2>&1 | grep -E "^ℹ (tests|pass|fail)"` must report the same count as before the edit (133 at this point: 127 moved + 2 api + 4 ics), `fail 0`.

- [ ] **Step 2: Create `packages/shared/eslint.config.js`**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

// Shared code runs in the browser, in React Native and under node:test.
export default defineConfig([
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

- [ ] **Step 3: Install and lint both workspaces**

```bash
npm install
npm run lint -w @stadar/shared 2>&1 | tail -12
npm run lint -w client 2>&1 | tail -8
```

Expected (matches the baseline, just split across two packages):
- shared: `✖ 5 problems (5 errors, 0 warnings)`, all `no-dupe-keys` in `data/teams.js` (Arizona State, Kansas State, Oklahoma State, Weber State, Long Island).
- client: `✖ 2 problems (2 errors, 0 warnings)`, both `Parsing error` in `client/scripts/all-d1-output.js` and `client/scripts/fbs-output.js`.

Any other error is new. Fix it only if this plan caused it (for example an unused import left in `EventDetailPage.jsx`); otherwise stop and report.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/package.json packages/shared/eslint.config.js package-lock.json
git commit -m "build: lint @stadar/shared with the same rules as the client

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 6: Dockerfile builds from the workspace

**Files:**
- Modify: `Dockerfile:1-7` (stage 1) and the `COPY --from=client-build` line
- Modify: `.dockerignore`

- [ ] **Step 1: Replace stage 1 of the `Dockerfile`**

Replace:

```dockerfile
# Stage 1: build the React client
FROM node:22-alpine AS client-build
WORKDIR /src/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build
```

with:

```dockerfile
# Stage 1: build the React client (npm workspace: client + packages/shared)
FROM node:22-alpine AS client-build
WORKDIR /src
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY packages/shared/ packages/shared/
COPY client/ client/
RUN npm run build -w client
```

The later line `COPY --from=client-build /src/client/dist ./wwwroot` is already correct for the new layout; leave it.

- [ ] **Step 2: Keep the future mobile app out of the build context**

In `.dockerignore`, add this line after `scripts`:

```text
mobile
```

- [ ] **Step 3: Build the image locally**

```bash
docker build -t stadar:shared-test . 2>&1 | tail -6
```

Expected: ends with a line naming the image (`naming to docker.io/library/stadar:shared-test`), no errors. If `npm ci` fails with a lockfile mismatch, run `npm install` at the root, commit the lockfile, and rebuild.

- [ ] **Step 4: Smoke-test the container**

```bash
docker run --rm -d -p 8089:8080 --name stadar-smoke stadar:shared-test
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8089/healthz
curl -s http://localhost:8089/ | grep -c 'id="root"'
curl -s http://localhost:8089/ | grep -oE 'assets/index-[^"]+\.css'
docker stop stadar-smoke
```

Expected: `200`, then `1`, then one `assets/index-….css` path. (The container has no API keys, so `/api/games` will not return games; that is not what this checks.)

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "build: Docker client stage installs and builds from the npm workspace

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 7: CI installs at the root and ignores mobile-only pushes

**Files:**
- Modify: `.github/workflows/deploy.yml:3-6` and `:24-39`

- [ ] **Step 1: Add the path filter to the trigger**

Replace:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

with:

```yaml
on:
  push:
    branches: [main]
    # The mobile app is not part of the deployed container; a push that only
    # touches it must not rebuild and redeploy the site.
    paths-ignore:
      - 'mobile/**'
  workflow_dispatch:
```

- [ ] **Step 2: Replace the Node steps in the `test` job**

Replace everything from `- uses: actions/setup-node@v4` through the end of the `Run client tests` step:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: client/package-lock.json

      - name: Build client
        working-directory: client
        run: |
          npm ci
          npm run build

      - name: Run client tests
        working-directory: client
        run: npm test
```

with:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Install JS dependencies
        run: npm ci

      - name: Build client
        run: npm run build -w client

      - name: Run JS tests (client + shared)
        run: npm test
```

Leave the `deploy` job untouched.

- [ ] **Step 3: Rehearse the CI commands locally from a clean install**

```bash
rm -rf node_modules client/node_modules packages/shared/node_modules
npm ci
npm run build -w client 2>&1 | tail -2
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

Expected: `npm ci` succeeds (proves the lockfile is in sync), build succeeds, totals add up to **138** with `fail 0`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: install and test from the workspace root; skip deploy on mobile-only pushes

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 8: Point the logo and team scripts at the new paths

**Files:**
- Modify: `scripts/export-known-teams.mjs:1-11`
- Modify: `scripts/seed-logos.mjs:33`
- Modify: `scripts/upload-logos.mjs:11,86`

- [ ] **Step 1: `scripts/export-known-teams.mjs`**

In the header comment, change `client/src/data/teams.js` to `packages/shared/data/teams.js` (line 3). On line 11 change the import source:

```js
} from '../client/src/data/teams.js'
```

to:

```js
} from '../packages/shared/data/teams.js'
```

- [ ] **Step 2: `scripts/seed-logos.mjs` line 33**

```js
  const { default: TEAMS } = await import('../client/src/data/teams.js')
```

becomes:

```js
  const { default: TEAMS } = await import('../packages/shared/data/teams.js')
```

- [ ] **Step 3: `scripts/upload-logos.mjs` lines 11 and 86**

```js
const MANIFEST_PATH = join(__dirname, '..', 'client', 'src', 'data', 'logoManifest.json')
```

becomes:

```js
const MANIFEST_PATH = join(__dirname, '..', 'packages', 'shared', 'data', 'logoManifest.json')
```

and:

```js
  const { default: TEAMS } = await import('../client/src/data/teams.js')
```

becomes:

```js
  const { default: TEAMS } = await import('../packages/shared/data/teams.js')
```

- [ ] **Step 4: Verify**

```bash
grep -rn "client/src\|'client', 'src'" scripts/*.mjs
cd scripts && node export-known-teams.mjs && cd ..
git status --short Api/Data/known-teams.json
node --check scripts/upload-logos.mjs && node --check scripts/seed-logos.mjs && echo syntax-ok
```

Expected: the `grep` prints nothing; the export runs without error; `git status` prints nothing (the regenerated `known-teams.json` is byte-identical, proving the script read the same team data from the new path); `syntax-ok`.

Do **not** run `upload-logos.mjs` or `seed-logos.mjs` for real: the first writes to Azure Blob Storage and the second downloads from third-party CDNs. The path check above is enough.

- [ ] **Step 5: Commit**

```bash
git add scripts/export-known-teams.mjs scripts/seed-logos.mjs scripts/upload-logos.mjs
git commit -m "chore: point logo and known-teams scripts at packages/shared

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 9: Update the docs

**Files:**
- Modify: `README.md:90-95`
- Modify: `CLAUDE.md` (gitignored: edit, do not commit)

- [ ] **Step 1: `README.md` run instructions**

Replace:

```bash
# Terminal 2 — client  (http://localhost:5173)
cd client
npm install
npm run dev
```

with:

```bash
# Terminal 2 — client  (http://localhost:5173)
# Run from the repo root: it is an npm workspace (client + packages/shared).
npm install
npm run dev
```

Then search the README for other stale paths and fix each to its new location:

```bash
grep -n "client/src/data\|client/src/utils\|client/src/hooks\|cd client" README.md
```

Expected after fixing: no output.

- [ ] **Step 2: `CLAUDE.md`**

Make these edits (the file is the repo-level source of truth for future sessions):

1. **To Run Locally:** Terminal 2 becomes `cd C:\Users\brady\Repos\stadar` then `npm run dev` (workspace root), with a note that `npm install` runs at the root.
2. **File Structure:** add the root `package.json` / `package-lock.json`, add a `packages/shared/` block listing `data/`, `utils/`, `copy/`, `context/`, `hooks/`, and trim `client/src/` to what remains (`pages/`, `components/`, `context/` providers, `utils/authApi.js`, `apiBase.js`).
3. **Logo Management:** every `client/src/data/teams.js` and `client/src/data/logoManifest.json` becomes `packages/shared/data/…`.
4. **Key Technical Notes:**
   - Tests line: `npm test` at the repo root runs client + shared (`node:test`); CI runs that plus the client build.
   - `API_BASE` line: lives in `packages/shared/utils/api.js`, set at startup by `client/src/apiBase.js` via `setApiBase()` (same-origin in production, `http://localhost:5068` in dev, `VITE_API_URL` override).
   - Storage adapter, `fetchJsonWithRetry`, reconcile helpers, `accountLink.js`, `profileCopy.js`: update each path to its `packages/shared/…` location.
   - Add: "**Shared package:** `packages/shared` (`@stadar/shared`) holds everything the web and future mobile app share. Plain ESM, no build step, imported by full subpath with extension. `client/src/index.css` has an `@source` line pointing at it because `teams.js` stores Tailwind class names as strings — do not remove it."
5. **To Deploy:** note that pushes touching only `mobile/**` do not trigger the workflow.

- [ ] **Step 3: Commit the README only**

```bash
git add README.md
git commit -m "docs: workspace run instructions and shared package paths

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
```

---

### Task 10: Final verification and hand-back

- [ ] **Step 1: Full check from a clean install**

```bash
rm -rf node_modules client/node_modules packages/shared/node_modules client/dist
npm ci
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run build 2>&1 | tail -2
npm run lint 2>&1 | grep -E "problems"
cd Api.Tests && dotnet test 2>&1 | tail -3 && cd ..
git status --short
```

Expected: totals add up to **138**, `fail 0`; build succeeds; lint prints `✖ 2 problems` (client) and `✖ 5 problems` (shared) and nothing else; the API tests pass (they were not touched, this is a guard); `git status` shows only `?? docs/design_handoff_stadar_overhaul/`.

- [ ] **Step 2: Click through the web app in dev mode**

Start the API and the dev client as in Task 3 Step 8. In the browser pane check, against production `https://stadar.app` side by side where useful:

1. Discover loads games; league chips show their colours (the `bg-…` classes from `teams.js`).
2. Follow a team, reload: it is still followed.
3. Open an event: map preview, ticket sheet, "add to calendar" downloads an `.ics`.
4. Save the event, open Saved and the team's saved page.
5. Profile opens "How my data is used".
6. No errors in the browser console.

Stop both servers afterwards.

- [ ] **Step 3: Stop and hand back to Brady**

Do not merge or push. Report:

- the commits on `feat/mobile-app` (`git log --oneline main..HEAD`),
- the test, lint and Docker results from this plan,
- that merging to `main` and pushing to the `stadar` remote will deploy production, and that the first deploy after this change is the real test of the new Dockerfile and workflow on the runner,
- how to roll back: `az containerapp update -n stadar -g stadar-rg --image ca759b5dd5aeacr.azurecr.io/stadar:53c1713…` (the full SHA of the current `main`, from `git rev-parse main`).

After Brady merges and the deploy finishes, the last check is the live site: load https://stadar.app, confirm the feed loads, and confirm the bundle calls same-origin (`/api/games` on `stadar.app`).
