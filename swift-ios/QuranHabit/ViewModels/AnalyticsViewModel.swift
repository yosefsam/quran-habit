import Foundation

@MainActor
final class AnalyticsViewModel: ObservableObject {
    @Published var visitedCount: Int = 0
    @Published var completedCount: Int = 0
    @Published var totalPages: Int = 604
    @Published var lastReadText: String = "—"

    private let quran: QuranDataProviding
    private let progress: ReadingProgressStore

    init(quran: QuranDataProviding, progress: ReadingProgressStore) {
        self.quran = quran
        self.progress = progress
    }

    func refresh() {
        totalPages = quran.pageCount
        visitedCount = progress.visitedCount(totalPages: totalPages)
        completedCount = progress.snapshot.completedPageNumbers.count
        if let lr = progress.snapshot.lastRead {
            lastReadText = "Page \(lr.page) · \(Self.format(lr.updatedAt))"
        } else {
            lastReadText = "—"
        }
    }

    private static func format(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .short
        return f.string(from: date)
    }
}
