import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStripeSubscriptionToSupabase } from "@/lib/stripe/syncSubscriptionToSupabase";

export const runtime = "nodejs";

function subscriptionIdFromSession(session: Stripe.Checkout.Session): string | null {
  const sub = session.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return (sub as Stripe.Subscription).id;
  return null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 501 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 501 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (typeof session.client_reference_id === "string" && session.client_reference_id
            ? session.client_reference_id
            : null) ??
          (typeof session.metadata?.user_id === "string" && session.metadata.user_id ? session.metadata.user_id : null);

        const subscriptionId = subscriptionIdFromSession(session);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscriptionToSupabase(admin, sub);
        } else {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
          if (userId && customerId) {
            const { error: custErr } = await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
            if (custErr) {
              console.error("[stripe webhook] checkout.session.completed: stripe_customer_id update failed", {
                userId,
                message: custErr.message,
              });
            }
          }
        }

        if (!userId) {
          console.error(
            "[stripe webhook] checkout.session.completed: missing user id (expected client_reference_id or metadata.user_id)",
            { sessionId: session.id }
          );
        } else {
          const { error: profileErr } = await admin.from("profiles").update({
            is_pro: true,
            subscription_status: "active",
          }).eq("id", userId);
          if (profileErr) {
            console.error("[stripe webhook] checkout.session.completed: Supabase profiles update failed", {
              userId,
              message: profileErr.message,
              code: profileErr.code,
            });
            return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncStripeSubscriptionToSupabase(admin, sub);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("stripe webhook handler", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
