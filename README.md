# Streakly - Habit Tracker

A habit tracker that shows the progress you are actually making. Track
done/not-done habits or measured ones (8 glasses, 20 pages, 30 minutes), set
goals with deadlines and a projected finish date, earn milestones automatically,
and watch a level that rises with consistency and falls when habits go cold.
Every user sees only their own data.

Built for **Engineering Design 2, Week 2 (AI Hootcamp)** using AI tooling rather
than hand-written code.

| | |
|---|---|
| **Live app** | https://resplendent-narwhal-9ee9d4.netlify.app |
| **Demo video** | https://youtu.be/onetj5UQPKM (unlisted) |
| **Repository** | https://github.com/Gvictome/ed2-habit-tracker |

---

## What it does

**Accounts that stay signed in**
- Register, log in, log out, and reset a forgotten password by email.
- The session lives in a secure cookie and is refreshed on every request, so you
  stay signed in across refreshes, tabs, and days.
- App pages are protected twice: a Next.js proxy redirects signed-out visitors,
  and the app layout re-checks the user on the server before rendering data.

**Habits (full CRUD)**
- Create, edit, and delete habits with a name, emoji icon, colour, notes, and a
  weekly target of 1-7 days.
- Two kinds: **check** (done or not) and **measured** (a daily target and unit).
  A measured day only counts as done once the logged amount reaches the target;
  smaller amounts still count toward totals.
- Log any past day from a month calendar, change the amount, or attach a note.

**Today**
- A progress ring for the day, one-tap check-offs, and a quick-add button that
  adds a step toward a measured habit's target.
- To-do and done lists that animate as habits move between them.
- One-click starter habits for a brand-new account.

**Goals**
- Set a goal on any habit: **total days**, **total amount**, or **streak length**,
  with an optional deadline.
- Progress counts from the day the goal is set. Streakly projects the finish date
  from your real pace and labels each goal *on track*, *behind pace*, *overdue*,
  or *complete*.

**Milestones and insights**
- Milestones at 3/7/14/30/60/100/365-day streaks and at total-day thresholds,
  each dated to the day it was earned, with a toast the moment you unlock one.
- A 17-week consistency heatmap, 30-day completion rates against weekly targets,
  and a 14/30/90-day trend chart per habit with the daily target drawn in.

**Settings**
- Display name, theme (system / light / dark), and week start day, saved to your
  account so they follow you to every device.
- Change password, log out, or permanently delete the account and all its data.

### Levels

| | |
|---|---|
| Every completed day ever | **+10 XP** |
| Every day of a live streak | **+5 XP** |
| Each habit that has gone cold | **-50 XP** |
| More than half your habits cold | **whole score cut 25%** |

A habit counts as **cold** relative to its own target (`ceil(7 / target) + 2`
days of silence), so a three-times-a-week habit is not punished for its days off.
Levels cost 0, 100, 300, 600, 1000 XP and carry a title from *Getting started* up
to *Unstoppable*.

**Levels, goals, and milestones are derived, not stored.** There is no XP column,
no progress column, and no scheduled job. Everything is recomputed from the
check-in rows, so it can fall on its own, cannot drift out of sync with the data,
and updates instantly when you edit an old day.

## Technologies used

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | Server Components, Server Actions, and a proxy for auth |
| Language | **TypeScript** (strict) | Row shapes and query strings cannot quietly disagree |
| Styling | **Tailwind CSS v4** | Design tokens as CSS variables, light and dark themes |
| UI primitives | Radix UI, Motion, Lucide, Sonner | Accessible dialogs and menus, animation, icons, toasts |
| Charts | Recharts | Trend bars with a target reference line |
| Backend / database | **Supabase** (PostgreSQL) | Free tier, auth built in |
| Auth | Supabase Auth via `@supabase/ssr` | Cookie sessions the server can read |
| Security | Postgres Row Level Security | Every policy is `auth.uid() = user_id` |
| Tests | Vitest | 55 tests over streaks, goals, milestones, stats, and levels |
| CI | GitHub Actions | Lint, typecheck, test, and build on every push |
| Hosting | Netlify | Native Next.js support |

### Project structure

