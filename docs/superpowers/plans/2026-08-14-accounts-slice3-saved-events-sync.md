# Accounts Slice 3: Saved-Events Sync + Import Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync a signed-in user's saved events across devices via `/api/me/saved`, and replace slice 2's silent favorites auto-transfer with a single first-login **"Import / Start fresh" prompt** that governs *both* favorites and saved events.

**Architecture:** Two new authenticated endpoints (`GET`/`PUT /api/me/saved`) store each saved record's client shape verbatim as `SnapshotJson`, keyed by `(UserId, EventId)`. A new shared **AccountLink** context owns the one-time first-login reconciliation decision for the device: it reads local favorites + saved counts, decides a `mode` (`anonymous` / `wait` / `merge` / `adopt`) that every collection hook follows, and drives the import-prompt modal. `useFavorites` and `useSavedEvents` both become uniform: paint from cache, then when authenticated reconcile per `mode` (merge = union local+server then persist + clear local; adopt = take server + clear local), with optimistic mutations that roll back on a failed `persist`.

**Tech Stack:** .NET 10 minimal APIs + EF Core 10, MSTest + `WebApplicationFactory` with a SQLite-backed `AppDbContext` override, React 19 + Context, node:test for client logic.

**Spec:** `docs/superpowers/specs/2026-07-21-accounts-oauth-sync-design.md` (see the Slice-2 account-only revision note in "Client: Storage Adapter").

**Depends on:** Slice 1 (auth + DB skeleton) and Slice 2 (favorites sync) — both merged on `feat/db-auth`. This slice assumes `AppDbContext`, the `SavedEventRow` entity (schema already defined), `AccountsTestFactory` (with `SeedUser`), the Option-B `storageAdapter` (`createLocalStorageAdapter`/`createApiAdapter`), `AuthContext`/`useAuth` (exposing `storageAdapter`), `mergeFavorites`, and the `useFavorites` cache-first hook already exist.

---

## Key Design Decisions

**Account-only model (carried from Slice 2).** For signed-in users the account is the sole source of truth. The API adapter's `persist` PUTs the server and keeps **no** local copy; first-login reconciliation **clears** the local `stadar-favorites` / `stadar-saved-events` keys after moving data to the account (a transfer, not a copy). This supersedes the original spec's "Start fresh leaves the local cache untouched" wording — both `Import` and `Start fresh` clear local keys; the only difference is whether local data is unioned up first. Rationale: one source of truth, nothing user-specific lingering in `localStorage` while signed in. Sign-out returns the UI to the (now empty) anonymous set.

**One reconciliation gate for both collections.** Slice 2 did favorites reconciliation *inside* `useFavorites` (silent auto-transfer). Slice 3 lifts the decision into a shared `AccountLinkProvider` so a single prompt covers favorites + saved events, and the `stadar-linked-<userId>` flag has exactly one writer (the provider). Each hook becomes a pure follower of the provider's `mode`.

**`mode` values (what every collection hook follows):**
- `anonymous` — not signed in → show the local cache; mutations persist to localStorage.
- `wait` — signed in, not yet linked, local data exists → the modal is up; hold the current cache, do not hydrate or persist-up yet (the modal gates the UI, so no mutations happen here).
- `merge` — user chose **Import** → union local + server, `persist` the merged set, then clear the local key.
- `adopt` — already linked, OR no local data, OR user chose **Start fresh** → take the server set as-is, clear the local key.

