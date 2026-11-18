import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// A solid strip behind the (transparent, edge-to-edge) status bar, so content
// scrolling under it on full-bleed screens doesn't collide with the clock.
export default function StatusBarScrim() {
  const { top } = useSafeAreaInsets()
  if (!top) return null
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top, backgroundColor: 'rgba(7,9,14,0.92)' }}
    />
  )
}
