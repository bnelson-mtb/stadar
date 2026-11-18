import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import { getVenueMapUrls } from '@stadar/shared/utils/maps.js'

// Darkens the embedded map to match the app (the web uses a CSS filter on
// the iframe; here it goes on the page inside the web view).
const DARKEN = `
  (function () {
    var s = document.createElement('style');
    s.innerHTML = 'html { filter: invert(0.9) hue-rotate(180deg) saturate(0.65) brightness(0.82) contrast(1.12); background: #101620; }';
    document.documentElement.appendChild(s);
  })();
  true;
`

// Static map preview for the venue card. Non-interactive on purpose: the
// card's Directions button opens the full map.
export default function VenueMap({ venue, city, state, lat, lng, height = 104 }) {
  const urls = getVenueMapUrls({ venue, city, state, lat, lng })
  if (!urls) return null

  return (
    <View
      pointerEvents="none"
      accessibilityLabel={`Map of ${venue || 'the venue'}`}
      style={{ height, backgroundColor: '#101620' }}
    >
      <WebView
        source={{ uri: urls.embedUrl }}
        injectedJavaScriptBeforeContentLoaded={DARKEN}
        injectedJavaScript={DARKEN}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        style={{ backgroundColor: '#101620' }}
        originWhitelist={['https://*']}
      />
    </View>
  )
}
