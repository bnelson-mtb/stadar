import { useEffect, useRef, useState } from 'react'
import useAuth from './useAuth.js'
import useAccountLink from './useAccountLink.js'
import { mergeFavorites } from '../utils/reconcile.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const { status, storageAdapter } = useAuth()
  const { mode } = useAccountLink()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [favorites, setFavorites] = useState(() => storageAdapter.readCache(STORAGE_KEY, []))
  const favoritesRef = useRef(favorites)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error

  const commit = next => {
    favoritesRef.current = next
    setFavorites(next)
  }

  // Reconcile with the shared link mode. The AccountLink provider owns the
  // linked flag and the import decision; this hook just applies the result.
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    if (mode === 'anonymous') {
      // Reset the UI to the (post-transfer, possibly empty) anonymous set.
      queueMicrotask(() => {
        if (!cancelled) commit(storageAdapter.readCache(STORAGE_KEY, []))
      })
      return () => { cancelled = true }
    }

    if (mode === 'wait') return () => { cancelled = true } // modal gating; hold the cache

    // merge | adopt — pull the server set.
    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setSyncStatus('idle'); return }

      if (mode === 'merge') {
        const merged = mergeFavorites(favoritesRef.current, remote)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          if (res.ok) {
            globalThis.localStorage.removeItem(STORAGE_KEY) // transfer = move
            setSyncStatus('synced')
          } else {
            setSyncStatus('error')
          }
        })
      } else {
        // adopt: server is authoritative; drop any local copy.
        commit(remote)
        globalThis.localStorage.removeItem(STORAGE_KEY)
        setSyncStatus('synced')
      }
    })
    return () => { cancelled = true }
  }, [mode, status, storageAdapter])

  function toggleFavorite(teamName) {
    const prev = favoritesRef.current
    const next = prev.includes(teamName)
      ? prev.filter(t => t !== teamName)
      : [...prev, teamName]

    commit(next) // optimistic
    setSyncStatus('syncing')
    storageAdapter.persist(STORAGE_KEY, next).then(res => {
      if (res.ok) {
        setSyncStatus('synced')
      } else {
        commit(prev) // roll back to the last confirmed set
        setSyncStatus('error')
      }
    })
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite, syncStatus }
}
