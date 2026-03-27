import Foundation

// MARK: - Core Quran types (aligned with mushaf page / ayah concepts)

struct QuranAyah: Identifiable, Hashable {
    var id: String { "\(surahNumber):\(ayahNumber)" }
    let surahNumber: Int
    let surahNameArabic: String
    let surahNameEnglish: String
    let ayahNumber: Int
    let text: String
}

struct QuranPage: Hashable {
    let page: Int
    let juz: Int
    let surahNumber: Int
    let surahNameArabic: String
    let surahNameEnglish: String
    let ayahs: [QuranAyah]
}

struct SurahMeta: Identifiable, Hashable {
    var id: Int { number }
    let number: Int
    let nameArabic: String
    let nameEnglish: String
    let ayahCount: Int
    let startPage: Int
}

/// Payload shapes for future JSON loading (e.g. full `pages.v2.json` import).
struct QuranPagesPayload: Codable {
    let version: Int
    let pageCount: Int
    let pages: [String: QuranPageDTO]
}

struct QuranPageDTO: Codable {
    let page: Int
    let juz: Int
    let surahNumber: Int
    let surahNameArabic: String
    let surahNameEnglish: String
    let ayahs: [QuranAyahDTO]
}

struct QuranAyahDTO: Codable {
    let surahNumber: Int
    let surahNameArabic: String
    let surahNameEnglish: String
    let ayahNumber: Int
    let text: String
}

struct QuranSurahsPayload: Codable {
    let version: Int
    let surahs: [SurahMetaDTO]
}

struct SurahMetaDTO: Codable {
    let number: Int
    let nameArabic: String
    let nameEnglish: String
    let ayahCount: Int
    let startPage: Int
}

extension QuranPage {
    static func from(dto: QuranPageDTO) -> QuranPage {
        let ayahs = dto.ayahs.map {
            QuranAyah(
                surahNumber: $0.surahNumber,
                surahNameArabic: $0.surahNameArabic,
                surahNameEnglish: $0.surahNameEnglish,
                ayahNumber: $0.ayahNumber,
                text: $0.text
            )
        }
        return QuranPage(
            page: dto.page,
            juz: dto.juz,
            surahNumber: dto.surahNumber,
            surahNameArabic: dto.surahNameArabic,
            surahNameEnglish: dto.surahNameEnglish,
            ayahs: ayahs
        )
    }
}

extension SurahMeta {
    static func from(dto: SurahMetaDTO) -> SurahMeta {
        SurahMeta(
            number: dto.number,
            nameArabic: dto.nameArabic,
            nameEnglish: dto.nameEnglish,
            ayahCount: dto.ayahCount,
            startPage: dto.startPage
        )
    }
}
