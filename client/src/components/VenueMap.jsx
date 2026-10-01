import { getVenueMapUrls } from '../utils/maps.js'

// Static map preview for the venue card. Non-interactive on purpose: at this
// height a pannable iframe just traps scroll on phones, and the card's
// Directions button opens the full map.
function VenueMap({ venue, city, state, lat, lng, className = 'h-[104px]' }) {
  const urls = getVenueMapUrls({ venue, city, state, lat, lng })
  if (!urls) return null

  return (
    <iframe
      title={`Map of ${venue || 'the venue'}`}
      className={`pointer-events-none block w-full bg-night-800 ${className}`}
      style={{
        border: 0,
        filter: 'invert(0.9) hue-rotate(180deg) saturate(0.65) brightness(0.82) contrast(1.12)',
      }}
      loading="lazy"
      tabIndex={-1}
      src={urls.embedUrl}
    />
  )
}

export default VenueMap
