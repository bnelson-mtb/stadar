import { NavLink } from 'react-router-dom'
import { BookmarkIcon, SearchIcon, UserCircleIcon, UserGroupIcon } from './icons.jsx'

// Profile stays a tab (it was already the third tab before the overhaul), so
// the nav is Discover / Teams / Saved / Profile.
const TABS = [
  { to: '/', label: 'Discover', Icon: SearchIcon, end: true },
  { to: '/teams', label: 'Teams', Icon: UserGroupIcon },
  { to: '/saved', label: 'Saved', Icon: BookmarkIcon, fillWhenActive: true },
  { to: '/profile', label: 'Profile', Icon: UserCircleIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[.06] bg-[linear-gradient(to_top,#07090e_65%,rgba(7,9,14,.85))] backdrop-blur-sm">
      <div className="mx-auto flex max-w-xl justify-between px-6 pb-4 pt-2.5">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex w-16 flex-col items-center gap-[5px] text-[10px] font-semibold tracking-[.06em] transition-colors duration-150 ${
                isActive ? 'text-radar-400' : 'text-ink-500 hover:text-ink-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.Icon
                  className="h-[21px] w-[21px]"
                  strokeWidth={tab.fillWhenActive && isActive ? 1.5 : 1.7}
                  filled={Boolean(tab.fillWhenActive && isActive)}
                />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
