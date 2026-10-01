import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import NotesSheet from '../components/NotesSheet.jsx'
import SavedEventRow from '../components/SavedEventRow.jsx'
import SavedScoreCard from '../components/SavedScoreCard.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getSavedSummary, partitionByTime, splitUpcomingByWeek } from '../utils/savedHelpers.js'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Been there' },
]

function GroupHeading({ children }) {
  return (
    <h2 className="mb-2.5 font-display text-[11px] uppercase tracking-[.2em] text-ink-400">{children}</h2>
  )
}

export default function SavedPage() {
  const { savedEvents, updateMetadata, persistenceStatus } = useSavedEvents()
  const [searchParams, setSearchParams] = useSearchParams()
  const [notesEventId, setNotesEventId] = useState(null)

  // The tab lives in the URL so "back" from a game lands on the same tab.
  const tab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming'
  const setTab = value => setSearchParams(value === 'past' ? { tab: 'past' } : {}, { replace: true })

  const { upcoming, past } = partitionByTime(savedEvents)
  const { thisWeek, later } = splitUpcomingByWeek(upcoming)
  const soonestId = upcoming[0]?.event.id
  const notesRecord = savedEvents.find(record => record.event.id === notesEventId) ?? null

  const upcomingGroups = [
    { label: 'This week', records: thisWeek },
    { label: 'Later', records: later },
  ].filter(group => group.records.length > 0)

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header className="mx-auto max-w-xl px-[18px] pb-3 pt-[18px]">
        <h1 className="font-display text-[30px] uppercase leading-none text-white">Saved</h1>
        <p className="mt-1.5 text-xs text-ink-400">{getSavedSummary(upcoming.length, past.length)}</p>
        <SegmentedControl
          className="mt-4"
          label="Saved games"
          options={TABS}
          value={tab}
          onChange={setTab}
        />
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-5 px-[18px] pb-6 pt-1.5">
        {tab === 'upcoming' && (
          upcomingGroups.length === 0 ? (
            <EmptyState title="Nothing coming up" body="No upcoming saved events.">
              <Link to="/" className="text-xs font-semibold text-radar-400 hover:text-radar-300">
                Find a game on Discover
              </Link>
            </EmptyState>
          ) : (
            upcomingGroups.map(group => (
              <section key={group.label}>
                <GroupHeading>{group.label}</GroupHeading>
                <div className="flex flex-col gap-2">
                  {group.records.map(record => (
                    <SavedEventRow
                      key={record.event.id}
                      record={record}
                      highlight={record.event.id === soonestId}
                    />
                  ))}
                </div>
              </section>
            ))
          )
        )}

        {tab === 'past' && (
          past.length === 0 ? (
            <EmptyState title="No games logged yet" body="Saved games land here once they've been played, ready for a score and a note." />
          ) : (
            <section>
              <div className="flex flex-col gap-2">
                {past.map(record => (
                  <SavedScoreCard
                    key={record.event.id}
                    record={record}
                    onEditNotes={() => setNotesEventId(record.event.id)}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </main>

      <NotesSheet
        record={notesRecord}
        onClose={() => setNotesEventId(null)}
        onUpdate={updateMetadata}
        persistenceStatus={persistenceStatus}
      />
    </div>
  )
}
