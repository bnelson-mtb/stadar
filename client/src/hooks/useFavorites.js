import { useEffect, useRef, useState } from 'react'
import useAuth from './useAuth.js'
import { mergeFavorites } from '../utils/reconcile.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const { status, user, storageAdapter } = useAuth()

  // Instant paint from cache — the anonymous path never shows a spinner.
  const [favorites, setFavorites] = useState(() => storageAdapter.readCache(STORAGE_KEY, []))
  const favoritesRef = useRef(favorites)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error

  const commit = next => {
    favoritesRef.current = next
    setFavorites(next)
  }

  // Hydrate from the server when signed in. Anonymous → fetchRemote returns
  // null and this is a no-op. First login (not yet linked) → one-time union of
  // local + server (auto-import). Already linked → server is authoritative.
  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    let cancelled = false
    const linkedKey = `stadar-linked-${user.id}`
    const alreadyLinked = globalThis.localStorage.getItem(linkedKey) === 'true'

    // Background hydrate resolves syncStatus directly (no synchronous 'syncing'
    // set here — that would trigger a cascading render, and no UI observes the
    // hydrate transient; the user-initiated toggle shows 'syncing' on its own).
    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setSyncStatus('idle'); return }

      if (alreadyLinked) {
        commit(remote)
        storageAdapter.writeCache(STORAGE_KEY, remote)
        setSyncStatus('synced')
      } else {
        const merged = mergeFavorites(favoritesRef.current, remote)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          setSyncStatus(res.ok ? 'synced' : 'error')
          if (res.ok) globalThis.localStorage.setItem(linkedKey, 'true')
        })
      }
    })
    return () => { cancelled = true }
  }, [status, user, storageAdapter])

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
