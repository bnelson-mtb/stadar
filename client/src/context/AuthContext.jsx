import { useEffect, useState } from 'react'
import { fetchMe, logout as logoutRequest, loginUrl } from '../utils/authApi.js'
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

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
