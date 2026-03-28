import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserSubscriptionStatus = {
  isPro: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
};

/**
 * Same logic as admin-based check, but uses the caller's Supabase client (user JWT + RLS).
 * Use this from Route Handlers where `createClient()` has the user's session — avoids requiring
 * SUPABASE_SERVICE_ROLE_KEY for Pro status on the client sync path.
 */
export async function getUserSubscriptionStatusWithClient(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSubscriptionStatus> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    const status = (data.status ?? null) as string | null;
    const currentPeriodEnd = data.current_period_end ?? null;
    const isStatusActive = status === "active" || status === "trialing";
    const isPeriodValid = !currentPeriodEnd || new Date(currentPeriodEnd).getTime() > Date.now();
    return {
      isPro: Boolean(isStatusActive && isPeriodValid),
      status,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
    };
  }

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("is_pro,subscription_tier,subscription_status,current_period_end")
    .eq("id", userId)
    .maybeSingle();
  if (profErr) throw profErr;

  const isPro = Boolean(prof?.is_pro === true || prof?.subscription_tier === "premium");
  const currentPeriodEnd = prof?.current_period_end ?? null;

  return {
    isPro,
    status: (prof?.subscription_status ?? null) as string | null,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
  };
}

/**
 * Server-side helper: determines whether a user has an active Stripe subscription.
 * Uses `public.subscriptions` as the source of truth (webhook-managed).
 */
export async function getUserSubscriptionStatus(userId: string): Promise<UserSubscriptionStatus> {
  const admin = createAdminClient();
  if (!admin) {
    // Without the service-role key, we cannot reliably check Stripe subscription state.
    // Fail closed for Pro gating but avoid breaking reading-state sync.
    return { isPro: false, status: null, currentPeriodEnd: null };
  }

  const { data, error } = await admin
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Primary source: webhook-managed subscriptions table.
  if (data) {
    const status = (data.status ?? null) as string | null;
    const currentPeriodEnd = data.current_period_end ?? null;
    const isStatusActive = status === "active" || status === "trialing";
    const isPeriodValid = !currentPeriodEnd || new Date(currentPeriodEnd).getTime() > Date.now();
    return {
      isPro: Boolean(isStatusActive && isPeriodValid),
      status,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
    };
  }

  // Fallback: during checkout, we may set flags on `profiles` before the subscriptions
  // table record is written by the webhook.
  const { data: prof, error: profErr } = await admin
    .from("profiles")
    .select("is_pro,subscription_tier,subscription_status,current_period_end")
    .eq("id", userId)
    .maybeSingle();
  if (profErr) throw profErr;

  const isPro = Boolean(prof?.is_pro === true || prof?.subscription_tier === "premium");
  const currentPeriodEnd = prof?.current_period_end ?? null;

  return {
    isPro,
    status: (prof?.subscription_status ?? null) as string | null,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
  };
}

