import { createElement } from 'react'
import { View } from 'react-native'
import { getVenueMapUrls } from '@stadar/shared/utils/maps.js'

// Web build: an iframe with the web app's CSS filter (react-native-webview
// does not run on web).
export default function VenueMap({ venue, city, state, lat, lng, height = 104 }) {
  const urls = getVenueMapUrls({ venue, city, state, lat, lng })
  if (!urls) return null

  return (
    <View pointerEvents="none" style={{ height, backgroundColor: '#101620' }}>
      {createElement('iframe', {
        title: `Map of ${venue || 'the venue'}`,
        src: urls.embedUrl,
        loading: 'lazy',
        tabIndex: -1,
        style: {
          border: 0,
          width: '100%',
          height: '100%',
          filter: 'invert(0.9) hue-rotate(180deg) saturate(0.65) brightness(0.82) contrast(1.12)',
        },
      })}
    </View>
  )
}
