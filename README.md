# Quran Habit

A mobile-first habit-building app for consistent Quran reading. Set daily goals, track streaks, log sessions, and view progress with a clean, premium Islamic-inspired design.

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

## License

MIT.
