export const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','Washington DC'],['FL','Florida'],
  ['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],
  ['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],
  ['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],
  ['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],
  ['WY','Wyoming'],
]

export const US_STATE_CODES = US_STATES.map(([code]) => code)

export const LOCATION_STORAGE_KEY = 'stadar-location'
export const DEFAULT_STATE_CODE = 'UT'

export function getStateName(code) {
  return US_STATES.find(([stateCode]) => stateCode === code)?.[1] ?? code
}

// The state Discover last showed (raw string, intentionally outside the
// storage adapter), falling back to Utah.
export function readStoredStateCode() {
  const saved = globalThis.localStorage?.getItem(LOCATION_STORAGE_KEY)
  return saved && US_STATE_CODES.includes(saved) ? saved : DEFAULT_STATE_CODE
}
