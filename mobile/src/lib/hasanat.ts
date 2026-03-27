export function getHasanatForPages(pages: number): number {
  // Same transparent MVP model as web: 500 per page.
  return Math.max(0, Math.floor(pages)) * 500;
}

export function formatHasanat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

