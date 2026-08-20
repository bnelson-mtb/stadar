# Accounts Slice 2: Favorites Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync a signed-in user's favorite teams across devices via `/api/me/favorites`, converting the favorites hook to a cache-first / sync-later model, while the anonymous path stays exactly as fast and DB-free as today.

**Architecture:** Two new authenticated endpoints (`GET`/`PUT /api/me/favorites`) read/replace the user's `Favorites` rows. The client storage adapter gains an Option-B interface (`readCache` sync + `fetchRemote`/`persist` async); a localStorage adapter (anonymous) and an API adapter (signed-in) implement it. `AuthContext` picks which adapter the hooks receive. `useFavorites` paints instantly from cache, then—when signed in—hydrates from the server: on an already-linked device the server is authoritative; on first login it does a one-time union of local + server favorites (auto-import). Mutations are optimistic with rollback on a failed server write.

**Tech Stack:** .NET 10 minimal APIs + EF Core 10, MSTest + `WebApplicationFactory` with a SQLite-backed `AppDbContext` override, React 19 + Context, node:test for client logic.

**Spec:** `docs/superpowers/specs/2026-07-21-accounts-oauth-sync-design.md`

**Depends on:** Slice 1 (auth + DB skeleton) — merged on `feat/db-auth`. This slice assumes `AppDbContext`, the `Favorite` entity, `AccountsStartup`, `AuthContext`/`useAuth`, and `authApi` already exist.

**Scope note:** Slice 2 of 3. It does NOT touch saved events, and it does NOT add the explicit import **prompt** — first-login reconciliation here is an automatic union (no data loss). Slice 3 replaces the auto-import with the user-facing "Import / Start fresh" prompt at the same gate, and adds saved-events sync.

---

## Key Design Decisions

**Adapter interface (Option B).** Four methods:
- `readCache(key, fallback)` — synchronous localStorage read; source of first paint.
- `writeCache(key, value)` — synchronous cache-only write; returns `{ ok }`.
- `fetchRemote(key, fallback)` — async; resolves to the server value, or `null` meaning "no remote / cache is truth" (anonymous adapter always returns `null`; API adapter returns `null` on 401/network/parse failure).
- `persist(key, value)` — async cache+remote write; returns `{ ok }`.

**API-adapter `persist` writes cache only after the server confirms.** PUT first; on success `writeCache` then `{ ok:true }`; on failure return `{ ok:false }` and leave the cache untouched. This keeps the cache a faithful mirror of the server, so an optimistic UI update that fails to persist rolls back cleanly (cache still holds the prior, server-confirmed value). The anonymous adapter still writes cache unconditionally (there, the cache *is* the source of truth).

**Reconciliation.** Favorites are a set of canonical team names; merge is a union (`mergeFavorites`). On an already-linked device, hydrate is server-authoritative (replace cache+state with the server set). The union runs exactly once, at first link, gated by a `stadar-linked-<userId>` flag.

**First login (this slice = auto-import).** When signed in and not yet linked, union local + server favorites, `persist` the merged set, set the linked flag. No prompt, no data loss. Slice 3 swaps this auto-import for the "Import / Start fresh" prompt at the identical gate.

---

## File Structure

**Server — modify:**
- `Api/Auth/AccountsStartup.cs` — add `GET`/`PUT /api/me/favorites` to `MapAccountEndpoints`

**Server — tests (create):**
- `Api.Tests/AccountsTestFactory.cs` — reusable factory: accounts enabled + `TestAuthHandler` + a shared open SQLite `AppDbContext`
- `Api.Tests/FavoritesEndpointsTests.cs` — 401, round-trip, replace-semantics, per-user isolation

**Client — modify:**
- `client/src/utils/storageAdapter.js` — Option-B interface; local + API adapters
- `client/src/context/AuthContext.jsx` — expose the active `storageAdapter`
- `client/src/hooks/useFavorites.js` — cache-first async conversion

**Client — create:**
- `client/src/utils/reconcile.js` — `mergeFavorites` pure helper
- `client/src/utils/reconcile.test.js`
- `client/src/utils/storageAdapter.test.js` — extend/replace for the new interface

**Docs — modify:**
- `CLAUDE.md` — document the two favorites endpoints (untracked; apply locally)

---

