import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import Blip from './Blip.jsx'

const RADAR = '#2ed3f2'

// The Stadar mark: two rings and a sweeping arm, with a blinking blip.
export default function RadarLogo({ size = 22 }) {
  const rotation = useSharedValue(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false)
  }, [reduceMotion, rotation])

  const sweepStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))
  const unit = size / 24

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute' }}>
        <Circle cx="12" cy="12" r="10" stroke={RADAR} strokeOpacity={0.28} strokeWidth="1" fill="none" />
        <Circle cx="12" cy="12" r="5.5" stroke={RADAR} strokeOpacity={0.18} strokeWidth="1" fill="none" />
      </Svg>
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, sweepStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 12 L12 2 A10 10 0 0 1 19.07 4.93 Z" fill={RADAR} fillOpacity={0.22} />
          <Line x1="12" y1="12" x2="19.07" y2="4.93" stroke={RADAR} strokeWidth="1.3" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute' }}>
        <Circle cx="12" cy="12" r="1.3" fill={RADAR} />
      </Svg>
      <Blip
        color="#7ae6fb"
        size={2.2 * unit}
        style={{ position: 'absolute', left: (16.2 - 1.1) * unit, top: (7.8 - 1.1) * unit }}
      />
    </View>
  )
}
