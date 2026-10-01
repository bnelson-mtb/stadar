import { useState } from 'react'
import { getTeamData } from '../data/teams'

const NAMED_SIZES = {
  small: 28,
  large: 64,
}

// `size` is a pixel size or one of the legacy names ('small' | 'large').
function TeamLogo({ name, size = 'small', className = '' }) {
  const [imgError, setImgError] = useState(false)
  if (!name) return null

  const team = getTeamData(name)
  const bg = team?.color || '#6B7280'
  const logoUrl = team?.logo
  const px = typeof size === 'number' ? size : NAMED_SIZES[size] ?? NAMED_SIZES.small
  const box = { width: px, height: px }

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`shrink-0 object-contain ${className}`}
        style={box}
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
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-white/15 ${className}`}
      style={{ ...box, backgroundColor: bg, fontSize: Math.max(8, Math.round(px * 0.34)) }}
      title={name}
    >
      {initials}
    </div>
  )
}

export default TeamLogo
