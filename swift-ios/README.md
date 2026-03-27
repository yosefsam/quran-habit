# Hidayah — Native SwiftUI (iOS)

This is a **standalone native SwiftUI** app. It does **not** use Expo or React Native. The existing website and `mobile/` Expo project are **unchanged**.

## Open in Xcode

1. Double-click **`QuranHabit.xcodeproj`** in Finder, **or** from Terminal:
   ```bash
   open "/path/to/your-repo/swift-ios/QuranHabit.xcodeproj"
   ```
2. Select the **QuranHabit** scheme and an **iOS Simulator** (or a device).
3. Press **⌘R** to build and run.

**Project root folder:** `swift-ios/`  
**Xcode project file:** `swift-ios/QuranHabit.xcodeproj`

## App entry point

- **`QuranHabit/App/QuranHabitApp.swift`** — `@main` struct `QuranHabitApp` is the entry point.
- The root UI is **`MainTabView`** (tabs: Home, Read, Bookmarks, Progress, Settings).

## Structure

| Area | Path |
|------|------|
| App + DI | `QuranHabit/App/` |
| Models | `QuranHabit/Models/` |
| Services | `QuranHabit/Services/` (`QuranDataProviding`, `MockQuranDataService`, stores, hasanat estimate) |
| View models | `QuranHabit/ViewModels/` |
| Screens | `QuranHabit/Views/` (grouped by feature) |
| Reusable UI | `QuranHabit/Components/` |
| Sample data | `QuranHabit/Resources/MockQuranSample.json` |

## Full Quran data

`MockQuranDataService` loads **`MockQuranSample.json`** (two sample pages) or falls back to tiny in-memory data. To ship the full mushaf:

1. Add your `pages.v2.json` / `surahs.v2.json` (or equivalent) to the app bundle.
2. Implement a new type conforming to **`QuranDataProviding`** that decodes your files and fills `page(_:)`, `surahs()`, etc.
3. Swap the implementation in **`AppEnvironment`**’s initializer.

## Requirements

- Xcode **15+** recommended  
- **iOS 17+** deployment target  
- Set your **Team** in the target’s **Signing & Capabilities** for device runs.

## Audio

`AudioPlaybackControlling` + **`AudioPlaybackPlaceholder`** are stubs. Replace with `AVPlayer` (or your streaming layer) when you connect recitation URLs.
