# LLM Event Classification Layer — Design

**Date:** 2026-07-07
**Status:** Approved (brainstormed with Claude; trigger-based coverage and the Gemini free-tier provider chosen by Brady)

## Problem

Stadar's event pipeline (Ticketmaster → parse → normalize → filter) is deterministic string matching: hardcoded team lists in `EventNormalizer` (AHL/ECHL/NWSL/college), keyword heuristics (`title.Contains("basketball")`), and a substring denylist in `EventFilter`. It handles the common cases well, but two failure modes hurt the product:

1. **Junk gets through** — non-game events (fan events, promotional listings) pass the filter and appear in the feed.
2. **Wrong labels shown** — real games appear with the wrong league, sport, or mangled team names (which also breaks logo lookup client-side).

Both failures often sit on events the rules are *confident* about, so purely widening the rules doesn't fix them, and the hardcoded lists silently go stale as leagues change.

## Decision summary

Add an LLM verdict layer using the Google Gemini API (a Flash model on the AI Studio free tier, chosen so the running cost is $0):

- **Authority: judge + labeler.** The verdict decides whether an event is a real spectator game (may drop junk) and supplies final sport/league/team labels. Deterministic hard rules (cancelled/postponed, past-date, ancillary denylist) always run first and never consume quota.
- **Trigger-based coverage.** The LLM sees only events the rules show signs of struggling with (four triggers below), not the whole feed. Rules-confident events are served directly at zero cost.
- **Request-path placement.** Triggered events are classified during the fetch, in parallel, so the feed is never served unvetted. Latency cost is bounded and paid once per event.
- **Persistent verdict store.** Verdicts are cached in a JSON blob in `stadarstorage`, so each event is classified at most once, ever — surviving scale-to-zero restarts.
- **Anti-hallucination via structured output.** The response is constrained by a schema: league and sport are closed enums with an `"Unknown"` escape hatch; team names are extracted from the provided data, never generated.

Expected cost: **$0 on the AI Studio free tier.** Classification volume is tens of requests/day and shrinks as verdicts accumulate — far under free-tier daily quotas (as of mid-2026 roughly 1,000 requests/day at 15 RPM for `gemini-2.5-flash-lite`, 250/day at 10 RPM for `gemini-2.5-flash`; confirm live limits in AI Studio during implementation). Each classification is ~900 input + ~100 output tokens, so even paid Flash pricing would be pennies per month if quota were ever exceeded.

## Architecture

Per event, on every fetch (`GET /api/games?stateCode=XX` and `GET /api/games/{id}`; the existing 5-minute response cache sits in front, unchanged):

```
parse raw event (unchanged)
  → HARD RULES (free, deterministic): cancelled/postponed, past-date,
    ancillary denylist (parking, watch party, combat sports, …) → drop
  → rules draft (EventNormalizer, unchanged)
  → verdict lookup (in-memory map, hydrated once per app wake from blob)
      ├─ verdict exists → apply it (drop if junk, else final labels)   [no LLM]
      └─ no verdict:
           any trigger fires? ── no → serve rules result               [no LLM, never stored]
                              └─ yes → classify with Gemini Flash (parallel, bounded)
                                        ├─ success → apply + persist verdict
                                        └─ failure → serve rules result, nothing
                                           persisted, retried next fetch
```

Key invariant: **a stored verdict always wins over the rules**, and **triggers only gate verdict creation**. Once the LLM has ruled on an event, that ruling holds even if later rule/data updates would stop the triggers from firing.

## Classification triggers

An event without a stored verdict is sent to the LLM when at least one fires. All are computable for free from data already in hand:

| # | Trigger | Catches |
|---|---------|---------|
| 1 | **Unknown team** — a non-empty home or away team (post-`NormalizeTeamName`) has no entry in the canonical team data | Mangled name extraction; teams missing from `teams.js` (the "no logo" cases) |
| 2 | **Unclassified** — rules resolved league or sport to `Other`/empty | Events the rules admit they can't classify |
| 3 | **Would-be-dropped rescue** — event fails `EventFilter`'s heuristic keep-rules (empty league and no matchup title) and would silently vanish today | Real games the rules can't recognize |
| 4 | **No-matchup pass** — event passed on league alone: no away team and a title that doesn't parse as "X vs Y" | Single-attraction junk wearing a real league tag (e.g. "Utah Jazz Block Party" tagged NBA) |

Zero triggers → known teams, recognized league, matchup title → serve rules result; the event never costs a request and never enters the store.

Accepted residual risk: junk shaped as a proper two-known-teams matchup with a valid league slips through untouched. That shape is rare; if leakage appears, triggers widen without any architecture change.

## Components

### 1. `EventVerdict` + `VerdictStore` (new, `Api/Services/`)

```csharp
record EventVerdict(
    bool IsSpectatorGame,
    string Sport, string League,   // from closed enums; "Unknown" mapped to "Other" for display
    string HomeTeam, string AwayTeam,
    string Reason,                 // one short sentence, for logs/auditing drops
    string EventDate,              // event's local date, used for pruning
    int SchemaVersion,             // bump to lazily re-classify when prompt/enums change
    DateTime ClassifiedAt);
```

- Persistence: single JSON blob `verdicts.json` in a new `verdicts` container in `stadarstorage` (`Azure.Storage.Blobs`), a map of Ticketmaster eventId → verdict. Only LLM-classified events are stored (~200 bytes each; tens of KB total). Single replica + last-writer-wins is acceptable.
- In-memory `ConcurrentDictionary`, hydrated lazily on first use (~100–300ms blob read, overlapping the Ticketmaster call). Blob unreachable at read → start empty and log (re-classification is free-tier quota, not money). Write failure → verdicts stay in memory, retry on next save.
- Saves happen after any fetch that produced new verdicts. On save, entries whose `EventDate` is more than 7 days past are pruned, keeping the blob bounded.
- Verdicts with an older `SchemaVersion` are treated as misses and re-classified lazily.

### 2. `EventClassifier` (new, `Api/Services/`, behind `IEventClassifier`)