## Task 1: Server `/api/me/favorites` endpoints

**Files:**
- Modify: `Api/Auth/AccountsStartup.cs`
- Create: `Api.Tests/AccountsTestFactory.cs`
- Test: `Api.Tests/FavoritesEndpointsTests.cs`

- [ ] **Step 1: Create the SQLite-backed test factory**

Slice 1's `EnabledFactory` didn't need a working DB (`/api/me` reads claims only). Favorites need real persistence, so this factory overrides the `AppDbContext` registration (SqlServer → a shared, open in-memory SQLite connection that survives across requests for the factory's lifetime) and wires the `TestAuthHandler`.

Create `Api.Tests/AccountsTestFactory.cs`:

```csharp
using System.Data.Common;
using Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

// Boots the app with accounts ENABLED, the fake Test auth scheme, and a real
// working SQLite database (shared open connection) in place of SqlServer.
// Requests authenticate by sending the "Test-User: <guid>" header.
public sealed class AccountsTestFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Default", "DataSource=:memory:");
        builder.UseSetting("Google:ClientId", "test-client");
        builder.UseSetting("Google:ClientSecret", "test-secret");

        builder.ConfigureTestServices(services =>
        {
            // Fake auth scheme (default + challenge) so anonymous → 401,
            // "Test-User" header → authenticated.
            services.AddAuthentication(o =>
                {
                    o.DefaultScheme = TestAuthHandler.SchemeName;
                    o.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName, _ => { });

            // Replace the SqlServer AppDbContext with a shared open SQLite one.
            var toRemove = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                d.ServiceType == typeof(DbContextOptions) ||
                (d.ServiceType == typeof(AppDbContext))).ToList();
            foreach (var d in toRemove) services.Remove(d);

            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            services.AddSingleton<DbConnection>(connection);
            services.AddDbContext<AppDbContext>((sp, o) =>
                o.UseSqlite(sp.GetRequiredService<DbConnection>()));
        });
    }
}
```

Note: the app's `MigrateAccountsDb` runs at startup; its `Migrate()` call fails on SQLite (SqlServer-targeted migrations) and falls back to `EnsureCreated`, which builds the schema on this SQLite connection. So the DB is ready without extra wiring.

- [ ] **Step 2: Write the failing tests**

Create `Api.Tests/FavoritesEndpointsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace Api.Tests;

[TestClass]
public class FavoritesEndpointsTests
{
    private static HttpClient ClientFor(AccountsTestFactory factory, string? userId)
    {
        var client = factory.CreateClient();
        if (userId is not null) client.DefaultRequestHeaders.Add("Test-User", userId);
        return client;
    }

    [TestMethod]
    public async Task Favorites_Anonymous_Returns401()
    {
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, null);

        using var response = await client.GetAsync("/api/me/favorites");
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task Favorites_PutThenGet_RoundTrips()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        using var put = await client.PutAsJsonAsync("/api/me/favorites",
            new[] { "Utah Jazz", "Real Salt Lake" });
        Assert.AreEqual(HttpStatusCode.OK, put.StatusCode);

        var teams = await client.GetFromJsonAsync<string[]>("/api/me/favorites");
        CollectionAssert.AreEquivalent(new[] { "Utah Jazz", "Real Salt Lake" }, teams);
    }

    [TestMethod]
    public async Task Favorites_Put_ReplacesWholeSet()
    {
        var uid = Guid.NewGuid().ToString();
        using var factory = new AccountsTestFactory();
        using var client = ClientFor(factory, uid);

        await client.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Jazz", "Utah Mammoth" });
        await client.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Royals" });

        var teams = await client.GetFromJsonAsync<string[]>("/api/me/favorites");
        CollectionAssert.AreEquivalent(new[] { "Utah Royals" }, teams);
    }

    [TestMethod]
    public async Task Favorites_AreIsolatedPerUser()
    {
        using var factory = new AccountsTestFactory();
        var userA = Guid.NewGuid().ToString();
        var userB = Guid.NewGuid().ToString();

        using (var a = ClientFor(factory, userA))
            await a.PutAsJsonAsync("/api/me/favorites", new[] { "Utah Jazz" });

        using var b = ClientFor(factory, userB);
        var teamsB = await b.GetFromJsonAsync<string[]>("/api/me/favorites");
        Assert.AreEqual(0, teamsB!.Length);
    }
}
```

- [ ] **Step 3: Run to verify they fail**

Run: `dotnet test Api.Tests/Api.Tests.csproj --filter FavoritesEndpointsTests`
Expected: FAIL — `Favorites_Anonymous_Returns401` may pass (route unmapped → 401/404), but the round-trip/replace/isolation tests fail because the endpoints don't exist yet (404).

- [ ] **Step 4: Add the endpoints**

In `Api/Auth/AccountsStartup.cs`, inside `MapAccountEndpoints`, after the `logout` mapping and before the closing brace, add:

```csharp
        // Current user's favorite team names (canonical). Auth required.
        app.MapGet("/api/me/favorites", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var teams = await db.Favorites
                .Where(f => f.UserId == userId)
                .OrderBy(f => f.CreatedAt)
                .Select(f => f.TeamName)
                .ToListAsync();
            return Results.Ok(teams);
        }).RequireAuthorization();

        // Whole-set replace (matches the client adapter's persist(key, wholeValue)).
        app.MapPut("/api/me/favorites", async (
            ClaimsPrincipal principal, AppDbContext db,
            [Microsoft.AspNetCore.Mvc.FromBody] List<string> teams) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await db.Favorites.Where(f => f.UserId == userId).ToListAsync();
            db.Favorites.RemoveRange(existing);

            var now = DateTime.UtcNow;
            var deduped = teams.Distinct().ToList();
            for (var i = 0; i < deduped.Count; i++)
                db.Favorites.Add(new Favorite
                {
                    UserId = userId,
                    TeamName = deduped[i],
                    CreatedAt = now.AddMilliseconds(i), // preserve input order on read-back
                });

            await db.SaveChangesAsync();
            return Results.Ok(deduped);
        }).RequireAuthorization();
```

Add these usings at the top of `Api/Auth/AccountsStartup.cs` if not already present (Slice 1 added `System.Security.Claims`, `Api.Data`, and `Microsoft.EntityFrameworkCore`):

```csharp
using Api.Models;
```

- [ ] **Step 5: Run to verify they pass**

Run: `dotnet test Api.Tests/Api.Tests.csproj --filter FavoritesEndpointsTests`
Expected: 4 passed.

- [ ] **Step 6: Run the full API suite (no regressions)**

Run: `dotnet test Api.Tests/Api.Tests.csproj`
Expected: all PASS (Slice 1's tests + 4 new), same 3 skipped.

- [ ] **Step 7: Commit**

```bash
git add Api/Auth/AccountsStartup.cs Api.Tests/AccountsTestFactory.cs Api.Tests/FavoritesEndpointsTests.cs
git commit -m "feat: add GET/PUT /api/me/favorites with per-user isolation"
```

---

## Task 2: Client storage adapter — Option B interface

**Files:**
- Modify: `client/src/utils/storageAdapter.js`
- Create: `client/src/utils/reconcile.js`, `client/src/utils/reconcile.test.js`
- Test: `client/src/utils/storageAdapter.test.js`

- [ ] **Step 1: Write the failing `mergeFavorites` test**

Create `client/src/utils/reconcile.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeFavorites } from './reconcile.js'

test('mergeFavorites unions without duplicates, local order first', () => {
  assert.deepEqual(
    mergeFavorites(['Jazz', 'RSL'], ['RSL', 'Royals']),
    ['Jazz', 'RSL', 'Royals'],
  )
})

test('mergeFavorites handles empty sides', () => {
  assert.deepEqual(mergeFavorites([], ['A']), ['A'])
  assert.deepEqual(mergeFavorites(['A'], []), ['A'])
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd client && node --test src/utils/reconcile.test.js`
Expected: FAIL — cannot find module `./reconcile.js`.

- [ ] **Step 3: Implement `mergeFavorites`**

Create `client/src/utils/reconcile.js`:

```js
// Union of two favorite-team lists, preserving local order first. Favorites
// are a set of canonical team names, so a plain de-duplicated union is correct.
export function mergeFavorites(local, remote) {
  return [...new Set([...local, ...remote])]
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && node --test src/utils/reconcile.test.js`
Expected: 2 passed.

- [ ] **Step 5: Rewrite the storage adapter to the Option-B interface**

Replace the entire body of `client/src/utils/storageAdapter.js`:

```js
// Storage adapter — the single seam between hooks and persistence.
//
// Option B (cache-first / sync-later):
//   readCache(key, fallback)  sync   — instant first paint from localStorage
//   writeCache(key, value)    sync   — cache-only write, returns { ok }
//   fetchRemote(key, fallback) async — server value, or null = "cache is truth"
//   persist(key, value)       async  — cache + remote write, returns { ok }
//
// Anonymous users get the localStorage adapter (fetchRemote → null, so the
// hydrate path is a no-op). Signed-in users get the API adapter. Hooks never
// touch localStorage directly — always go through an adapter from AuthContext.
// `stadar-location` stays a raw string outside the adapter on purpose.

import { API_BASE } from './api.js'

// Maps a storage key to its server endpoint. Favorites now; saved events in slice 3.
const ENDPOINTS = {
  'stadar-favorites': '/api/me/favorites',
}

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  function readCache(key, fallback) {
    try {
      const raw = storage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }
  function writeCache(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
      return { ok: true }
    } catch (error) {
      return { ok: false, error }
    }
  }
  return {
    readCache,
    writeCache,
    // Anonymous tier: no remote, the cache is the source of truth.
    async fetchRemote() {
      return null
    },
    // Anonymous tier: cache write IS the persist.
    async persist(key, value) {
      return writeCache(key, value)
    },
  }
}

export function createApiAdapter(fetchImpl = fetch, storage = globalThis.localStorage) {
  const local = createLocalStorageAdapter(storage)

  return {
    readCache: local.readCache,
    writeCache: local.writeCache,

    // GET the server set; null on 401/network/parse failure → hook keeps cache.
    async fetchRemote(key, fallback) {
      const endpoint = ENDPOINTS[key]
      if (!endpoint) return null
      try {
        const res = await fetchImpl(`${API_BASE}${endpoint}`, { credentials: 'include' })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },

    // PUT first; only mirror into the cache once the server confirms, so a
    // failed write leaves the cache holding the last server-confirmed value.
    async persist(key, value) {
      const endpoint = ENDPOINTS[key]
      if (!endpoint) return local.writeCache(key, value)
      try {
        const res = await fetchImpl(`${API_BASE}${endpoint}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
        if (!res.ok) return { ok: false, error: new Error(`HTTP ${res.status}`) }
        local.writeCache(key, value)
        return { ok: true }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}

// Default anonymous adapter (used until AuthContext supplies an API adapter).
export const storageAdapter = createLocalStorageAdapter()
```

- [ ] **Step 6: Write the adapter tests**

Replace the contents of `client/src/utils/storageAdapter.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLocalStorageAdapter, createApiAdapter } from './storageAdapter.js'

