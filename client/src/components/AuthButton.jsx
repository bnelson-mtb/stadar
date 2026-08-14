import useAuth from '../hooks/useAuth.js'
import { getAuthButtonCopy } from './authButtonCopy.js'

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
      <path fill="#34A853" d="M12 21.67c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z" />
      <path fill="#FBBC05" d="M6.54 13.74A5.85 5.85 0 0 1 6.24 12c0-.61.1-1.2.3-1.74V7.73H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.27l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.23c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.32 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.4l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </svg>
  )
}

export default function AuthButton() {
  const { user, status, login, logout } = useAuth()

  if (status === 'loading') return null

  if (status === 'authenticated') {
    const { label, title } = getAuthButtonCopy(status)
    return (
      <button
        type="button"
        onClick={logout}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-white/25 hover:bg-night-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
        title={user?.email || title}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-radar-400/15 text-[11px] text-radar-300" aria-hidden="true">
          {user?.displayName?.charAt(0)?.toUpperCase() || '•'}
        </span>
        <span>{label}{user?.displayName ? ` (${user.displayName})` : ''}</span>
      </button>
    )
  }

  const { label, title } = getAuthButtonCopy(status)
  return (
    <button
      type="button"
      onClick={login}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-white/25 hover:bg-night-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
      title={title}
    >
      <GoogleMark />
      <span>{label}</span>
    </button>
  )
}
