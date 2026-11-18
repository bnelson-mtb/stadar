import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { getCanonicalTeamName } from '@stadar/shared/data/teams.js'
import { US_STATES } from '@stadar/shared/data/usStates.js'
import { getApiBase, fetchJsonWithRetry } from '@stadar/shared/utils/api.js'
import { isPastEvent } from '@stadar/shared/utils/eventDetailState.js'
import { formatLocalTime, formatShortDate } from '@stadar/shared/utils/eventDisplay.js'
import { buildTicketLinks } from '@stadar/shared/utils/ticketLinks.js'
import { openWebPage } from '../lib/links.js'
import { colors } from '../theme.js'
import Button from './Button.jsx'
import Dialog from './Dialog.jsx'
import { SearchField } from './FilterBar.jsx'
import Sheet from './Sheet.jsx'
import TeamLogo from './TeamLogo.jsx'
import Txt from './Txt.jsx'
import { CheckIcon, ExternalLinkIcon, HeartIcon } from './icons.jsx'

// "+ Follow" from the My Teams rail: every team playing in the current feed,
// each with a follow toggle. Followed teams stay in the list (toggled on) so
// the row doesn't jump away under the user's thumb.
export function FollowSheet({ open, onClose, teams, isFavorite, onToggleFavorite, stateName }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visibleTeams = needle ? teams.filter(team => team.toLowerCase().includes(needle)) : teams

  function handleClose() {
    setQuery('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Follow teams" subtitle={`Teams with upcoming games in ${stateName}`}>
      {teams.length > 8 ? (
        <View className="mb-3">
          <SearchField value={query} onChange={setQuery} placeholder="Find a team" label="Find a team" clearable={false} />
        </View>
      ) : null}

      {visibleTeams.length === 0 ? (
        <Txt className="py-6 text-center text-sm text-ink-400">
          {teams.length === 0 ? 'No upcoming games loaded yet.' : 'No teams match that search.'}
        </Txt>
      ) : (
        <View className="gap-2">
          {visibleTeams.map(team => {
            const following = isFavorite(team)
            return (
              <Pressable
                key={team}
                onPress={() => onToggleFavorite(team)}
                accessibilityRole="button"
                accessibilityState={{ selected: following }}
                accessibilityLabel={`${team}, ${following ? 'following' : 'not following'}`}
                className="flex-row items-center gap-3 rounded-[14px] border border-white/[.06] bg-night-800 px-3.5 py-2.5 active:opacity-85"
              >
                <TeamLogo name={team} size={30} />
                <Txt numberOfLines={1} className="min-w-0 flex-1 font-sans-semibold text-sm text-white">{team}</Txt>
                <View
                  className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                    following ? 'border-radar-400/35 bg-radar-400/[.14]' : 'border-white/10 bg-white/[.06]'
                  }`}
                >
                  <HeartIcon
                    filled={following}
                    strokeWidth={2}
                    size={14}
                    color={following ? colors.radar[400] : colors.ink[200]}
                  />
                  <Txt className={`font-sans-semibold text-xs ${following ? 'text-radar-400' : 'text-ink-200'}`}>
                    {following ? 'Following' : 'Follow'}
                  </Txt>
                </View>
              </Pressable>
            )
          })}
        </View>
      )}
    </Sheet>
  )
}

function TicketProviderLogo({ provider }) {
  const [failed, setFailed] = useState(false)
  return (
    <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] bg-white">
      {provider.logoUrl && !failed ? (
        <Image source={{ uri: provider.logoUrl }} style={{ width: 20, height: 20 }} contentFit="contain" onError={() => setFailed(true)} />
      ) : (
        <Txt className="font-sans-extrabold text-[9px] text-night-950">{provider.logoLabel}</Txt>
      )}
    </View>
  )
}

// Looks up the direct SeatGeek event page while the sheet is open. 404 (no
// match / not configured) fails fast and is swallowed, so the search link stays.
export function useSeatGeekUrl(eventId, enabled) {
  const [found, setFound] = useState({ eventId: null, url: null })

  useEffect(() => {
    if (!enabled || !eventId) return undefined
    let cancelled = false
    fetchJsonWithRetry(`${getApiBase()}/api/games/${eventId}/seatgeek`)
      .then(data => {
        if (!cancelled && data?.url) setFound({ eventId, url: data.url })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [eventId, enabled])

  return found.eventId === eventId ? found.url : null
}

// Every ticket provider for one event, in ticketLinks.js order. Pass
// `seatGeekUrl` when the caller already looked it up (the detail screen does).
export function TicketSheet({ event, open, onClose, seatGeekUrl }) {
  const lookedUpUrl = useSeatGeekUrl(event?.id, open && seatGeekUrl === undefined)
  if (!event) return null

  const links = buildTicketLinks(event, seatGeekUrl ?? lookedUpUrl)
  const home = getCanonicalTeamName(event.homeTeam)
  const away = getCanonicalTeamName(event.awayTeam)
  const matchup = away ? `${home} vs ${away}` : home || event.name
  const time = formatLocalTime(event.localTime)
  const subtitle = [matchup, formatShortDate(event.localDate), time?.label].filter(Boolean).join(' · ')

  return (
    <Sheet open={open} onClose={onClose} title="Get tickets" subtitle={subtitle}>
      <View className="gap-2">
        {links.map(link => (
          <Pressable
            key={link.name}
            onPress={() => openWebPage(link.url)}
            accessibilityRole="link"
            accessibilityLabel={`${link.name}, ${link.isDirect ? 'event page' : 'search listings'}`}
            className="flex-row items-center gap-3 rounded-[14px] border border-white/[.06] bg-night-800 px-3.5 py-3 active:opacity-85"
          >
            <TicketProviderLogo provider={link} />
            <View className="min-w-0 flex-1">
              <Txt numberOfLines={1} className="font-sans-semibold text-sm text-white">{link.name}</Txt>
              <Txt className="mt-0.5 text-[11px] text-ink-500">{link.isDirect ? 'Event page' : 'Search listings'}</Txt>
            </View>
            <ExternalLinkIcon size={16} color={colors.ink[500]} />
          </Pressable>
        ))}
      </View>
      <Txt className="mt-3 text-center text-[11px] text-ink-500">
        Prices and fees are set by each seller. Purchases happen on their site.
      </Txt>
    </Sheet>
  )
}

export function UnsaveConfirmDialog({ event, onCancel, onConfirm }) {
  if (!event) return null
  const isPast = isPastEvent(event)
  return (
    <Dialog open onClose={onCancel} className="p-6">
      <Txt accessibilityRole="header" className="font-display text-[22px] uppercase leading-[26px] text-white">
        Unsave this event?
      </Txt>
      <Txt className="mt-3 text-sm leading-[22px] text-ink-400">
        {isPast
          ? 'Your notes and the final score will be permanently deleted. This cannot be undone.'
          : 'Are you sure you want to unsave this event?'}
      </Txt>
      <View className="mt-6 flex-row justify-end gap-3">
        <Button variant="ghost" label="Cancel" onPress={onCancel} className="h-11" boxClassName="rounded-xl px-4" />
        <Button variant="danger" label="Unsave" onPress={onConfirm} className="h-11" boxClassName="rounded-xl px-4" />
      </View>
    </Dialog>
  )
}

// The web's state <select>: every state, current one ticked.
export function StatePickerSheet({ open, onClose, value, onChange }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const states = needle
    ? US_STATES.filter(([code, name]) => code.toLowerCase().includes(needle) || name.toLowerCase().includes(needle))
    : US_STATES

  function close() {
    setQuery('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title="Location" subtitle="Show upcoming games in">
      <View className="mb-3">
        <SearchField value={query} onChange={setQuery} placeholder="Find a state" label="Find a state" />
      </View>
      <View className="gap-1">
        {states.map(([code, name]) => {
          const selected = code === value
          return (
            <Pressable
              key={code}
              onPress={() => {
                onChange(code)
                close()
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`flex-row items-center justify-between rounded-xl px-3.5 py-3 ${
                selected ? 'bg-radar-400/10' : 'active:bg-white/5'
              }`}
            >
              <Txt className={`text-sm ${selected ? 'font-sans-semibold text-radar-400' : 'text-ink-100'}`}>
                {name}
              </Txt>
              <View className="flex-row items-center gap-2">
                <Txt className="font-display text-xs tracking-[1.2px] text-ink-500">{code}</Txt>
                {selected ? <CheckIcon size={16} color={colors.radar[400]} /> : null}
              </View>
            </Pressable>
          )
        })}
      </View>
    </Sheet>
  )
}
