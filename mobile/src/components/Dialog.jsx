import { Modal, Pressable, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

// Centred modal card. Tapping outside it or Android back calls onClose.
export default function Dialog({ open, onClose, children, className = '' }) {
  if (!open) return null
  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(180)} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)' }}
          />
          <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 448 }}>
            <View className={`rounded-[18px] border border-white/[.08] bg-night-900 ${className}`}>{children}</View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  )
}
