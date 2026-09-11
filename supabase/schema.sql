-- Habit Tracker - Supabase (PostgreSQL) schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.
--
-- Two tables:
--   habits    - one row per habit a user is tracking
--   check_ins - one row per day a habit was completed
--
-- Row Level Security is enabled on both tables so a signed-in user can only
-- ever read or write rows they own. Anonymous visitors can read nothing.

-- ---------------------------------------------------------------- habits ---
create table if not exists public.habits (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  name            text        not null check (char_length(btrim(name)) between 1 and 80),
  description     text        not null default '' check (char_length(description) <= 280),
  color           text        not null default 'emerald',
  target_per_week smallint    not null default 7 check (target_per_week between 1 and 7),
  created_at      timestamptz not null default now()
);

create index if not exists habits_user_id_created_at_idx
  on public.habits (user_id, created_at desc);

-- ------------------------------------------------------------- check_ins ---
create table if not exists public.check_ins (
  id         uuid        primary key default gen_random_uuid(),
  habit_id   uuid        not null references public.habits (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  day        date        not null default current_date,
  created_at timestamptz not null default now(),
  -- A habit can only be checked off once per calendar day.
  unique (habit_id, day)
);

create index if not exists check_ins_user_id_day_idx
  on public.check_ins (user_id, day desc);

-- ----------------------------------------------------- row level security ---
alter table public.habits    enable row level security;
alter table public.check_ins enable row level security;

drop policy if exists "Owners can read their habits"   on public.habits;
drop policy if exists "Owners can create habits"       on public.habits;
drop policy if exists "Owners can update their habits" on public.habits;
drop policy if exists "Owners can delete their habits" on public.habits;

create policy "Owners can read their habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Owners can create habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete their habits"
  on public.habits for delete
  using (auth.uid() = user_id);

drop policy if exists "Owners can read their check-ins"   on public.check_ins;
drop policy if exists "Owners can create check-ins"       on public.check_ins;
drop policy if exists "Owners can delete their check-ins" on public.check_ins;

create policy "Owners can read their check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

create policy "Owners can create check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Owners can delete their check-ins"
  on public.check_ins for delete
  using (auth.uid() = user_id);
