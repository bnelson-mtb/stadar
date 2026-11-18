import { Linking, Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

// Opens a web page in an in-app browser tab (Chrome Custom Tab / Safari
// view), so the user can come straight back. On web, a new tab.
export async function openWebPage(url) {
  if (!url) return
  if (Platform.OS === 'web') {
    globalThis.open?.(url, '_blank', 'noopener,noreferrer')
    return
  }
  try {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: '#07090e',
      controlsColor: '#2ed3f2',
      enableBarCollapsing: true,
      showTitle: true,
    })
  } catch {
    await Linking.openURL(url).catch(() => {})
  }
}

// Hands a URL to the system (Google Maps directions open in the Maps app).
export async function openExternal(url) {
  if (!url) return
  if (Platform.OS === 'web') {
    globalThis.open?.(url, '_blank', 'noopener,noreferrer')
    return
  }
  await Linking.openURL(url).catch(() => openWebPage(url))
}
