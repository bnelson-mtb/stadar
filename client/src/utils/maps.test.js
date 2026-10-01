import test from 'node:test'
import assert from 'node:assert/strict'

import { getVenueMapUrls } from './maps.js'

test('getVenueMapUrls searches by venue name, city and state', () => {
  const urls = getVenueMapUrls({ venue: 'Delta Center', city: 'Salt Lake City', state: 'UT', lat: 40.77, lng: -111.9 })

  assert.equal(urls.directionsUrl, 'https://www.google.com/maps/dir/?api=1&destination=Delta%20Center%2C%20Salt%20Lake%20City%2C%20UT')
  assert.equal(urls.embedUrl, 'https://www.google.com/maps?q=Delta%20Center%2C%20Salt%20Lake%20City%2C%20UT&output=embed')
})

test('getVenueMapUrls falls back to coordinates without a venue name', () => {
  const urls = getVenueMapUrls({ lat: 40.5, lng: -111.5 })

  assert.equal(urls.directionsUrl, 'https://www.google.com/maps/dir/?api=1&destination=40.5%2C-111.5')
  assert.match(urls.embedUrl, /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=/)
})

test('getVenueMapUrls returns null with nothing to locate', () => {
  assert.equal(getVenueMapUrls({}), null)
  assert.equal(getVenueMapUrls({ lat: 0, lng: 0 }), null)
  assert.equal(getVenueMapUrls(), null)
})
