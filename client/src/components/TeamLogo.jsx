import { useState } from 'react'
import { getTeamData } from '../data/teams'

function TeamLogo({ name, size = 'small' }) {
  const [imgError, setImgError] = useState(false)
  if (!name) return null

  const team = getTeamData(name)
  const bg = team?.color || '#6B7280'
  const logoUrl = team?.logo

  const sizeClasses = {
    small: 'w-7 h-7 text-[10px]',
    large: 'w-16 h-16 text-sm'
  }

  const logoClasses = {
    small: 'w-7 h-7',
    large: 'w-16 h-16'
  }

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${logoClasses[size]} object-contain shrink-0`}
        onError={() => setImgError(true)}
      />
    )
  }

  const words = name.trim().split(/\s+/);
  const initials = words.length === 1
    ? words[0].slice(0, 3).toUpperCase()
    : words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  return (
    <div
      className={`${sizeClasses[size]} rounded-full ring-1 ring-white/15 flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  )
}

export default TeamLogo
