/**
 * Hasanat (reward) estimates — motivational only, not a definitive religious count.
 *
 * Reader sessions: we estimate from Arabic letter counts in the open-source mushaf text
 * (Madani-style dataset) when ayah text is available. A common convention in apps is to
 * scale by letters read (often discussed alongside hadith on reward per letter); we use a
 * single linear factor and document it — still an estimate, not certainty.
 *
 * Manual logs: when exact text isn't loaded, we use conservative statistical averages
 * derived from typical mushaf typography (letters per page / per ayah).
 */

import { clampPage, getPageContent, type QuranPageContent } from "@/lib/quran";
import type { ReadingUnit } from "@/types";
import { getRuntimePage, type PagesPayload } from "@/lib/quran/runtime";

/** Tunable scalar: "hasanat units" per Arabic letter (motivational aggregate, not literal fiqh). */
export const HASANAT_UNITS_PER_ARABIC_LETTER = 10;

/** Approximate mean letters per Madani mushaf page (used only when ayah text is unavailable). */
export const FALLBACK_LETTERS_PER_PAGE = 1520;

/** Approximate mean letters per verse across the Quran (manual "verses read" logs). */
export const FALLBACK_LETTERS_PER_AYAH = 88;

/** Rough minutes → letters proxy for manual logs (low confidence). */
export const FALLBACK_LETTERS_PER_MINUTE = 320;

const DIACRITIC_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_LETTER_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

/**
 * Count Arabic letters in a string, ignoring combining marks / diacritics.
 */
export function countArabicLetters(text: string): number {
  if (!text) return 0;
  const stripped = text.normalize("NFC").replace(DIACRITIC_REGEX, "");
  const matches = stripped.match(ARABIC_LETTER_REGEX);
  return matches ? matches.length : 0;
}

export function estimateLettersForPageContent(content: QuranPageContent | null): number {
  if (!content) return FALLBACK_LETTERS_PER_PAGE;
  if (content.ayahs?.length) {
    let sum = 0;
    for (const a of content.ayahs) {
      sum += countArabicLetters(a.text);
    }
    return Math.max(1, sum);
  }
  if (content.arabic?.length) {
    const sum = content.arabic.reduce((acc, line) => acc + countArabicLetters(line), 0);
    return Math.max(1, sum);
  }
  return FALLBACK_LETTERS_PER_PAGE;
}

/**
 * Motivational hasanat estimate for one mushaf page, from actual verse text when present.
 */
export function estimateHasanatForPageContent(content: QuranPageContent | null): number {
  const letters = estimateLettersForPageContent(content);
  return Math.round(letters * HASANAT_UNITS_PER_ARABIC_LETTER);
}

/**
 * Manual / non-reader sessions: best-effort when we don't have the Arabic string.
 */
export function estimateHasanatForManualEntry(amount: number, unit: ReadingUnit): number {
  if (amount <= 0) return 0;
  switch (unit) {
    case "pages":
      return Math.round(amount * FALLBACK_LETTERS_PER_PAGE * HASANAT_UNITS_PER_ARABIC_LETTER);
    case "ayahs":
      return Math.round(amount * FALLBACK_LETTERS_PER_AYAH * HASANAT_UNITS_PER_ARABIC_LETTER);
    case "minutes":
      return Math.round(amount * FALLBACK_LETTERS_PER_MINUTE * HASANAT_UNITS_PER_ARABIC_LETTER);
    case "surahs":
      // Very rough aggregate when surah count is logged without text (length varies widely by surah).
      return Math.round(amount * 3500 * HASANAT_UNITS_PER_ARABIC_LETTER);
    default:
      return 0;
  }
}

/**
 * If each page in the set were read once, total motivational hasanat from letter counts (unique pages).
 * Independent of session totals (which count re-reads per visit).
 */
export function estimateUniqueCompletedHasanat(
  completedPageNumbers: number[],
  payload: PagesPayload | null
): number {
  let sum = 0;
  const seen = new Set<number>();
  for (const raw of completedPageNumbers) {
    const p = clampPage(raw);
    if (seen.has(p)) continue;
    seen.add(p);
    const content = getRuntimePage(payload, p) ?? getPageContent(p);
    sum += estimateHasanatForPageContent(content);
  }
  return Math.round(sum);
}
