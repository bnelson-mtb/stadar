import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import SavedEventRow from '../components/SavedEventRow.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import TicketSheet from '../components/TicketSheet.jsx'
import { LivePill } from '../components/Countdown.jsx'
import { ChevronLeftIcon, HeartIcon } from '../components/icons.jsx'
import useCountdown from '../hooks/useCountdown.js'
import useFavorites from '../hooks/useFavorites.js'
import useGames from '../hooks/useGames.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getCanonicalTeamName } from '../data/teams.js'
import { readStoredStateCode } from '../data/usStates.js'
import { formatCountdown } from '../utils/countdown.js'
import {
  formatLocalTime,
  formatLongDate,
  getDayLabel,
  getEventStart,
  getTeamContext,
  getTeamHeroColor,
  getTeamShortName,
  involvesTeam,
  splitTeamName,
} from '../utils/eventDisplay.js'
import { getNextGameForTeam } from '../utils/feedFilters.js'
import {
  formatWinLoss,
  getOpponentName,
  getScoreOutcome,
  getTeamRecords,
  getTeamStats,
  partitionByTime,
} from '../utils/savedHelpers.js'

function matchupTitle(event, teamName) {
  const opponent = getOpponentName(event, teamName)
  if (!opponent) return event.name
  const side = getCanonicalTeamName(event.homeTeam) === teamName ? 'vs' : 'at'
  return `${side} ${getTeamShortName(opponent)}`
}

function StatTile({ value, label }) {
  return (
    <div className="flex-1 rounded-[13px] border border-white/[.08] bg-[rgba(7,9,14,.5)] px-[13px] py-[11px]">
      <div className="font-display text-[19px] leading-tight text-white">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[.1em] text-ink-400">{label}</div>
    </div>
  )
}

function NextGameCard({ event, teamName, backTo, onOpenTickets }) {
  const countdown = useCountdown(getEventStart(event))
  const opponent = getOpponentName(event, teamName)
  const isHome = getCanonicalTeamName(event.homeTeam) === teamName
  const title = matchupTitle(event, teamName)
  const when = [
    getDayLabel(event.localDate, { localTime: event.localTime }),
    formatLocalTime(event.localTime)?.label,
  ].filter(Boolean).join(' ')

  return (
    <article className="press relative overflow-hidden rounded-2xl border border-radar-400/25 bg-[linear-gradient(120deg,rgba(46,211,242,.12),#0d1219_60%)] p-4">
      <Link
        to={`/event/${event.id}`}
        state={{ event, backTo }}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-2 focus-visible:outline-radar-400"
        aria-label={`Next game: ${title}, ${when}. Open event`}
      />
      <div className="pointer-events-none relative z-[2]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[11px] uppercase tracking-[.2em] text-radar-400">Next game</span>
          {opponent && <span className="text-[11px] text-ink-400">{isHome ? 'Home' : 'Away'}</span>}
        </div>
        <div className="mt-3 flex items-center gap-[11px]">
          <span className="min-w-0 truncate font-display text-[22px] uppercase leading-tight text-white">{title}</span>
          {opponent && <TeamLogo name={opponent} size={28} className="ml-auto" />}
        </div>
        <div className="mt-3.5 flex items-end justify-between gap-3">
          <div>
            {countdown?.isLive ? (
              <LivePill large />
            ) : (
              <div className="font-display text-[26px] leading-none text-white">
                {countdown && !countdown.isPast ? formatCountdown(countdown, { pad: false }) : 'TBD'}
              </div>
            )}
            <div className="mt-[3px] text-[11px] text-ink-400">{when}</div>
          </div>
          <button
            type="button"
            onClick={onOpenTickets}
            className="pointer-events-auto inline-flex h-[38px] flex-none cursor-pointer items-center rounded-[11px] bg-radar-400 px-[15px] text-[13px] font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
          >
            Tickets
          </button>
        </div>
      </div>
    </article>
  )
}

const BADGE_STYLES = {
  W: 'bg-radar-400/[.12] text-radar-400',
  L: 'bg-white/5 text-ink-500',
  T: 'bg-white/5 text-ink-200',
}

const SCORE_STYLES = {
  W: 'text-white',
  L: 'text-ink-400',
  T: 'text-ink-200',
}

function HistoryRow({ record, teamName, backTo }) {
  const outcome = getScoreOutcome(record, teamName)
  const meta = [
    formatLongDate(record.event.localDate),
    record.notes?.trim() ? 'note added' : null,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/event/${record.event.id}`}
      state={{ event: record.event, backTo }}
      className="press flex items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 px-3.5 py-[13px]"
    >
      <span
        className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] font-display text-xs ${
          outcome ? BADGE_STYLES[outcome.result] : 'bg-white/5 text-ink-500'
        }`}
        aria-label={outcome ? { W: 'Win', L: 'Loss', T: 'Tie' }[outcome.result] : 'No score logged'}
      >
        {outcome?.result ?? '—'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-white">{matchupTitle(record.event, teamName)}</div>
        <div className="mt-0.5 truncate text-[11px] text-ink-500">{meta}</div>
      </div>
      {outcome && (
        <div className={`flex-none font-display text-lg ${SCORE_STYLES[outcome.result]}`}>
          {outcome.teamScore}—{outcome.opponentScore}
        </div>
      )}
    </Link>
  )
}

