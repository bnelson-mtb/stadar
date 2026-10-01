import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthButton from '../components/AuthButton.jsx'
import DataUsageDialog from '../components/DataUsageDialog.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import { ArrowRightIcon } from '../components/icons.jsx'
import useAuth from '../hooks/useAuth.js'
import useFavorites from '../hooks/useFavorites.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
import { getTeamShortName } from '../utils/eventDisplay.js'
import {
  DATA_USAGE_TITLE,
  PROVIDER_NOTE,
  getFollowStats,
  getProfileIdentity,
} from '../components/profileCopy.js'

export default function ProfilePage() {
  const { user, status } = useAuth()
  const { favorites } = useFavorites()
  const { savedEvents } = useSavedEvents()
  const [dataDialogOpen, setDataDialogOpen] = useState(false)
  const mainRef = useRef(null)

  const identity = getProfileIdentity(status, user)
  const stats = getFollowStats(favorites.length, savedEvents.length)
  const isLoading = status === 'loading'

  return (
    <div className="min-h-screen bg-night-950 text-ink-100">
      <header className="mx-auto max-w-xl px-[18px] pb-3 pt-[18px]">
        <h1 className="font-display text-[30px] uppercase leading-none text-white">Profile</h1>
      </header>

      <main ref={mainRef} tabIndex={-1} className="mx-auto max-w-xl space-y-6 px-[18px] pb-6 pt-1.5 outline-none">
        {/* Account */}
        <section>
          <div className="rounded-[14px] border border-white/5 bg-night-900 p-[18px]">
            {isLoading ? (
              // Matches AuthButton, which renders nothing until auth resolves —
              // avoids flashing "Not signed in" at a user who is signed in.
              <div className="shimmer h-20 rounded-xl bg-white/[.04]" />
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl ${
                      identity.signedIn
                        ? 'bg-radar-400/15 text-radar-300 ring-1 ring-radar-400/30'
                        : 'bg-white/5 text-ink-500 ring-1 ring-white/10'
                    }`}
                    aria-hidden="true"
                  >
                    {identity.initial}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-white">
                      {identity.heading}
                    </h2>
                    {identity.subheading && (
                      <p className="mt-1 break-words text-[13px] leading-relaxed text-ink-400">
                        {identity.subheading}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[.16em] text-ink-500">
                      {stats}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <AuthButton />
                  {!identity.signedIn && (
                    <span className="text-xs text-ink-500">{PROVIDER_NOTE}</span>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDataDialogOpen(true)}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-400 underline-offset-4 transition-colors duration-150 hover:text-radar-300 hover:underline focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            {DATA_USAGE_TITLE}
            <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </section>

        {/* Your Teams: each tile opens that team's page. */}
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-[11px] uppercase tracking-[.2em] text-ink-400">Your teams</h2>
            {favorites.length > 0 && (
              <Link to="/teams" className="text-[11px] font-medium text-radar-400 hover:text-radar-300">
                See all
              </Link>
            )}
          </div>
          {favorites.length === 0 ? (
            <p className="text-sm text-ink-500">
              Follow teams on the Discover page and they’ll show up here.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {favorites.map(team => (
                <li key={team}>
                  <Link
                    to={`/saved/team/${encodeURIComponent(team)}`}
                    state={{ backTo: '/profile' }}
                    title={team}
                    className="press flex h-full flex-col items-center gap-2 rounded-[14px] border border-white/5 bg-night-900 px-2 py-4 text-center"
                  >
                    <TeamLogo name={team} size={40} />
                    <span className="w-full truncate text-[11px] font-semibold text-ink-200">
                      {getTeamShortName(team)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <DataUsageDialog
        open={dataDialogOpen}
        focusFallbackRef={mainRef}
        onClose={() => setDataDialogOpen(false)}
      />
    </div>
  )
}