- Calls the Gemini REST API directly (`generativelanguage.googleapis.com`, `generateContent`) with `HttpClient` + `System.Text.Json`, matching the existing `TicketmasterClient` pattern — no new SDK dependency. Model from config (`Classifier:Model`, default `gemini-2.5-flash-lite`; exact model ID confirmed against Google's current model list at implementation time).
- One call per event: system instruction (~600 tokens — task rules, guardrails, enum semantics) + compact event payload (event name, attraction names, TM genre/subGenre, venue, city/state, date — not the raw JSON). `maxOutputTokens` ≈ 500, non-streaming.
- **Structured output** (Gemini `responseMimeType: "application/json"` + `responseSchema`, with enum-constrained fields):
  - `is_spectator_game: boolean` — true only for ticketed team-vs-team or competitive spectator sporting events. Fan fests, watch parties, "An Evening With…", camps/clinics, and combat sports (current product exclusion) are `false`.
  - `sport: enum` — Basketball, Football, Baseball, Softball, Hockey, Soccer, Volleyball, Lacrosse, Other.
  - `league: enum` — every league the pipeline knows today (NBA, WNBA, NHL, NFL, MLB, MLS, NWSL, AHL, ECHL, USL, Liga MX, World Cup, International, PLL, IAL, LOVB, the NCAA variants, the MiLB levels) plus `"Unknown"`. The model cannot emit an unlisted league and is instructed to prefer `"Unknown"` over guessing.
  - `home_team`, `away_team: string` — canonical short names extracted from the provided data only ("Utah Utes", not "University of Utah Utes Men's Basketball"); empty string when there is no opponent.
  - `reason: string` — one sentence explaining the verdict.
- Bounded concurrency (~4 parallel — free-tier rate limits are 10–15 requests/minute) with an overall per-fetch time budget (~15s). Events that don't finish inside the budget serve the rules result and are classified on a later fetch; 429/quota responses are treated as ordinary failures (no bespoke retry loop — the next fetch retries naturally, and daily quotas reset at midnight Pacific).
- **No Gemini API key configured → the entire verdict layer is inert** — no blob reads, no verdict application, no classification — and the pipeline behaves exactly as today (safe default for local dev and CI; no storage connection needed either).

### 3. Known-team data for trigger 1 (new)

The canonical team list lives client-side (`client/src/data/teams.js` + `logoManifest.json`). A small Node script in `scripts/` (matching the existing logo-script pattern) exports the set of canonical team names to a checked-in `Api/Data/known-teams.json`, regenerated whenever `teams.js` changes. The API loads it once at startup; the trigger-1 check is a case-insensitive lookup of the normalized team name. This also aligns with the roadmap's future shared data layer.

### 4. Pipeline integration (edits to `TicketmasterClient`, `EventFilter`, `Program.cs`)

- `EventFilter` splits conceptually: **hard rules** (status, past-date, denylist) always run pre-LLM; the heuristic **keep-rules** apply only when serving a rules result (no verdict, or classification failed).
- Verdict application: `IsSpectatorGame == false` → drop, logged with `Reason`; otherwise verdict labels replace normalizer output in the `SportEvent`. `NormalizeTeamName` is still applied to LLM team names as belt-and-suspenders; league `"Unknown"` maps to `"Other"` so the client vocabulary is unchanged.
- `ParseEvent` stays static and testable; verdict lookup/classification happens in the async fetch path around it.

### 5. Config, secrets, and observability

- `Gemini__ApiKey` — new Container App secret (a free Google AI Studio key; mirrors the `Ticketmaster__ApiKey` pattern, local value in `appsettings.Development.json`).
- `Storage__ConnectionString` — new Container App secret for the verdict blob.
- Every classification is logged (event id, fired triggers, verdict, reason, token counts from `usageMetadata`) and every verdict-drop is logged with its reason — auditable via `az containerapp logs show`.

## Error handling

| Failure | Behavior |
|---|---|
| No Gemini API key | Entire verdict layer inert (no blob reads, no verdict application); exact current behavior |
| Gemini timeout / 5xx / safety block | Serve rules result for that event; nothing persisted; retried next fetch |
| Rate/quota limited (429) | Bounded concurrency + time budget; remainder classified on later fetches (free-tier quotas reset daily) |
| Blob read fails | Start with empty store; re-classification only costs free-tier quota |
| Blob write fails | Verdicts stay in memory; retry on next save |

The feed is never blocked by the LLM. Worst case for any event equals today's behavior.

## Testing

- Existing suites (`EventFilterTests`, `EventNormalizerTests`, parse tests) unchanged — the rules remain the fallback path.
- New unit tests around a fake `IEventClassifier`: each trigger fires/doesn't fire on representative events; verdict-hit overrides labels and drops junk; verdict-wins-over-triggers invariant; no-trigger events bypass classification and are never stored; classifier-down serves current behavior; `Unknown`→`Other` mapping; `SchemaVersion` invalidation; pruning.
- Schema/prompt construction tests (league enum complete and in sync with the normalizer's vocabulary).
- Optional env-gated integration test: run the real classifier against recorded raw fixtures (the existing `TicketmasterRawDataTests` pattern) when a Gemini key is present locally.

## What does not change

The `/api/games` contract and `SportEvent` shape, the React client (zero frontend changes), the 5-minute response cache, client retry logic, request logging middleware, the logo pipeline, and the deployment workflow (aside from two new secrets).

## Verification

1. `cd Api.Tests && dotnet test` — all green.
2. Run locally with a real key, fetch `/api/games?stateCode=UT`: confirm triggers and verdicts logged, junk dropped with reasons, labels correct, blob written.
3. Fetch the same state again after cache expiry: zero LLM calls (verdict hits only).
4. Remove the key locally → behavior identical to today.
