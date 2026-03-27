import type { QuranPagesPayload, QuranSurahsPayload, QuranPage } from "../types";

// Bundled datasets (page -> ayahs with true verse numbers)
// These live in mobile/assets/quran/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pagesPayload = require("../../assets/quran/pages.v2.json") as QuranPagesPayload;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const surahsPayload = require("../../assets/quran/surahs.v2.json") as QuranSurahsPayload;

export const QURAN_PAGES = pagesPayload;
export const QURAN_SURAHS = surahsPayload;

export const MUSHAF_PAGE_COUNT = 604;

export function clampPage(page: number): number {
  const p = Math.floor(page || 1);
  return Math.min(MUSHAF_PAGE_COUNT, Math.max(1, p));
}

export function getPage(page: number): QuranPage {
  const p = clampPage(page);
  return QURAN_PAGES.pages[String(p)];
}

export function findSurahStartPage(surahNumber: number): number {
  return QURAN_SURAHS.surahs.find((s) => s.number === surahNumber)?.startPage ?? 1;
}

export function findPageForAyah(surahNumber: number, ayahNumber: number): number {
  // Simple scan (fast enough for 604 pages; can be indexed later).
  for (let p = 1; p <= MUSHAF_PAGE_COUNT; p++) {
    const ayahs = QURAN_PAGES.pages[String(p)]?.ayahs ?? [];
    if (ayahs.some((a) => a.surahNumber === surahNumber && a.ayahNumber === ayahNumber)) return p;
  }
  return findSurahStartPage(surahNumber);
}

export function getFirstPageOfJuz(juz: number): number {
  const j = Math.min(30, Math.max(1, Math.floor(juz || 1)));
  for (let p = 1; p <= MUSHAF_PAGE_COUNT; p++) {
    if (QURAN_PAGES.pages[String(p)]?.juz === j) return p;
  }
  return 1;
}

