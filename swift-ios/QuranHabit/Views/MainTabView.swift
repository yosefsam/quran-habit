import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var env: AppEnvironment

    var body: some View {
        TabView {
            HomeView(viewModel: env.homeViewModel)
                .tabItem { Label("Home", systemImage: "house.fill") }

            ReaderView(viewModel: env.readerViewModel, quran: env.quranData)
                .tabItem { Label("Read", systemImage: "book.fill") }

            BookmarksView(viewModel: env.bookmarksViewModel)
                .tabItem { Label("Bookmarks", systemImage: "bookmark.fill") }

            AnalyticsDashboardView(viewModel: env.analyticsViewModel)
                .tabItem { Label("Progress", systemImage: "chart.bar.fill") }

            SettingsView(viewModel: env.settingsViewModel)
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(.green)
    }
}
