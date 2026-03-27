import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/demo-cookie";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/reader",
  "/analytics",
  "/profile",
  "/onboarding",
  "/session",
];

// Extra premium-only gates.
const PRO_ONLY_PREFIXES = [
  "/analytics",
];

const FREE_LIMIT_PREFIXES = [
  "/reader",
  "/session",
];

const DEMO_DAILY_LIMIT_COOKIE = "hidayah_demo_limit";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/signup")) return true;
  if (pathname.startsWith("/pricing")) return true;
  if (pathname.startsWith("/forgot-password")) return true;
  if (pathname.startsWith("/update-password")) return true;
  if (pathname.startsWith("/auth/callback")) return true;
  if (pathname.startsWith("/api/stripe/webhook")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProOnlyPath(pathname: string): boolean {
  return PRO_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isFreeLimitedPath(pathname: string): boolean {
  return FREE_LIMIT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function getFreeDailyLimit(): number {
  const raw = process.env.FREE_DAILY_READER_LIMIT;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 3;
}

function isPrefetchRequest(request: NextRequest): boolean {
  const purpose = request.headers.get("purpose")?.toLowerCase();
  if (purpose === "prefetch") return true;
  if (request.headers.has("next-router-prefetch")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const demo = request.cookies.get(DEMO_COOKIE_NAME)?.value === "1";
  const freeDailyLimit = getFreeDailyLimit();
  const prefetch = isPrefetchRequest(request);

  // Pro-only route gate (Stripe subscription).
  if (isProOnlyPath(pathname) && user && !demo) {
    // Prefer subscriptions table (webhook-managed); fall back to profile flags
    // so users become Pro immediately after checkout completes.
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subStatus = sub?.status ?? null;
    const periodEnd = sub?.current_period_end ?? null;

    const statusIsActive = subStatus === "active" || subStatus === "trialing";
    const periodValid = !periodEnd || new Date(periodEnd).getTime() > Date.now();

    let isPro = Boolean(statusIsActive && periodValid);

    if (!isPro) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_pro,subscription_tier")
        .eq("id", user.id)
        .maybeSingle();
      isPro = Boolean(prof?.is_pro === true || prof?.subscription_tier === "premium");
    }

    if (!isPro) {
      const pricing = new URL("/pricing", request.url);
      pricing.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(pricing);
    }
  }

  if (isProtectedPath(pathname) && !user && !demo) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  // Demo limit gate: server-side cookie counter (httpOnly) for free demo sessions.
  // This avoids unlimited anonymous/demo usage from client-only state.
  if (isFreeLimitedPath(pathname) && demo && !user && request.method === "GET" && !prefetch) {
    const today = new Date().toISOString().slice(0, 10);
    const raw = request.cookies.get(DEMO_DAILY_LIMIT_COOKIE)?.value ?? "";
    const [datePart, countPart] = raw.split(":");
    const count = datePart === today ? Number.parseInt(countPart ?? "0", 10) || 0 : 0;

    if (count >= freeDailyLimit) {
      const pricing = new URL("/pricing", request.url);
      pricing.searchParams.set("limit", "demo");
      pricing.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(pricing);
    }

    supabaseResponse.cookies.set(DEMO_DAILY_LIMIT_COOKIE, `${today}:${count + 1}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  // Free authenticated users: enforce daily usage on server-backed DB rows.
  // This ties usage limits to authenticated user IDs and cannot be bypassed
  // by changing client-only local state.
  if (isFreeLimitedPath(pathname) && user && !demo && request.method === "GET" && !prefetch) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subStatus = sub?.status ?? null;
    const periodEnd = sub?.current_period_end ?? null;
    const statusIsActive = subStatus === "active" || subStatus === "trialing";
    const periodValid = !periodEnd || new Date(periodEnd).getTime() > Date.now();

    let isPro = Boolean(statusIsActive && periodValid);
    if (!isPro) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_pro,subscription_tier")
        .eq("id", user.id)
        .maybeSingle();
      isPro = Boolean(prof?.is_pro === true || prof?.subscription_tier === "premium");
    }

    if (!isPro) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: usageRow } = await supabase
        .from("free_usage_daily")
        .select("reader_visits")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();

      const current = Number(usageRow?.reader_visits ?? 0) || 0;
      if (current >= freeDailyLimit) {
        const pricing = new URL("/pricing", request.url);
        pricing.searchParams.set("limit", "free");
        pricing.searchParams.set("next", pathname + request.nextUrl.search);
        return NextResponse.redirect(pricing);
      }

      await supabase.from("free_usage_daily").upsert(
        {
          user_id: user.id,
          usage_date: today,
          reader_visits: current + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,usage_date" }
      );
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
