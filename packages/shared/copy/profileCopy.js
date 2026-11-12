// Pure copy/derivation helpers for the Profile page.
//
// The client test suite is plain node:test with no DOM, so anything worth
// asserting lives here as data or pure functions and ProfilePage stays a thin
// shell over it — same split as authButtonCopy.js / AuthButton.jsx.

export const GITHUB_URL = 'https://github.com/bnelson-mtb/stadar'

export const SIGN_IN_PITCH =
  'Sign in to sync your saved events and followed teams across every device you use.'

export const PROVIDER_NOTE = 'Stadar currently supports Google sign-in only.'

export const DATA_USAGE_TITLE = 'How my data is used'

// Identity block for the account card. `loading` is treated as anonymous by
// callers, which skip rendering entirely until auth resolves.
export function getProfileIdentity(status, user) {
  if (status === 'authenticated') {
    const displayName = user?.displayName?.trim() || 'Signed in'
    return {
      signedIn: true,
      heading: displayName,
      subheading: user?.email?.trim() || '',
      initial: displayName.charAt(0).toUpperCase(),
    }
  }

  return {
    signedIn: false,
    heading: 'Not signed in',
    subheading: SIGN_IN_PITCH,
    initial: '•',
  }
}

function countOf(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

// "3 teams · 7 events saved" — keeps the account card from looking empty for
// signed-out users, who still have local favorites and saved events.
export function getFollowStats(favoriteCount, savedCount) {
  return `${pluralize(countOf(favoriteCount), 'team')} · ${pluralize(
    countOf(savedCount),
    'event'
  )} saved`
}

// Content for DataUsageDialog. Structured rather than inline JSX so the copy is
// assertable, and so a future /privacy page can render the same source.
export const DATA_USAGE_SECTIONS = [
  {
    heading: 'What Stadar is',
    body: 'Stadar is a personal, non-commercial portfolio project that helps you find upcoming live sports events near you. Event listings come from the official Ticketmaster Discovery API.',
  },
  {
    heading: 'Browsing without an account',
    body: "You can use every part of Stadar without signing in. Your followed teams and saved events stay in your own browser's local storage and never leave your device.",
  },
  {
    heading: 'If you sign in with Google',
    body: 'Google shares your name and email address with Stadar. Those are stored alongside your followed teams and saved events so the same list follows you between devices. Stadar never sees or stores your Google password.',
  },
  {
    heading: 'Finding events near you',
    body: 'To pick a starting state, Stadar asks the third-party service ipapi.co to estimate your region from your IP address. You can change the state at any time on the Discover page.',
  },
  {
    heading: 'What Stadar never collects',
    body: 'No passwords, no payment or card details, and no ongoing location tracking. Ticket purchases happen on the ticket vendor’s own site, never here.',
  },
  {
    heading: 'Open source',
    body: 'The complete source code for this project is public on GitHub, so you can read exactly what it does.',
  },
]