```
src/
  proxy.ts                  refreshes the session cookie, guards app routes
  app/
    page.tsx                landing page
    (auth)/                 login, signup, forgot/reset password + Server Actions
    auth/callback/route.ts  exchanges email-link codes for a session
    (app)/                  signed-in pages, gated by a server layout
      layout.tsx            checks the user, fetches the first data snapshot
      today/  habits/  habits/[id]/  goals/  insights/  settings/
  components/
    app/                    page views, dialogs, charts, calendar, data provider
    auth/                   auth forms
    ui/                     button, field, dialog, progress, segmented, misc
  lib/
    habits.ts               what "done" means, per-habit stats
    goals.ts                goal progress, pace projection, deadline status
    milestones.ts           milestone rules and the day each was earned
    stats.ts                heatmap and trend series
    levels.ts               XP, levels, cold habits
    dates.ts                local-time day keys and streak maths
    api.ts                  every browser-side query, in one place
    supabase/               browser and server clients
supabase/
  schema.sql                v1 tables and RLS
  migrations/002_*.sql      profiles, measured habits, notes, goals
```

Components never call Supabase directly: the server layout loads the first
snapshot, and every change after that goes through `src/lib/api.ts` inside the
`DataProvider`, which updates the screen instantly and rolls back if a write fails.

## Database schema

| Table | Columns | Notes |
|---|---|---|
| `habits` | `id`, `user_id`, `name`, `description`, `color`, `icon`, `kind`, `unit`, `daily_target`, `target_per_week`, `created_at` | `kind` is `check` or `measure`; measured habits require a target |
| `check_ins` | `id`, `habit_id`, `user_id`, `day`, `value`, `note`, `created_at` | unique on `(habit_id, day)`: one entry per habit per day |
| `goals` | `id`, `user_id`, `habit_id`, `title`, `kind`, `target`, `deadline`, `created_at` | `kind` is `total_days`, `total_amount`, or `streak` |
| `profiles` | `id`, `display_name`, `theme`, `week_start` | created automatically for each new account by a trigger |

RLS is enabled on every table, and every policy is `auth.uid() = user_id` (or
`= id` for profiles). Deleting a habit cascades to its check-ins and goals;
deleting an account cascades to everything, through a `security definer`
function so the app never needs the service-role key.

## Setup instructions

You need Node.js 20 or newer and a free Supabase account.

**1. Clone and install**

```bash
git clone https://github.com/Gvictome/ed2-habit-tracker.git
cd ed2-habit-tracker
npm install
```

**2. Create the database**

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. In **SQL Editor -> New query**, run `supabase/schema.sql`, then run
   `supabase/migrations/002_v2_goals_measurements_profiles.sql`.
3. Under **Authentication -> Sign In / Providers**, make sure **Email** is
   enabled. For a quick demo you can turn off "Confirm email".
4. Under **Authentication -> URL Configuration**, set the Site URL to your
   deployed URL and add `http://localhost:3000/**` to the redirect URLs, so
   password-reset links come back to the app.

**3. Add your credentials**

```bash
cp .env.example .env.local
```

Fill in the two values from **Project Settings -> API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Both are safe in a browser bundle; the anon key only grants what the RLS
policies allow. `.env.local` is gitignored.

**4. Run it**

```bash
npm run dev        # http://localhost:3000
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build      # production build
```

Without credentials, or without the migration, the app shows a setup screen
explaining exactly what is missing instead of crashing.

## Deploying to Netlify

1. In Netlify: **Add new site -> Import an existing project**, and pick the repo.
2. Build settings come from `netlify.toml` (`npm run build`, publish `.next`);
   Netlify detects Next.js automatically.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under
   **Site configuration -> Environment variables** *before* deploying. Next.js
   inlines them at build time.
4. Deploy, add the live URL to Supabase's Site URL, and paste it at the top of
   this README.

## How this was built

Per the assignment, the point was to use AI tooling rather than write code by
hand. v1 was a React + Vite app; v2 rebuilt it on Next.js on a feature branch
merged through a pull request.

1. Describe the app and data model in plain language; have the AI produce the
   SQL, including Row Level Security, as an additive migration so existing data
   survives.
2. Write the scoring rules (streaks, goals, milestones) as pure functions,
   **tests first**, before any UI.
3. Build the UI page by page on top of those functions, running lint, typecheck,
   tests, and a production build after each slice.
4. Read and correct the output rather than accepting it. Things that needed a
   human eye: dates formatted with `toISOString()` roll over to the next UTC day
   in the evening; two v1 tests only passed because they ran on the day they
   were written (the level code ignored the injected "now"); and rendering
   "today" on the server would show the wrong day to anyone outside the
   server's timezone, so date-based UI renders on the client.

The lesson: the AI produced working code fast, but the subtle bugs lived in the
assumptions it made quietly, especially around time and error states.
