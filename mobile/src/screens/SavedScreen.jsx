import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useSavedEvents from '@stadar/shared/hooks/useSavedEvents.js'
import { getSavedSummary, partitionByTime, splitUpcomingByWeek } from '@stadar/shared/utils/savedHelpers.js'
import { EmptyState, GroupHeading, SegmentedControl } from '../components/common.jsx'
import { NotesSheet } from '../components/detail.jsx'
import { SavedEventRow, SavedScoreCard } from '../components/saved.jsx'
import Txt from '../components/Txt.jsx'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Been there' },
]

export default function SavedScreen() {
  const insets = useSafeAreaInsets()
  const { savedEvents, updateMetadata, persistenceStatus } = useSavedEvents()
  const [tab, setTab] = useState('upcoming')
  const [notesEventId, setNotesEventId] = useState(null)

  const { upcoming, past } = partitionByTime(savedEvents)
  const { thisWeek, later } = splitUpcomingByWeek(upcoming)
  const soonestId = upcoming[0]?.event.id
  const notesRecord = savedEvents.find(record => record.event.id === notesEventId) ?? null
  const upcomingGroups = [
    { label: 'This week', records: thisWeek },
    { label: 'Later', records: later },
  ].filter(group => group.records.length > 0)

  return (
    <View className="flex-1 bg-night-950" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-xl self-center px-[18px] pb-3 pt-[18px]">
        <Txt accessibilityRole="header" className="font-display text-[30px] uppercase leading-[34px] text-white">Saved</Txt>
        <Txt className="mt-1.5 text-xs text-ink-400">{getSavedSummary(upcoming.length, past.length)}</Txt>
        <SegmentedControl className="mt-4" label="Saved games" options={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 576, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 24, gap: 20 }}>
        {tab === 'upcoming' ? (
          upcomingGroups.length === 0 ? (
            <EmptyState title="Nothing coming up" body="No upcoming saved events.">
              <Pressable onPress={() => router.navigate('/')} accessibilityRole="link" hitSlop={8}>
                <Txt className="font-sans-semibold text-xs text-radar-400">Find a game on Discover</Txt>
              </Pressable>
            </EmptyState>
          ) : (
            upcomingGroups.map(group => (
              <View key={group.label}>
                <GroupHeading>{group.label}</GroupHeading>
                <View className="gap-2">
                  {group.records.map(record => (
                    <SavedEventRow key={record.event.id} record={record} highlight={record.event.id === soonestId} />
                  ))}
                </View>
              </View>
            ))
          )
        ) : past.length === 0 ? (
          <EmptyState
            title="No games logged yet"
            body="Saved games land here once they've been played, ready for a score and a note."
          />
        ) : (
          <View className="gap-2">
            {past.map(record => (
              <SavedScoreCard key={record.event.id} record={record} onEditNotes={() => setNotesEventId(record.event.id)} />
            ))}
          </View>
        )}
      </ScrollView>

      <NotesSheet
        record={notesRecord}
        onClose={() => setNotesEventId(null)}
        onUpdate={updateMetadata}
        persistenceStatus={persistenceStatus}
      />
    </View>
  )
}
