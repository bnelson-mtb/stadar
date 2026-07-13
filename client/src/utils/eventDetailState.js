export function isPastEvent(event, now = new Date()) {
  return new Date(event.dateTime) <= now
}

const MAX_BROWSER_TIMEOUT = 2_147_483_647

export function getEventBoundaryDelay(
  event,
  now = new Date(),
  maxDelay = MAX_BROWSER_TIMEOUT
) {
  const eventTime = new Date(event?.dateTime).getTime()
  const nowTime = new Date(now).getTime()

  if (!Number.isFinite(eventTime) || !Number.isFinite(nowTime)) return null

  const remaining = eventTime - nowTime
  if (remaining <= 0) return null

  return Math.max(1, Math.min(remaining, Math.max(1, maxDelay)))
}

export function getDetailSectionOrder({ isPast, isSaved, hasLeagueInfo }) {
  let sections

  if (isPast) {
    sections = isSaved ? ['notes', 'venue', 'league'] : ['venue', 'league']
  } else {
    sections = isSaved
      ? ['tickets', 'venue', 'notes', 'league']
      : ['tickets', 'venue', 'league']
  }

  return hasLeagueInfo ? sections : sections.filter(section => section !== 'league')
}

export function shouldShowFinalScore({ isPast, isSaved, hasAwayTeam }) {
  return isPast && isSaved && hasAwayTeam
}

export function sanitizeScoreInput(value) {
  return typeof value === 'string' && /^\d*$/.test(value) ? value : null
}

export function getFocusTrapTarget(focusableElements, activeElement, shiftKey) {
  if (focusableElements.length === 0) return null

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!focusableElements.includes(activeElement)) {
    return shiftKey ? lastElement : firstElement
  }
  if (shiftKey && activeElement === firstElement) return lastElement
  if (!shiftKey && activeElement === lastElement) return firstElement
  return null
}

export function getFocusRestoreTarget(previouslyActiveElement, fallbackElement) {
  if (previouslyActiveElement?.isConnected) return previouslyActiveElement
  if (fallbackElement?.isConnected) return fallbackElement
  return null
}
