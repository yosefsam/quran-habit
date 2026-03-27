import { createBrowserClient } from "@supabase/ssr";

/**
 * Thrown when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing.
 * Next.js inlines `NEXT_PUBLIC_*` at build time — restart dev server after changing `.env.local`.
 */
export class SupabaseEnvError extends Error {
  constructor() {
    super(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy env.example to .env.local, add your Supabase URL and anon key, then restart the dev server (npm run dev)."
    );
    this.name = "SupabaseEnvError";
  }
}

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Browser Supabase client (singleton). Always returns a valid client or throws — never null.
 */
export function createClient(): ReturnType<typeof createBrowserClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (process.env.NODE_ENV === "development") {
    console.log("[Supabase client]", {
      hasUrl: Boolean(url),
      urlPreview: url ? `${url.slice(0, 40)}${url.length > 40 ? "…" : ""}` : "(empty)",
      hasAnonKey: Boolean(key),
      anonKeyLength: key?.length ?? 0,
    });
  }

  if (!url || !key) {
    throw new SupabaseEnvError();
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}
