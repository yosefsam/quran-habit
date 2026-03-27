import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isLikelySupabaseProjectMismatch, resolveSupabasePublicEnv } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publicKey: key } = resolveSupabasePublicEnv();
  if (!url || !key) return null as unknown as ReturnType<typeof createServerClient>;
  if (isLikelySupabaseProjectMismatch(url, key)) return null as unknown as ReturnType<typeof createServerClient>;
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
