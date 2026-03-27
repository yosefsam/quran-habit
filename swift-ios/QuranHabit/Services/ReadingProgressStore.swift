import Foundation

@MainActor
final class ReadingProgressStore: ObservableObject {
    @Published private(set) var snapshot: PageProgressSnapshot = .empty

    private let storageKey = "quranhabit.progress.v1"

    init() {
        load()
    }

    func recordVisit(page: Int) {
        var s = snapshot
        s.visitedPageNumbers.insert(page)
        snapshot = s
        save()
    }

    func markCompleted(page: Int) {
        var s = snapshot
        s.completedPageNumbers.insert(page)
        s.visitedPageNumbers.insert(page)
        snapshot = s
        save()
    }

    func updateLastRead(page: Int) {
        var s = snapshot
        s.lastRead = LastReadPosition(page: page, updatedAt: .now)
        snapshot = s
        save()
    }

    func visitedCount(totalPages: Int) -> Int {
        snapshot.visitedPageNumbers.filter { $0 >= 1 && $0 <= totalPages }.count
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else {
            snapshot = .empty
            return
        }
        if let decoded = try? JSONDecoder().decode(PageProgressSnapshotCodable.self, from: data) {
            snapshot = decoded.snapshot
        }
    }

    private func save() {
        let codable = PageProgressSnapshotCodable(snapshot: snapshot)
        if let data = try? JSONEncoder().encode(codable) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}

/// `Codable` wrapper because `Set` encodes as array in JSON — keep stable.
private struct PageProgressSnapshotCodable: Codable {
    var visited: [Int]
    var completed: [Int]
    var lastRead: LastReadPosition?

    init(snapshot: PageProgressSnapshot) {
        self.visited = Array(snapshot.visitedPageNumbers).sorted()
        self.completed = Array(snapshot.completedPageNumbers).sorted()
        self.lastRead = snapshot.lastRead
    }

    var snapshot: PageProgressSnapshot {
        PageProgressSnapshot(
            visitedPageNumbers: Set(visited),
            completedPageNumbers: Set(completed),
            lastRead: lastRead
        )
    }
}
