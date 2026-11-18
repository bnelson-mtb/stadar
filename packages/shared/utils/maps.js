// Google Maps URLs for a venue. Prefers the venue/city/state text query (it
// lands on the named place); falls back to raw coordinates, with an
// OpenStreetMap embed since Google's coordinate embed needs an API key.
export function getVenueMapUrls({ venue, city, state, lat, lng } = {}) {
  const venueQuery = [venue, city, state].filter(Boolean).join(', ')
  const hasCoordinates = Boolean(lat) && Boolean(lng)
  if (!venueQuery && !hasCoordinates) return null

  const destination = encodeURIComponent(venueQuery || `${lat},${lng}`)
  return {
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    embedUrl: venueQuery
      ? `https://www.google.com/maps?q=${destination}&output=embed`
      : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`,
  }
}
