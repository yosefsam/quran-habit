import Foundation
import SwiftUI

@MainActor
final class ReaderViewModel: ObservableObject {
    @Published var currentPage: Int = 1
    @Published var currentPageContent: QuranPage?
    @Published var sessionAyahsRead: Int = 0
    @Published var sessionHassanatEstimate: Int = 0
    @Published var jumpSurah: Int = 1
    @Published var jumpJuz: Int = 1
    @Published var jumpPageField: String = "1"
    @Published var jumpAyahRef: String = "1:1"
    @Published var showJumpSheet: Bool = false

    private let quran: QuranDataProviding
    private let progress: ReadingProgressStore
    private let bookmarks: BookmarkStore

    init(quran: QuranDataProviding, progress: ReadingProgressStore, bookmarks: BookmarkStore) {
        self.quran = quran
        self.progress = progress
        self.bookmarks = bookmarks
    }

    /// - Parameter countSession: when `true`, accumulate ayah / hasanat estimates (navigation), not initial open.
    func load(page: Int? = nil, countSession: Bool = false) {
        let p = quran.clampPage(page ?? currentPage)
        currentPage = p
        currentPageContent = quran.page(p)
        progress.recordVisit(page: p)
        progress.updateLastRead(page: p)
        if countSession, let content = currentPageContent {
            sessionAyahsRead += content.ayahs.count
            sessionHassanatEstimate += HassanatEstimator.estimateForPage(content)
        }
    }

    func nextPage() {
        load(page: currentPage + 1, countSession: true)
    }

    func previousPage() {
        load(page: currentPage - 1, countSession: true)
    }

    func applyJump() {
        if let p = Int(jumpPageField.trimmingCharacters(in: .whitespaces)) {
            load(page: p, countSession: true)
            showJumpSheet = false
            return
        }
        if let s = quran.surahs().first(where: { $0.number == jumpSurah }) {
            load(page: s.startPage, countSession: true)
            showJumpSheet = false
            return
        }
    }

    func applyJuzJump() {
        if let p = quran.firstPageOfJuz(jumpJuz) {
            load(page: p, countSession: true)
            showJumpSheet = false
        }
    }

    func applyAyahJump() {
        let parts = jumpAyahRef.split(separator: ":").map(String.init)
        guard parts.count == 2,
              let s = Int(parts[0]),
              let a = Int(parts[1]),
              let p = quran.pageForAyah(surah: s, ayah: a) else { return }
        load(page: p, countSession: true)
        showJumpSheet = false
    }

    func toggleBookmark() {
        bookmarks.toggleBookmark(page: currentPage)
    }

    var isBookmarked: Bool {
        bookmarks.isBookmarked(page: currentPage)
    }

    func markPageCompleted() {
        progress.markCompleted(page: currentPage)
    }
}
