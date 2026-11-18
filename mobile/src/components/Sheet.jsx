import { useEffect } from 'react'
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme.js'
import Txt from './Txt.jsx'
import { XMarkIcon } from './icons.jsx'

// Modal sheet that slides up from the bottom. Tapping the backdrop, the close
// button or Android back closes it.
export default function Sheet({ open, ...props }) {
  if (!open) return null
  return <OpenSheet {...props} />
}

// Slides up with a plain translate (Reanimated's SlideInDown entering
// animation left the panel short of the bottom edge under Android edge-to-edge).
function OpenSheet({ title, subtitle, onClose, footer, children }) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const reduceMotion = useReducedMotion()
  const offset = useSharedValue(reduceMotion ? 0 : height)
  useEffect(() => {
    offset.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) })
  }, [offset])
  const slide = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }))

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            entering={FadeIn.duration(220)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            />
          </Animated.View>
          {/* Styling lives on a plain inner View: NativeWind classes don't
              reach Reanimated's Animated.View. */}
          <Animated.View
            style={[{ width: '100%', maxWidth: 576, alignSelf: 'center', maxHeight: '88%' }, slide]}
          >
          <View
            accessibilityViewIsModal
            className="rounded-t-[22px] border-t border-white/[.08] bg-night-900"
            style={{ flexShrink: 1 }}
          >
            <View className="items-center pt-2.5">
              <View className="h-1 w-10 rounded-full bg-white/15" />
            </View>
            <View className="flex-row items-start justify-between gap-4 px-[18px] pb-3 pt-3">
              <View className="min-w-0 flex-1">
                <Txt accessibilityRole="header" className="font-display text-[22px] uppercase leading-[26px] text-white">
                  {title}
                </Txt>
                {subtitle ? (
                  <Txt numberOfLines={2} className="mt-1.5 text-xs leading-[18px] text-ink-400">
                    {subtitle}
                  </Txt>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={6}
                className="h-9 w-9 items-center justify-center rounded-[11px] border border-white/10 bg-white/[.06]"
              >
                <XMarkIcon size={16} color={colors.ink[200]} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: footer ? 20 : 20 + insets.bottom }}
            >
              {children}
            </ScrollView>
            {footer ? (
              <View className="border-t border-white/[.06] px-[18px] pt-3.5" style={{ paddingBottom: 18 + insets.bottom }}>
                {footer}
              </View>
            ) : null}
          </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
