import type { ReadingUnit } from "@/types";

const HASANAT_PER_UNIT: Record<ReadingUnit, number> = {
  pages: 500,
  ayahs: 15,
  minutes: 80,
  surahs: 200,
};

export function getHasanatForSession(amount: number, unit: ReadingUnit): number {
  return amount * (HASANAT_PER_UNIT[unit] ?? 0);
}

export function formatHasanat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}
