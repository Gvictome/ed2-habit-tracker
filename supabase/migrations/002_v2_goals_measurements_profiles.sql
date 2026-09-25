-- Streakly v2 - profiles, measured habits, day notes, and goals.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
--
-- Purely additive and safe to re-run: every existing habit and check-in keeps
-- working, and existing habits become "check" habits (done / not done).

-- ------------------------------------------------------------- profiles ---
-- One row per user for settings that should follow them across devices.
create table if not exists public.profiles (
  id           uuid        primary key references auth.users (id) on delete cascade,
  display_name text        not null default '' check (char_length(display_name) <= 40),
  theme        text        not null default 'system' check (theme in ('system', 'light', 'dark')),
  week_start   smallint    not null default 1 check (week_start in (0, 1)),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Owners can read their profile"   on public.profiles;
drop policy if exists "Owners can create their profile" on public.profiles;
drop policy if exists "Owners can update their profile" on public.profiles;

create policy "Owners can read their profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Owners can create their profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Owners can update their profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Every new account gets a profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 40))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts that existed before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ----------------------------------------------------- measured habits ---
-- kind = 'check'   -> a day is done when a check-in exists
-- kind = 'measure' -> a day is done when its logged value reaches daily_target
alter table public.habits
  add column if not exists kind         text    not null default 'check',
  add column if not exists unit         text    not null default '',
  add column if not exists daily_target numeric,
  add column if not exists icon         text    not null default '';

alter table public.habits drop constraint if exists habits_kind_check;
alter table public.habits add constraint habits_kind_check
  check (kind in ('check', 'measure'));

alter table public.habits drop constraint if exists habits_measure_target_check;
alter table public.habits add constraint habits_measure_target_check
  check (kind = 'check' or (daily_target is not null and daily_target > 0));

alter table public.habits drop constraint if exists habits_unit_length_check;
alter table public.habits add constraint habits_unit_length_check
  check (char_length(unit) <= 16 and char_length(icon) <= 8);

-- ------------------------------------------------ check-in value + note ---
alter table public.check_ins
  add column if not exists value numeric check (value is null or value >= 0),
  add column if not exists note  text    not null default '' check (char_length(note) <= 280);

-- Logging a new amount or editing a note updates the day's row in place.
drop policy if exists "Owners can update their check-ins" on public.check_ins;
create policy "Owners can update their check-ins"
  on public.check_ins for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------- goals ---
-- A long-range target on one habit. Progress is computed from check-ins,
-- never stored, so it cannot drift from the data.
create table if not exists public.goals (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  habit_id   uuid        not null references public.habits (id) on delete cascade,
  title      text        not null check (char_length(btrim(title)) between 1 and 80),
  kind       text        not null check (kind in ('total_days', 'total_amount', 'streak')),
  target     numeric     not null check (target > 0),
  deadline   date,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id, created_at desc);

alter table public.goals enable row level security;

drop policy if exists "Owners can read their goals"   on public.goals;
drop policy if exists "Owners can create goals"       on public.goals;
drop policy if exists "Owners can update their goals" on public.goals;
drop policy if exists "Owners can delete their goals" on public.goals;

create policy "Owners can read their goals"
  on public.goals for select using (auth.uid() = user_id);
create policy "Owners can create goals"
  on public.goals for insert with check (auth.uid() = user_id);
create policy "Owners can update their goals"
  on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owners can delete their goals"
  on public.goals for delete using (auth.uid() = user_id);

-- ------------------------------------------------------- delete account ---
-- Lets a signed-in user remove their own account (and, by cascade, all of
-- their data) without the app ever holding the service-role key.
create or replace function public.delete_own_account()
returns void
language sql
security definer set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
