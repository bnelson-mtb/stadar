import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

// A dot that fades in and out every two seconds (the web's .radar-blip).
export default function Blip({ size = 6, color = '#2ed3f2', style }) {
  const opacity = useSharedValue(1)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    opacity.value = withRepeat(withTiming(0.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [reduceMotion, opacity])

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, animated, style]}
    />
  )
}
