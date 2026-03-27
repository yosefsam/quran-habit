"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Check } from "lucide-react";

export default function PricingPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return undefined;
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limitReason = searchParams.get("limit");
  const nextPath = searchParams.get("next");

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = `/login?next=${encodeURIComponent(nextPath || "/pricing")}`;
        return;
      }
      const res = await fetch("/api/stripe/checkout", { method: "POST", credentials: "include" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Checkout unavailable");
        setLoading(false);
        return;
      }
      if (body.url) window.location.href = body.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark min-h-screen bg-[hsl(24_10%_6%)] text-zinc-100 antialiased">
      <nav className="border-b border-white/5 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="md" tone="onDark" href="/" />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 transition hover:text-white">
              Sign in
            </Link>
            <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-lg px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-sm font-medium text-emerald-400/90 mb-2">Quranly Pro</p>
          <h1 className="text-3xl font-bold tracking-tight">Unlock premium features</h1>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            Subscriptions help us run secure infrastructure and ship new features. Premium status is recorded on your
            account and can be used to gate future tools.
          </p>
          {limitReason ? (
            <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Free usage limit reached for today. Upgrade to Pro to continue reading without limits.
            </p>
          ) : null}
        </motion.div>

        <Card className="border-white/10 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Premium</CardTitle>
            <CardDescription className="text-zinc-400">
              Monthly Pro subscription via Stripe. Cancel anytime from your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Priority roadmap input", "Premium badge on profile", "Funds ongoing Quran tooling"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
            {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              size="lg"
              disabled={loading}
              onClick={startCheckout}
            >
              {loading ? "Redirecting…" : "Upgrade to Pro"}
            </Button>
            <p className="text-xs text-zinc-500 text-center">
              Configure <code className="text-zinc-400">STRIPE_SECRET_KEY</code> and{" "}
              <code className="text-zinc-400">STRIPE_PRICE_PREMIUM</code> in production.
            </p>
          </CardFooter>
        </Card>

        <p className="text-center mt-8 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
