import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import useAuth from '@stadar/shared/hooks/useAuth.js'
import useFavorites from '@stadar/shared/hooks/useFavorites.js'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getAuthButtonCopy } from '@stadar/shared/copy/authButtonCopy.js'
import {
  DATA_USAGE_TITLE,
  GITHUB_URL,
  PROVIDER_NOTE,
  getAccountNotice,
  getFollowStats,
  getProfileIdentity,
} from '@stadar/shared/copy/profileCopy.js'
import { getTeamShortName } from '@stadar/shared/utils/eventDisplay.js'
import Button from '../components/Button.jsx'
import Dialog from '../components/Dialog.jsx'
import Shimmer from '../components/Shimmer.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import Txt from '../components/Txt.jsx'
import { ArrowRightIcon } from '../components/icons.jsx'
import { appDataUsageSections } from '../lib/dataUsage.js'
import { signInErrorMessage } from '../lib/signInCopy.js'
import { openWebPage } from '../lib/links.js'
import { openTeam } from '../lib/nav.js'
import { colors } from '../theme.js'

function GoogleMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
      <Path fill="#34A853" d="M12 21.67c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z" />
      <Path fill="#FBBC05" d="M6.54 13.74A5.85 5.85 0 0 1 6.24 12c0-.61.1-1.2.3-1.74V7.73H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.27l3.24-2.53Z" />
      <Path fill="#EA4335" d="M12 6.23c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.32 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.4l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </Svg>
  )
}

