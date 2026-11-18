import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { sanitizeScoreInput } from '@stadar/shared/utils/eventDetailState.js'
import { formatLongDate } from '@stadar/shared/utils/eventDisplay.js'
import { openWebPage } from '../lib/links.js'
import { colors } from '../theme.js'
import Button from './Button.jsx'
import { MicroLabel } from './common.jsx'
import Sheet from './Sheet.jsx'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { ChevronDownIcon } from './icons.jsx'

export function CollapsibleSection({ title, subtitle, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 150 }) }],
  }))

  return (
    <View className="overflow-hidden rounded-[14px] border border-white/[.06] bg-night-900">
      <Pressable
        onPress={() => setIsOpen(open => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        className="flex-row items-center justify-between gap-4 px-4 py-[15px] active:bg-white/[.03]"
      >
        <View className="min-w-0 flex-1">
          <Txt className="font-display text-xs uppercase tracking-[2.2px] text-white">{title}</Txt>
          {subtitle ? <Txt numberOfLines={1} className="mt-1 text-xs text-ink-400">{subtitle}</Txt> : null}
        </View>
        <Animated.View style={chevron}>
          <ChevronDownIcon size={16} color={colors.ink[500]} />
        </Animated.View>
      </Pressable>
      {isOpen ? <View className="border-t border-white/[.06] p-4">{children}</View> : null}
    </View>
  )
}

const inputClass = 'rounded-xl border border-white/[.08] bg-night-800 font-sans text-white'

function ScoreInput({ value, onChange, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      accessibilityLabel={label}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={3}
      selectTextOnFocus
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`h-12 w-14 text-center font-sans-bold text-2xl ${inputClass} ${focused ? 'border-radar-400' : ''}`}
      style={{ paddingVertical: 0 }}
    />
  )
}

// Final score (played games with two teams) and free-text notes for a saved
// event. Edits go straight to the saved-events store.
export function GameNotesSection({ record, homeTeamName, awayTeamName, showScore, persistenceStatus, onUpdate }) {
  const [notesFocused, setNotesFocused] = useState(false)
  const homeScore = record?.score?.home ?? ''
  const awayScore = record?.score?.away ?? ''
  const notes = record?.notes ?? ''
  const statusCopy = {
    saving: 'Saving…',
    saved: 'Autosaved',
    error: 'Could not save. Your latest changes may be lost if you leave this screen.',
  }[persistenceStatus] ?? 'Saving…'

  function updateScore(side, value) {
    const sanitized = sanitizeScoreInput(value)
    if (sanitized === null) return
    onUpdate({
      score: {
        home: side === 'home' ? sanitized : homeScore,
        away: side === 'away' ? sanitized : awayScore,
      },
    })
  }

  return (
    <View className="gap-5">
      {showScore ? (
        <View>
          <Txt className="mb-3 font-sans-semibold text-sm text-ink-200">Final score</Txt>
          <View className="flex-row items-center gap-2">
            <View className="min-w-0 flex-1 items-center gap-1.5">
              <TeamLogo name={homeTeamName} />
              <Txt numberOfLines={2} className="text-center font-sans-semibold text-[11px] leading-[14px] text-ink-200">
                {homeTeamName || 'Home team'}
              </Txt>
            </View>
            <View className="flex-row items-center gap-2">
              <ScoreInput value={homeScore} onChange={v => updateScore('home', v)} label={`${homeTeamName || 'Home team'} score`} />
              <Txt className="font-sans-bold text-lg text-ink-500">–</Txt>
              <ScoreInput value={awayScore} onChange={v => updateScore('away', v)} label={`${awayTeamName || 'Away team'} score`} />
            </View>
            <View className="min-w-0 flex-1 items-center gap-1.5">
              <TeamLogo name={awayTeamName} />
              <Txt numberOfLines={2} className="text-center font-sans-semibold text-[11px] leading-[14px] text-ink-200">
                {awayTeamName || 'Away team'}
              </Txt>
            </View>
          </View>
        </View>
      ) : null}

      <View>
        <Txt className="mb-2 font-sans-semibold text-sm text-ink-200">Notes</Txt>
        <TextInput
          value={notes}
          onChangeText={text => onUpdate({ notes: text })}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Notes"
          placeholder="Add memories, highlights, or anything you want to remember..."
          placeholderTextColor={colors.ink[500]}
          onFocus={() => setNotesFocused(true)}
          onBlur={() => setNotesFocused(false)}
          className={`min-h-[120px] px-3 py-2.5 text-[15px] leading-[21px] ${inputClass} ${notesFocused ? 'border-radar-400' : ''}`}
        />
      </View>

      <Txt
        accessibilityLiveRegion="polite"
        className={`text-xs ${persistenceStatus === 'error' ? 'text-rose-400' : 'text-ink-500'}`}
      >
        {statusCopy}
      </Txt>
    </View>
  )
}