function fakeStorage() {
  const map = new Map()
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  }
}

test('local adapter: readCache/writeCache round-trip', () => {
  const a = createLocalStorageAdapter(fakeStorage())
  a.writeCache('stadar-favorites', ['A'])
  assert.deepEqual(a.readCache('stadar-favorites', []), ['A'])
})

test('local adapter: fetchRemote is always null (cache is truth)', async () => {
  const a = createLocalStorageAdapter(fakeStorage())
  assert.equal(await a.fetchRemote('stadar-favorites', []), null)
})

test('local adapter: persist writes cache and returns ok', async () => {
  const store = fakeStorage()
  const a = createLocalStorageAdapter(store)
  const res = await a.persist('stadar-favorites', ['A'])
  assert.deepEqual(res, { ok: true })
  assert.equal(store.getItem('stadar-favorites'), JSON.stringify(['A']))
})

test('api adapter: fetchRemote returns server value on 200', async () => {
  const fake = async () => ({ ok: true, json: async () => ['Jazz'] })
  const a = createApiAdapter(fake, fakeStorage())
  assert.deepEqual(await a.fetchRemote('stadar-favorites', []), ['Jazz'])
})

test('api adapter: fetchRemote returns null on 401', async () => {
  const fake = async () => ({ ok: false, status: 401 })
  const a = createApiAdapter(fake, fakeStorage())
  assert.equal(await a.fetchRemote('stadar-favorites', []), null)
})

