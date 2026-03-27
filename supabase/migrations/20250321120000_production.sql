-- Hidayah production — subscriptions, Stripe, and reading state sync
-- Run in Supabase SQL Editor after base schema (or merge with schema.sql)

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_tier text default 'free' check (subscription_tier in ('free', 'premium'));

create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references public.profiles on delete cascade not null,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  updated_at timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "Users read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Server-side writes use service role (webhooks bypass RLS)

create table if not exists public.user_reading_state (
  user_id uuid references public.profiles on delete cascade primary key,
  visited_pages integer[] default '{}',
  completed_pages integer[] default '{}',
  last_read_page integer,
  streak jsonb,
  sessions jsonb,
  bookmarks jsonb,
  reader_preferences jsonb,
  today_progress integer default 0,
  today_status text,
  updated_at timestamptz default now()
);

alter table public.user_reading_state enable row level security;

create policy "Users own reading state"
  on public.user_reading_state for all
  using (auth.uid() = user_id);
