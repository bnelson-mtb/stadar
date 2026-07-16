import { useState } from 'react'
import { storageAdapter } from '../utils/storageAdapter.js'

const STORAGE_KEY = 'stadar-favorites'

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => storageAdapter.load(STORAGE_KEY, []))

  function toggleFavorite(teamName) {
    setFavorites(prev => {
      const next = prev.includes(teamName)
        ? prev.filter(t => t !== teamName)
        : [...prev, teamName]
      storageAdapter.save(STORAGE_KEY, next)
      return next
    })
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite }
}
