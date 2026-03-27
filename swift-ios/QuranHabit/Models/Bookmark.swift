import Foundation

struct QuranBookmark: Identifiable, Codable, Hashable {
    let id: UUID
    var page: Int
    var label: String?
    var createdAt: Date

    init(id: UUID = UUID(), page: Int, label: String? = nil, createdAt: Date = .now) {
        self.id = id
        self.page = page
        self.label = label
        self.createdAt = createdAt
    }
}
