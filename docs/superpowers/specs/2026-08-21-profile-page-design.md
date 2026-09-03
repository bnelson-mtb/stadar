# Profile page — design

**Date:** 2026-08-21
**Branch:** `feat/profile-page`
**Status:** approved

## Problem

The account controls live in the `DiscoverPage` header, where the "Sign in with
Google" button competes with the state selector and the app title. There is no
home for account-level content, and no surface anywhere in the app that explains
what Stadar stores about a user — a gap that also showed up when Google Safe
Browsing flagged `stadar.app` as a suspected phishing site (a brand-new domain
asking for a Google login with no policy pages anywhere).

## Goals

- A third bottom-nav tab, **Profile**, to the right of Saved.
- Move the Google sign-in control out of the Discover header and onto it.
- Explain, in plain language, why signing in is worth it and that Google is
  currently the only supported provider.
- Give users a "How my data is used" dialog covering what the project is and
  what it stores.
- Show the user's followed teams as a placeholder for future profile content.

## Non-goals

- A full `/privacy` policy page and `/about` page. Those are a separate
  follow-up; this dialog is the short, friendly version.
- Any new API endpoint, database column, or auth behavior change. This is a
  presentation-layer feature over the existing `useAuth` / `useFavorites` /
  `useSavedEvents` hooks.
- Profile editing, avatars, or account deletion.

## Design

### Navigation

`BottomNav` gains a third `flex-1` `NavLink` to `/profile` using a person icon,
reusing the existing `linkClasses` and `ActiveBar` treatment so the active tab
still gets `text-radar-400` and the glowing top bar. Three tabs share the width
evenly with no layout change needed.

`/profile` is registered inside the `AppLayout` route in `App.jsx`, so it
inherits `BottomNav` and `ImportPrompt` like `/` and `/saved`.

`<AuthButton />` is removed from the `DiscoverPage` header. The state `<select>`
remains and occupies the freed space.

### ProfilePage

Header matches `SavedPage` exactly: `bg-night-900`, the radial radar glow
overlay, and a `font-display` uppercase `tracking-[0.18em]` `<h1>Profile</h1>`.

Body sections, `max-w-2xl` with `space-y-8`:

1. **Account card** (`bg-night-800`, `border-white/10`, `rounded-xl`). Driven by
   `useAuth().status`:
   - `loading` — renders nothing in the identity slot (matches `AuthButton`'s
     existing behavior of returning `null` while loading).
   - `anonymous` — a muted avatar circle, "Not signed in", the sync pitch, the
     `<AuthButton />`, and a footnote that Google is the only supported
     provider.
   - `authenticated` — an avatar circle showing the display name's first
     initial in `bg-radar-400/15 text-radar-300` (reusing `AuthButton`'s
     treatment), the display name, the email, and `<AuthButton />` in its
     sign-out state.

   Both signed-in and signed-out states show a stat line — `N teams · M events
   saved` — so the card is never empty.

2. **How my data is used** — a text button below the card that opens
   `DataUsageDialog`.

3. **Your Teams** — favorite team logos as **static** tiles (logo + name), not
   links. The interactive per-team navigation already exists on `SavedPage`;
   here the section reads as an identity/collection placeholder for future
   profile content. Empty state points users at Discover.

### DataUsageDialog

A new component modeled directly on `UnsaveConfirmDialog`, reusing its
accessibility behavior: `role="dialog"`, `aria-modal`, `aria-labelledby` /
`aria-describedby`, Escape to close, backdrop-click to close, a Tab focus trap
via the shared `getFocusTrapTarget` helper, and focus restoration through
`getFocusRestoreTarget` on unmount.

Content is rendered from structured data (see below) rather than hardcoded JSX,
covering: what Stadar is, what is stored when browsing anonymously
(localStorage only), what is stored when signed in (display name, email,
followed teams, saved events), the `ipapi.co` IP lookup used for state
detection, the fact that no passwords or payment details are ever collected,
and a link to the public GitHub repository.

### Testable seam

The client test suite is plain `node:test` over `src/**/*.test.js` with no DOM
or JSX rendering, so testable logic must live in pure `.js` modules — the
pattern already set by `authButtonCopy.js` / `AuthButton.test.js`.

A new `profileCopy.js` exports:

- `getProfileIdentity(status, user)` — the heading, subheading, and avatar
  initial for the account card, derived from auth status.
- `getFollowStats(favoriteCount, savedCount)` — the stat line string, with
  correct singular/plural forms.
- `DATA_USAGE_SECTIONS` — the dialog content as an array of
  `{ heading, body }`, so the copy is assertable without rendering.

`profileCopy.test.js` covers each status branch, plural boundaries (0, 1, many),
and the shape/non-emptiness of the dialog sections. The JSX stays a thin shell
over these.

## Files

| File | Change |
|---|---|
| `client/src/components/BottomNav.jsx` | add third tab |
| `client/src/App.jsx` | register `/profile` |
| `client/src/pages/DiscoverPage.jsx` | remove `<AuthButton />` |
| `client/src/pages/ProfilePage.jsx` | new |
| `client/src/components/DataUsageDialog.jsx` | new |
| `client/src/components/profileCopy.js` | new |
| `client/src/components/profileCopy.test.js` | new |

## Risks

- Removing `AuthButton` from Discover means a signed-out user no longer sees a
  sign-in prompt on the landing page. Acceptable: sign-in is optional by design,
  and the Profile tab is always one tap away in the bottom nav.
- The stat line reads `useSavedEvents()`, which for signed-in users hydrates a
  beat behind first paint. It will briefly show `0 events saved`. Acceptable for
  a placeholder; no loading skeleton for now.
