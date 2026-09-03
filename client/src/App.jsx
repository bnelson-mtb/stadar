import { Routes, Route, Outlet, useParams } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TeamSavedPage from './pages/TeamSavedPage.jsx'
import ImportPrompt from './components/ImportPrompt.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen bg-night-950 pb-16">
      <Outlet />
      <BottomNav />
      <ImportPrompt />
    </div>
  )
}

// key={id} remounts the detail page when navigating between events, so
// state initialized from router state / saved snapshots can never leak
// from one event to another.
function EventDetailRoute() {
  const { id } = useParams()
  return <EventDetailPage key={id} />
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/saved/team/:teamName" element={<TeamSavedPage />} />
      <Route path="/event/:id" element={<EventDetailRoute />} />
    </Routes>
  )
}

export default App
