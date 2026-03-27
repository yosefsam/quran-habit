import Foundation

/// Last reading position (mushaf page).
struct LastReadPosition: Codable, Hashable {
    var page: Int
    var updatedAt: Date
}

/// Tracks visited / completed pages for analytics (604-page mushaf).
struct PageProgressSnapshot: Codable, Equatable {
    var visitedPageNumbers: Set<Int>
    var completedPageNumbers: Set<Int>
    var lastRead: LastReadPosition?

    static let empty = PageProgressSnapshot(
        visitedPageNumbers: [],
        completedPageNumbers: [],
        lastRead: nil
    )
}
