import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import { getVenueMapUrls } from '@stadar/shared/utils/maps.js'

// Google's embed only renders inside an iframe, so the web view loads a tiny
// page holding one, darkened with the web app's CSS filter.
function mapPage(embedUrl) {
  const src = embedUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#101620;overflow:hidden}
iframe{border:0;width:100%;height:100%;filter:invert(0.9) hue-rotate(180deg) saturate(0.65) brightness(0.82) contrast(1.12)}</style>
</head><body><iframe src="${src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></body></html>`
}

// Static map preview for the venue card. Non-interactive on purpose: the
// card's Directions button opens the full map.
export default function VenueMap({ venue, city, state, lat, lng, height = 104 }) {
  const urls = getVenueMapUrls({ venue, city, state, lat, lng })
  if (!urls) return null

  return (
    <View
      pointerEvents="none"
      accessible
      accessibilityLabel={`Map of ${venue || 'the venue'}`}
      style={{ height, backgroundColor: '#101620' }}
    >
      <WebView
        source={{ html: mapPage(urls.embedUrl), baseUrl: 'https://stadar.app' }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        style={{ backgroundColor: '#101620' }}
        originWhitelist={['*']}
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  )
}
