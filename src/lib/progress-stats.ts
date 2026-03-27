import { MUSHAF_PAGE_COUNT } from "@/lib/quran";

export function mushafCompletionPercent(completedUniquePages: number): number {
  if (completedUniquePages <= 0) return 0;
  return Math.min(100, Math.round((completedUniquePages / MUSHAF_PAGE_COUNT) * 1000) / 10);
}

export function formatCompletionLine(completedUniquePages: number): string {
  const pct = mushafCompletionPercent(completedUniquePages);
  return `${completedUniquePages} / ${MUSHAF_PAGE_COUNT} pages · ${pct}% of the Quran`;
}
