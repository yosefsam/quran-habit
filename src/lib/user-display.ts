import type { User } from "@supabase/supabase-js";

export type ProfileDisplayFields = {
  full_name?: string | null;
  display_name?: string | null;
};

function trimStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Display name for UI: profile columns first, then auth metadata, then email local-part, else "User".
 * Query `profiles.display_name` (and `full_name` when that column exists) from Supabase.
 */
export function resolveUserDisplayName(
  profile: ProfileDisplayFields | null | undefined,
  user: Pick<User, "email" | "user_metadata">
): string {
  const fromProfileFull = trimStr(profile?.full_name);
  if (fromProfileFull) return fromProfileFull;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaFull = trimStr(meta?.full_name);
  if (metaFull) return metaFull;
  const metaName = trimStr(meta?.name);
  if (metaName) return metaName;
  const given = trimStr(meta?.given_name);
  if (given) return given;

  const fromProfileDisplay = trimStr(profile?.display_name);
  if (fromProfileDisplay) return fromProfileDisplay;

  const email = user.email?.trim();
  if (email) {
    const local = email.split("@")[0];
    if (local) return local;
    return email;
  }
  return "User";
}
