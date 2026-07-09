import { NavLink } from 'react-router-dom'

const linkClasses = ({ isActive }) =>
  `relative flex-1 flex flex-col items-center py-3 text-xs font-medium tracking-wide transition-colors ${
    isActive ? 'text-radar-400' : 'text-slate-500 hover:text-slate-300'
  }`

function ActiveBar({ isActive }) {
  if (!isActive) return null
  return <span className="absolute top-0 h-0.5 w-8 rounded-full bg-radar-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-night-900/90 backdrop-blur border-t border-white/10 flex z-50">
      <NavLink to="/" end className={linkClasses}>
        {({ isActive }) => (
          <>
            <ActiveBar isActive={isActive} />
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Discover
          </>
        )}
      </NavLink>
      <NavLink to="/saved" className={linkClasses}>
        {({ isActive }) => (
          <>
            <ActiveBar isActive={isActive} />
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            Saved
          </>
        )}
      </NavLink>
    </nav>
  )
}
