/** Daily free-tier cap for reader/session (authenticated, non-Pro). Env: FREE_DAILY_READER_LIMIT */
export function getFreeDailyReaderLimit(): number {
  const raw = process.env.FREE_DAILY_READER_LIMIT;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 3;
}