test('api adapter: persist PUTs then mirrors cache on success', async () => {
  let method = null
  const store = fakeStorage()
  const fake = async (_url, opts) => { method = opts.method; return { ok: true } }
  const a = createApiAdapter(fake, store)
  const res = await a.persist('stadar-favorites', ['Jazz'])
  assert.equal(method, 'PUT')
  assert.deepEqual(res, { ok: true })
  assert.equal(store.getItem('stadar-favorites'), JSON.stringify(['Jazz']))
})

test('api adapter: persist failure leaves cache untouched', async () => {
  const store = fakeStorage()
  store.setItem('stadar-favorites', JSON.stringify(['prior']))
  const fake = async () => ({ ok: false, status: 500 })
  const a = createApiAdapter(fake, store)
  const res = await a.persist('stadar-favorites', ['new'])
  assert.equal(res.ok, false)
  assert.equal(store.getItem('stadar-favorites'), JSON.stringify(['prior']))
})
```

- [ ] **Step 7: Run the client tests**

Run: `cd client && npm test`
Expected: all PASS (existing + new reconcile + adapter tests).

- [ ] **Step 8: Commit**

```bash
git add client/src/utils/storageAdapter.js client/src/utils/storageAdapter.test.js client/src/utils/reconcile.js client/src/utils/reconcile.test.js
git commit -m "feat: Option-B storage adapter (local + API) and favorites union helper"
```

---

## Task 3: AuthContext supplies the active storage adapter

**Files:**
- Modify: `client/src/context/AuthContext.jsx`

- [ ] **Step 1: Expose a `storageAdapter` from the context**

The context already provides `{ user, status, login, logout }`. Add a memoized adapter chosen by auth state: signed-in → API adapter, otherwise → localStorage adapter. Replace the body of `client/src/context/AuthContext.jsx`:

```jsx
import { useEffect, useMemo, useState } from 'react'
import { fetchMe, logout as logoutRequest, loginUrl } from '../utils/authApi.js'
import { createLocalStorageAdapter, createApiAdapter } from '../utils/storageAdapter.js'
import { AuthContext } from './AuthContextDef.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | anonymous | authenticated

  useEffect(() => {
    let cancelled = false
    fetchMe().then(me => {
      if (cancelled) return
      setUser(me)
      setStatus(me ? 'authenticated' : 'anonymous')
    })
    return () => { cancelled = true }
  }, [])

  function login() {
    window.location.href = loginUrl()
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
    setStatus('anonymous')
  }

  // Signed-in users read/write through the API; everyone else stays local.
  const storageAdapter = useMemo(
    () => (status === 'authenticated' ? createApiAdapter() : createLocalStorageAdapter()),
    [status],
  )

  return (
    <AuthContext.Provider value={{ user, status, login, logout, storageAdapter }}>
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] **Step 2: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: no new lint errors; build succeeds.

