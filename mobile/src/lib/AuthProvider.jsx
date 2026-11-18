import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { AuthContext } from '@stadar/shared/context/AuthContextDef.js'
import { fetchAuthState, logout as logoutRequest, resolveAuthState } from '@stadar/shared/utils/authApi.js'
import { flushCollections } from '@stadar/shared/utils/collections.js'
import { createApiAdapter, createLocalStorageAdapter } from '@stadar/shared/utils/storageAdapter.js'
import { signInWithBrowser } from './mobileSignIn.js'

const LOGOUT_FLUSH_TIMEOUT_MS = 3000

// The web AuthProvider for the phone: same context value, so the shared hooks
// and stores behave identically. Differences: the session cookie lives in the
// app's native cookie store, sign-in runs in an in-app browser tab and hands
// the session over with a one-time code, and "tab visible" is the app coming
// to the foreground.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | anonymous | authenticated
  const [verified, setVerified] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [signInError, setSignInError] = useState(null) // null | 'failed' | 'unavailable'
  const [signingIn, setSigningIn] = useState(false)
  const checkingRef = useRef(false)

  const apply = useCallback(state => {
    if (state.status === 'authenticated') {
      setUser(state.user)
      setStatus('authenticated')
      setVerified(true)
      return
    }
    setUser(null)
    setStatus('anonymous')
    setVerified(state.status === 'anonymous')
  }, [])

  useEffect(() => {
    let cancelled = false
    resolveAuthState().then(state => {
      if (!cancelled) apply(state)
    })
    return () => {
      cancelled = true
    }
  }, [apply])

  // Shown as signed out only because the server never answered: ask again
  // when the app comes back to the foreground.
  useEffect(() => {
    if (status === 'loading' || verified) return undefined
    let cancelled = false
    const sub = AppState.addEventListener('change', next => {
      if (next !== 'active') return
      fetchAuthState().then(state => {
        if (!cancelled && state.status !== 'unknown') apply(state)
      })
    })
    return () => {
      cancelled = true
      sub.remove()
    }
  }, [status, verified, apply])

  const handleUnauthorized = useCallback(async () => {
    if (checkingRef.current) return
    checkingRef.current = true
    try {
      const state = await fetchAuthState()
      if (state.status === 'anonymous') {
        setUser(null)
        setStatus('anonymous')
        setVerified(true)
        setSessionExpired(true)
      }
    } finally {
      checkingRef.current = false
    }
  }, [])

  const login = useCallback(async () => {
    if (signingIn) return
    setSignInError(null)
    setSigningIn(true)
    try {
      const result = await signInWithBrowser()
      if (result.status === 'signed-in') {
        setSessionExpired(false)
        apply({ status: 'authenticated', user: result.user })
      } else if (result.status === 'failed' || result.status === 'unavailable') {
        setSignInError(result.status)
      }
      // 'cancelled': the user closed the browser; nothing to report.
    } finally {
      setSigningIn(false)
    }
  }, [apply, signingIn])

  const logout = useCallback(async () => {
    await Promise.race([
      flushCollections(),
      new Promise(resolve => setTimeout(resolve, LOGOUT_FLUSH_TIMEOUT_MS)),
    ])
    await logoutRequest()
    setUser(null)
    setStatus('anonymous')
    setVerified(true)
    setSessionExpired(false)
  }, [])

  const storageAdapter = useMemo(
    () => (status === 'authenticated' ? createApiAdapter() : createLocalStorageAdapter()),
    [status],
  )

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      storageAdapter,
      handleUnauthorized,
      sessionExpired,
      signInError,
      signingIn,
    }),
    [user, status, login, logout, storageAdapter, handleUnauthorized, sessionExpired, signInError, signingIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
