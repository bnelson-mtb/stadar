// CSS linear-gradient angles as expo-linear-gradient start/end points.
// 0deg points up and angles turn clockwise, as in CSS.
export function angle(deg) {
  const rad = (deg * Math.PI) / 180
  const x = Math.sin(rad)
  const y = -Math.cos(rad)
  return {
    start: { x: 0.5 - x / 2, y: 0.5 - y / 2 },
    end: { x: 0.5 + x / 2, y: 0.5 + y / 2 },
  }
}
