import { router } from 'expo-router'

// Event objects the app already has, keyed by id, so the detail screen can
// render at once instead of refetching (the web passes them as router state).
const eventCache = new Map()

export function rememberEvent(event) {
  if (event?.id) eventCache.set(event.id, event)
}

export function cachedEvent(id) {
  return eventCache.get(id) ?? null
}

export function openEvent(event) {
  rememberEvent(event)
  router.push({ pathname: '/event/[id]', params: { id: event.id } })
}

export function openTeam(teamName) {
  router.push({ pathname: '/team/[name]', params: { name: teamName } })
}

export function goBack(fallback = '/') {
  if (router.canGoBack()) router.back()
  else router.replace(fallback)
}
