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
