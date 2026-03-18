-- Quran Habit App - Supabase Schema
-- Run in Supabase SQL Editor after creating your project

create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  onboarding_completed boolean default false,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.onboarding_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  goal text not null,
  daily_amount integer not null,
  unit text not null check (unit in ('pages', 'ayahs', 'minutes', 'surahs')),
  reminder_time time,
  consistency_level text not null check (consistency_level in ('new', 'sometimes', 'regular', 'daily')),
  plan_intensity text not null check (plan_intensity in ('gentle', 'moderate', 'ambitious')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.reading_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  daily_amount integer not null,
  unit text not null check (unit in ('pages', 'ayahs', 'minutes', 'surahs')),
  intensity text not null check (intensity in ('gentle', 'moderate', 'ambitious')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.reading_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  amount integer not null,
  unit text not null check (unit in ('pages', 'ayahs', 'minutes', 'surahs')),
  source text default 'manual' check (source in ('manual', 'reader')),
  page_start integer,
  page_end integer,
  duration_seconds integer,
  completed_at timestamptz not null default now(),
  note text,
  goal_completed boolean default false,
  hasanat integer,
  created_at timestamptz default now()
);
create index reading_sessions_user_id_idx on public.reading_sessions(user_id);
create index reading_sessions_completed_at_idx on public.reading_sessions(completed_at desc);

create table public.last_read_positions (
  user_id uuid references public.profiles on delete cascade primary key,
  page integer not null default 1,
  updated_at timestamptz default now()
);

create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  page integer not null,
  label text,
  created_at timestamptz default now()
);
create index bookmarks_user_id_idx on public.bookmarks(user_id);

create table public.user_reader_preferences (
  user_id uuid references public.profiles on delete cascade primary key,
  focus_mode boolean default false,
  show_translation boolean default false,
  font_scale numeric default 1.0,
  updated_at timestamptz default now()
);

-- Optional content tables (for when a full verified dataset is bundled/ingested).
create table public.quran_surahs (
  number integer primary key,
  name_arabic text not null,
  name_english text not null,
  ayah_count integer not null,
  start_page integer not null
);

create table public.quran_pages (
  page integer primary key,
  juz integer not null,
  surah_number integer,
  arabic text not null,
  translation text
);

create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date,
  updated_at timestamptz default now()
);

create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  enabled boolean default true,
  time time not null default '08:00',
  tone text default 'gentle' check (tone in ('gentle', 'moderate', 'motivating')),
  frequency text default 'daily' check (frequency in ('daily', 'weekdays', 'custom')),
  updated_at timestamptz default now()
);

create table public.progress_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date date not null,
  completed boolean not null,
  amount integer not null default 0,
  unit text not null,
  streak integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.profiles enable row level security;
alter table public.onboarding_preferences enable row level security;
alter table public.reading_goals enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.streaks enable row level security;
alter table public.reminders enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.last_read_positions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_reader_preferences enable row level security;
alter table public.quran_surahs enable row level security;
alter table public.quran_pages enable row level security;

create policy "Users own profiles" on public.profiles for all using (auth.uid() = id);
create policy "Users own onboarding_preferences" on public.onboarding_preferences for all using (auth.uid() = user_id);
create policy "Users own reading_goals" on public.reading_goals for all using (auth.uid() = user_id);
create policy "Users own reading_sessions" on public.reading_sessions for all using (auth.uid() = user_id);
create policy "Users own streaks" on public.streaks for all using (auth.uid() = user_id);
create policy "Users own reminders" on public.reminders for all using (auth.uid() = user_id);
create policy "Users own progress_snapshots" on public.progress_snapshots for all using (auth.uid() = user_id);
create policy "Users own last_read_positions" on public.last_read_positions for all using (auth.uid() = user_id);
create policy "Users own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);
create policy "Users own user_reader_preferences" on public.user_reader_preferences for all using (auth.uid() = user_id);

-- Quran content is public-read (no user data).
create policy "Public read quran_surahs" on public.quran_surahs for select using (true);
create policy "Public read quran_pages" on public.quran_pages for select using (true);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
