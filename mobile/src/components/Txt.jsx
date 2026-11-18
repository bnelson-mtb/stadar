import { Text } from 'react-native'

// Text in the app font. A className that names a family (font-display,
// font-sans-*) wins; otherwise Sora regular. Defaults to light ink on dark.
export default function Txt({ className = '', ...props }) {
  const hasFamily = /\bfont-(display|sans)/.test(className)
  const hasColor = /\btext-(white|black|ink|radar|night|rose|transparent)/.test(className)
  const base = `${hasFamily ? '' : 'font-sans '}${hasColor ? '' : 'text-ink-100 '}`
  return <Text maxFontSizeMultiplier={1.4} {...props} className={`${base}${className}`} />
}
