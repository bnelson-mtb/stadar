import { getCountdownParts } from '../utils/countdown.js'

const DIGIT_SIZES = {
  hero: { digits: 'text-[38px]', units: 'text-[15px]', gap: 'gap-[3px]', unitSpacing: 'mr-1.5' },
  tile: { digits: 'text-[19px]', units: 'text-[11px]', gap: 'gap-0.5', unitSpacing: 'mr-1' },
}

// Anton digits with cyan unit letters: "06h 12m" / "2d 04h".
export function CountdownDigits({ countdown, size = 'hero' }) {
  const parts = getCountdownParts(countdown)
  if (parts.length === 0) return null

  const style = DIGIT_SIZES[size] ?? DIGIT_SIZES.hero
  return (
    <span className={`flex items-baseline font-display text-white ${style.gap}`}>
      {parts.map((part, index) => (
        <span key={part.unit} className={`flex items-baseline ${style.gap}`}>
          <span className={`${style.digits} leading-none`}>{part.value}</span>
          <span className={`${style.units} text-radar-400 ${index < parts.length - 1 ? style.unitSpacing : ''}`}>
            {part.unit}
          </span>
        </span>
      ))}
    </span>
  )
}

// Shown in place of a countdown once the event has started.
export function LivePill({ large = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-radar-400 font-display uppercase tracking-[.2em] text-night-950 ${
        large ? 'px-3.5 py-1.5 text-[15px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      <span className={`radar-blip rounded-full bg-night-950 ${large ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} aria-hidden="true" />
      Live
    </span>
  )
}
