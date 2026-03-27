import SwiftUI

/// App entry point — open this project in Xcode and run the **QuranHabit** scheme.
@main
struct QuranHabitApp: App {
    @StateObject private var appEnvironment = AppEnvironment()

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(appEnvironment)
        }
    }
}
