import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import { decideInitialLinkMode } from '../utils/accountLink.js'
import { AccountLinkContext } from './AccountLinkContextDef.js'

const FAVORITES_KEY = 'stadar-favorites'
const SAVED_KEY = 'stadar-saved-events'

export function AccountLinkProvider({ children }) {
  const { status, user, storageAdapter } = useAuth()
  const [mode, setMode] = useState('anonymous') // anonymous | wait | merge | adopt
  const [counts, setCounts] = useState(null) // { favorites, savedEvents } while prompting

  useEffect(() => {
    if (status === 'loading') return

    const authenticated = status === 'authenticated' && !!user
    const linkedKey = authenticated ? `stadar-linked-${user.id}` : null
    const alreadyLinked =
      authenticated && globalThis.localStorage.getItem(linkedKey) === 'true'

    const favoritesCount = (storageAdapter.readCache(FAVORITES_KEY, []) || []).length
    const savedCount = (storageAdapter.readCache(SAVED_KEY, []) || []).length

    const decision = decideInitialLinkMode({
      authenticated,
      alreadyLinked,
      favoritesCount,
      savedCount,
    })

    if (decision.markLinked && linkedKey) {
      globalThis.localStorage.setItem(linkedKey, 'true')
    }
    // Batch initialization of mode and counts on auth/storage-state change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(decision.mode)
    setCounts(decision.prompt ? { favorites: favoritesCount, savedEvents: savedCount } : null)
  }, [status, user, storageAdapter])

  function resolve(nextMode) {
    if (status === 'authenticated' && user) {
      globalThis.localStorage.setItem(`stadar-linked-${user.id}`, 'true')
    }
    setCounts(null)
    setMode(nextMode)
  }

  const chooseImport = () => resolve('merge')
  const chooseStartFresh = () => resolve('adopt')

  return (
    <AccountLinkContext.Provider value={{ mode, counts, chooseImport, chooseStartFresh }}>
      {children}
    </AccountLinkContext.Provider>
  )
}
