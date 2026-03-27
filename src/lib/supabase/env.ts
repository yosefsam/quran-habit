type ResolvedSupabaseEnv = {
  url?: string;
  publicKey?: string;
};

function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseProjectRefFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const { hostname } = new URL(url);
    return hostname.split(".")[0];
  } catch {
    return undefined;
  }
}

function parseProjectRefFromJwtLikeKey(key?: string): string | undefined {
  if (!key || key.startsWith("sb_")) return undefined;
  const parts = key.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { ref?: string };
    return typeof payload.ref === "string" ? payload.ref : undefined;
  } catch {
    return undefined;
  }
}

export function resolveSupabasePublicEnv(): ResolvedSupabaseEnv {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const publishableKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const publicKey = anonKey ?? publishableKey;
  return { url, publicKey };
}

/**
 * Detects obvious URL/key project mismatch for JWT-style keys.
 * For sb_publishable_* style keys, Supabase does not encode project ref in JWT payload.
 */
export function isLikelySupabaseProjectMismatch(url?: string, key?: string): boolean {
  const urlRef = parseProjectRefFromUrl(url);
  const keyRef = parseProjectRefFromJwtLikeKey(key);
  return Boolean(urlRef && keyRef && urlRef !== keyRef);
}
