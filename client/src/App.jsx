import { Routes, Route } from 'react-router-dom'
import DiscoverPage from './pages/DiscoverPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoverPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
    </Routes>
  )
}

export default App
