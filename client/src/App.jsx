import { Routes, Route, Outlet } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import TeamSavedPage from './pages/TeamSavedPage.jsx'

function AppLayout() {
  return (
    <div className="pb-16">
      <Outlet />
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/saved" element={<SavedPage />} />
      </Route>
      <Route path="/saved/team/:teamName" element={<TeamSavedPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
    </Routes>
  )
}

export default App