// The notes editor (final score + notes) in a sheet, so a played game can be
// logged straight from the Saved and team screens.
export function NotesSheet({ record, onClose, onUpdate, persistenceStatus }) {
  const event = record?.event
  const homeTeamName = getCanonicalTeamName(event?.homeTeam)
  const awayTeamName = getCanonicalTeamName(event?.awayTeam)
  const matchup = awayTeamName ? `${homeTeamName} vs ${awayTeamName}` : homeTeamName || event?.name
  const subtitle = [matchup, formatLongDate(event?.localDate)].filter(Boolean).join(' · ')

  return (
    <Sheet
      open={Boolean(record)}
      onClose={onClose}
      title="Game notes"
      subtitle={subtitle}
      footer={<Button label="Done" onPress={onClose} className="h-12" />}
    >
      {record ? (
        <GameNotesSection
          record={record}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          showScore={Boolean(awayTeamName)}
          persistenceStatus={persistenceStatus}
          onUpdate={patch => onUpdate(event.id, patch)}
        />
      ) : null}
    </Sheet>
  )
}

function DetailList({ items }) {
  const visible = items
    .filter(Boolean)
    .map(item => (typeof item === 'string' ? { value: item } : item))
    .filter(item => item?.value)
  if (visible.length === 0) return null
  return (
    <View className="gap-1.5">
      {visible.map(item => (
        <View key={`${item.label ?? 'detail'}-${item.value}`} className="flex-row gap-2">
          <Txt className="text-[13px] leading-[21px] text-radar-400">·</Txt>
          <Txt className="flex-1 text-[13px] leading-[21px] text-ink-400">
            {item.label ? <Txt className="font-sans-semibold text-ink-200">{item.label}: </Txt> : null}
            {item.value}
          </Txt>
        </View>
      ))}
    </View>
  )
}

function KnowledgeBlock({ title, items }) {
  if (items.filter(Boolean).filter(i => (typeof i === 'string' ? i : i?.value)).length === 0) return null
  return (
    <View className="rounded-xl border border-white/5 bg-night-800 p-3.5">
      <Txt className="mb-2 font-sans-bold text-[9px] uppercase tracking-[1.5px] text-ink-500">{title}</Txt>
      <DetailList items={items} />
    </View>
  )
}

const LINK_LABELS = { website: 'Official Site', parking: 'Parking', bagPolicy: 'Bag Policy', accessibility: 'Accessibility' }
function linkLabel(key) {
  return LINK_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
}

function venueReviewStamp(confidence) {
  if (!confidence?.lastReviewed) return null
  const prefix = confidence.source === 'generated' ? 'Auto-generated' : 'Fan-reviewed'
  return `${prefix} on ${confidence.lastReviewed}`
}

