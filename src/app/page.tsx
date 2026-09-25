import { ArrowRight, BarChart3, Flame, Gauge, Ruler, ShieldCheck, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
import { buttonClasses } from '@/components/ui/button'
import { Logo } from '@/components/ui/misc'
import { HeroPreview } from '@/components/marketing/hero-preview'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getServerClient } from '@/lib/supabase/server'

const FEATURES = [
  {
    icon: Ruler,
    title: 'Measure, not just tick',
    body: 'Log 6 of 8 glasses or 25 of 30 minutes. A day only counts once you hit your target, and partial days still add to your totals.',
  },
  {
    icon: Target,
    title: 'Goals with a finish line',
    body: 'Set a total, an amount, or a streak, with an optional deadline. Streakly projects when you will finish from your real pace.',
  },
  {
    icon: Trophy,
    title: 'Milestones you earn',
    body: 'Badges at 7, 30, and 100-day streaks and at total-day thresholds, each dated to the day you earned it.',
  },
  {
    icon: Gauge,
    title: 'A level that can fall',
    body: 'Consistency raises your level. Let habits go cold and it drops, so the number always means something.',
  },
  {
    icon: BarChart3,
    title: 'Insights at a glance',
    body: 'A 17-week heatmap, 30-day completion rates against your weekly targets, and trend charts for every habit.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Row Level Security in Postgres means your data is readable by your account only, enforced by the database itself.',
  },
]

const STEPS = [
  { title: 'Add a habit', body: 'Pick done/not-done or a daily amount, a weekly target, and a colour.' },
  { title: 'Check in daily', body: 'One tap on Today. Add a note when a day deserves one.' },
  { title: 'Watch it compound', body: 'Streaks, goals, milestones, and your level all update instantly.' },
]

const STACK = ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Postgres RLS', 'Tailwind CSS v4', 'Motion']

export default async function LandingPage() {
  let isSignedIn = false
  if (isSupabaseConfigured) {
    const supabase = await getServerClient()
    const { data } = await supabase.auth.getUser()
    isSignedIn = Boolean(data.user)
  }

  return (
    <div className="bg-aurora min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="flex items-center gap-2">
            <a href="#features" className="hidden px-3 text-sm font-semibold text-muted hover:text-foreground sm:block">
              Features
            </a>
            <a href="#how" className="hidden px-3 text-sm font-semibold text-muted hover:text-foreground sm:block">
              How it works
            </a>
            {isSignedIn ? (
              <Link href="/today" className={buttonClasses('primary', 'sm')}>
                Open app <ArrowRight />
              </Link>
            ) : (
              <>
                <Link href="/login" className={buttonClasses('ghost', 'sm')}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonClasses('primary', 'sm')}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pt-16 pb-24 lg:grid-cols-2 lg:pt-24">
          <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[36rem] opacity-60" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/80 px-3 py-1 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-accent" /> New: goals, measurements &amp; milestones
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Build habits that <span className="relative whitespace-nowrap text-accent-text">actually stick.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted text-pretty">
              Streakly turns small daily actions into visible progress: measured check-ins, goals with deadlines, and
              milestones that show how far you have come.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={isSignedIn ? '/today' : '/signup'} className={buttonClasses('primary', 'lg')}>
                {isSignedIn ? 'Open Streakly' : 'Start for free'} <ArrowRight />
              </Link>
              {!isSignedIn && (
                <Link href="/login" className={buttonClasses('outline', 'lg')}>
                  I have an account
                </Link>
              )}
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted">
              <Flame className="size-4 text-orange-500" /> Free, no card, installable on your phone.
            </p>
          </div>
          <HeroPreview />
        </section>

        <section className="border-y border-border bg-surface/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-6 text-sm font-semibold text-muted">
            <span className="text-xs tracking-wider text-faint uppercase">Built with</span>
            {STACK.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent-text">Features</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-balance">
              More than a checklist. A record of who you are becoming.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group rounded-3xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-border-strong">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent/15 text-accent-text transition-transform group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl border border-border bg-surface/60 p-6">
                <span className="tabular font-display text-5xl font-bold text-accent-text/30">0{index + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-[32px] border border-border-strong bg-surface p-10 text-center shadow-card sm:p-16">
            <div className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" aria-hidden />
            <h2 className="relative font-display text-4xl font-bold tracking-tight text-balance">Day one starts today.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted">
              Add your first habit in under a minute. Your streak starts the moment you check it off.
            </p>
            <Link href={isSignedIn ? '/today' : '/signup'} className={`${buttonClasses('primary', 'lg')} relative mt-8`}>
              {isSignedIn ? 'Go to Today' : 'Create your account'} <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo className="scale-90" />
          <p>Built for Engineering Design 2 · AI Hootcamp</p>
          <a href="https://github.com/Gvictome/ed2-habit-tracker" className="font-semibold hover:text-foreground">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
