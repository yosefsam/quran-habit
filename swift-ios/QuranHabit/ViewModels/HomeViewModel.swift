import Foundation

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var greeting: String = ""
    @Published var lastReadPage: Int?
    @Published var visitedSummary: String = ""

    private let quran: QuranDataProviding
    private let progress: ReadingProgressStore

    init(quran: QuranDataProviding, progress: ReadingProgressStore) {
        self.quran = quran
        self.progress = progress
    }

    func refresh() {
        greeting = Self.timeBasedGreeting()
        lastReadPage = progress.snapshot.lastRead?.page
        let total = quran.pageCount
        let n = progress.visitedCount(totalPages: total)
        visitedSummary = "\(n) / \(total) pages visited"
    }

    private static func timeBasedGreeting() -> String {
        let h = Calendar.current.component(.hour, from: .now)
        switch h {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<22: return "Good evening"
        default: return "Peace"
        }
    }
}
