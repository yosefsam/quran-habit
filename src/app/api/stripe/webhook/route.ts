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

function userIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const ref = session.client_reference_id;
  if (typeof ref === "string" && ref.trim()) return ref.trim();
  const meta = session.metadata?.user_id;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
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

  console.log("[stripe webhook] received event", { type: event.type, id: event.id });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 501 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = userIdFromCheckoutSession(session);
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const stripeSubscriptionId = subscriptionIdFromSession(session);

        console.log("[stripe webhook] checkout.session.completed extracted", {
          userId: userId ?? "(missing)",
          stripeCustomerId: customerId ?? "(none)",
          stripeSubscriptionId: stripeSubscriptionId ?? "(none)",
          sessionId: session.id,
        });

        if (stripeSubscriptionId) {
          const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          await syncStripeSubscriptionToSupabase(admin, sub);
        }

        if (!userId) {
          console.error(
            "[stripe webhook] checkout.session.completed: missing user id (client_reference_id or metadata.user_id)",
            { sessionId: session.id }
          );
          break;
        }

        const profileUpdate: Record<string, unknown> = {
          is_pro: true,
          subscription_status: "active",
        };
        if (customerId) profileUpdate.stripe_customer_id = customerId;
        if (stripeSubscriptionId) profileUpdate.stripe_subscription_id = stripeSubscriptionId;

        const { error: profileErr } = await admin.from("profiles").update(profileUpdate).eq("id", userId);
        if (profileErr) {
          console.error("[stripe webhook] checkout.session.completed: Supabase profiles update failed", {
            userId,
            message: profileErr.message,
            code: profileErr.code,
          });
          return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
        }

        console.log("[stripe webhook] checkout.session.completed: profiles update success", { userId });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.user_id ?? null;
        console.log("[stripe webhook] subscription event extracted", {
          type: event.type,
          userIdFromMetadata: typeof uid === "string" && uid ? uid : "(missing)",
          subscriptionId: sub.id,
        });

        const { userId } = await syncStripeSubscriptionToSupabase(admin, sub);
        if (!userId) {
          console.error("[stripe webhook] subscription sync: could not resolve Supabase user id", {
            type: event.type,
            subscriptionId: sub.id,
          });
        } else {
          console.log("[stripe webhook] subscription sync success", { userId, type: event.type });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler error", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
