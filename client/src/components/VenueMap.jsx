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
      <iframe
        title="Venue map"
        width="100%"
        height="200"
        style={{ border: 0, borderRadius: 12 }}
        loading="lazy"
        src={embedUrl}
      />
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
