export type ReadingUnit = "pages" | "ayahs" | "minutes" | "surahs";

export type QuranAyah = {
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahNumber: number;
  text: string;
};

export type QuranPage = {
  page: number;
  juz: number;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahs: QuranAyah[];
};

export type QuranPagesPayload = {
  version: number;
  pageCount: number;
  pages: Record<string, QuranPage>;
};

export type QuranSurahMeta = {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
  startPage: number;
};

export type QuranSurahsPayload = {
  version: number;
  surahs: QuranSurahMeta[];
};

export type Bookmark = {
  id: string;
  page: number;
  createdAt: string;
};

export type LastRead = {
  page: number;
  updatedAt: string;
};

