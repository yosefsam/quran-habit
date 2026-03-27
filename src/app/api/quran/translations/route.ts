import { NextResponse } from "next/server";
import type { TranslationKey } from "@/lib/quran/translations";

export const runtime = "nodejs";

const TRANSLATION_IDS: Record<TranslationKey, number> = {
  // Verified Quran.com translation IDs.
  sahih: 20,
  pickthall: 19,
  yusufali: 22,
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageRaw = searchParams.get("page");
  const keyRaw = (searchParams.get("translation") ?? "sahih") as TranslationKey;

  const page = Number.parseInt(pageRaw ?? "1", 10);
  if (!Number.isFinite(page) || page < 1 || page > 604) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }
  if (!(keyRaw in TRANSLATION_IDS)) {
    return NextResponse.json({ error: "Invalid translation" }, { status: 400 });
  }

  const translationId = TRANSLATION_IDS[keyRaw];
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?translations=${translationId}&fields=verse_key&per_page=50`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 502 });
  }
  const data = (await res.json()) as {
    verses?: Array<{ verse_key: string; translations?: Array<{ text?: string }> }>;
  };

  const verses: Record<string, string> = {};
  for (const v of data.verses ?? []) {
    const text = v.translations?.[0]?.text;
    if (!v.verse_key || !text) continue;
    verses[v.verse_key] = stripHtml(text);
  }

  return NextResponse.json({
    page,
    translation: keyRaw,
    source: `Quran.com API v4 (translation id ${translationId})`,
    verses,
  });
}

