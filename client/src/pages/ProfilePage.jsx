import { useRef, useState } from 'react'
import AuthButton from '../components/AuthButton.jsx'
import DataUsageDialog from '../components/DataUsageDialog.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import useAuth from '../hooks/useAuth.js'
import useFavorites from '../hooks/useFavorites.js'
import useSavedEvents from '../hooks/useSavedEvents.js'
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
    <div className="min-h-screen bg-night-950 text-slate-200">
      <header className="relative overflow-hidden bg-night-900 border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_140%_at_50%_-20%,rgba(163,230,53,0.12),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-4 py-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.18em] text-white leading-none">
            Profile
          </h1>
        </div>
      </header>

      <main ref={mainRef} tabIndex={-1} className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Account */}
        <section>
          <div className="rounded-xl border border-white/10 bg-night-800 p-5">
            {isLoading ? (
              // Matches AuthButton, which renders nothing until auth resolves —
              // avoids flashing "Not signed in" at a user who is signed in.
              <div className="h-20 animate-pulse rounded-lg bg-white/5" />
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      identity.signedIn
                        ? 'bg-radar-400/15 text-radar-300 ring-1 ring-radar-400/30'
                        : 'bg-white/5 text-slate-500 ring-1 ring-white/10'
                    }`}
                    aria-hidden="true"
                  >
                    {identity.initial}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg font-bold text-white">
                      {identity.heading}
                    </h2>
                    {identity.subheading && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-400 break-words">
                        {identity.subheading}
                      </p>
                    )}
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                      {stats}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <AuthButton />
                  {!identity.signedIn && (
                    <span className="text-xs text-slate-500">{PROVIDER_NOTE}</span>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDataDialogOpen(true)}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-slate-400 underline-offset-4 transition-colors hover:text-radar-300 hover:underline focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            {DATA_USAGE_TITLE}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </section>

        {/* Your Teams — static tiles; per-team navigation lives on Saved. */}
        <section>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-radar-400 uppercase tracking-[0.2em] mb-3">
            Your Teams
            <span className="flex-1 h-px bg-white/10" />
          </h2>
          {favorites.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Follow teams on the Discover page and they’ll show up here.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {favorites.map(team => (
                <li
                  key={team}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-night-800 px-3 py-4 text-center"
                >
                  <TeamLogo name={team} size="large" />
                  <span className="text-xs font-medium leading-snug text-slate-300">
                    {team}
                  </span>
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