function AuthButton() {
  const { user, status, login, logout, signingIn } = useAuth()
  if (status === 'loading') return null
  const { label } = getAuthButtonCopy(status)
  const boxClass = 'min-h-10 flex-row items-center gap-2 rounded-xl border border-white/10 bg-night-800 px-3 py-2 active:bg-night-700'

  if (status === 'authenticated') {
    return (
      <Pressable onPress={logout} accessibilityRole="button" accessibilityLabel={`${label}${user?.email ? `, ${user.email}` : ''}`} className={boxClass}>
        <View className="h-5 w-5 items-center justify-center rounded-full bg-radar-400/15">
          <Txt className="text-[11px] text-radar-300">{user?.displayName?.charAt(0)?.toUpperCase() || '•'}</Txt>
        </View>
        <Txt className="font-sans-semibold text-xs text-ink-200">
          {label}{user?.displayName ? ` (${user.displayName})` : ''}
        </Txt>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={login} disabled={signingIn} accessibilityRole="button" accessibilityState={{ busy: signingIn }} className={boxClass}>
      {signingIn ? <ActivityIndicator size="small" color={colors.radar[400]} /> : <GoogleMark />}
      <Txt className="font-sans-semibold text-xs text-ink-100">{label}</Txt>
    </Pressable>
  )
}

function DataUsageDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <View className="border-b border-white/10 px-6 pb-4 pt-6">
        <Txt accessibilityRole="header" className="font-display text-[22px] uppercase leading-[26px] text-white">
          {DATA_USAGE_TITLE}
        </Txt>
      </View>
      <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 20 }}>
        {appDataUsageSections().map(section => (
          <View key={section.heading}>
            <Txt className="font-display text-xs uppercase tracking-[2.4px] text-radar-400">{section.heading}</Txt>
            <Txt className="mt-2 text-sm leading-[22px] text-ink-400">{section.body}</Txt>
          </View>
        ))}
        <Pressable
          onPress={() => openWebPage(GITHUB_URL)}
          accessibilityRole="link"
          className="flex-row items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 active:bg-white/10"
        >
          <Svg width={16} height={16} viewBox="0 0 16 16" fill={colors.ink[100]}>
            <Path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </Svg>
          <Txt className="font-sans-semibold text-xs text-ink-100">View the source on GitHub</Txt>
        </Pressable>
      </ScrollView>
      <View className="flex-row justify-end border-t border-white/10 px-6 py-4">
        <Button variant="ghost" label="Close" onPress={onClose} className="h-11" boxClassName="rounded-xl px-4" />
      </View>
    </Dialog>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { user, status, sessionExpired, signInError } = useAuth()
  const { favorites } = useFavorites()
  const { savedEvents } = useSavedEvents()
  const [dataDialogOpen, setDataDialogOpen] = useState(false)

  const identity = getProfileIdentity(status, user)
  const accountNotice = signInError === 'unavailable'
    ? signInErrorMessage(signInError)
    : getAccountNotice({ signedIn: identity.signedIn, signInFailed: signInError === 'failed', sessionExpired })
  const stats = getFollowStats(favorites.length, savedEvents.length)
  const isLoading = status === 'loading'

  return (
    <View className="flex-1 bg-night-950" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-xl self-center px-[18px] pb-3 pt-[18px]">
        <Txt accessibilityRole="header" className="font-display text-[30px] uppercase leading-[34px] text-white">Profile</Txt>
      </View>

      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 576, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 24, gap: 24 }}>
        <View>
          <View className="rounded-[14px] border border-white/5 bg-night-900 p-[18px]">
            {isLoading ? (
              <Shimmer className="h-20 rounded-xl bg-white/[.04]" />
            ) : (
              <>
                <View className="flex-row items-start gap-4">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full border ${
                      identity.signedIn ? 'border-radar-400/30 bg-radar-400/15' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Txt className={`font-display text-xl ${identity.signedIn ? 'text-radar-300' : 'text-ink-500'}`}>
                      {identity.initial}
                    </Txt>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Txt numberOfLines={1} className="font-sans-semibold text-base text-white">{identity.heading}</Txt>
                    {identity.subheading ? (
                      <Txt className="mt-1 text-[13px] leading-[21px] text-ink-400">{identity.subheading}</Txt>
                    ) : null}
                    <Txt className="mt-2 font-sans-semibold text-[10px] uppercase tracking-[1.6px] text-ink-500">{stats}</Txt>
                  </View>
                </View>

                <View className="mt-5 flex-row flex-wrap items-center gap-3">
                  <AuthButton />
                  {!identity.signedIn ? <Txt className="text-xs text-ink-500">{PROVIDER_NOTE}</Txt> : null}
                </View>
                {accountNotice ? (
                  <Txt accessibilityLiveRegion="polite" className="mt-3 text-xs text-rose-400">{accountNotice}</Txt>
                ) : null}
              </>
            )}
          </View>

          <Pressable
            onPress={() => setDataDialogOpen(true)}
            accessibilityRole="button"
            className="mt-3 flex-row items-center gap-1.5 self-start py-1"
          >
            <Txt className="font-sans-medium text-[13px] text-ink-400">{DATA_USAGE_TITLE}</Txt>
            <ArrowRightIcon size={14} strokeWidth={2} color={colors.ink[400]} />
          </Pressable>
        </View>

        <View>
          <View className="mb-2.5 flex-row items-center justify-between">
            <Txt accessibilityRole="header" className="font-display text-[11px] uppercase tracking-[2.2px] text-ink-400">Your teams</Txt>
            {favorites.length > 0 ? (
              <Pressable onPress={() => router.navigate('/teams')} accessibilityRole="link" hitSlop={8}>
                <Txt className="font-sans-medium text-[11px] text-radar-400">See all</Txt>
              </Pressable>
            ) : null}
          </View>
          {favorites.length === 0 ? (
            <Txt className="text-sm text-ink-500">Follow teams on the Discover page and they’ll show up here.</Txt>
          ) : (
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
              {favorites.map(team => (
                <View key={team} style={{ width: '33.333%', padding: 5 }}>
                  <Pressable
                    onPress={() => openTeam(team)}
                    accessibilityRole="button"
                    accessibilityLabel={team}
                    className="items-center gap-2 rounded-[14px] border border-white/5 bg-night-900 px-2 py-4 active:bg-night-800"
                  >
                    <TeamLogo name={team} size={40} />
                    <Txt numberOfLines={1} className="w-full text-center font-sans-semibold text-[11px] text-ink-200">
                      {getTeamShortName(team)}
                    </Txt>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <DataUsageDialog open={dataDialogOpen} onClose={() => setDataDialogOpen(false)} />
    </View>
  )
}
