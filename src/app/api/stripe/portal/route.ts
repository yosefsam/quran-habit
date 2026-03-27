import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

export async function POST() {
  const stripe = getStripe();
  const supabase = await createClient();
  if (!stripe || !supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet. Subscribe first." }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getSiteUrl()}/profile`,
  });

  return NextResponse.json({ url: portal.url });
}
