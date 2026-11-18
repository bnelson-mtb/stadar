// Pure pieces of the mobile sign-in handoff (see mobileSignIn.js), kept free
// of native modules so they can be unit tested under Node.

const BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

// Bytes as unpadded base64url (RFC 4648 §5), the encoding the API expects.
export function toBase64Url(bytes) {
  let out = ''
  let i = 0
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    out += BASE64URL[(n >> 18) & 63] + BASE64URL[(n >> 12) & 63] + BASE64URL[(n >> 6) & 63] + BASE64URL[n & 63]
  }
  const rest = bytes.length - i
  if (rest === 1) {
    const n = bytes[i] << 16
    out += BASE64URL[(n >> 18) & 63] + BASE64URL[(n >> 12) & 63]
  } else if (rest === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8)
    out += BASE64URL[(n >> 18) & 63] + BASE64URL[(n >> 12) & 63] + BASE64URL[(n >> 6) & 63]
  }
  return out
}

export function buildMobileLoginUrl(apiBase, { challenge, redirectUri }) {
  const params = `challenge=${encodeURIComponent(challenge)}&redirect=${encodeURIComponent(redirectUri)}`
  return `${apiBase}/api/auth/mobile/login?${params}`
}

// { code, error } from the URL the API redirected back to.
export function parseAuthRedirect(url) {
  const query = String(url ?? '').split('?')[1]?.split('#')[0] ?? ''
  const params = {}
  for (const pair of query.split('&')) {
    if (!pair) continue
    const [key, value = ''] = pair.split('=')
    params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '))
  }
  return { code: params.code ?? null, error: params.error ?? null }
}
