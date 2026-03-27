import Foundation
import SwiftUI

/// Shared services + view models (constructed once for the app lifetime).
@MainActor
final class AppEnvironment: ObservableObject {
    let quranData: QuranDataProviding
    let bookmarkStore: BookmarkStore
    let progressStore: ReadingProgressStore

    let homeViewModel: HomeViewModel
    let readerViewModel: ReaderViewModel
    let bookmarksViewModel: BookmarksViewModel
    let analyticsViewModel: AnalyticsViewModel
    let settingsViewModel: SettingsViewModel

    init(
        quranData: QuranDataProviding? = nil,
        bookmarkStore: BookmarkStore? = nil,
        progressStore: ReadingProgressStore? = nil
    ) {
        let quran = quranData ?? MockQuranDataService()
        let bookmarks = bookmarkStore ?? BookmarkStore()
        let progress = progressStore ?? ReadingProgressStore()

        self.quranData = quran
        self.bookmarkStore = bookmarks
        self.progressStore = progress

        self.homeViewModel = HomeViewModel(quran: quran, progress: progress)
        self.readerViewModel = ReaderViewModel(quran: quran, progress: progress, bookmarks: bookmarks)
        self.bookmarksViewModel = BookmarksViewModel(store: bookmarks, quran: quran)
        self.analyticsViewModel = AnalyticsViewModel(quran: quran, progress: progress)
        self.settingsViewModel = SettingsViewModel()
    }
}
