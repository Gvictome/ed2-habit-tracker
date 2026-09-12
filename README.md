# Streakly - Habit Tracker

A small web app for tracking daily habits. Create a habit, check off the days
you did it, and watch the streak build. Every user sees only their own data.

Built for **Engineering Design 2, Week 2 (AI Hootcamp)** using AI tooling rather
than hand-written code.

| | |
|---|---|
| **Live app** | https://REPLACE-ME.netlify.app |
| **Demo video** | https://youtu.be/REPLACE-ME (unlisted) |
| **Repository** | https://github.com/Gvictome/ed2-habit-tracker |

---

## What it does

The app opens on **Today**, not on a wall of history:

- **Today view** - a progress ring for the day, the date, and one row per habit.
  One tap on the 44px circle checks a habit off.
- **Habit detail** - current streak, best streak ever, progress against the
  weekly target, an editable week, and a four-week grid.
- **Last 7 days** - every habit's week, kept below the fold for fixing a day you
  forgot.

Full CRUD and auth underneath:

- **Register / log in / log out** with email and password.
- **Create** a habit with a name, optional notes, a colour, and a weekly target
  of 1 to 7 days.
- **Read** every habit and its whole check-in history in one query.
- **Update** any habit in place.
- **Delete** a habit, with an inline confirmation. Its check-ins go with it.
- **Check in** on any of the last seven days. Tapping again undoes it.

It also installs as an app: a web manifest, standalone display, theme colour and
safe-area padding, so adding it to a phone home screen gives a full-screen app
with no browser chrome.

Nothing is readable or writable without being signed in. That is enforced in the
database with Row Level Security, not just hidden in the interface, so an
unauthenticated request returns zero rows even if it is sent directly to the API.

## Technologies used

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite | Fast dev server, one-command production build |
| Styling | Tailwind CSS v4 | Utility classes, no separate stylesheet to maintain |
| Type | Space Grotesk + Manrope | Display face for numbers and headings, Manrope for UI |
| Backend / database | Supabase (PostgreSQL) | Free tier, and auth is built in rather than bolted on |
| Auth | Supabase Auth (email + password) | Issues the JWT that Row Level Security checks |
| Hosting | Netlify | Connects straight to the GitHub repo |
| CI | GitHub Actions | Lints and builds every push to `main` |

### Project structure

```
src/
  lib/
    supabaseClient.js   Supabase client + error message translation
    habitsApi.js        every database query, in one place
    dates.js            local-time day keys, streak and weekly-count maths
    habitColors.js      colour palette
  context/
    authContext.js      the React context object
    AuthProvider.jsx    subscribes to Supabase auth state
  hooks/
    useAuth.js          read the session anywhere
    useHabits.js        habit list state + create/update/delete/toggle
  components/
    AuthScreen.jsx      combined register + login form
    Dashboard.jsx       the Today screen, and the route into habit detail
    TodaySummary.jsx    progress ring, date, what is left
    TodayRow.jsx        one habit, one 44px tap target
    HabitDetail.jsx     streak stats, editable week, four-week grid
    WeekHistory.jsx     the last seven days for every habit
    DayGrid.jsx         the seven day toggles
    HabitForm.jsx       create and edit (same fields, one form)
    ProgressRing.jsx  StreakChip.jsx  Icons.jsx  Skeleton.jsx
    Header.jsx  EmptyState.jsx  Spinner.jsx  SetupNotice.jsx
design/
    *.dc.html           design-canvas artboards for the screens above
supabase/
  schema.sql            tables, indexes, and RLS policies
```

Components never call Supabase directly. Every query goes through
`src/lib/habitsApi.js`, so the data layer can change without touching the UI.

## Database schema

Two tables, defined in [`supabase/schema.sql`](supabase/schema.sql):

- **`habits`** - `id`, `user_id`, `name`, `description`, `color`,
  `target_per_week`, `created_at`
- **`check_ins`** - `id`, `habit_id`, `user_id`, `day`, `created_at`, with a
  unique constraint on `(habit_id, day)` so a habit can only be completed once
  per calendar day

RLS is enabled on both tables. Every policy is `auth.uid() = user_id`, which
means the signed-in user can read and write their own rows and nothing else.

## Setup instructions

You need Node.js 20 or newer and a free Supabase account.

**1. Clone and install**

```bash
git clone https://github.com/Gvictome/ed2-habit-tracker.git
cd ed2-habit-tracker
npm install
```

**2. Create the Supabase project**

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier).
2. Open **SQL Editor -> New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates both tables and all RLS policies.
3. Under **Authentication -> Sign In / Providers**, make sure **Email** is
   enabled. For a quick demo you can turn off "Confirm email" so registration
   logs you straight in.

**3. Add your credentials**

```bash
cp .env.example .env
```

Fill in the two values from **Project Settings -> API**:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Both are safe in a browser bundle. The anon key only grants what the RLS
policies allow. `.env` is gitignored and never committed.

**4. Run it**

```bash
npm run dev      # http://localhost:5173
npm run lint     # oxlint
npm run build    # production build into dist/
```

If you start the app without credentials it shows a setup screen explaining
what is missing instead of crashing.

## Deploying to Netlify

1. Push the repository to GitHub.
2. In Netlify: **Add new site -> Import an existing project**, and pick the repo.
3. Build settings are read from `netlify.toml`, so leave them as detected
   (`npm run build`, publish `dist`).
4. Add the two environment variables under **Site configuration -> Environment
   variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. They are read
   at build time, so they must be set *before* the build that you ship.
5. Deploy, then paste the live URL at the top of this README.

## How this was built

Per the assignment, the point was to use AI tooling rather than write the code by
hand. The workflow was:

1. Describe the app and the data model in plain language, and have the AI produce
   the SQL schema including the Row Level Security policies.
2. Generate the React components feature by feature (auth, then CRUD, then
   check-ins), committing each working slice to Git before starting the next.
3. Read and correct the output rather than accepting it blindly. Two things
   needed fixing: the first version formatted dates with `toISOString()`, which
   silently rolls over to the next UTC day in the evening and would check off the
   wrong box, and the first Supabase client had no handling for a missing
   configuration, so the app crashed instead of explaining itself.
4. Run `npm run lint` and `npm run build` after every slice, and let GitHub
   Actions re-run both on every push.

The useful lesson was that the AI produced working code quickly but needed a
human to catch the assumptions it made quietly, especially around timezones and
error states.
