import type { ReadingUnit } from "@/types";
import { estimateHasanatForManualEntry } from "@/lib/hasanat/estimate";

/**
 * Manual / logged sessions without loaded Arabic text: uses statistical letter proxies.
 * For reader sessions, use `estimateHasanatForPageContent` from `@/lib/hasanat/estimate` per page.
 */
export function getHasanatForSession(amount: number, unit: ReadingUnit): number {
  return estimateHasanatForManualEntry(amount, unit);
}

export function formatHasanat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export const HASANAT_DISCLAIMER =
  "Hassanat shown here are motivational estimates for reflection and consistency, not a definitive count.";
