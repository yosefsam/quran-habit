/** Legacy keys — migrated once into Zustand; still cleared on reset. */
export const LEGACY_STORAGE_VISITED = "quran_reader_pages_visited_v1";
export const LEGACY_STORAGE_COMPLETED = "quran_reader_pages_completed_v1";

export function loadLegacyPageSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(
      arr
        .map((x) => parseInt(String(x), 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 604)
    );
  } catch {
    return new Set();
  }
}

export function clearLegacyReaderStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_VISITED);
    localStorage.removeItem(LEGACY_STORAGE_COMPLETED);
  } catch {}
}
