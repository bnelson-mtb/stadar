import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchAuthState,
  resolveAuthState,
  logout as logoutRequest,
  loginUrl,
} from '../utils/authApi.js'
import { flushCollections } from '@stadar/shared/utils/collections.js'
import { createLocalStorageAdapter, createApiAdapter } from '@stadar/shared/utils/storageAdapter.js'
import { AuthContext } from '@stadar/shared/context/AuthContextDef.js'

const LOGOUT_FLUSH_TIMEOUT_MS = 3000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | anonymous | authenticated
  // false = shown as signed out only because the server never gave a definite
  // answer (still waking, offline). Checked again when the tab or network returns.
  const [verified, setVerified] = useState(false)
  // The session ended underneath a signed-in tab (expired or revoked).
  const [sessionExpired, setSessionExpired] = useState(false)
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
    return () => { cancelled = true }
  }, [apply])

  useEffect(() => {
    if (status === 'loading' || verified) return undefined
    let cancelled = false
    const recheck = () => {
      if (document.visibilityState !== 'visible') return
      fetchAuthState().then(state => {
        if (!cancelled && state.status !== 'unknown') apply(state)
      })
    }
    window.addEventListener('online', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      cancelled = true
      window.removeEventListener('online', recheck)
      document.removeEventListener('visibilitychange', recheck)
    }
  }, [status, verified, apply])

  // An account request came back 401. Confirm with /api/me before signing the
  // UI out, so the tab stops claiming a session that no longer exists.
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

  function login() {
    window.location.href = loginUrl()
  }

  async function logout() {
    // Let an edit still waiting out its typing pause reach the account first.
    await Promise.race([
      flushCollections(),
      new Promise(resolve => setTimeout(resolve, LOGOUT_FLUSH_TIMEOUT_MS)),
    ])
    await logoutRequest()
    setUser(null)
    setStatus('anonymous')
    setVerified(true)
    setSessionExpired(false)
  }

  // Signed-in users read/write through the API; everyone else stays local.
  const storageAdapter = useMemo(
    () => (status === 'authenticated' ? createApiAdapter() : createLocalStorageAdapter()),
    [status],
  )

  return (
    <AuthContext.Provider
      value={{ user, status, login, logout, storageAdapter, handleUnauthorized, sessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  )
}
