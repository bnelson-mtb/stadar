// Pure decision for the sign-in reconciliation gate. Every collection follows
// the returned `mode`:
//   anonymous — not signed in; show/persist the local cache.
//   wait      — signed in and this browser holds local data; the import prompt
//               is up. Hold what is on screen; do not load or write the account.
//   merge     — user chose Import; union local+server, persist, clear local.
//   adopt     — no local data / user chose Start fresh; take the server set
//               as-is and clear local.
// `prompt` = show the modal.
//
// Signed-in sessions keep no local copy, so local data found at sign-in was
// always made while signed out (before the first sign-in, after signing out,
// or while the session could not be confirmed). It is never dropped without
// asking: an import that fails leaves it in place and the prompt comes back.
export function decideInitialLinkMode({ authenticated, favoritesCount, savedCount }) {
  if (!authenticated) return { mode: 'anonymous', prompt: false }
  if (favoritesCount === 0 && savedCount === 0) return { mode: 'adopt', prompt: false }
  return { mode: 'wait', prompt: true }
}

// The mode the collections should actually run in. The link decision is made
// one render after sign-in resolves; until it catches up, a signed-in session
// must not be treated as anonymous (that would write local data to the account).
export function effectiveLinkMode(authStatus, linkMode) {
  if (authStatus !== 'authenticated') return 'anonymous'
  return linkMode === 'anonymous' ? 'wait' : linkMode
}
