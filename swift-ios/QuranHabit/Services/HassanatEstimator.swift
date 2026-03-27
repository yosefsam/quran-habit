import Foundation

/// Rough hasanat-style estimate from reading activity (placeholder logic — tune with your scholarly sources).
enum HassanatEstimator {
    /// Typical teaching: ~10 hasanat per letter; we use a simplified per-ayah multiplier for UI.
    static func estimateForAyahsRead(_ count: Int) -> Int {
        max(0, count * 100)
    }

    static func estimateForPage(_ page: QuranPage) -> Int {
        estimateForAyahsRead(page.ayahs.count)
    }

    static func formatted(_ value: Int) -> String {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        return f.string(from: NSNumber(value: value)) ?? "\(value)"
    }
}