// The venue deep dive: summary, vibe, chips, four knowledge blocks, links.
export function VenueKnowledgeCard({ venue }) {
  if (!venue) return null
  const bestFor = venue.bestFor ?? []
  const atmosphere = venue.atmosphere ?? {}
  const arrival = venue.arrival ?? {}
  const seating = venue.seating ?? {}
  const food = venue.foodAndDrink ?? {}
  const officialLinks = Object.entries(venue.officialLinks ?? {}).filter(([, url]) => Boolean(url))
  const chips = [
    atmosphere.indoorOutdoor,
    atmosphere.noiseLevel ? `${atmosphere.noiseLevel} noise` : null,
    atmosphere.familyFriendly ? 'Family friendly' : null,
  ].filter(Boolean)
  const reviewStamp = venueReviewStamp(venue.confidence)

  return (
    <View className="gap-4">
      {venue.summary ? <Txt className="text-sm leading-[22px] text-ink-200">{venue.summary}</Txt> : null}

      {bestFor.length > 0 || chips.length > 0 || atmosphere.vibe ? (
        <View className="gap-3">
          {atmosphere.vibe ? (
            <View className="rounded-xl border border-radar-400/15 bg-radar-400/[.06] p-3">
              <Txt className="text-[13px] leading-[21px] text-ink-200">
                <Txt className="font-sans-semibold text-white">Overall vibe:</Txt> {atmosphere.vibe}
              </Txt>
            </View>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            {bestFor.map(item => (
              <View key={item} className="rounded-full bg-white/[.08] px-2.5 py-1">
                <Txt className="font-sans-semibold text-[11px] text-ink-200">Best for {item}</Txt>
              </View>
            ))}
            {chips.map(item => (
              <View key={item} className="rounded-full bg-white/[.05] px-2.5 py-1">
                <Txt className="font-sans-semibold text-[11px] text-ink-400">{item}</Txt>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-2.5">
        <KnowledgeBlock
          title="Getting there"
          items={[
            { label: 'Transit', value: arrival.transit },
            { label: 'Parking', value: arrival.parking },
            { label: 'Rideshare', value: arrival.rideshare },
          ]}
        />
        <KnowledgeBlock
          title="Seats"
          items={[
            { label: 'Best value', value: seating.bestValueSections?.length ? seating.bestValueSections.join(', ') : null },
            { label: 'Watch out for', value: seating.avoidIfPossible?.length ? seating.avoidIfPossible.join(', ') : null },
            { label: 'Accessibility', value: seating.accessibilityNote },
          ]}
        />
        <KnowledgeBlock
          title="Food & pregame"
          items={[
            { label: 'Inside', value: food.summary },
            { label: 'Nearby', value: food.nearbyPregame?.length ? food.nearbyPregame.join(', ') : null },
          ]}
        />
        <KnowledgeBlock title="Fan tips" items={(venue.fanTips ?? []).slice(0, 4).map(tip => ({ value: tip }))} />
      </View>

      {officialLinks.length > 0 || reviewStamp ? (
        <View className="flex-row flex-wrap items-center gap-3 border-t border-white/[.06] pt-3.5">
          {officialLinks.map(([key, url]) => (
            <Pressable key={key} onPress={() => openWebPage(url)} accessibilityRole="link" hitSlop={6}>
              <Txt className="font-sans-medium text-[13px] text-radar-400">{linkLabel(key)} →</Txt>
            </Pressable>
          ))}
          {reviewStamp ? <Txt className="text-[11px] text-ink-500">{reviewStamp}</Txt> : null}
        </View>
      ) : null}
    </View>
  )
}

// The two most-asked venue facts, pulled forward from the deep dive.
export function VenueTips({ venue }) {
  if (!venue) return null
  const tips = [
    { label: 'Getting there', text: venue.arrival?.transit || venue.arrival?.parking || venue.arrival?.rideshare },
    { label: 'Best value seats', text: venue.seating?.bestValueSections?.join(', ') },
  ].filter(tip => tip.text)
  if (tips.length === 0) return null
  return (
    <View className="flex-row gap-2.5">
      {tips.map(tip => (
        <View key={tip.label} className="min-w-0 flex-1 rounded-[14px] border border-white/[.06] bg-night-900 px-3.5 py-[13px]">
          <MicroLabel className="text-ink-500">{tip.label}</MicroLabel>
          <Txt numberOfLines={4} className="mt-1.5 text-xs leading-[18px] text-ink-200">{tip.text}</Txt>
        </View>
      ))}
    </View>
  )
}
