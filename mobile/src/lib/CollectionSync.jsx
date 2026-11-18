import { useEffect } from 'react'
import { AppState } from 'react-native'
import useAuth from '@stadar/shared/hooks/useAuth.js'
import useAccountLink from '@stadar/shared/hooks/useAccountLink.js'
import { effectiveLinkMode } from '@stadar/shared/utils/accountLink.js'
import { collections } from '@stadar/shared/utils/collections.js'

// Keeps the app-wide collections pointed at the right backing store (the web
// CollectionSync, with the app's foreground/background in place of tab
// visibility). Renders nothing.
export default function CollectionSync() {
  const { status, storageAdapter, handleUnauthorized } = useAuth()
  const { mode } = useAccountLink()

  useEffect(() => {
    if (status === 'loading') return
    for (const store of collections) {
      store.configure({
        adapter: storageAdapter,
        mode: effectiveLinkMode(status, mode),
        onUnauthorized: handleUnauthorized,
      })
    }
  }, [status, mode, storageAdapter, handleUnauthorized])

  // Going to the background: send anything still waiting out a typing pause.
  // Coming back: pick up changes made on another device.
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      for (const store of collections) {
        if (next === 'active') store.refresh()
        else if (next === 'background' || next === 'inactive') store.flush()
      }
    })
    return () => sub.remove()
  }, [])

  return null
}
