"use client";

export type ProStatus = "unknown" | "free" | "pro";

/**
 * Redirect helper used by client components.
 * - If `proStatus === "pro"` it returns `true` and does nothing.
 * - If `proStatus === "unknown"` it returns `false` without redirecting (status not loaded yet).
 * - Otherwise it redirects to the pricing page and returns `false`.
 */
export function requireProUser({
  proStatus,
  router,
  nextPath,
  pricingPath = "/pricing",
}: {
  proStatus: ProStatus;
  router: { replace: (url: string) => void };
  nextPath: string;
  pricingPath?: string;
}): boolean {
  if (proStatus === "pro") return true;
  if (proStatus === "unknown") return false;
  const url = `${pricingPath}?next=${encodeURIComponent(nextPath)}`;
  router.replace(url);
  return false;
}

