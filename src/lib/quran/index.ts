import type { QuranSurahMeta } from "@/types";

/**
 * Quran data layer (MVP)
 * - Provides a clean interface for page-based reading.
 * - Ships with a small seed dataset so the reader is real and demo-ready.
 * - Designed so a full verified dataset (604 pages, surah/juz mapping, translations)
 *   can be swapped in later without rewriting the reader UI.
 */

export const MUSHAF_PAGE_COUNT = 604;

export type QuranAyah = {
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahNumber: number;
  text: string;
};

export type QuranPageContent = {
  page: number;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  juz: number;
  /** Ayahs on this page with true surah + ayah numbers when available. */
  ayahs?: QuranAyah[];
  /** Arabic lines for the page (fallback only). */
  arabic?: string[];
  /** Optional translation lines aligned loosely (MVP). */
  translation?: string[];
};

// Minimal surah metadata (enough for jump UI + header).
// NOTE: startPage values here are for the classic Madani Mushaf pagination.
// For MVP we only rely on start pages for the first few surahs.
export const SURAHS: QuranSurahMeta[] = [
  { number: 1, nameArabic: "ٱلْفَاتِحَة", nameEnglish: "Al-Fātiḥah", ayahCount: 7, startPage: 1 },
  { number: 2, nameArabic: "ٱلْبَقَرَة", nameEnglish: "Al-Baqarah", ayahCount: 286, startPage: 2 },
  { number: 3, nameArabic: "آلِ عِمْرَان", nameEnglish: "Āl ʿImrān", ayahCount: 200, startPage: 50 },
];

// Seed pages: real Arabic for Al-Fātiḥah and the opening of Al-Baqarah.
// This is intentionally small for repo size; the interface supports plugging in a full dataset.
const SEED_PAGES: Record<number, QuranPageContent> = {
  1: {
    page: 1,
    surahNumber: 1,
    surahNameArabic: "ٱلْفَاتِحَة",
    surahNameEnglish: "Al-Fātiḥah",
    juz: 1,
    ayahs: [
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 3, text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 4, text: "مَٰلِكِ يَوْمِ ٱلدِّينِ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ" },
      { surahNumber: 1, surahNameArabic: "ٱلْفَاتِحَة", surahNameEnglish: "Al-Fātiḥah", ayahNumber: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّالِّينَ" },
    ],
    translation: [
      "In the name of Allah, the Most Compassionate, the Most Merciful.",
      "All praise is for Allah—Lord of all worlds,",
      "the Most Compassionate, the Most Merciful,",
      "Master of the Day of Judgment.",
      "You alone we worship and You alone we ask for help.",
      "Guide us along the Straight Path,",
      "the Path of those You have blessed—not those You are displeased with, or those who are astray.",
    ],
  },
  2: {
    page: 2,
    surahNumber: 2,
    surahNameArabic: "ٱلْبَقَرَة",
    surahNameEnglish: "Al-Baqarah",
    juz: 1,
    ayahs: [
      { surahNumber: 2, surahNameArabic: "ٱلْبَقَرَة", surahNameEnglish: "Al-Baqarah", ayahNumber: 1, text: "الٓمٓ" },
      { surahNumber: 2, surahNameArabic: "ٱلْبَقَرَة", surahNameEnglish: "Al-Baqarah", ayahNumber: 2, text: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ" },
      { surahNumber: 2, surahNameArabic: "ٱلْبَقَرَة", surahNameEnglish: "Al-Baqarah", ayahNumber: 3, text: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ" },
      { surahNumber: 2, surahNameArabic: "ٱلْبَقَرَة", surahNameEnglish: "Al-Baqarah", ayahNumber: 4, text: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ" },
      { surahNumber: 2, surahNameArabic: "ٱلْبَقَرَة", surahNameEnglish: "Al-Baqarah", ayahNumber: 5, text: "أُو۟لَٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ" },
    ],
    translation: [
      "In the name of Allah, the Most Compassionate, the Most Merciful.",
      "Alif-Lâm-Mîm.",
      "This is the Book! There is no doubt about it—a guide for those mindful of Allah;",
      "who believe in the unseen, establish prayer, and donate from what We have provided for them;",
      "and who believe in what has been revealed to you and what was revealed before you, and have sure faith in the Hereafter.",
      "It is they who are on true guidance from their Lord, and it is they who will be successful.",
    ],
  },
};

export function clampPage(page: number): number {
  return Math.min(MUSHAF_PAGE_COUNT, Math.max(1, Math.floor(page || 1)));
}

export function getSurahMeta(surahNumber: number): QuranSurahMeta | undefined {
  return SURAHS.find((s) => s.number === surahNumber);
}

export function getPageContent(page: number): QuranPageContent {
  const p = clampPage(page);
  const seeded = SEED_PAGES[p];
  if (seeded) return seeded;

  // Fallback placeholder with a calm empty state (still supports page flipping for UX).
  return {
    page: p,
    surahNumber: 0,
    surahNameArabic: "—",
    surahNameEnglish: "Quran",
    juz: guessJuzFromPage(p),
    ayahs: [
      { surahNumber: 0, surahNameArabic: "—", surahNameEnglish: "Quran", ayahNumber: 0, text: "…" },
      { surahNumber: 0, surahNameArabic: "—", surahNameEnglish: "Quran", ayahNumber: 0, text: "Quran content for this page isn’t bundled in the fallback dataset." },
      { surahNumber: 0, surahNameArabic: "—", surahNameEnglish: "Quran", ayahNumber: 0, text: "The full dataset should load from public/quran when available." },
    ],
  };
}

export function guessJuzFromPage(page: number): number {
  // Very rough mapping for MVP display only (real mapping will come from dataset).
  // 604 pages / 30 juz ≈ 20 pages per juz.
  return Math.min(30, Math.max(1, Math.ceil(page / 20)));
}

export function findSurahStartPage(surahNumber: number): number | null {
  const s = getSurahMeta(surahNumber);
  return s?.startPage ?? null;
}

