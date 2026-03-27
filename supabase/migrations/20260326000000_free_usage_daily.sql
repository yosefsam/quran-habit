-- Free/demo daily usage tracking for reader/session gates.

create table if not exists public.free_usage_daily (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  usage_date date not null,
  reader_visits integer not null default 0,
  updated_at timestamptz default now(),
  unique (user_id, usage_date)
);

create index if not exists free_usage_daily_user_date_idx
  on public.free_usage_daily(user_id, usage_date desc);

alter table public.free_usage_daily enable row level security;

create policy "Users own free usage rows"
  on public.free_usage_daily for all
  using (auth.uid() = user_id);

