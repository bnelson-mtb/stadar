import { useEffect } from 'react'
import useAuth from '@stadar/shared/hooks/useAuth.js'
import useAccountLink from '@stadar/shared/hooks/useAccountLink.js'
import { effectiveLinkMode } from '@stadar/shared/utils/accountLink.js'
import { collections } from '@stadar/shared/utils/collections.js'

// Keeps the app-wide collections pointed at the right backing store: the
// local cache while signed out, the account once signed in and linked.
// Renders nothing.
export default function CollectionSync() {
  const { status, storageAdapter, handleUnauthorized } = useAuth()
  const { mode } = useAccountLink()

  useEffect(() => {
    // Until sign-in resolves the collections stay on the local cache.
    if (status === 'loading') return
    for (const store of collections) {
      store.configure({
        adapter: storageAdapter,
        mode: effectiveLinkMode(status, mode),
        onUnauthorized: handleUnauthorized,
      })
    }
  }, [status, mode, storageAdapter, handleUnauthorized])

  // Leaving the tab: send anything still waiting out a typing pause.
  // Coming back: pick up changes made on another device.
  useEffect(() => {
    const onVisibilityChange = () => {
      for (const store of collections) {
        if (document.visibilityState === 'visible') store.refresh()
        else store.flush()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
