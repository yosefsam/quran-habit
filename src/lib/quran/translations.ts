export type TranslationKey = "sahih" | "pickthall" | "yusufali";

export type TranslationOption = {
  key: TranslationKey;
  label: string;
  source: string;
};

export const TRANSLATION_OPTIONS: TranslationOption[] = [
  { key: "sahih", label: "Sahih International", source: "Quran.com translation id 20" },
  { key: "pickthall", label: "Pickthall", source: "Quran.com translation id 19" },
  { key: "yusufali", label: "Yusuf Ali", source: "Quran.com translation id 22" },
];

type TranslationPayload = {
  page: number;
  translation: TranslationKey;
  source: string;
  verses: Record<string, string>;
};

const cache = new Map<string, TranslationPayload>();

function cacheKey(page: number, translation: TranslationKey): string {
  return `${page}:${translation}`;
}

/** Client helper: cached per page + translation, avoids repeated fetches. */
export async function loadPageTranslations(page: number, translation: TranslationKey): Promise<TranslationPayload> {
  const p = Math.max(1, Math.min(604, Math.floor(page || 1)));
  const key = cacheKey(p, translation);
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch(`/api/quran/translations?page=${p}&translation=${translation}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("Could not load translation payload");
  const payload = (await res.json()) as TranslationPayload;
  cache.set(key, payload);
  return payload;
}

