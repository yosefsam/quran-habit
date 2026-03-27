import Foundation

/// Loads sample data from `MockQuranSample.json` (bundle). Replace with full JSON + `BundledQuranDataService` later.
final class MockQuranDataService: QuranDataProviding {
    private let pagesByNumber: [Int: QuranPage]
    private let surahList: [SurahMeta]
    private let juzFirstPage: [Int: Int]

    let pageCount: Int

    init() {
        if let loaded = Self.loadCombinedSample() {
            self.pagesByNumber = loaded.pages
            self.surahList = loaded.surahs
            self.pageCount = loaded.pageCount
        } else {
            self.pagesByNumber = Self.fallbackPages
            self.surahList = Self.fallbackSurahs
            self.pageCount = 604
        }

        self.juzFirstPage = [
            1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
            11: 201, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
            21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582
        ]
    }

    func page(_ number: Int) -> QuranPage? {
        pagesByNumber[clampPage(number)]
    }

    func surahs() -> [SurahMeta] {
        surahList.sorted { $0.number < $1.number }
    }

    func pageForAyah(surah: Int, ayah: Int) -> Int? {
        for (p, page) in pagesByNumber {
            if page.ayahs.contains(where: { $0.surahNumber == surah && $0.ayahNumber == ayah }) {
                return p
            }
        }
        return surahs().first(where: { $0.number == surah })?.startPage
    }

    func firstPageOfJuz(_ juz: Int) -> Int? {
        let j = min(30, max(1, juz))
        return juzFirstPage[j]
    }

    func clampPage(_ page: Int) -> Int {
        min(pageCount, max(1, page))
    }

    // MARK: - Sample JSON

    private struct CombinedSample: Codable {
        let version: Int
        let pageCount: Int
        let pages: [String: QuranPageDTO]
        let surahs: [SurahMetaDTO]
    }

    private static func loadCombinedSample() -> (pages: [Int: QuranPage], surahs: [SurahMeta], pageCount: Int)? {
        guard let url = Bundle.main.url(forResource: "MockQuranSample", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return nil }
        guard let sample = try? JSONDecoder().decode(CombinedSample.self, from: data) else { return nil }
        var map: [Int: QuranPage] = [:]
        for (key, dto) in sample.pages {
            if let n = Int(key) {
                map[n] = QuranPage.from(dto: dto)
            }
        }
        let surahs = sample.surahs.map { SurahMeta.from(dto: $0) }
        return (map, surahs, sample.pageCount)
    }

    private static var fallbackPages: [Int: QuranPage] {
        let p1 = QuranPage(
            page: 1,
            juz: 1,
            surahNumber: 1,
            surahNameArabic: "الفاتحة",
            surahNameEnglish: "Al-Fatihah",
            ayahs: [
                QuranAyah(surahNumber: 1, surahNameArabic: "الفاتحة", surahNameEnglish: "Al-Fatihah", ayahNumber: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"),
                QuranAyah(surahNumber: 1, surahNameArabic: "الفاتحة", surahNameEnglish: "Al-Fatihah", ayahNumber: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ")
            ]
        )
        let p2 = QuranPage(
            page: 2,
            juz: 1,
            surahNumber: 2,
            surahNameArabic: "البقرة",
            surahNameEnglish: "Al-Baqarah",
            ayahs: [
                QuranAyah(surahNumber: 2, surahNameArabic: "البقرة", surahNameEnglish: "Al-Baqarah", ayahNumber: 1, text: "الم"),
                QuranAyah(surahNumber: 2, surahNameArabic: "البقرة", surahNameEnglish: "Al-Baqarah", ayahNumber: 2, text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ")
            ]
        )
        return [1: p1, 2: p2]
    }

    private static let fallbackSurahs: [SurahMeta] = [
        SurahMeta(number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah", ayahCount: 7, startPage: 1),
        SurahMeta(number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", ayahCount: 286, startPage: 2)
    ]
}
