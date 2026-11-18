import { Pressable, View } from 'react-native'
import { getCountdownParts } from '@stadar/shared/utils/countdown.js'
import Blip from './Blip.jsx'
import Shimmer from './Shimmer.jsx'
import Txt from './Txt.jsx'

// Anton eyebrow over a muted line of copy, with an optional action below.
export function EmptyState({ title, body, children, className = '' }) {
  return (
    <View className={`items-center rounded-[14px] border border-white/5 bg-night-900 px-5 py-8 ${className}`}>
      <Txt className="text-center font-display text-xs uppercase tracking-[2.4px] text-ink-400">{title}</Txt>
      {body ? (
        <Txt className="mt-2 max-w-[300px] text-center text-sm leading-[22px] text-ink-400">{body}</Txt>
      ) : null}
      {children ? <View className="mt-4 items-center">{children}</View> : null}
    </View>
  )
}

// Pill-track switcher used for Discover's date filter and Saved's tabs.
export function SegmentedControl({ options, value, onChange, label, className = '' }) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      className={`flex-row gap-1.5 rounded-xl border border-white/5 bg-night-900 p-1 ${className}`}
    >
      {options.map(option => {
        const isActive = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-[9px] py-2 ${isActive ? 'bg-radar-400' : ''}`}
          >
            <Txt className={`text-xs ${isActive ? 'font-sans-bold text-night-950' : 'font-sans-medium text-ink-400'}`}>
              {option.label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

// Section heading in Anton caps.
export function GroupHeading({ children, className = '' }) {
  return (
    <Txt accessibilityRole="header" className={`mb-2.5 font-display text-[11px] uppercase tracking-[2.2px] text-ink-400 ${className}`}>
      {children}
    </Txt>
  )
}

// Loading placeholder in the shape of an EventRow.
export function SkeletonCard() {
  return (
    <Shimmer className="flex-row items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5">
      <View className="w-11 items-center gap-1.5">
        <View className="h-3 w-8 rounded bg-white/[.06]" />
        <View className="h-2 w-7 rounded bg-white/[.04]" />
      </View>
      <View className="w-px self-stretch bg-white/[.07]" />
      <View className="min-w-0 flex-1 gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-[22px] w-[22px] rounded-full bg-white/[.06]" />
          <View className="h-3.5 w-24 rounded bg-white/[.06]" />
          <View className="h-3 w-16 rounded bg-white/[.04]" />
        </View>
        <View className="h-2.5 w-36 rounded bg-white/[.04]" />
      </View>
    </Shimmer>
  )
}

// Loading placeholder for the Discover "next up" hero.
export function SkeletonHero() {
  return (
    <Shimmer className="h-[216px] rounded-[18px] border border-white/5 bg-night-900 p-[18px]">
      <View className="h-3 w-32 rounded bg-white/[.06]" />
      <View className="mt-5 flex-row items-center gap-3.5">
        <View className="h-14 w-14 rounded-full bg-white/[.06]" />
        <View className="gap-2">
          <View className="h-6 w-28 rounded bg-white/[.06]" />
          <View className="h-6 w-36 rounded bg-white/[.04]" />
        </View>
      </View>
      <View className="mt-6 h-9 w-40 rounded bg-white/[.05]" />
    </Shimmer>
  )
}

const DIGIT_SIZES = {
  hero: { digits: 38, units: 15, gap: 3, unitSpacing: 6 },
  tile: { digits: 19, units: 11, gap: 2, unitSpacing: 4 },
}

// Anton digits with cyan unit letters: "06h 12m" / "2d 04h".
export function CountdownDigits({ countdown, size = 'hero' }) {
  const parts = getCountdownParts(countdown)
  if (parts.length === 0) return null
  const s = DIGIT_SIZES[size] ?? DIGIT_SIZES.hero
  return (
    <View className="flex-row items-baseline" style={{ gap: s.gap }} accessibilityLabel={parts.map(p => `${p.value}${p.unit}`).join(' ')}>
      {parts.map((part, index) => (
        <View
          key={part.unit}
          className="flex-row items-baseline"
          style={{ gap: s.gap, marginRight: index < parts.length - 1 ? s.unitSpacing : 0 }}
        >
          <Txt className="font-display text-white" style={{ fontSize: s.digits, lineHeight: s.digits * 1.15 }}>
            {part.value}
          </Txt>
          <Txt className="font-display text-radar-400" style={{ fontSize: s.units }}>{part.unit}</Txt>
        </View>
      ))}
    </View>
  )
}

// Shown in place of a countdown once the event has started.
export function LivePill({ large = false }) {
  return (
    <View
      className={`flex-row items-center self-start rounded-full bg-radar-400 ${large ? 'gap-1.5 px-3.5 py-1.5' : 'gap-1.5 px-2.5 py-1'}`}
      accessibilityLabel="Live"
    >
      <Blip size={large ? 8 : 6} color="#07090e" />
      <Txt className={`font-display uppercase text-night-950 ${large ? 'text-[15px] tracking-[3px]' : 'text-[11px] tracking-[2.2px]'}`}>
        Live
      </Txt>
    </View>
  )
}

// Tiny caps label used on stat and status tiles.
export function MicroLabel({ children, className = 'text-ink-400' }) {
  return (
    <Txt className={`font-sans-bold text-[9px] uppercase tracking-[1.6px] ${className}`}>{children}</Txt>
  )
}
