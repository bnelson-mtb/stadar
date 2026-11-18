import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

// Skeleton wrapper: a soft highlight band slides across its children.
export default function Shimmer({ className = '', style, children }) {
  const [width, setWidth] = useState(0)
  const x = useSharedValue(-1)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    x.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false)
  }, [reduceMotion, x])

  const band = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * width }] }))

  return (
    <View
      className={`overflow-hidden ${className}`}
      style={style}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      {children}
      {width > 0 && !reduceMotion && (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width }, band]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.04)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  )
}
