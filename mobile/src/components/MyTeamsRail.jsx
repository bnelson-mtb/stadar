import { Pressable, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { getDayLabel, getTeamShortName, isToday } from '@stadar/shared/utils/eventDisplay.js'
import { getNextGameForTeam } from '@stadar/shared/utils/feedFilters.js'
import { colors } from '../theme.js'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { PlusIcon } from './icons.jsx'

function TeamTile({ team, nextGame, selected, onSelect }) {
  const playsToday = Boolean(nextGame) && isToday(nextGame.localDate)
  const label = nextGame ? getDayLabel(nextGame.localDate, { localTime: nextGame.localTime }) : 'No games'

  let tileStyle = 'border-white/[.06] bg-night-900'
  if (playsToday) tileStyle = 'border-radar-400/30 bg-night-800'
  if (selected) tileStyle = 'border-radar-400 bg-radar-400/10'

  return (
    <Pressable
      onPress={() => onSelect(team)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${team}, ${label}. ${selected ? 'Showing only their games' : 'Show only their games'}`}
      className={`w-[76px] items-center gap-1.5 rounded-[14px] border px-2 py-[11px] active:opacity-85 ${tileStyle}`}
    >
      <TeamLogo name={team} size={30} />
      <Txt numberOfLines={1} className="w-full text-center font-sans-semibold text-[10px] text-ink-100">
        {getTeamShortName(team)}
      </Txt>
      <Txt
        numberOfLines={1}
        className={playsToday
          ? 'font-sans-semibold text-[9px] uppercase tracking-[0.7px] text-radar-400'
          : 'font-sans-medium text-[9px] tracking-[0.5px] text-ink-500'}
      >
        {label}
      </Txt>
    </Pressable>
  )
}

// Followed teams with each one's next game in the feed. Tapping a tile filters
// the list to that team; tapping it again clears the filter.
export default function MyTeamsRail({ favorites, events, selectedTeam, onSelectTeam, onFollow }) {
  return (
    <View>
      <View className="mb-2.5 flex-row items-center justify-between">
        <Txt accessibilityRole="header" className="font-display text-xs uppercase tracking-[2.4px] text-ink-400">
          My teams
        </Txt>
        <Pressable onPress={() => router.navigate('/teams')} accessibilityRole="link" hitSlop={8}>
          <Txt className="font-sans-medium text-[11px] text-radar-400">Manage</Txt>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -18 }}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
      >
        {favorites.map(team => (
          <TeamTile
            key={team}
            team={team}
            nextGame={getNextGameForTeam(events, team)}
            selected={selectedTeam === team}
            onSelect={onSelectTeam}
          />
        ))}

        <Pressable
          onPress={onFollow}
          accessibilityRole="button"
          accessibilityLabel="Follow teams"
          className="min-h-[86px] w-[76px] items-center justify-center gap-[5px] rounded-[14px] border border-dashed border-white/[.12] active:border-white/25"
        >
          <PlusIcon size={20} color={colors.ink[500]} />
          <Txt className="font-sans-semibold text-[9px] tracking-[0.5px] text-ink-500">Follow</Txt>
        </Pressable>

        {favorites.length === 0 ? (
          <Txt className="max-w-[210px] self-center text-xs leading-[19px] text-ink-500">
            Follow teams to see their next game here.
          </Txt>
        ) : null}
      </ScrollView>
    </View>
  )
}
