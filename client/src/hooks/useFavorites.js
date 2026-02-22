import { useState } from 'react'

const STORAGE_KEY = 'stadar-favorites'

function loadFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites)

  function toggleFavorite(teamName) {
    setFavorites(prev => {
      const next = prev.includes(teamName)
        ? prev.filter(t => t !== teamName)
        : [...prev, teamName]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function isFavorite(teamName) {
    return favorites.includes(teamName)
  }

  return { favorites, toggleFavorite, isFavorite }
}
