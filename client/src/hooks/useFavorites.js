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

  // Reconcile with auth state. Anonymous → show the local set (empty once
  // favorites have been transferred to an account). Signed in → hydrate from
  // the server: first login unions local + server then deletes the local copy
  // (transfer = move); an already-linked device is server-authoritative. While
  // signed in, favorites live in memory + the account, never in localStorage.
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    if (status !== 'authenticated' || !user) {
      // Deferred so it isn't a synchronous setState inside the effect. Resets
      // the UI to the anonymous set on sign-out.
      queueMicrotask(() => {
        if (!cancelled) commit(storageAdapter.readCache(STORAGE_KEY, []))
      })
      return () => { cancelled = true }
    }

    const linkedKey = `stadar-linked-${user.id}`
    const alreadyLinked = globalThis.localStorage.getItem(linkedKey) === 'true'

    // syncStatus resolves in the async callbacks (no synchronous 'syncing' set
    // here — that would trigger a cascading render, and no UI observes the
    // hydrate transient; the user-initiated toggle shows 'syncing' on its own).
    storageAdapter.fetchRemote(STORAGE_KEY, []).then(remote => {
      if (cancelled) return
      if (remote === null) { setSyncStatus('idle'); return }

      if (alreadyLinked) {
        commit(remote)
        setSyncStatus('synced')
      } else {
        const merged = mergeFavorites(favoritesRef.current, remote)
        commit(merged)
        storageAdapter.persist(STORAGE_KEY, merged).then(res => {
          if (cancelled) return
          if (res.ok) {
            globalThis.localStorage.setItem(linkedKey, 'true')
            globalThis.localStorage.removeItem(STORAGE_KEY) // transfer = move
            setSyncStatus('synced')
          } else {
            setSyncStatus('error')
          }
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