**Saved-events reconciliation** unions by `event.id`, keeping the **local** record on collision (a brand-new account's server set is empty or older; import intent is to bring local in). Local order first, remote-only records appended.

**Whole-set `PUT`** for saved events mirrors favorites: last-write-wins, no per-item diffing. The server stores `SnapshotJson` verbatim and never reads inside it.

---

## File Structure

**Server — modify:**
- `Api/Auth/AccountsStartup.cs` — add `GET`/`PUT /api/me/saved` to `MapAccountEndpoints`

**Server — create (tests):**
- `Api.Tests/SavedEventsEndpointsTests.cs` — 401, verbatim round-trip, whole-set replace, per-user isolation

**Client — create:**
- `client/src/utils/accountLink.js` — `decideInitialLinkMode` pure helper
- `client/src/utils/accountLink.test.js`
- `client/src/context/AccountLinkContextDef.js` — `createContext`
- `client/src/context/AccountLinkContext.jsx` — `AccountLinkProvider`
- `client/src/hooks/useAccountLink.js`
- `client/src/components/ImportPrompt.jsx` — the modal
- `client/src/components/importPromptCopy.js` — pure copy helper
- `client/src/components/importPromptCopy.test.js`

**Client — modify:**
- `client/src/utils/reconcile.js` — add `mergeSavedRecords`
- `client/src/utils/reconcile.test.js` — add `mergeSavedRecords` tests
- `client/src/utils/storageAdapter.js` — register `stadar-saved-events` → `/api/me/saved`
- `client/src/utils/storageAdapter.test.js` — assert the saved endpoint is used
- `client/src/hooks/useFavorites.js` — follow the shared `mode`
- `client/src/hooks/useSavedEvents.js` — cache-first account sync via adapter + `mode`
- `client/src/main.jsx` — wrap `<App/>` with `<AccountLinkProvider>`
- `client/src/App.jsx` — mount `<ImportPrompt/>` in `AppLayout`

**Docs — modify:**
- `CLAUDE.md` — document the two saved-events endpoints + the slice-3 prompt (untracked; apply locally)

---

## Task 1: Server `/api/me/saved` endpoints

**Files:**
- Modify: `Api/Auth/AccountsStartup.cs`
- Test: `Api.Tests/SavedEventsEndpointsTests.cs`

- [ ] **Step 1: Write the failing tests**

Create `Api.Tests/SavedEventsEndpointsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

[TestClass]
public class SavedEventsEndpointsTests
{
    private static HttpClient ClientFor(AccountsTestFactory factory, string? userId)
    {
        if (userId is not null) factory.SeedUser(userId);
        var client = factory.CreateClient();
        if (userId is not null) client.DefaultRequestHeaders.Add("Test-User", userId);
        return client;
    }

    // Mirrors the client saved-record shape: { event:{id,...}, savedAt, notes, score }.
    private static object Record(string id, string notes = "", string home = "", string away = "") => new
    {
        @event = new { id, name = $"Event {id}", homeTeam = "Utah Jazz", awayTeam = "Denver Nuggets" },
        savedAt = "2026-08-14T00:00:00.000Z",
        notes,
        score = new { home, away },
    };

    [TestMethod]
    public async Task Saved_Anonymous_Returns401()
    {
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, null);

        using var response = await client.GetAsync("/api/me/saved");
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Saved_PutThenGet_PreservesSnapshotVerbatim()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        using var put = await client.PutAsJsonAsync("/api/me/saved",
            new[] { Record("evt1", notes: "great seats", home: "2", away: "1") });
        Assert.AreEqual(HttpStatusCode.OK, put.StatusCode);

        var records = await client.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(1, records!.Length);
        var rec = records[0];
        Assert.AreEqual("evt1", rec.GetProperty("event").GetProperty("id").GetString());
        Assert.AreEqual("great seats", rec.GetProperty("notes").GetString());
        Assert.AreEqual("2", rec.GetProperty("score").GetProperty("home").GetString());
        Assert.AreEqual("1", rec.GetProperty("score").GetProperty("away").GetString());
    }

    [TestMethod]
    public async Task Saved_Put_ReplacesWholeSet()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        await client.PutAsJsonAsync("/api/me/saved", new[] { Record("evt1"), Record("evt2") });
        await client.PutAsJsonAsync("/api/me/saved", new[] { Record("evt3") });

        var records = await client.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(1, records!.Length);
        Assert.AreEqual("evt3", records[0].GetProperty("event").GetProperty("id").GetString());
    }

    [TestMethod]
    public async Task Saved_AreIsolatedPerUser()
    {
        using var factory = new AccountsTestFactory();
        var userA = Guid.NewGuid().ToString();
        var userB = Guid.NewGuid().ToString();

        using (var a = ClientFor(factory, userA))
            await a.PutAsJsonAsync("/api/me/saved", new[] { Record("evt1") });

        using var b = ClientFor(factory, userB);
        var recordsB = await b.GetFromJsonAsync<JsonElement[]>("/api/me/saved");
        Assert.AreEqual(0, recordsB!.Length);
    }
}
```

- [ ] **Step 2: Run to verify they fail**

Run: `dotnet test Api.Tests/Api.Tests.csproj --filter SavedEventsEndpointsTests`
Expected: FAIL — `Saved_Anonymous_Returns401` may pass (route unmapped → 401/404), but the round-trip/replace/isolation tests fail because the endpoints don't exist yet (404 → JSON deserialize throws or length assert fails).

- [ ] **Step 3: Add the endpoints**

In `Api/Auth/AccountsStartup.cs`, add this using at the top (next to the existing usings):

```csharp
using System.Text.Json;
```

Then inside `MapAccountEndpoints`, after the `MapPut("/api/me/favorites", ...)` block and before the closing brace of the method, add:

```csharp
        // Current user's saved-event records. SnapshotJson is the client record
        // shape stored verbatim; the server never reads inside it. Auth required.
        app.MapGet("/api/me/saved", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var snapshots = await db.SavedEvents
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.UpdatedAt)
                .Select(s => s.SnapshotJson)
                .ToListAsync();
            var records = snapshots.Select(json => JsonSerializer.Deserialize<JsonElement>(json)).ToList();
            return Results.Ok(records);
        }).RequireAuthorization();

        // Whole-set replace. Each record is stored verbatim, keyed by event.id.
        app.MapPut("/api/me/saved", async (
            ClaimsPrincipal principal, AppDbContext db,
            [Microsoft.AspNetCore.Mvc.FromBody] List<JsonElement> records) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await db.SavedEvents.Where(s => s.UserId == userId).ToListAsync();
            db.SavedEvents.RemoveRange(existing);

            var now = DateTime.UtcNow;
            var seen = new HashSet<string>();
            var stored = new List<JsonElement>();
            foreach (var record in records)
            {
                if (record.ValueKind != JsonValueKind.Object
                    || !record.TryGetProperty("event", out var ev)
                    || !ev.TryGetProperty("id", out var idEl))
                    continue;
                var eventId = idEl.GetString();
                if (string.IsNullOrEmpty(eventId) || !seen.Add(eventId)) continue;

                db.SavedEvents.Add(new SavedEventRow
                {
                    UserId = userId,
                    EventId = eventId,
                    SnapshotJson = record.GetRawText(),
                    UpdatedAt = now,
                });
                stored.Add(record);
            }

            await db.SaveChangesAsync();
            return Results.Ok(stored);
        }).RequireAuthorization();
```

- [ ] **Step 4: Run to verify they pass**

Run: `dotnet test Api.Tests/Api.Tests.csproj --filter SavedEventsEndpointsTests`
Expected: 4 passed.

- [ ] **Step 5: Run the full API suite (no regressions)**

Run: `dotnet test Api.Tests/Api.Tests.csproj`
Expected: all PASS (prior suite + 4 new), same skipped count as before.

- [ ] **Step 6: Commit**

```bash
git add Api/Auth/AccountsStartup.cs Api.Tests/SavedEventsEndpointsTests.cs
git commit -m "feat: add GET/PUT /api/me/saved with verbatim per-user snapshots"
```

---

## Task 2: Client `mergeSavedRecords` reconciliation helper

**Files:**
- Modify: `client/src/utils/reconcile.js`, `client/src/utils/reconcile.test.js`

- [ ] **Step 1: Write the failing tests**

Add to `client/src/utils/reconcile.test.js` (keep the existing `mergeFavorites` tests; add the import and these tests):

```js
import { mergeSavedRecords } from './reconcile.js'

const rec = (id, notes = '') => ({ event: { id }, notes, savedAt: `t-${id}`, score: { home: '', away: '' } })

test('mergeSavedRecords unions by event.id, local order first', () => {
  const merged = mergeSavedRecords([rec('a'), rec('b')], [rec('b'), rec('c')])
  assert.deepEqual(merged.map(r => r.event.id), ['a', 'b', 'c'])
})

test('mergeSavedRecords keeps the local record on an id collision', () => {
  const merged = mergeSavedRecords([rec('b', 'local note')], [rec('b', 'server note')])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].notes, 'local note')
})

test('mergeSavedRecords handles empty sides', () => {
  assert.deepEqual(mergeSavedRecords([], [rec('a')]).map(r => r.event.id), ['a'])
  assert.deepEqual(mergeSavedRecords([rec('a')], []).map(r => r.event.id), ['a'])
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd client && node --test src/utils/reconcile.test.js`
Expected: FAIL — `mergeSavedRecords` is not exported.

- [ ] **Step 3: Implement `mergeSavedRecords`**

Add to `client/src/utils/reconcile.js` (below `mergeFavorites`):

```js
// Union of two saved-record lists by event.id, keeping the LOCAL record on a
// collision (import intent is to bring local data into a fresh account). Local
// order first, then remote-only records appended.
export function mergeSavedRecords(local, remote) {
  const localIds = new Set(local.map(r => r.event.id))
  return [...local, ...remote.filter(r => !localIds.has(r.event.id))]
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && node --test src/utils/reconcile.test.js`
Expected: all reconcile tests pass (existing + 3 new).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/reconcile.js client/src/utils/reconcile.test.js
git commit -m "feat: mergeSavedRecords union helper (local wins on id collision)"
```

---

## Task 3: Register the saved-events endpoint in the adapter

**Files:**
- Modify: `client/src/utils/storageAdapter.js`, `client/src/utils/storageAdapter.test.js`

- [ ] **Step 1: Add the failing test**

Add to `client/src/utils/storageAdapter.test.js` (keep existing tests; add):

```js
test('api adapter: saved-events fetchRemote hits /api/me/saved', async () => {
  let calledUrl = null
  const fake = async (url) => { calledUrl = url; return { ok: true, json: async () => [] } }
  const a = createApiAdapter(fake, fakeStorage())
  await a.fetchRemote('stadar-saved-events', [])
  assert.ok(calledUrl.endsWith('/api/me/saved'))
})

test('api adapter: saved-events persist PUTs /api/me/saved', async () => {
  let calledUrl = null
  let method = null
  const fake = async (url, opts) => { calledUrl = url; method = opts.method; return { ok: true } }
  const a = createApiAdapter(fake, fakeStorage())
  const res = await a.persist('stadar-saved-events', [{ event: { id: 'x' } }])
  assert.equal(method, 'PUT')
  assert.ok(calledUrl.endsWith('/api/me/saved'))
  assert.deepEqual(res, { ok: true })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd client && node --test src/utils/storageAdapter.test.js`
Expected: FAIL — `stadar-saved-events` is not in `ENDPOINTS`, so `fetchRemote` returns `null` without calling `fake` (`calledUrl` stays `null` → `.endsWith` throws / assertion fails).

- [ ] **Step 3: Register the endpoint**

In `client/src/utils/storageAdapter.js`, extend the `ENDPOINTS` map:

```js
// Maps a storage key to its server endpoint.
const ENDPOINTS = {
  'stadar-favorites': '/api/me/favorites',
  'stadar-saved-events': '/api/me/saved',
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && node --test src/utils/storageAdapter.test.js`
Expected: all adapter tests pass (existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/storageAdapter.js client/src/utils/storageAdapter.test.js
git commit -m "feat: route stadar-saved-events through /api/me/saved in the API adapter"
```

---

## Task 4: AccountLink context — the shared reconciliation gate

**Files:**
- Create: `client/src/utils/accountLink.js`, `client/src/utils/accountLink.test.js`
- Create: `client/src/context/AccountLinkContextDef.js`, `client/src/context/AccountLinkContext.jsx`, `client/src/hooks/useAccountLink.js`
- Modify: `client/src/main.jsx`

- [ ] **Step 1: Write the failing test for the pure decision helper**

Create `client/src/utils/accountLink.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decideInitialLinkMode } from './accountLink.js'

test('anonymous → mode anonymous, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: false, alreadyLinked: false, favoritesCount: 3, savedCount: 2 }),
    { mode: 'anonymous', prompt: false, markLinked: false },
  )
})

test('already linked → adopt, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: true, favoritesCount: 3, savedCount: 2 }),
    { mode: 'adopt', prompt: false, markLinked: false },
  )
})

test('signed in, not linked, no local data → adopt and mark linked, no prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: false, favoritesCount: 0, savedCount: 0 }),
    { mode: 'adopt', prompt: false, markLinked: true },
  )
})

test('signed in, not linked, has local data → wait and prompt', () => {
  assert.deepEqual(
    decideInitialLinkMode({ authenticated: true, alreadyLinked: false, favoritesCount: 1, savedCount: 0 }),
    { mode: 'wait', prompt: true, markLinked: false },
  )
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd client && node --test src/utils/accountLink.test.js`
Expected: FAIL — cannot find module `./accountLink.js`.

- [ ] **Step 3: Implement the decision helper**

Create `client/src/utils/accountLink.js`:

```js
// Pure decision for the first-login reconciliation gate. Every collection hook
// follows the returned `mode`:
//   anonymous — not signed in; show/persist the local cache.
//   wait      — signed in, not linked, local data exists; the import prompt is
//               up. Hold the current cache; do not hydrate or persist-up.
//   merge     — user chose Import; union local+server, persist, clear local.
//   adopt     — already linked / no local data / user chose Start fresh; take
//               the server set as-is and clear local.
// `prompt` = show the modal. `markLinked` = set the linked flag immediately
// (no user choice needed because there is nothing to import).
export function decideInitialLinkMode({ authenticated, alreadyLinked, favoritesCount, savedCount }) {
  if (!authenticated) return { mode: 'anonymous', prompt: false, markLinked: false }
  if (alreadyLinked) return { mode: 'adopt', prompt: false, markLinked: false }
  if (favoritesCount === 0 && savedCount === 0) return { mode: 'adopt', prompt: false, markLinked: true }
  return { mode: 'wait', prompt: true, markLinked: false }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && node --test src/utils/accountLink.test.js`
Expected: 4 passed.

- [ ] **Step 5: Create the context definition**

Create `client/src/context/AccountLinkContextDef.js`:

```js
import { createContext } from 'react'

export const AccountLinkContext = createContext(null)
```

- [ ] **Step 6: Create the provider**

Create `client/src/context/AccountLinkContext.jsx`:

```jsx
import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import { decideInitialLinkMode } from '../utils/accountLink.js'
import { AccountLinkContext } from './AccountLinkContextDef.js'

const FAVORITES_KEY = 'stadar-favorites'
const SAVED_KEY = 'stadar-saved-events'

export function AccountLinkProvider({ children }) {
  const { status, user, storageAdapter } = useAuth()
  const [mode, setMode] = useState('anonymous') // anonymous | wait | merge | adopt
  const [counts, setCounts] = useState(null) // { favorites, savedEvents } while prompting

  useEffect(() => {
    if (status === 'loading') return

    const authenticated = status === 'authenticated' && !!user
    const linkedKey = authenticated ? `stadar-linked-${user.id}` : null
    const alreadyLinked =
      authenticated && globalThis.localStorage.getItem(linkedKey) === 'true'

    const favoritesCount = (storageAdapter.readCache(FAVORITES_KEY, []) || []).length
    const savedCount = (storageAdapter.readCache(SAVED_KEY, []) || []).length

    const decision = decideInitialLinkMode({
      authenticated,
      alreadyLinked,
      favoritesCount,
      savedCount,
    })

    if (decision.markLinked && linkedKey) {
      globalThis.localStorage.setItem(linkedKey, 'true')
    }
    setMode(decision.mode)
    setCounts(decision.prompt ? { favorites: favoritesCount, savedEvents: savedCount } : null)
  }, [status, user, storageAdapter])

  function resolve(nextMode) {
    if (status === 'authenticated' && user) {
      globalThis.localStorage.setItem(`stadar-linked-${user.id}`, 'true')
    }
    setCounts(null)
    setMode(nextMode)
  }

  const chooseImport = () => resolve('merge')
  const chooseStartFresh = () => resolve('adopt')

  return (
    <AccountLinkContext.Provider value={{ mode, counts, chooseImport, chooseStartFresh }}>
      {children}
    </AccountLinkContext.Provider>
  )
}
```

- [ ] **Step 7: Create the hook**

Create `client/src/hooks/useAccountLink.js`:

```js
import { useContext } from 'react'
import { AccountLinkContext } from '../context/AccountLinkContextDef.js'

export default function useAccountLink() {
  const ctx = useContext(AccountLinkContext)
  if (ctx === null) throw new Error('useAccountLink must be used within AccountLinkProvider')
  return ctx
}
```

- [ ] **Step 8: Wire the provider into the tree**

Replace `client/src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AccountLinkProvider } from './context/AccountLinkContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccountLinkProvider>
          <App />
        </AccountLinkProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 9: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: no new lint errors; build succeeds.

- [ ] **Step 10: Commit**

```bash
git add client/src/utils/accountLink.js client/src/utils/accountLink.test.js \
  client/src/context/AccountLinkContextDef.js client/src/context/AccountLinkContext.jsx \
  client/src/hooks/useAccountLink.js client/src/main.jsx
git commit -m "feat: shared AccountLink context owning the first-login reconcile gate"
```

---

## Task 5: `useFavorites` follows the shared `mode`

**Files:**
- Modify: `client/src/hooks/useFavorites.js`

- [ ] **Step 1: Rewrite the hook to read `mode` from AccountLink**

Replace the entire body of `client/src/hooks/useFavorites.js`:

```js
import { useEffect, useRef, useState } from 'react'
import useAuth from './useAuth.js'
import useAccountLink from './useAccountLink.js'
import { mergeFavorites } from '../utils/reconcile.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const { status, storageAdapter } = useAuth()
  const { mode } = useAccountLink()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [favorites, setFavorites] = useState(() => storageAdapter.readCache(STORAGE_KEY, []))
  const favoritesRef = useRef(favorites)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error

  const commit = next => {
    favoritesRef.current = next
    setFavorites(next)
  }

  // Reconcile with the shared link mode. The AccountLink provider owns the
  // linked flag and the import decision; this hook just applies the result.
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    if (mode === 'anonymous') {
      // Reset the UI to the (post-transfer, possibly empty) anonymous set.
      queueMicrotask(() => {
        if (!cancelled) commit(storageAdapter.readCache(STORAGE_KEY, []))
      })
      return () => { cancelled = true }
    }

    if (mode === 'wait') return () => { cancelled = true } // modal gating; hold the cache

    // merge | adopt — pull the server set.
    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setSyncStatus('idle'); return }

      if (mode === 'merge') {
        const merged = mergeFavorites(favoritesRef.current, remote)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          if (res.ok) {
            globalThis.localStorage.removeItem(STORAGE_KEY) // transfer = move
            setSyncStatus('synced')
          } else {
            setSyncStatus('error')
          }
        })
      } else {
        // adopt: server is authoritative; drop any local copy.
        commit(remote)
        globalThis.localStorage.removeItem(STORAGE_KEY)
        setSyncStatus('synced')
      }
    })
    return () => { cancelled = true }
  }, [mode, status, storageAdapter])

  function toggleFavorite(teamName) {
    const prev = favoritesRef.current
    const next = prev.includes(teamName)
      ? prev.filter(t => t !== teamName)
      : [...prev, teamName]

    commit(next) // optimistic
    setSyncStatus('syncing')
    storageAdapter.persist(STORAGE_KEY, next).then(res => {
      if (res.ok) {
        setSyncStatus('synced')
      } else {
        commit(prev) // roll back to the last confirmed set
        setSyncStatus('error')
      }
    })
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite, syncStatus }
}
```

Note: the internal `stadar-linked-<user.id>` handling from slice 2 is gone — the AccountLink provider is now the single owner of that flag. The public return contract (`favorites`/`toggleFavorite`/`isFavorite`/`syncStatus`) is unchanged, so `DiscoverPage`, `FilterBar`, and `EventCard` need no changes.

- [ ] **Step 2: Confirm no consumer broke**

Run: `cd client && grep -rn "useFavorites" src/`
Expected: call sites destructure only `favorites`, `toggleFavorite`, `isFavorite` (and possibly `syncStatus`). None reference a removed field.

- [ ] **Step 3: Run client tests, lint, build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useFavorites.js
git commit -m "feat: useFavorites follows the shared AccountLink reconcile mode"
```

