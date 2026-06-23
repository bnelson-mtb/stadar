import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`
        }
      >
        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        Discover
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`
        }
      >
        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        Saved
      </NavLink>
    </nav>
  )
}
