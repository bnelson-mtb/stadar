import { Pressable, View } from 'react-native'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Txt from '../../components/Txt.jsx'
import { BookmarkIcon, SearchIcon, UserCircleIcon, UserGroupIcon } from '../../components/icons.jsx'
import { colors } from '../../theme.js'

const TABS = {
  index: { label: 'Discover', Icon: SearchIcon },
  teams: { label: 'Teams', Icon: UserGroupIcon },
  saved: { label: 'Saved', Icon: BookmarkIcon, fillWhenActive: true },
  profile: { label: 'Profile', Icon: UserCircleIcon },
}

// The web's bottom nav: Discover / Teams / Saved / Profile.
function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      className="border-t border-white/[.06] bg-night-950"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="w-full max-w-xl flex-row justify-between self-center px-6 pt-2.5">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name]
          if (!tab) return null
          const focused = state.index === index
          const color = focused ? colors.radar[400] : colors.ink[500]
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
          }
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              className="w-16 items-center gap-[5px]"
              hitSlop={6}
            >
              <tab.Icon
                size={21}
                color={color}
                strokeWidth={tab.fillWhenActive && focused ? 1.5 : 1.7}
                filled={Boolean(tab.fillWhenActive && focused)}
              />
              <Txt
                className={`font-sans-semibold text-[10px] tracking-[0.6px] ${focused ? 'text-radar-400' : 'text-ink-500'}`}
              >
                {tab.label}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.night[950] } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="teams" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
