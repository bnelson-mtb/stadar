import { useEffect, useMemo, useState } from 'react'
import useAuth from '@stadar/shared/hooks/useAuth.js'
import { decideInitialLinkMode } from '@stadar/shared/utils/accountLink.js'
import { AccountLinkContext } from '@stadar/shared/context/AccountLinkContextDef.js'

const FAVORITES_KEY = 'stadar-favorites'
const SAVED_KEY = 'stadar-saved-events'

// Same decision as the web AccountLinkProvider: on first sign-in with local
// data on the phone, hold the collections until the user picks Import or
// Start fresh.
export function AccountLinkProvider({ children }) {
  const { status, user, storageAdapter } = useAuth()
  const [mode, setMode] = useState('anonymous') // anonymous | wait | merge | adopt
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    if (status === 'loading') return
    const authenticated = status === 'authenticated' && !!user
    const favoritesCount = (storageAdapter.readCache(FAVORITES_KEY, []) || []).length
    const savedCount = (storageAdapter.readCache(SAVED_KEY, []) || []).length
    const decision = decideInitialLinkMode({ authenticated, favoritesCount, savedCount })
    // Batch initialization of mode and counts on auth change (as on the web).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(decision.mode)
    setCounts(decision.prompt ? { favorites: favoritesCount, savedEvents: savedCount } : null)
  }, [status, user, storageAdapter])

  const value = useMemo(() => {
    function resolve(nextMode) {
      setCounts(null)
      setMode(nextMode)
    }
    return {
      mode,
      counts,
      chooseImport: () => resolve('merge'),
      chooseStartFresh: () => resolve('adopt'),
    }
  }, [mode, counts])

  return <AccountLinkContext.Provider value={value}>{children}</AccountLinkContext.Provider>
}
