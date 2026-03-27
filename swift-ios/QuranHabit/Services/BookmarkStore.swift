import Foundation

@MainActor
final class BookmarkStore: ObservableObject {
    @Published private(set) var bookmarks: [QuranBookmark] = []

    private let storageKey = "quranhabit.bookmarks.v1"

    init() {
        load()
    }

    func toggleBookmark(page: Int) {
        if let idx = bookmarks.firstIndex(where: { $0.page == page }) {
            bookmarks.remove(at: idx)
        } else {
            bookmarks.append(QuranBookmark(page: page))
        }
        save()
    }

    func isBookmarked(page: Int) -> Bool {
        bookmarks.contains { $0.page == page }
    }

    func remove(_ bookmark: QuranBookmark) {
        bookmarks.removeAll { $0.id == bookmark.id }
        save()
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([QuranBookmark].self, from: data) else {
            bookmarks = []
            return
        }
        bookmarks = decoded.sorted { $0.createdAt > $1.createdAt }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(bookmarks) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
