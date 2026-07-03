// API base URL for backend requests.
// - Set VITE_API_URL to point at a separately hosted API.
// - In production builds it defaults to '' (same-origin), for the
//   single-container deployment where the API serves the built client.
// - In dev it defaults to the local API from launchSettings.json.
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:5068' : '')
