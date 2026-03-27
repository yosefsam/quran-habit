-- Add Pro subscription fields to the user profile.
-- Run in Supabase SQL editor.

alter table public.profiles
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists is_pro boolean default false,
  add column if not exists current_period_end timestamptz;