function GroupHeading({ children }) {
  return (
    <h2 className="mb-2.5 font-display text-[11px] uppercase tracking-[.2em] text-ink-400">{children}</h2>
  )
}

export default function TeamSavedPage() {
  const { teamName } = useParams()
  const decodedTeam = decodeURIComponent(teamName)
  const navigate = useNavigate()
  const location = useLocation()
  const { savedEvents } = useSavedEvents()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [stateCode] = useState(readStoredStateCode)
  const { events } = useGames(stateCode)
  const [ticketsOpen, setTicketsOpen] = useState(false)

  const teamRecords = getTeamRecords(savedEvents, decodedTeam)
  const { upcoming, past } = partitionByTime(teamRecords)
  const stats = getTeamStats(savedEvents, decodedTeam)
  const feedGames = events.filter(event => involvesTeam(event, decodedTeam))
  const nextGame = getNextGameForTeam([...feedGames, ...upcoming.map(record => record.event)], decodedTeam)
  const otherUpcoming = upcoming.filter(record => record.event.id !== nextGame?.id)
  const context = getTeamContext([...feedGames, ...teamRecords.map(record => record.event)], decodedTeam)
  const nameLines = splitTeamName(decodedTeam)
  const following = isFavorite(decodedTeam)
  const heroColor = getTeamHeroColor(decodedTeam)
  const pagePath = `/saved/team/${encodeURIComponent(decodedTeam)}`

  // Callers say where "back" goes: a path, or -1 to pop history (used from
  // the event page so its own back button keeps working).
  function handleBack() {
    const backTo = location.state?.backTo
    if (backTo === -1) {
      navigate(-1)
      return
    }
    navigate(backTo ?? '/teams')
  }

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header
        className="relative overflow-hidden px-[18px] pb-[22px] pt-4"
        style={{ background: `linear-gradient(168deg, ${heroColor} 0%, #0a1526 62%, #07090e 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_110%_at_15%_-10%,rgba(46,211,242,.16),transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] border border-white/10 bg-white/[.08] text-ink-100 transition-colors duration-150 hover:bg-white/[.14]"
            >
              <ChevronLeftIcon className="h-[17px] w-[17px]" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(decodedTeam)}
              aria-pressed={following}
              aria-label={following ? `Unfollow ${decodedTeam}` : `Follow ${decodedTeam}`}
              className={`inline-flex cursor-pointer items-center gap-[7px] rounded-full border px-3.5 py-[9px] text-xs font-semibold transition-colors duration-150 ${
                following
                  ? 'border-radar-400/35 bg-radar-400/[.14] text-radar-400 hover:bg-radar-400/20'
                  : 'border-white/10 bg-white/[.08] text-ink-100 hover:bg-white/[.14]'
              }`}
            >
              <HeartIcon filled={following} strokeWidth={2} className="h-3.5 w-3.5" />
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <TeamLogo name={decodedTeam} size={76} />
            <div className="min-w-0">
              <h1 className="font-display text-[32px] uppercase leading-[.94] text-white [overflow-wrap:anywhere]">
                {nameLines.map(line => <span key={line} className="block">{line}</span>)}
              </h1>
              {(context.league || context.homeVenue) && (
                <p className="mt-[7px] text-[11px] font-medium uppercase tracking-[.12em] text-ink-400">
                  {[context.league, context.homeVenue].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <StatTile value={stats.saved} label="Saved" />
            <StatTile value={stats.attended} label="Attended" />
            <StatTile value={formatWinLoss(stats)} label="When I go" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-5 p-[18px] pb-10">
        {nextGame && (
          <NextGameCard
            event={nextGame}
            teamName={decodedTeam}
            backTo={pagePath}
            onOpenTickets={() => setTicketsOpen(true)}
          />
        )}

        {otherUpcoming.length > 0 && (
          <section>
            <GroupHeading>Saved upcoming</GroupHeading>
            <div className="flex flex-col gap-2">
              {otherUpcoming.map(record => (
                <SavedEventRow key={record.event.id} record={record} backTo={pagePath} />
              ))}
            </div>
          </section>
        )}

        <section>
          <GroupHeading>My history</GroupHeading>
          {past.length === 0 ? (
            <EmptyState
              title="No games logged"
              body={teamRecords.length === 0
                ? `No saved events for ${decodedTeam} yet.`
                : 'Saved games show up here once they have been played.'}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {past.map(record => (
                <HistoryRow key={record.event.id} record={record} teamName={decodedTeam} backTo={pagePath} />
              ))}
            </div>
          )}
        </section>
      </main>

      <TicketSheet event={nextGame} open={ticketsOpen} onClose={() => setTicketsOpen(false)} />
    </div>
  )
}
