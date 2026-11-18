import { useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useFavorites from '@stadar/shared/hooks/useFavorites.js'
import useGames from '@stadar/shared/hooks/useGames.js'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { getStateName, readStoredStateCode } from '@stadar/shared/data/usStates.js'
import { getDayLabel, getTeamShortName, isToday } from '@stadar/shared/utils/eventDisplay.js'
import { getNextGameForTeam } from '@stadar/shared/utils/feedFilters.js'
import { getOpponentName, groupSavedByTeam } from '@stadar/shared/utils/savedHelpers.js'
import Button from '../components/Button.jsx'
import { EmptyState } from '../components/common.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import Txt from '../components/Txt.jsx'
import { ChevronRightIcon } from '../components/icons.jsx'
import { openTeam } from '../lib/nav.js'
import { colors } from '../theme.js'

function nextGameLabel(game, teamName) {
  const day = getDayLabel(game.localDate, { localTime: game.localTime })
  const opponent = getOpponentName(game, teamName)
  if (!opponent) return day
  const side = getCanonicalTeamName(game.homeTeam) === teamName ? 'vs' : 'at'
  return `${day} ${side} ${getTeamShortName(opponent)}`
}

// Re-reads the state Discover last showed each time the tab comes into view
// (tabs stay mounted on the phone, unlike web pages).
function useStoredStateCode() {
  const [stateCode, setStateCode] = useState(readStoredStateCode)
  useFocusEffect(() => {
    const latest = readStoredStateCode()
    if (latest !== stateCode) setStateCode(latest)
  })
  return stateCode
}

// Followed teams: each one's next game (from the selected state's feed and
// saved games) and how many of its games are saved.
export default function TeamsScreen() {
  const insets = useSafeAreaInsets()
  const { favorites } = useFavorites()
  const { savedEvents } = useSavedEvents()
  const stateCode = useStoredStateCode()
  const { events, loading } = useGames(favorites.length > 0 ? stateCode : null)

  const savedByTeam = groupSavedByTeam(savedEvents, favorites)
  const knownGames = useMemo(() => [...events, ...savedEvents.map(record => record.event)], [events, savedEvents])

  return (
    <View className="flex-1 bg-night-950" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-xl self-center px-[18px] pb-3 pt-[18px]">
        <Txt accessibilityRole="header" className="font-display text-[30px] uppercase leading-[34px] text-white">Teams</Txt>
        <Txt className="mt-1.5 text-xs text-ink-400">
          {favorites.length} followed{favorites.length > 0 ? ` · schedules for ${getStateName(stateCode)}` : ''}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 576, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 24 }}>
        {favorites.length === 0 ? (
          <EmptyState title="No teams yet" body="Follow teams on the Discover page to see them here.">
            <Button label="Find teams" onPress={() => router.navigate('/')} className="h-10" boxClassName="rounded-xl px-5" textClassName="text-[13px]" />
          </EmptyState>
        ) : (
          <View className="gap-2">
            {favorites.map(team => {
              const nextGame = getNextGameForTeam(knownGames, team)
              const playsToday = Boolean(nextGame) && isToday(nextGame.localDate)
              let label = `No games on the radar in ${getStateName(stateCode)}`
              if (nextGame) label = nextGameLabel(nextGame, team)
              else if (loading) label = 'Checking the schedule...'
              const savedCount = savedByTeam[team]?.length ?? 0

              return (
                <Pressable
                  key={team}
                  onPress={() => openTeam(team)}
                  accessibilityRole="button"
                  accessibilityLabel={`${team}. ${label}. ${savedCount} saved`}
                  className="flex-row items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5 active:bg-night-800"
                >
                  <TeamLogo name={team} size={34} />
                  <View className="min-w-0 flex-1">
                    <Txt numberOfLines={1} className="font-sans-semibold text-sm text-white">{team}</Txt>
                    <Txt
                      numberOfLines={1}
                      className={`mt-[3px] text-[11px] ${playsToday ? 'font-sans-semibold text-radar-400' : 'text-ink-400'}`}
                    >
                      {label}
                    </Txt>
                  </View>
                  <View className="items-end">
                    <Txt className="font-display text-[17px] leading-[20px] text-ink-200">{savedCount}</Txt>
                    <Txt className="mt-[3px] text-[10px] text-ink-500">saved</Txt>
                  </View>
                  <ChevronRightIcon size={16} color={colors.ink[600]} />
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
