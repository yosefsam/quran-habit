import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://raw.githubusercontent.com/hamzakat/madani-muhsaf-json/main/madani-muhsaf.json";
const SOURCE_FILE = process.env.QURAN_SOURCE_FILE || "";

function normalizeSpace(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/^ /, "")
    .replace(/ $/, "");
}

function toInt(x, fallback = 0) {
  const n = typeof x === "number" ? x : parseInt(String(x ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return await res.json();
}

function extractFirstSurahEntry(pageObj) {
  // pageObj shape: { "2": {chapterNumber,...,text:[...]}, "juzNumber": 1 }
  const keys = Object.keys(pageObj).filter((k) => k !== "juzNumber");
  if (keys.length === 0) return null;
  keys.sort((a, b) => toInt(a) - toInt(b));
  return pageObj[keys[0]] ?? null;
}

function build() {
  const sourcePromise = SOURCE_FILE
    ? fs.readFile(SOURCE_FILE, "utf8").then((txt) => JSON.parse(txt))
    : fetchJson(SOURCE_URL);

  return sourcePromise.then((raw) => {
    if (!Array.isArray(raw)) throw new Error("Unexpected dataset shape (expected array).");

    /** @type {Record<string, any>} */
    const pages = {};
    /** @type {Map<number, any>} */
    const surahMap = new Map();

    for (let i = 1; i < raw.length; i++) {
      const pageNumber = i;
      const pageObj = raw[i];
      if (!pageObj || typeof pageObj !== "object") continue;

      const juz = toInt(pageObj.juzNumber, 1);

      // A page can contain multiple surah entries; flatten all verses in order WITH true verse numbers.
      const surahKeys = Object.keys(pageObj).filter((k) => k !== "juzNumber");
      surahKeys.sort((a, b) => toInt(a) - toInt(b));

      const ayahs = [];
      for (const key of surahKeys) {
        const s = pageObj[key];
        if (!s) continue;
        const surahNumber = toInt(s.chapterNumber || key);

        const meta = {
          number: surahNumber,
          nameArabic: normalizeSpace(s.titleAr),
          nameEnglish: normalizeSpace(s.titleEn),
          ayahCount: toInt(s.verseCount, 0),
          startPage: pageNumber,
        };
        const existing = surahMap.get(surahNumber);
        if (!existing || pageNumber < existing.startPage) surahMap.set(surahNumber, meta);

        const verses = Array.isArray(s.text) ? s.text : [];
        for (const v of verses) {
          const text = normalizeSpace(v?.text);
          const ayahNumber = toInt(v?.verseNumber, 0);
          if (!text) continue;
          ayahs.push({
            surahNumber,
            surahNameArabic: meta.nameArabic,
            surahNameEnglish: meta.nameEnglish,
            ayahNumber,
            text,
          });
        }
      }

      const firstSurah = extractFirstSurahEntry(pageObj);
      const surahNumber = firstSurah ? toInt(firstSurah.chapterNumber) : 0;
      const surahNameArabic = firstSurah ? normalizeSpace(firstSurah.titleAr) : "—";
      const surahNameEnglish = firstSurah ? normalizeSpace(firstSurah.titleEn) : "Quran";

      pages[String(pageNumber)] = {
        page: pageNumber,
        surahNumber,
        surahNameArabic,
        surahNameEnglish,
        juz,
        ayahs,
      };
    }

    const surahs = Array.from(surahMap.values()).sort((a, b) => a.number - b.number);

    return { pages, surahs, pageCount: Object.keys(pages).length };
  });
}

async function main() {
  const projectRoot = process.cwd();
  const outDir = path.join(projectRoot, "public", "quran");
  await fs.mkdir(outDir, { recursive: true });

  const { pages, surahs, pageCount } = await build();
  const version = 2;

  const pagesPayload = {
    version,
    source: "hamzakat/madani-muhsaf-json (Madani mushaf paging)",
    pageCount,
    generatedAt: new Date().toISOString(),
    pages,
  };

  const surahsPayload = {
    version,
    source: "hamzakat/madani-muhsaf-json (Madani mushaf paging)",
    generatedAt: new Date().toISOString(),
    surahs,
  };

  await fs.writeFile(path.join(outDir, "pages.v2.json"), JSON.stringify(pagesPayload), "utf8");
  await fs.writeFile(path.join(outDir, "surahs.v2.json"), JSON.stringify(surahsPayload), "utf8");

  console.log(`Wrote ${pageCount} pages to public/quran/pages.v2.json`);
  console.log(`Wrote ${surahs.length} surahs to public/quran/surahs.v2.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

