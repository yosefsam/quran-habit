# Hidayah — Mobile (iOS Simulator)

This is a **separate Expo + React Native** app. It does **not** use Expo Go. It uses **expo-dev-client** and runs as a **native build** in the **iOS Simulator** on your Mac.

## Prerequisites

- **Xcode** from the Mac App Store (includes iOS Simulator)
- Open Xcode once to finish component install
- In Terminal:

```bash
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcrun simctl list devices available | head
```

## Install

```bash
cd mobile
npm install
```

## Run in iOS Simulator (first time — builds & installs the app)

```bash
cd mobile
npm run ios
```

This runs `expo run:ios`, which builds the **development client**, opens the **Simulator**, and installs your app. Metro usually starts as part of this flow.

## Daily development (Metro + Simulator)

If the app is already installed on the Simulator:

**Terminal 1 — Metro for dev client**

```bash
cd mobile
npm run start
```

**Then** open the **mobile** app icon on the Simulator (it connects to Metro automatically if it was built with dev client).

Or run again (rebuilds if native code changed):

```bash
cd mobile
npm run ios
```

## Clear Metro cache

```bash
cd mobile
npm run ios:clear
```

## Scripts reference

| Script        | Purpose                                      |
|---------------|----------------------------------------------|
| `npm run ios` | Build + run on iOS Simulator (`expo run:ios`) |
| `npm run start` | Start Metro for **dev client** (`expo start --dev-client`) |
| `npm run ios:dev` | Same as `start` (alias)                     |
| `npm run ios:clear` | Dev client + clear Metro cache          |

## No Expo Go / no QR

- Do **not** install or scan with Expo Go for this workflow.
- Use **Simulator** + the app named like your project (e.g. **mobile**).

## Quran data

Bundled JSON lives in `assets/quran/` (`pages.v2.json`, `surahs.v2.json`).

## EXConstants / `Generate app.config for prebuilt` (Xcode script phase)

If that phase fails (often with **`bash: /Users/.../Your: No such file or directory`**), the cause is usually **spaces in the project path**. This repo applies a **`patch-package` patch** on `expo-constants` that:

1. **Quotes `PROJECT_DIR`** in `get-app-config-ios.sh` and defaults **`BUNDLE_FORMAT`** to `shallow` when unset (CocoaPods often does not set it).
2. **Fixes `EXConstants.podspec`** so the script phase uses an absolute, **Shellwords-escaped** path instead of embedding `$PODS_TARGET_SRCROOT/...` unquoted inside `bash -l -c "..."`.

After **`npm install`**, if the patch changes, run **`cd ios && pod install`** again so the Pods project picks up the updated script phase.

## iOS build notes (CocoaPods / React Native prebuilds)

- **`React-Core-prebuilt` / “Missing required attribute `source`”**  
  This project sets **`ios.buildReactNativeFromSource: true`** via the **`expo-build-properties`** plugin in `app.json`. That disables Maven prebuilt React Native iOS artifacts (which can fail validation when the prebuilt podspec has no `source`) and builds React Native **from source** instead.

- **Reanimated 4 + worklets**  
  **`react-native-worklets`** is required for **`react-native-reanimated` 4.x** on SDK 55 (see `package.json`).

- **Audio**  
  **`expo-av`** is not used (its iOS native code targets removed ExpoModulesCore legacy headers). Playback uses **`expo-audio`** instead.

- **Regenerating `ios/`**

```bash
cd mobile
rm -rf ios
npx expo prebuild --clean --platform ios
```

- **Clean rebuild**

```bash
cd mobile/ios
rm -rf build Pods Podfile.lock
pod install
cd ..
npx expo run:ios --no-build-cache
```

- **Project path with spaces**  
  If you see scripts breaking on paths, prefer cloning the repo into a folder **without spaces** (e.g. `~/Projects/quran-habit`).