---

## Task 6: `useSavedEvents` — cache-first account sync

**Files:**
- Modify: `client/src/hooks/useSavedEvents.js`

- [ ] **Step 1: Rewrite the hook**

Replace the entire body of `client/src/hooks/useSavedEvents.js`:

```js
import { useEffect, useRef, useState } from 'react'
import {
  createSavedRecord,
  normalizeSavedRecords,
  removeSavedRecord,
  updateSavedMetadata,
  updateSavedSnapshot as replaceSavedSnapshot,
} from '../utils/savedEventRecords.js'
import { mergeSavedRecords } from '../utils/reconcile.js'
import useAuth from './useAuth.js'
import useAccountLink from './useAccountLink.js'

const STORAGE_KEY = 'stadar-saved-events'

export default function useSavedEvents() {
  const { status, storageAdapter } = useAuth()
  const { mode } = useAccountLink()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [savedEvents, setSavedEvents] = useState(() =>
    normalizeSavedRecords(storageAdapter.readCache(STORAGE_KEY, [])))
  const savedEventsRef = useRef(savedEvents)
  // 'saved' = nothing pending (kept for GameNotesSection's existing copy map).
  const [persistenceStatus, setPersistenceStatus] = useState('saved')
  const [pendingRemoval, setPendingRemoval] = useState(null)

  const commit = next => {
    savedEventsRef.current = next
    setSavedEvents(next)
  }

  // Reconcile with the shared link mode (same shape as useFavorites).
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    if (mode === 'anonymous') {
      queueMicrotask(() => {
        if (!cancelled) commit(normalizeSavedRecords(storageAdapter.readCache(STORAGE_KEY, [])))
      })
      return () => { cancelled = true }
    }

    if (mode === 'wait') return () => { cancelled = true }

    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setPersistenceStatus('saved'); return }

      const remoteRecords = normalizeSavedRecords(remote)
      if (mode === 'merge') {
        const merged = mergeSavedRecords(savedEventsRef.current, remoteRecords)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          if (res.ok) {
            globalThis.localStorage.removeItem(STORAGE_KEY) // transfer = move
            setPersistenceStatus('saved')
          } else {
            setPersistenceStatus('error')
          }
        })
      } else {
        commit(remoteRecords)
        globalThis.localStorage.removeItem(STORAGE_KEY)
        setPersistenceStatus('saved')
      }
    })
    return () => { cancelled = true }
  }, [mode, status, storageAdapter])

  // Single choke point for every mutation: optimistic set, persist, roll back
  // on a failed remote write. persist targets localStorage (anonymous) or the
  // account (signed in) depending on the active adapter.
  function commitSavedEvents(transform) {
    const prev = savedEventsRef.current
    const next = transform(prev)
    if (next === prev) return

    setPersistenceStatus('saving')
    commit(next)
    storageAdapter.persist(STORAGE_KEY, next).then(res => {
      if (res.ok) {
        setPersistenceStatus('saved')
      } else {
        commit(prev) // roll back to the last confirmed set
        setPersistenceStatus('error')
      }
    })
  }

  function toggleSave(event) {
    if (isSaved(event.id)) {
      setPendingRemoval(event)
      return
    }
    commitSavedEvents(records => [...records, createSavedRecord(event)])
  }

  function isSaved(id) {
    return savedEvents.some(r => r.event.id === id)
  }

  function requestRemove(event) {
    setPendingRemoval(event)
  }

  function cancelRemove() {
    setPendingRemoval(null)
  }

  function confirmRemove() {
    if (!pendingRemoval) return
    commitSavedEvents(records => removeSavedRecord(records, pendingRemoval.id))
    setPendingRemoval(null)
  }

  function updateMetadata(eventId, patch) {
    commitSavedEvents(records => updateSavedMetadata(records, eventId, patch))
  }

  function updateSnapshot(freshEvent) {
    if (!freshEvent) return
    commitSavedEvents(records => replaceSavedSnapshot(records, freshEvent))
  }

  return {
    savedEvents,
    toggleSave,
    isSaved,
    requestRemove,
    pendingRemoval,
    cancelRemove,
    confirmRemove,
    updateMetadata,
    updateSnapshot,
    persistenceStatus,
  }
}
```

