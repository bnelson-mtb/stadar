import { DATA_USAGE_SECTIONS } from '@stadar/shared/copy/profileCopy.js'

// The web's "How my data is used" copy, with the parts that differ in the app.
const APP_OVERRIDES = {
  'Browsing without an account':
    'You can use every part of Stadar without signing in. Your followed teams, saved events and notes stay in the app’s own storage on this phone and never leave your device.',
}

const APP_ADDITIONS = [
  {
    after: 'What Stadar never collects',
    heading: 'Phone permissions',
    body: 'Stadar asks for no special permissions. “Add to calendar” opens your calendar’s own new-event screen, and sharing uses your phone’s share sheet; nothing is read from your calendar or contacts.',
  },
]

export function appDataUsageSections(sections = DATA_USAGE_SECTIONS) {
  const out = []
  for (const section of sections) {
    out.push(APP_OVERRIDES[section.heading] ? { ...section, body: APP_OVERRIDES[section.heading] } : section)
    for (const addition of APP_ADDITIONS) {
      if (addition.after === section.heading) out.push({ heading: addition.heading, body: addition.body })
    }
  }
  return out
}
