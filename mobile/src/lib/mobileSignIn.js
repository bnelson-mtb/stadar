import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { getApiBase } from '@stadar/shared/utils/api.js'
import { buildMobileLoginUrl, parseAuthRedirect, toBase64Url } from './signInFlow.js'

WebBrowser.maybeCompleteAuthSession()

// Google sign-in for the app. The cookie a browser gets from Google sign-in
// can't reach the app, so the API hands the session over instead:
//   1. The app opens /api/auth/mobile/login in an in-app browser tab with a
//      SHA-256 challenge of a secret only the app knows.
//   2. After Google, the API redirects to stadar://auth?code=… (a one-time
//      code that expires in two minutes).
//   3. The app posts the code and the secret to /api/auth/mobile/exchange,
//      which signs the app in; the session cookie lands in the app's own
//      cookie store and every later API call carries it.
// The secret means a code intercepted by another app is useless.
//
// Resolves to { status: 'signed-in', user } | 'cancelled' | 'failed' |
// 'unavailable' (this API has no mobile sign-in, e.g. not deployed yet).
export async function signInWithBrowser() {
  const api = getApiBase()
  try {
    const probe = await fetch(`${api}/api/auth/mobile`, { credentials: 'include' })
    // Exactly 204: an API without these endpoints answers unknown paths with
    // the web app's index.html (200), which must not count as support.
    if (probe.status !== 204) return { status: 'unavailable' }
  } catch {
    return { status: 'failed' }
  }

  const verifier = toBase64Url(Crypto.getRandomBytes(32))
  const challenge = toBase64Url(
    new Uint8Array(await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new TextEncoder().encode(verifier))),
  )
  const redirectUri = Linking.createURL('auth')

  const result = await WebBrowser.openAuthSessionAsync(
    buildMobileLoginUrl(api, { challenge, redirectUri }),
    redirectUri,
    { preferEphemeralSession: false, showInRecents: true },
  )
  if (result.type !== 'success') return { status: 'cancelled' }

  const { code, error } = parseAuthRedirect(result.url)
  if (error || !code) return { status: 'failed' }

  try {
    const res = await fetch(`${api}/api/auth/mobile/exchange`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, verifier }),
    })
    if (!res.ok) return { status: 'failed' }
    const user = await res.json()
    return user?.id ? { status: 'signed-in', user } : { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
