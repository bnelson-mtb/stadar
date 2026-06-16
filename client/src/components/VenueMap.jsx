function VenueMap({ lat, lng, venue }) {
  if (!lat || !lng) return null

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="space-y-3">
      <iframe
        title="Venue map"
        width="100%"
        height="200"
        style={{ border: 0, borderRadius: 12 }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        Get Directions &rarr;
      </a>
    </div>
  )
}

export default VenueMap
