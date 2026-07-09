function VenueMap({ venue, city, state, lat, lng }) {
  const venueQuery = [venue, city, state].filter(Boolean).join(', ')
  const hasVenueQuery = Boolean(venueQuery)

  if (!hasVenueQuery && (!lat || !lng)) return null

  const destination = hasVenueQuery ? venueQuery : `${lat},${lng}`
  const encodedDestination = encodeURIComponent(destination)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`
  const embedUrl = hasVenueQuery
    ? `https://www.google.com/maps?q=${encodedDestination}&output=embed`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-night-900 shadow-inner shadow-black/30">
        <iframe
          title="Venue map"
          className="block h-52 w-full bg-night-900"
          style={{
            border: 0,
            filter: 'invert(0.9) hue-rotate(180deg) saturate(0.65) brightness(0.82) contrast(1.12)',
          }}
          loading="lazy"
          src={embedUrl}
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-medium text-radar-400 hover:text-radar-300"
      >
        Get Directions &rarr;
      </a>
    </div>
  )
}

export default VenueMap
