import { useState } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { getTeamData } from '@stadar/shared/data/teams.js'
import Txt from './Txt.jsx'

const NAMED_SIZES = { small: 28, large: 64 }

// The team's logo from the manifest (PNG, SVG or WebP), or its initials on
// the team colour when there is no logo or it fails to load.
export default function TeamLogo({ name, size = 'small', style }) {
  const [failedUrl, setFailedUrl] = useState(null)
  if (!name) return null

  const team = getTeamData(name)
  const px = typeof size === 'number' ? size : NAMED_SIZES[size] ?? NAMED_SIZES.small
  const logoUrl = team?.logo

  if (logoUrl && failedUrl !== logoUrl) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={[{ width: px, height: px }, style]}
        contentFit="contain"
        accessibilityLabel={name}
        cachePolicy="memory-disk"
        transition={120}
        onError={() => setFailedUrl(logoUrl)}
      />
    )
  }

  const words = name.trim().split(/\s+/)
  const initials = words.length === 1
    ? words[0].slice(0, 3).toUpperCase()
    : words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
  return (
    <View
      accessibilityLabel={name}
      style={[{
        width: px,
        height: px,
        borderRadius: px / 2,
        backgroundColor: team?.color || '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
      }, style]}
    >
      <Txt
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        allowFontScaling={false}
        className="font-sans-bold text-white"
        style={{ fontSize: Math.max(8, Math.round(px * 0.34)), maxWidth: px * 0.86, textAlign: 'center' }}
      >
        {initials}
      </Txt>
    </View>
  )
}
