// Sets the API base URL for the web client. Imported first in main.jsx so it
// runs before anything can fetch.
// - VITE_API_URL points at a separately hosted API.
// - Production builds default to '' (same-origin): the API serves the built client.
// - Dev defaults to the local API from launchSettings.json.
// Never add client/.env.production — it once baked a dead API URL into every bundle.
import { setApiBase } from '@stadar/shared/utils/api.js'

const env = import.meta.env ?? {}
setApiBase(env.VITE_API_URL ?? (env.DEV ? 'http://localhost:5068' : ''))
