import { useEffect, useState } from 'react'
import { getCountdown } from '../utils/countdown.js'

const TICK_MS = 30_000

// Live countdown to `date` (ISO string or Date). Re-renders every 30s, which is
// plenty for minute resolution. Returns { days, hours, minutes, isLive, isPast },
// or null when there is no date to count down to.
export default function useCountdown(date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!date) return undefined
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [date])

  return getCountdown(date, now)
}