Notes:
- The old write-on-`[savedEvents]`-effect is gone; persistence now happens inside `commitSavedEvents` (so hydrate's `commit` does not trigger a persist-back). `persistenceStatus` keeps its `saving | saved | error` states and initial value flips to `'saved'` (idle) so `GameNotesSection`'s copy map is unchanged.
- The return contract is byte-for-byte the same as before, so `SavedPage`, `TeamSavedPage`, `EventDetailPage`, `DiscoverPage`, and `GameNotesSection` need no changes.

- [ ] **Step 2: Confirm consumers still line up**

Run: `cd client && grep -rn "useSavedEvents\|persistenceStatus" src/`
Expected: pages destructure the same fields; `GameNotesSection` still receives `persistenceStatus`. No consumer references a removed field.

- [ ] **Step 3: Run client tests, lint, build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useSavedEvents.js
git commit -m "feat: cache-first saved-events sync via the auth-scoped adapter"
```

---

## Task 7: The import-prompt modal

**Files:**
- Create: `client/src/components/importPromptCopy.js`, `client/src/components/importPromptCopy.test.js`
- Create: `client/src/components/ImportPrompt.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Write the failing copy test**

Create `client/src/components/importPromptCopy.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { importPromptBody } from './importPromptCopy.js'

test('pluralizes both collections', () => {
  assert.equal(importPromptBody({ favorites: 3, savedEvents: 2 }),
    'Import your 3 saved teams and 2 saved events into your account?')
})

test('uses singular for a count of one', () => {
  assert.equal(importPromptBody({ favorites: 1, savedEvents: 1 }),
    'Import your 1 saved team and 1 saved event into your account?')
})

test('omits a collection with a zero count', () => {
  assert.equal(importPromptBody({ favorites: 0, savedEvents: 4 }),
    'Import your 4 saved events into your account?')
  assert.equal(importPromptBody({ favorites: 2, savedEvents: 0 }),
    'Import your 2 saved teams into your account?')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd client && node --test src/components/importPromptCopy.test.js`
Expected: FAIL — cannot find module `./importPromptCopy.js`.

- [ ] **Step 3: Implement the copy helper**

Create `client/src/components/importPromptCopy.js`:

```js
function phrase(count, singular) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

// Builds the prompt body from the local data counts. A zero-count collection is
// omitted; the provider never opens the prompt when both are zero.
export function importPromptBody({ favorites, savedEvents }) {
  const parts = []
  if (favorites > 0) parts.push(phrase(favorites, 'saved team'))
  if (savedEvents > 0) parts.push(phrase(savedEvents, 'saved event'))
  return `Import your ${parts.join(' and ')} into your account?`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && node --test src/components/importPromptCopy.test.js`
Expected: 3 passed.

- [ ] **Step 5: Create the modal component**

Create `client/src/components/ImportPrompt.jsx`:

```jsx
import useAccountLink from '../hooks/useAccountLink.js'
import { importPromptBody } from './importPromptCopy.js'

// One-time first-login reconciliation prompt. Renders only while the provider
// is holding a decision (counts present, mode === 'wait'). The overlay gates
// the UI so no favorites/saved mutations race the choice.
export default function ImportPrompt() {
  const { counts, chooseImport, chooseStartFresh } = useAccountLink()
  if (!counts) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-night-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-300">{importPromptBody(counts)}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={chooseImport}
            className="flex-1 rounded-lg bg-radar-400 px-4 py-2 text-sm font-semibold text-night-950 transition hover:bg-radar-300 focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            Import
          </button>
          <button
            type="button"
            onClick={chooseStartFresh}
            className="flex-1 rounded-lg border border-white/15 bg-night-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Mount the modal in the layout**

In `client/src/App.jsx`, add the import near the other component imports:

```jsx
import ImportPrompt from './components/ImportPrompt.jsx'
```

Then render it inside `AppLayout` alongside `Outlet`/`BottomNav`:

```jsx
function AppLayout() {
  return (
    <div className="min-h-screen bg-night-950 pb-16">
      <Outlet />
      <BottomNav />
      <ImportPrompt />
    </div>
  )
}
```

- [ ] **Step 7: Run client tests, lint, build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/importPromptCopy.js client/src/components/importPromptCopy.test.js \
  client/src/components/ImportPrompt.jsx client/src/App.jsx
git commit -m "feat: first-login import prompt covering favorites and saved events"
```

---

## Task 8: Documentation and final verification

**Files:**
- Modify: `CLAUDE.md` (untracked — apply locally, will not commit)

- [ ] **Step 1: Update CLAUDE.md**

In the API endpoint list, add the two saved-events routes near the other `/api/me` routes and bump the "Ten endpoints" count to "Twelve endpoints":

```text
GET  /api/me/saved
PUT  /api/me/saved
```

Update the "Favorites sync (slice 2)" note area to record slice 3: saved events now sync for signed-in users via `/api/me/saved` (whole-set replace, `SnapshotJson` verbatim); first login shows the shared **Import / Start fresh** prompt covering favorites + saved events (replacing slice 2's silent favorites auto-transfer); the `stadar-linked-<userId>` flag is now owned by `AccountLinkProvider`; anonymous path unchanged. Reference this plan.

- [ ] **Step 2: Full API suite**

Run: `dotnet test Api.Tests/Api.Tests.csproj`
Expected: all PASS, same skipped count.

- [ ] **Step 3: Full client suite + lint + build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds.

- [ ] **Step 4: Manual cross-device verification (requires real Google creds + a DB)**

With accounts configured locally (real `Google:ClientId/Secret`, a reachable SQL `ConnectionStrings:Default`):

1. Anonymous: heart a couple of teams and save a couple of events. Confirm they persist across reload (localStorage, no network).
2. Sign in. Confirm the **Import / Start fresh** prompt appears with the right counts.
   - **Import:** confirm favorites + saved events are all present afterward, a `PUT /api/me/favorites` and a `PUT /api/me/saved` fired, and the `stadar-favorites` / `stadar-saved-events` localStorage keys are gone.
   - Repeat from a fresh anonymous state choosing **Start fresh:** confirm the account's (empty/older) server sets are shown and local keys are cleared.
3. In a second browser/profile, sign in as the same user. Confirm favorites and saved events hydrate from the server (no prompt — already linked on a device only matters per-device, so this second device prompts once too; choose Import or Start fresh as appropriate).
4. Edit a saved event's notes/score while signed in; reload; confirm it round-trips through the account.
5. Sign out. Confirm you return to the (now empty) anonymous set and no further `/api/me` calls fire.
6. Simulate a failed write (offline) on a saved-event edit; confirm `persistenceStatus` shows the error and the prior set is intact after reload.

- [ ] **Step 5: Commit any doc changes**

```bash
git add CLAUDE.md 2>/dev/null || true
git commit -m "docs: note saved-events sync endpoints and the import prompt" || echo "CLAUDE.md untracked — skipped"
```

---

## Self-Review Checklist (run before handing off)

- **Spec coverage:** `/api/me/saved` GET/PUT ✓ (Task 1), saved-events reconciliation ✓ (Task 2), adapter routing ✓ (Task 3), shared reconcile gate + `stadar-linked` single-owner ✓ (Task 4), `useFavorites`/`useSavedEvents` cache-first conversion ✓ (Tasks 5–6), the one-time **Import / Start fresh** prompt covering both collections ✓ (Task 7).
- **Account-only invariant:** signed-in `persist` keeps no local copy; both `merge` and `adopt` clear the local key; sign-out shows the empty anonymous set.
- **Anonymous stays DB-free:** `mode === 'anonymous'` shows the local cache; the API adapter is only selected when authenticated; `fetchRemote` never fires for anonymous.
- **No removed public fields:** `useFavorites` keeps `favorites`/`toggleFavorite`/`isFavorite`/`syncStatus`; `useSavedEvents` keeps its full return object including `persistenceStatus`; `GameNotesSection`'s status copy map still matches (`saving`/`saved`/`error`).
- **Type consistency:** `mode` values (`anonymous`/`wait`/`merge`/`adopt`) match across `decideInitialLinkMode`, the provider, and both hooks; `mergeSavedRecords(local, remote)` signature matches its call; endpoint keys `stadar-favorites`/`stadar-saved-events` match `ENDPOINTS`, `STORAGE_KEY`, and the reconcile reads in `AccountLinkProvider`; server stores/returns `event.id` as the composite key.
</content>
</invoke>
