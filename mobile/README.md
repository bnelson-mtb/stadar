# Stadar mobile

The Stadar app for Android (and later iOS), built with Expo SDK 57, Expo
Router and NativeWind 4. It has the same screens as the web app and talks to
the same API (`https://stadar.app`).

Data, logic and the sync stores come from `packages/shared` (`@stadar/shared`),
linked with `file:../packages/shared`. This folder is **not** part of the root
npm workspace, so the web app, the Docker image and CI never install React
Native. `metro.config.js` watches `packages/shared` and sends its `react`
imports to this folder's copy, so the app has exactly one React.

## Run it

```bash
cd mobile
npm install
npm start            # Expo dev server: press a for Android, w for web
```

- **Phone with Expo Go:** scan the QR code. Expo Go must support SDK 57.
  Everything except Google sign-in works there (sign-in needs the `stadar://`
  scheme of a real build).
- **Android emulator / USB phone (dev build):** `npm run android`
  (`expo run:android`) builds and installs a debug app with every feature.
- **Web:** `npm run web`. Handy for quick UI checks; the venue map uses an
  iframe there.

To use a local API instead of production:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:5068 npm start   # Android emulator
EXPO_PUBLIC_API_URL=http://localhost:5068 npm run web
```

For the web build, the API must allow the Expo origin
(`Cors__AllowedOrigins__0=http://localhost:8081`). Signing in against a local
`http://` API won't stick on Android: the session cookie is `Secure`.

## Test

```bash
npm test             # node:test unit tests for src/lib
npm run lint
```

The screens reuse the shared package's tested logic (`npm test` at the repo
root runs those tests).

## Build an APK for testers

`android/` is generated from `app.json` (`npx expo prebuild`) and is not
committed. A release APK, signed with a local key:

```bash
npx expo prebuild --platform android
cd android
# Android Studio ships JDK 25; this keeps its native-access warning from
# failing the CMake steps:
export JAVA_TOOL_OPTIONS=--enable-native-access=ALL-UNNAMED
./gradlew app:assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

See `docs/superpowers/plans/2026-11-18-mobile-release.md` for signing, the
Play Console closed test, and EAS Build.

## Sign-in

Google sign-in opens in an in-app browser tab and hands the session to the
app with a one-time code (`src/lib/mobileSignIn.js`, `Api/Auth/MobileSignIn.cs`).
It needs the API with the `/api/auth/mobile/*` endpoints deployed; until then
the Profile tab says app sign-in isn't available and everything stays on the
phone.

## Layout

```text
src/app/          Expo Router routes: (tabs)/, event/[id], team/[name]
src/screens/      one file per screen
src/components/   UI pieces (ports of client/src/components)
src/lib/          providers, navigation, links, calendar, sign-in
src/theme.js      colours and fonts (keep in step with client/src/index.css)
```
