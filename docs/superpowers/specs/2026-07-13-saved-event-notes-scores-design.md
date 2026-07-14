# Saved Event Notes, Final Scores, and Detail Sections Design

**Date:** 2026-07-13

## Goal

Let people keep private scratch notes on saved events, record a two-team final score after an event, and make the secondary detail-page content easier to scan. User-entered data remains local to the browser and is deleted only after an explicit confirmation.

## Scope

This change applies to the React client and its existing `stadar-saved-events` local-storage collection. It does not add an API, account sync, score lookup, rich-text editing, score validation against an external source, or recovery after a saved event is removed.

## Saved Record Model

New saved records use this shape:

```js
{
  event,
  savedAt,
  notes: '',
  score: {
    home: '',
    away: '',
  },
}
```

`notes` is plain text. Score values are stored as strings so an empty input remains distinct from a score of zero. The UI accepts only non-negative whole numbers.

Existing records that contain only `event` and `savedAt` remain valid. Reads treat absent notes and score values as empty strings; no one-time local-storage migration is required.

The saved-events state layer will expose a metadata update operation that changes only `notes` and/or `score` for the matching event. Its existing snapshot refresh will continue replacing only `record.event`, preserving `savedAt`, notes, and scores.

## Event State

An event is past when `new Date(event.dateTime) <= now`, matching the current Saved-page partitioning behavior. An event is saved when its ID has a record in the saved-events collection.

Notes are available only for saved events. Final-score inputs are available only when all of the following are true:

- the event is saved;
- the event is past; and
- the event has both a home team and an away team.

Single-team or non-matchup events keep the notes field but do not show ambiguous score controls.

## Detail Page Layout

The hero image and matchup tile remain permanently expanded. Every other detail-page card is independently collapsible and starts open:

- Get Tickets
- Venue
- Game Notes
- League Overview

Each collapsible card uses a full-width button header with a visible chevron, `aria-expanded`, and an associated content region. Collapsing one card does not affect any other card.

The page order is state-dependent:

### Upcoming saved event

1. Hero image, when available
2. Matchup
3. Get Tickets
4. Venue
5. Game Notes
6. League Overview, when available

### Upcoming unsaved event

1. Hero image, when available
2. Matchup
3. Get Tickets
4. Venue
5. League Overview, when available

### Past saved event

1. Hero image, when available
2. Matchup
3. Game Notes with final score
4. Venue
5. League Overview, when available

### Past unsaved event

1. Hero image, when available
2. Matchup
3. Venue
4. League Overview, when available

The Get Tickets card, including its calendar action, is absent after the event passes. The Game Notes card moves into that high-priority position for a past saved event. Before the event, Game Notes stays between Venue and League Overview.

## Game Notes Card

The card contains a multiline textarea for unrestricted plain-text scratch notes. Changes update the matching saved record and local storage immediately. A quiet “Autosaved locally” message explains the behavior without requiring a Save button.

For past two-team events, a final-score area appears above the textarea. It has separate inputs labeled with the canonical home and away team names. Inputs may be blank or contain a non-negative whole number. Notes and score remain editable after the event.

Refreshing the page or navigating away and back restores the values from the saved record. Fresh event data may update the event snapshot but cannot replace the user-entered metadata.

## Unsave Confirmation

Every route that can remove a saved event must use the same styled confirmation dialog:

- Discover event cards
- Saved page event cards
- Team saved page event cards
- Event detail header bookmark

Saving a new event remains immediate and does not show a dialog. Attempting to unsave sets that event as the pending removal and opens the dialog. Cancel and backdrop/Escape dismissal leave the record unchanged. Confirm removes the complete record, including notes and score.

For an upcoming event, the dialog asks the user to confirm removing it from Saved. For a past event, it also states that any notes and final score will be permanently deleted and that the action cannot be undone. The dialog has clear Cancel and Unsave buttons, moves focus into the dialog, supports Escape, and returns focus to the initiating control when closed.

Only the confirmed removal operation writes the filtered collection to local storage. The lower-level removal function is not exposed as an ordinary click handler, preventing a page from bypassing confirmation accidentally.

## Component Boundaries

- A saved-event utility owns pure record creation, metadata update, snapshot update, and removal transformations. These functions allow the storage behavior to be tested without rendering React.
- `useSavedEvents` owns React state, local-storage writes, and pending-removal state. It exposes save/toggle requests, metadata updates, and confirm/cancel removal actions.
- A reusable `CollapsibleSection` owns only the open/closed state and accessible section shell.
- A reusable `UnsaveConfirmDialog` owns the modal presentation and keyboard/focus behavior. Page components supply it with pending event data and hook actions.
- A focused `GameNotesSection` renders score and notes controls and reports metadata changes without knowing how local storage works.
- `EventDetailPage` computes past/saved state and composes cards in the required order.

## Failure Behavior

Malformed existing local-storage JSON continues falling back to an empty saved list, matching current behavior. Missing metadata on older valid records renders as empty fields. If no matching saved record exists when a metadata update runs, the collection is left unchanged.

Score input rejects negative, decimal, and non-numeric characters at the UI boundary while permitting an empty value. Event snapshot refresh failures continue using the stored snapshot and therefore leave user metadata available.

## Verification

Automated tests will cover:

- new saved records receive empty notes and score fields;
- older saved records read with empty metadata defaults;
- editing notes or either score changes only the target record;
- metadata updates preserve the event snapshot and saved timestamp;
- snapshot refreshes preserve notes and scores;
- cancelling removal does not change storage state;
- confirming removal deletes the entire target record;
- past/upcoming and saved/unsaved states produce the specified section order;
- score controls appear only for past saved two-team events;
- ticket content is omitted for past events.

The client lint and production build must pass. Manual browser verification will cover expanding/collapsing each card, auto-save persistence across reloads, all four unsave entry points, dialog keyboard behavior, responsive layout, and the upcoming-to-past content hierarchy.
