import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard.jsx'

function DiscoverPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5068/api/events')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch events')
        return res.json()
      })
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            stadar
          </h1>
          <p className="text-gray-500 mt-1">Live sports near you</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12 text-gray-400">No upcoming events found</div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 font-medium">
              {events.length} upcoming events
            </p>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default DiscoverPage
