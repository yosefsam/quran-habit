import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

export async function POST() {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_PREMIUM;
  if (!stripe || !priceId) {
    return NextResponse.json({ error: "Stripe checkout is not configured (STRIPE_PRICE_PREMIUM)." }, { status: 501 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

  const site = getSiteUrl();
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${site}/profile?subscription=success`,
    cancel_url: `${site}/pricing?canceled=1`,
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  };

  if (profile?.stripe_customer_id) params.customer = profile.stripe_customer_id;
  else if (user.email) params.customer_email = user.email;

  const session = await stripe.checkout.sessions.create(params);

  if (!session.url) return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
