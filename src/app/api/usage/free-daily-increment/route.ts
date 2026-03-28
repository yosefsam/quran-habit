import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatusWithClient } from "@/lib/subscription/getUserSubscriptionStatus";
import { getFreeDailyReaderLimit } from "@/lib/subscription/freeTierLimits";

export const dynamic = "force-dynamic";

/**
 * Increments today's free-tier usage counter (reader + session share one pool).
 * Pro users: no increment, returns { isPro: true }.
 * When the daily cap is already reached, returns 429 so the client can show a paywall.
 */
export async function POST() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 501 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await getUserSubscriptionStatusWithClient(supabase, user.id);
  const limit = getFreeDailyReaderLimit();

  if (subscription.isPro) {
    return NextResponse.json({ ok: true, isPro: true, unlimited: true, limit });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRow } = await supabase
    .from("free_usage_daily")
    .select("reader_visits")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  const current = Number(usageRow?.reader_visits ?? 0) || 0;
  if (current >= limit) {
    return NextResponse.json(
      { ok: false, limitReached: true, used: current, limit, isPro: false },
      { status: 429 }
    );
  }

  const next = current + 1;
  const { error } = await supabase.from("free_usage_daily").upsert(
    {
      user_id: user.id,
      usage_date: today,
      reader_visits: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, isPro: false, used: next, limit, limitReached: next >= limit });
}
