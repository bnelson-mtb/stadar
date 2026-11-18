// A synchronous localStorage backed by SQLite, so the shared storage adapter,
// the saved-state key and the sync stores work unchanged on the phone. On web
// this import does nothing and the browser's localStorage is used.
import 'expo-sqlite/localStorage/install'
import { setApiBase } from '@stadar/shared/utils/api.js'

// The live API by default; EXPO_PUBLIC_API_URL points a dev build elsewhere
// (e.g. http://10.0.2.2:5068 for the Android emulator).
setApiBase(process.env.EXPO_PUBLIC_API_URL ?? 'https://stadar.app')
