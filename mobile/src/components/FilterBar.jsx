import { Pressable, TextInput, View } from 'react-native'
import { colors } from '../theme.js'
import Txt from './Txt.jsx'
import { SearchIcon, XMarkIcon } from './icons.jsx'

function GroupLabel({ children }) {
  return (
    <Txt className="mb-2.5 font-sans-bold text-[10px] uppercase tracking-[1.6px] text-ink-500">{children}</Txt>
  )
}

function Chip({ selected, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`rounded-full border px-3 py-1.5 ${
        selected ? 'border-transparent bg-radar-400' : 'border-white/[.08] bg-night-800 active:border-white/20'
      }`}
    >
      <Txt className={`text-xs ${selected ? 'font-sans-semibold text-night-950' : 'font-sans-medium text-ink-200'}`}>
        {children}
      </Txt>
    </Pressable>
  )
}

// A search box with a leading magnifier and an optional clear button.
export function SearchField({ value, onChange, placeholder, label, clearable = true }) {
  return (
    <View className="h-11 flex-row items-center rounded-xl border border-white/[.08] bg-night-800 pl-3.5 pr-1">
      <SearchIcon size={16} strokeWidth={2} color={colors.ink[500]} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.ink[500]}
        accessibilityLabel={label}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        className="ml-2.5 h-full flex-1 font-sans text-[15px] text-ink-100"
        style={{ paddingVertical: 0 }}
      />
      {clearable && value ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="h-8 w-8 items-center justify-center"
        >
          <XMarkIcon size={16} color={colors.ink[500]} />
        </Pressable>
      ) : null}
    </View>
  )
}

// On/off switch row in the web's style.
export function SwitchRow({ label, value, onToggle }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="flex-row items-center justify-between gap-4 rounded-[14px] border border-white/[.06] bg-night-800 px-4 py-3 active:opacity-85"
    >
      <Txt className="flex-1 font-sans-medium text-sm text-ink-100">{label}</Txt>
      <View className={`h-6 w-10 rounded-full ${value ? 'bg-radar-400' : 'bg-white/10'}`}>
        <View
          className={`absolute top-1 h-4 w-4 rounded-full ${value ? 'bg-night-950' : 'bg-ink-400'}`}
          style={{ left: value ? 20 : 4 }}
        />
      </View>
    </Pressable>
  )
}

// Search, "my teams only" and the sport/league chips. Lives in Discover's
// filter sheet, out of the main scroll.
export default function FilterBar({
  sports = [],
  leagues = [],
  selectedSports,
  onToggleSport,
  selectedLeagues,
  onToggleLeague,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  hasFavorites,
  searchQuery,
  onSearchChange,
}) {
  return (
    <View className="gap-6">
      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search teams, cities, venues..."
        label="Search teams, cities, or venues"
      />

      {hasFavorites ? (
        <View>
          <GroupLabel>My teams</GroupLabel>
          <SwitchRow label="Only games with teams I follow" value={showFavoritesOnly} onToggle={onToggleFavoritesOnly} />
        </View>
      ) : null}

      {sports.length > 0 ? (
        <View>
          <GroupLabel>Sport</GroupLabel>
          <View className="flex-row flex-wrap gap-2">
            {sports.map(sport => (
              <Chip key={sport} selected={selectedSports.includes(sport)} onPress={() => onToggleSport(sport)}>
                {sport}
              </Chip>
            ))}
          </View>
        </View>
      ) : null}

      {leagues.length > 0 ? (
        <View>
          <GroupLabel>League</GroupLabel>
          <View className="flex-row flex-wrap gap-2">
            {leagues.map(league => (
              <Chip key={league} selected={selectedLeagues.includes(league)} onPress={() => onToggleLeague(league)}>
                {league}
              </Chip>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}
