import useAuth from '../hooks/useAuth.js'

export default function AuthButton() {
  const { user, status, login, logout } = useAuth()

  if (status === 'loading') return null

  if (status === 'authenticated') {
    return (
      <button
        onClick={logout}
        className="text-xs text-slate-400 hover:text-slate-200"
        title={user?.email}
      >
        Sign out{user?.displayName ? ` (${user.displayName})` : ''}
      </button>
    )
  }

  return (
    <button
      onClick={login}
      className="text-xs text-slate-300 hover:text-white"
    >
      Sign in with Google
    </button>
  )
}
