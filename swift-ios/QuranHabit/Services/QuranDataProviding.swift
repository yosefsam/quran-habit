import Foundation

/// Abstraction for loading mushaf pages, surah metadata, and lookups.
/// Replace `MockQuranDataService` with a bundle loader for full `pages.v2.json` / `surahs.v2.json` when ready.
protocol QuranDataProviding: AnyObject {
    var pageCount: Int { get }
    func page(_ number: Int) -> QuranPage?
    func surahs() -> [SurahMeta]
    func pageForAyah(surah: Int, ayah: Int) -> Int?
    func firstPageOfJuz(_ juz: Int) -> Int?
    func clampPage(_ page: Int) -> Int
}
