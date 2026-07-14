# Inline Final Score Design

**Date:** 2026-07-13

## Goal

Restyle the final-score controls in Game Notes as a compact inline scoreboard that resembles the event matchup tile without adding unnecessary vertical height.

## Layout

The existing `Final score` fieldset remains above Notes and continues to render only for past saved two-team events.

Its contents use one horizontal, three-part row:

1. Home team identity on the left: miniature `TeamLogo`, then the canonical home team name.
2. Score controls in the center: a wide, shallow home-score input, a visible dash, and a matching away-score input.
3. Away team identity on the right: the canonical away team name, then a miniature `TeamLogo`.

This produces a visual reading such as:

```text
[UG8 logo] Utah Great 8s    [ 27 ] – [ 24 ]    Las Vegas Rockers [LVR logo]
```

The score inputs use centered, bold, prominent numerals. They are larger horizontally than the current form controls but shorter vertically, keeping the scoreboard compact.

## Responsive Behavior

The same left-to-right order is preserved on mobile. Team identity columns may shrink and names may wrap to a compact second line. Logos and score inputs remain fixed-size enough to stay recognizable and easy to edit. The row must not create horizontal page overflow at a 320-pixel viewport.

## Component and Data Boundaries

Only `GameNotesSection` changes visually. It imports and reuses the existing `TeamLogo` component with its small size. No saved-record shape, autosave behavior, score sanitization, section ordering, or postgame gating changes.

Each input retains an explicit accessible label using the canonical team name, for example `Utah Great 8s score`. The visible team names are not used as the sole labeling mechanism.

## Verification

- Add a rendered-component test first that fails until the final-score markup includes both team identities, miniature logos, labeled score inputs, and home-before-away ordering.
- Keep existing score sanitization and saved-record tests passing.
- Run focused ESLint and the production build.
- Inspect the rendered row at desktop and 320-pixel mobile widths for alignment, name wrapping, and horizontal overflow.
