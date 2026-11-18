import test from 'node:test'
import assert from 'node:assert/strict'
import { getVenueKnowledge, normalizeVenueName } from './index.js'

test('exact name match without hints still works', () => {
  const venue = getVenueKnowledge('Gillette Stadium')
  assert.equal(venue?.name, 'Gillette Stadium')
  assert.equal(venue?.state, 'MA')
})

test('exact match with agreeing state hint works', () => {
  const venue = getVenueKnowledge('Lambeau Field', { city: 'Green Bay', state: 'WI' })
  assert.equal(venue?.name, 'Lambeau Field')
})

test('sponsor/city suffix from Ticketmaster still matches (stored name subset of query)', () => {
  const venue = getVenueKnowledge('Lambeau Field - Green Bay', { state: 'WI' })
  assert.equal(venue?.name, 'Lambeau Field')
})

test('generic name resolves via state hint (query subset of stored names)', () => {
  const venue = getVenueKnowledge('Memorial Stadium', { city: 'Champaign', state: 'IL' })
  assert.equal(venue?.name, 'Memorial Stadium (Illinois)')
  const nebraska = getVenueKnowledge('Memorial Stadium', { city: 'Lincoln', state: 'NE' })
  assert.equal(nebraska?.name, 'Memorial Stadium (Nebraska)')
})

test('state hint rejects a lone same-name candidate in a different state', () => {
  // Ticketmaster has venues named "Gillette Stadium"-style in other states;
  // a contradicting state must not fall back to the wrong building.
  assert.equal(getVenueKnowledge('Gillette Stadium', { city: 'Sacramento', state: 'CA' }), null)
})

test('state hint rejects generic-name subset matches with no in-state candidate', () => {
  assert.equal(getVenueKnowledge('Memorial Stadium', { city: 'Tampa', state: 'FL' }), null)
})

test('ambiguous generic name with no hints refuses to guess', () => {
  assert.equal(getVenueKnowledge('Memorial Stadium'), null)
})

test('city hint alone does not reject a lone candidate (metro vs suburb naming)', () => {
  const venue = getVenueKnowledge('Gillette Stadium', { city: 'Boston', state: 'MA' })
  assert.equal(venue?.name, 'Gillette Stadium')
})

test('normalizeVenueName collapses punctuation and casing', () => {
  assert.equal(normalizeVenueName("AT&T Stadium"), 'at and t stadium')
  assert.equal(normalizeVenueName('Lambeau Field'), normalizeVenueName('  lambeau-field. '))
})
