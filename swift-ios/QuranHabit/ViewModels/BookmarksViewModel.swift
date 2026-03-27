import Foundation

@MainActor
final class BookmarksViewModel: ObservableObject {
    @Published var items: [QuranBookmark] = []

    private let store: BookmarkStore
    private let quran: QuranDataProviding

    init(store: BookmarkStore, quran: QuranDataProviding) {
        self.store = store
        self.quran = quran
    }

    func refresh() {
        items = store.bookmarks
    }

    func remove(_ b: QuranBookmark) {
        store.remove(b)
        refresh()
    }

    func title(for page: Int) -> String {
        if let p = quran.page(page) {
            return "p.\(page) · \(p.surahNameEnglish)"
        }
        return "Page \(page)"
    }
}
