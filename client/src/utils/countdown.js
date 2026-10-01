// Pure countdown math behind useCountdown. Kept DOM- and React-free so the
// node:test suite can pin the formatting rules.

// Events carry a start time but no end time. For this long after the start
// an event reads as "LIVE"; after that it is simply past.
export const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000

function toMs(value) {
  if (value === null || value === undefined || value === '') return NaN
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

export function getCountdown(target, now = Date.now()) {
  const targetMs = toMs(target)
  const nowMs = toMs(now)
  if (!Number.isFinite(targetMs) || !Number.isFinite(nowMs)) return null

  const remaining = targetMs - nowMs
  if (remaining <= 0) {
    const isLive = -remaining < LIVE_WINDOW_MS
    return { days: 0, hours: 0, minutes: 0, isLive, isPast: !isLive }
  }

  const totalMinutes = Math.floor(remaining / 60_000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    isLive: false,
    isPast: false,
  }
}

const twoDigits = n => String(n).padStart(2, '0')

// "06h 12m" under a day, "2d 04h" past that. `pad: false` drops the leading
// zero on the hours ("6h 12m") for the compact list variants. Live and past
// countdowns have no parts; callers render a LIVE pill or nothing instead.
export function getCountdownParts(countdown, { pad = true } = {}) {
  if (!countdown || countdown.isLive || countdown.isPast) return []

  if (countdown.days > 0) {
    return [
      { value: String(countdown.days), unit: 'd' },
      { value: twoDigits(countdown.hours), unit: 'h' },
    ]
  }

  return [
    { value: pad ? twoDigits(countdown.hours) : String(countdown.hours), unit: 'h' },
    { value: twoDigits(countdown.minutes), unit: 'm' },
  ]
}

export function formatCountdown(countdown, options) {
  return getCountdownParts(countdown, options)
    .map(part => `${part.value}${part.unit}`)
    .join(' ')
}
