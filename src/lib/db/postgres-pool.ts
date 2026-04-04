import { Pool } from "pg";

/** Singleton pool for server-side direct Postgres (bypasses PostgREST). Not for client bundles. */
let pool: Pool | undefined;

export function getPostgresPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 5,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}
