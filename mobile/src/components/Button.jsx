import { Pressable, View } from 'react-native'
import Txt from './Txt.jsx'

const VARIANTS = {
  primary: { box: 'bg-radar-400', pressed: 'bg-radar-500', text: 'font-sans-bold text-night-950' },
  ghost: {
    box: 'border border-white/10 bg-white/[.06]',
    pressed: 'border border-white/10 bg-white/10',
    text: 'font-sans-semibold text-ink-100',
  },
  dark: {
    box: 'border border-white/[.09] bg-night-800',
    pressed: 'border border-white/[.09] bg-night-700',
    text: 'font-sans-semibold text-ink-200',
  },
  danger: { box: 'bg-rose-600', pressed: 'bg-rose-500', text: 'font-sans-semibold text-white' },
}

// Button with a text label (or custom children). `className` sizes the outer
// pressable (height, width, flex); `boxClassName` adds to the inner box.
export default function Button({
  variant = 'primary',
  className = '',
  boxClassName = 'rounded-[14px] px-4',
  textClassName = 'text-sm',
  label,
  children,
  disabled,
  ...props
}) {
  const v = VARIANTS[variant]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      {...props}
      className={className}
    >
      {({ pressed }) => (
        <View
          className={`flex-1 flex-row items-center justify-center gap-2 ${boxClassName} ${pressed ? v.pressed : v.box}`}
          style={disabled ? { opacity: 0.45 } : undefined}
        >
          {label ? <Txt className={`${v.text} ${textClassName}`}>{label}</Txt> : children}
        </View>
      )}
    </Pressable>
  )
}
