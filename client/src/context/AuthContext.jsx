import { useEffect, useMemo, useState } from 'react'
import { fetchMe, logout as logoutRequest, loginUrl } from '../utils/authApi.js'
import { createLocalStorageAdapter, createApiAdapter } from '../utils/storageAdapter.js'
import { AuthContext } from './AuthContextDef.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | anonymous | authenticated

  useEffect(() => {
    let cancelled = false
    fetchMe().then(me => {
      if (cancelled) return
      setUser(me)
      setStatus(me ? 'authenticated' : 'anonymous')
    })
    return () => { cancelled = true }
  }, [])

  function login() {
    window.location.href = loginUrl()
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
    setStatus('anonymous')
  }

  // Signed-in users read/write through the API; everyone else stays local.
  const storageAdapter = useMemo(
    () => (status === 'authenticated' ? createApiAdapter() : createLocalStorageAdapter()),
    [status],
  )

  return (
    <AuthContext.Provider value={{ user, status, login, logout, storageAdapter }}>
      {children}
    </AuthContext.Provider>
  )
}
