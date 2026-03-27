# Hidayah

A mobile-first app for **guided Quran reading** and consistent daily practice. Set goals, track streaks, log sessions, and view progress with a calm, premium design.

## Tech stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **shadcn/ui** (Radix), **Framer Motion**, **Zustand**, **Recharts**
- **Supabase** (auth + database)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `env.example` to `.env.local` and add your Supabase URL and anon key.

3. **Supabase**

   Create a project at [supabase.com](https://supabase.com). In the SQL Editor, run the schema in `supabase/schema.sql`. In Authentication → URL Configuration, set Site URL and Redirect URLs (e.g. `http://localhost:3000`, `http://localhost:3000/auth/callback`).

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Quran dataset (604 mushaf pages)

This repo includes a **page-by-page mushaf dataset** under `public/quran/` so the reader can load the full Quran **inside the app**.

- `public/quran/madani-muhsaf.json` (source download)
- `public/quran/pages.v2.json` (optimized pages index; **ayah-by-ayah with true verse numbers**)
- `public/quran/surahs.v2.json` (surah metadata with start pages)

To regenerate these files:

```bash
npm run quran:build
```

## Demo mode

Without Supabase env vars, the app still runs. Use **Try demo — no sign up** on the landing page to use the app with local state and demo data.

## Hasanat disclaimer

Hasanat shown in the app is a **motivational estimate** based on reading activity for reflection and consistency — **not a definitive count**.

## Features

- **Landing** — Hero, features, CTAs, footer
- **Auth** — Email/password sign up and login (Supabase)
- **Onboarding** — Multi-step: goal, daily amount, unit, reminder time, consistency, plan intensity → personalized plan
- **Dashboard** — Today's goal, progress ring, streak, hasanat, weekly consistency, quote, recent sessions
- **Quran reader (in-app)** — Page-by-page mushaf-style reader with swipe/page buttons, bookmarks, jump-to page/surah (MVP), focus mode, and last-read resume
- **Session** — Log reading by pages/ayahs/minutes/surahs, optional note, hasanat, goal completion
- **Analytics** — Total hasanat, streaks, total units, sessions, 30-day chart, average per session
- **Profile** — Account, daily goal, reminders (toggle, time), theme (light/dark/system), manual log link
- **404 & loading** — Not-found and loading states

## Project structure

```
src/
├── app/           # Routes: landing, (auth), (app), auth/callback
├── components/   # ui/, theme-provider, app-nav, demo-banner, progress-ring
├── lib/          # utils, hasanat, demo-data, supabase
├── store/        # Zustand (theme, demo, goal, sessions, streak, reminder, onboarding, today)
└── types/        # Shared TypeScript interfaces
```

## Production deployment (hidayah.io)

**Stack:** Next.js on **Vercel** (recommended) + **Supabase** + **Stripe**.

### 1. Environment variables

Copy `env.example` → `.env.local` (local) or set in Vercel → Project → Settings → Environment Variables.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, e.g. `https://hidayah.io` (auth redirects, Stripe return URLs, metadata) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — Stripe webhooks upsert subscription rows |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID for the Premium subscription |

Never commit real secrets; use Vercel env UI or CI secrets.

### 2. Supabase

1. Run `supabase/schema.sql` in the SQL Editor (base tables + RLS).
2. Run `supabase/migrations/20250321120000_production.sql` (subscriptions, `user_reading_state`, profile columns).
3. **Authentication → URL configuration**
   - Site URL: `https://hidayah.io`
   - Redirect URLs: `https://hidayah.io/**`, `http://localhost:3000/**`
4. **Auth providers:** enable Email; for production deliverability use **custom SMTP** in Supabase (not Next.js env). See **`docs/supabase-auth-email.md`** for exact redirect URLs, templates notes, and a test checklist.

### 3. Stripe

1. Create a Product and recurring Price; copy the Price ID → `STRIPE_PRICE_PREMIUM`.
2. **Developers → Webhooks** → endpoint: `https://hidayah.io/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`
3. Enable **Customer portal** in Stripe Billing settings (used by “Manage billing” on Profile).

### 4. Deploy to Vercel

1. Import the Git repo into [Vercel](https://vercel.com).
2. Set all environment variables (Production + Preview as needed).
3. Add domain **hidayah.io** in Vercel → Domains (DNS: A/ALIAS or CNAME per Vercel instructions).
4. Deploy; confirm `npm run build` passes (also run locally).

### 5. Auth & routes

- **Middleware** refreshes Supabase cookies and **requires a session** (or demo cookie) for `/dashboard`, `/reader`, `/analytics`, `/profile`, `/onboarding`, `/session`.
- **Demo:** “Try demo” sets a short-lived `hidayah_demo` cookie so the marketing demo works without login.
- **Sign out** clears local user-scoped state and session.

### 6. Reading state sync

Authenticated users: progress is **debounced-synced** to `user_reading_state` (Supabase) and loaded on sign-in. Requires migration SQL applied.

## License

MIT.
