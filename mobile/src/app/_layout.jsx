import '../../global.css'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton'
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora'
import ImportPrompt from '../components/ImportPrompt.jsx'
import { AccountLinkProvider } from '../lib/AccountLinkProvider.jsx'
import { AuthProvider } from '../lib/AuthProvider.jsx'
import CollectionSync from '../lib/CollectionSync.jsx'
import { colors } from '../theme.js'

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  })
  const ready = fontsLoaded || Boolean(fontError)

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {})
  }, [ready])

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.night[950] }} />

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AccountLinkProvider>
          <CollectionSync />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.night[950] },
              animation: 'slide_from_right',
            }}
          />
          <ImportPrompt />
        </AccountLinkProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