- [ ] **Step 3: Commit**

```bash
git add client/src/context/AuthContext.jsx
git commit -m "feat: AuthContext exposes the auth-scoped storage adapter"
```

---

## Task 4: Convert `useFavorites` to cache-first sync

**Files:**
- Modify: `client/src/hooks/useFavorites.js`

- [ ] **Step 1: Rewrite the hook**

Replace the entire body of `client/src/hooks/useFavorites.js`:

```js
import { useEffect, useRef, useState } from 'react'
import useAuth from './useAuth.js'
import { mergeFavorites } from '../utils/reconcile.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const { status, user, storageAdapter } = useAuth()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [favorites, setFavorites] = useState(() => storageAdapter.readCache(STORAGE_KEY, []))
  const favoritesRef = useRef(favorites)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error

  const commit = next => {
    favoritesRef.current = next
    setFavorites(next)
  }

  // Hydrate from the server when signed in. Anonymous → fetchRemote returns
  // null and this is a no-op. First login (not yet linked) → one-time union of
  // local + server (auto-import). Already linked → server is authoritative.
  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    let cancelled = false
    const linkedKey = `stadar-linked-${user.id}`
    const alreadyLinked = globalThis.localStorage.getItem(linkedKey) === 'true'

    setSyncStatus('syncing')
    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setSyncStatus('idle'); return }

      if (alreadyLinked) {
        commit(remote)
        storageAdapter.writeCache(STORAGE_KEY, remote)
        setSyncStatus('synced')
      } else {
        const merged = mergeFavorites(favoritesRef.current, remote)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          setSyncStatus(res.ok ? 'synced' : 'error')
          if (res.ok) globalThis.localStorage.setItem(linkedKey, 'true')
        })
      }
    })
    return () => { cancelled = true }
  }, [status, user, storageAdapter])

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

Note: `useAuth` is a **default** export at `client/src/hooks/useAuth.js` (Slice 1), so from `useFavorites.js` in the same directory it imports as `import useAuth from './useAuth.js'` (verified against the merged Slice 1 code).

- [ ] **Step 2: Verify existing favorites consumers still work**

`useFavorites` still returns `{ favorites, toggleFavorite, isFavorite }` (plus a new `syncStatus`), so `DiscoverPage`, `FilterBar`, and `EventCard` need no changes. Confirm no consumer destructured a removed field:

Run: `cd client && grep -rn "useFavorites" src/`
Expected: call sites use `favorites`, `toggleFavorite`, `isFavorite` only. If any references something else, note it — but none should.

- [ ] **Step 3: Run client tests, lint, and build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds. (The hook itself is exercised via manual verification; its pure dependencies — `mergeFavorites`, the adapters — are unit-tested.)

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useFavorites.js
git commit -m "feat: cache-first favorites sync with one-time first-login import"
```

