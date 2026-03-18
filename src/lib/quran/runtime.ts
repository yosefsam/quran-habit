import type { QuranSurahMeta } from "@/types";
import type { QuranPageContent } from "@/lib/quran";
import { clampPage } from "@/lib/quran";

export type PagesPayload = {
  version: number;
  pageCount: number;
  pages: Record<string, QuranPageContent>;
};

export type SurahsPayload = {
  version: number;
  surahs: QuranSurahMeta[];
};

let pagesCache: PagesPayload | null = null;
let surahsCache: SurahsPayload | null = null;
let pagesPromise: Promise<PagesPayload> | null = null;
let surahsPromise: Promise<SurahsPayload> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return (await res.json()) as T;
}

export async function loadQuranPages(): Promise<PagesPayload> {
  if (pagesCache) return pagesCache;
  pagesPromise ??= fetchJson<PagesPayload>("/quran/pages.v2.json").then((p) => (pagesCache = p));
  return pagesPromise;
}

export async function loadQuranSurahs(): Promise<SurahsPayload> {
  if (surahsCache) return surahsCache;
  surahsPromise ??= fetchJson<SurahsPayload>("/quran/surahs.v2.json").then((p) => (surahsCache = p));
  return surahsPromise;
}

export function getRuntimePage(pages: PagesPayload | null, page: number): QuranPageContent | null {
  if (!pages?.pages) return null;
  const p = clampPage(page);
  return pages.pages[String(p)] ?? null;
}

