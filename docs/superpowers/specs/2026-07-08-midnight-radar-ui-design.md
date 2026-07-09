# Midnight Radar — Stadar Visual Identity

**Date:** 2026-07-08
**Status:** Approved direction (chosen over "Broadcast Bold" and "Ticket Stub" options)
**Scope:** Client-only styling pass on the `feature/UI-enhancements` branch. No API changes, no routing changes, no behavior changes. Local-only work — intentionally not committed so it can be discarded wholesale.

## Concept

Stadar = stadium + radar. The identity leans into the radar metaphor with a
dark "stadium at night" theme: deep navy surfaces, a lime radar-green accent,
and a radar-sweep logo mark. The dark canvas also makes team colors and league
badges pop, which is the actual content of the app.

## Design tokens (Tailwind v4 `@theme` in `client/src/index.css`)

| Token | Value | Use |
|-------|-------|-----|
| `night-950` | `#060B16` | Page background |
| `night-900` | `#0A1120` | Header / bottom nav surfaces |
| `night-800` | `#111A2E` | Card surfaces |
| `night-700` | `#1A2740` | Elevated / hover surfaces |
| `radar-300` | `#BEF264` | Accent hover / bright text |
| `radar-400` | `#A3E635` | Primary accent (links, active nav, CTAs) |
| `radar-500` | `#84CC16` | Accent pressed / borders |

Text scale on dark: white for primary, `slate-300` secondary, `slate-400`
meta, `slate-500` muted. Hairlines are `white/10`, subtle fills `white/5`.

`color-scheme: dark` on `:root` so native form controls (the state `<select>`)
render dark.

## Typography

- **Display:** Rajdhani (Google Fonts, 500/600/700) — squared-off, technical,
  HUD/radar character. Used for the wordmark, section rails, date blocks, and
  page headings, always uppercase with wide tracking. Exposed as
  `font-display`.
- **Body:** system-ui stack (unchanged).

## Brand mark

New `RadarLogo` component: SVG with concentric radar rings, a slowly rotating
sweep wedge (CSS `radar-sweep` keyframes, ~4s linear infinite), and a lime
blip dot. Sits next to the `STADAR` wordmark in the Discover header and scales
down for compact headers. Tagline becomes "Live sports on your radar."

## Component treatments

- **EventCard:** `night-800` surface, `white/5` border, team-color left edge
  (kept from current design), lime border/glow on hover, Rajdhani date block,
  lime bookmark when saved, rose heart when followed.
- **TeamLogo:** logo images render transparent, directly on the dark surface
  (per Brady — no white chip); initials fallback unchanged. Known trade-off:
  mostly-black logo marks may read poorly on navy; if that bites, add a faint
  white drop-shadow to the image rather than a background.
- **FilterBar:** dark chips (`night-800`, `white/10` border); selected sport
  chips flip to lime with near-black text; selected league chips keep their
  existing `LEAGUE_COLORS`; My Teams chip uses rose.
- **BottomNav:** `night-900/90` + backdrop blur, `white/10` top hairline,
  active tab in radar lime with a small blip dot.
- **Section rails (Today / This Weekend / …):** lime dot + uppercase Rajdhani
  label + hairline rule; sticky background matches `night-950`.
- **EventDetailPage:** dark sticky header with blur, all cards `night-800`,
  lime "Buy Tickets" CTA with near-black text, radar-lime links, Rajdhani
  headings.
- **Saved pages:** same dark card system; team chips dark with lime count
  badges.
- **Skeletons:** `night-800` cards with `white/10` / `white/5` bones.
- **Header glow:** a low-opacity lime radial gradient behind the Discover
  header for depth.

## Explicitly out of scope

- Light-mode toggle (dark is the identity; revisit only if testers complain).
- Logo asset/favicon files, PWA manifest.
- Any behavior, data, or API change. League badge color map unchanged.

## Verification

`npm run lint` and `npm run build` in `client/`. Visual check via `npm run dev`.
