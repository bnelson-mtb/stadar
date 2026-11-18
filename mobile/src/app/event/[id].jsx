import { useLocalSearchParams } from 'expo-router'
import EventDetailScreen from '../../screens/EventDetailScreen.jsx'

// key={id} remounts the screen per event, so state seeded from one event can
// never leak into another (same as the web route).
export default function EventRoute() {
  const { id } = useLocalSearchParams()
  const eventId = Array.isArray(id) ? id[0] : id
  return <EventDetailScreen key={eventId} id={eventId} />
}
