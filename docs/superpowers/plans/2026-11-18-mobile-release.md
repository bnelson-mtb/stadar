# Mobile app: getting it to testers and the Play Store

Status: the app (`mobile/`) has parity with the web client and builds a
release APK locally. This is the path from here to real users.

## 0. Before testers sign in: deploy the API

App sign-in uses new endpoints (`/api/auth/mobile/*`, `Api/Auth/MobileSignIn.cs`).
They reach production when `feat/mobile-app` (PR #3) is merged after PR #2.
Until then the app works fully signed out, and Profile says app sign-in
isn't available. No Google Cloud change is needed: Google still returns to
the registered `https://stadar.app/api/auth/callback`.

PR #2's own deploy note applies too: `Storage__ConnectionString` must be set
on the Container App, or sessions (web and app) end on every restart.

## 1. Testers now: sideloaded APK

```bash
cd mobile
npm install
npx expo prebuild --platform android
cd android
./gradlew app:assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

Build notes (Windows):

- `JAVA_HOME` = Android Studio's JDK (`C:\Program Files\Android\Android Studio\jbr`).
  It is JDK 25, whose "restricted method" warning fails AGP's native (CMake)
  steps. Set `JAVA_TOOL_OPTIONS=--enable-native-access=ALL-UNNAMED` for the
  build: the warning comes from a child Java process (prefab), which the
  Gradle JVM flag that `plugins/withGradleJvmArgs.js` adds doesn't reach.
  (A JDK 17 also avoids it.)
- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`. Gradle downloads NDK 27.1
  and CMake 3.22 on the first build.
- The release APK is signed with the React Native template's
  `android/app/debug.keystore`. Every prebuild ships the same well-known key,
  so updates install over earlier tester builds, but it is public: fine for a
  closed group sideloading, not for the Play Store or wide distribution. Use
  a real upload key (step 2) before that; testers then reinstall once.

Testers: send the APK (Drive link), they allow "install unknown apps" for
their browser/Drive, install, open. Android 7+ (Expo SDK 57 minimum: API 24).

## 2. A real signing key

Generate once, store outside the repo (password manager + backup), never
commit it:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore stadar-upload.keystore \
  -alias stadar-upload -keyalg RSA -keysize 2048 -validity 10000
```

Then either:

- **EAS Build** (recommended): `npx eas-cli build -p android --profile production`
  with `eas credentials` holding the key (or letting EAS generate it). Needs a
  free Expo account. Builds in the cloud, no local JDK/NDK.
- **Local**: wire the keystore into `android/app/build.gradle` signingConfigs
  through a config plugin and `~/.gradle/gradle.properties` for the
  passwords, and build `./gradlew app:bundleRelease` (AAB for Play).

## 3. Google Play

1. Play Console developer account ($25 one-time, identity verification).
2. Create the app; package name `app.stadar` (set in `app.json`, permanent
   once uploaded).
3. Enrol in Play App Signing; upload the AAB signed with the upload key.
4. **Closed test with at least 12 testers for 14 continuous days** before a
   new personal account can apply for production. Start this early: it is
   the longest pole.
5. Store listing needs: privacy policy URL (the web `/privacy` page is still
   a follow-up; the Profile data-usage copy is the basis), screenshots,
   data-safety form (Google name/email when signed in; no location beyond an
   IP-based region guess via ipapi.co; no tracking).

## 4. Updates

- JavaScript-only changes: `eas update` (EAS Update) ships them to installed
  apps without a store review once `expo-updates` is added.
- Native changes (new native library, SDK upgrade): new build + upload.

## Known gaps

- iOS: untested. Builds need EAS (no Mac) and an Apple developer account.
- App sign-in was verified with integration tests and a local build; the full
  Google round trip on a phone happens after the API deploys (see step 0).