---

## Task 5: Documentation and final verification

**Files:**
- Modify: `CLAUDE.md` (untracked — apply locally, will not commit)

- [ ] **Step 1: Update CLAUDE.md**

Add the two favorites endpoints to the API endpoint list near the other `/api/me` routes:

```text
GET  /api/me/favorites
PUT  /api/me/favorites
```

Update the "Accounts (optional)" note (or add a sentence) to record that favorites now sync for signed-in users via `/api/me/favorites`, first login auto-imports local favorites (union), and the anonymous path is unchanged.

- [ ] **Step 2: Full API suite**

Run: `dotnet test Api.Tests/Api.Tests.csproj`
Expected: all PASS, 3 skipped.

- [ ] **Step 3: Full client suite + lint + build**

Run: `cd client && npm test && npm run lint && npm run build`
Expected: all tests PASS, no new lint errors, build succeeds.

- [ ] **Step 4: Manual cross-device verification (requires real Google creds + a DB)**

With accounts configured locally (real `Google:ClientId/Secret`, a reachable SQL/Azure SQL `ConnectionStrings:Default`):

1. Anonymous: heart a couple of teams. Confirm they persist across reload (localStorage, no network).
2. Sign in. Confirm the anonymous favorites are still present (first-login auto-import unioned them into the account) and a `PUT /api/me/favorites` fired (check container/network logs).
3. In a second browser/profile, sign in as the same user. Confirm the favorites appear (server hydrate).
4. Toggle a favorite in browser 2, reload browser 1, confirm it reflects after hydrate.
5. Sign out. Confirm you return to the anonymous localStorage set and no further `/api/me` calls fire.
6. Simulate a failed write (offline) and confirm the heart rolls back and `syncStatus` reflects an error, with the prior set intact after reload.

- [ ] **Step 5: Commit any doc changes**

```bash
git add CLAUDE.md 2>/dev/null || true
git commit -m "docs: note favorites sync endpoints" || echo "CLAUDE.md untracked — skipped"
```

---

## Self-Review Checklist (run before handing off)

- **Spec coverage:** favorites endpoints ✓ (Task 1), Option-B adapter ✓ (Task 2), adapter selection ✓ (Task 3), cache-first hook + optimistic rollback + one-time union ✓ (Task 4). The explicit import *prompt* is intentionally deferred to Slice 3 (auto-import here).
- **Anonymous stays DB-free:** `fetchRemote → null` for the local adapter; the hydrate effect returns early unless `status === 'authenticated'`.
- **No removed public fields:** `useFavorites` keeps `favorites`/`toggleFavorite`/`isFavorite`; `syncStatus` is additive.
- **Type consistency:** `readCache`/`writeCache`/`fetchRemote`/`persist` used identically across adapter, context, and hook; `mergeFavorites(local, remote)` signature matches its call in the hook; endpoint key `stadar-favorites` matches `ENDPOINTS` and `STORAGE_KEY`.
