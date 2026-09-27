'use client'

import { motion } from 'motion/react'
import { CalendarCheck, ChartSpline, Goal, LayoutGrid, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { signOut } from '@/app/(auth)/actions'
import { Logo } from '@/components/ui/misc'
import { ProgressBar } from '@/components/ui/progress'
import { cn } from '@/lib/cn'
import { calculateProgress } from '@/lib/levels'
import { useData } from './data-provider'
import { useToday } from './use-today'

const NAV = [
  { href: '/today', label: 'Today', icon: CalendarCheck },
  { href: '/habits', label: 'Habits', icon: LayoutGrid },
  { href: '/goals', label: 'Goals', icon: Goal },
  { href: '/insights', label: 'Insights', icon: ChartSpline },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function initials(name: string, email: string): string {
  const source = name.trim() || email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '?').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase()
}

function useLevel() {
  const { habits } = useData()
  const { now } = useToday()
  return useMemo(() => (now ? calculateProgress(habits, now) : null), [habits, now])
}

function LevelCard() {
  const level = useLevel()
  return (
    <div className="rounded-2xl border border-border bg-surface-2/60 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">Level</span>
        <span className="tabular font-display text-2xl font-bold">{level?.level ?? '-'}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-accent-text">{level?.title ?? ' '}</p>
      <ProgressBar value={level?.progressRatio ?? 0} className="mt-3 h-1.5" color="var(--accent)" label="Progress to next level" />
      <p className="tabular mt-2 text-[11px] text-muted">
        {level ? `${level.xpToNextLevel} XP to level ${level.level + 1}` : ' '}
      </p>
      {level?.isCoolingOff && (
        <p className="mt-2 text-[11px] font-medium text-warning">Most habits have gone cold. XP is reduced.</p>
      )}
    </div>
  )
}

function UserRow() {
  const { profile, user } = useData()
  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
      <Link
        href="/settings"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-fg"
        aria-label="Account settings"
      >
        {initials(profile.display_name, user.email)}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{profile.display_name || 'You'}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  )
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/today" className="px-2">
        <Logo />
      </Link>
      <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                active ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-border bg-surface-2"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className={cn('relative size-[18px]', active && 'text-accent-text')} />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <LevelCard />
        <UserRow />
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const level = useLevel()
  const { profile, user } = useData()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <Link href="/today">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        {level && (
          <Link
            href="/insights"
            className="tabular flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 text-xs font-bold"
          >
            <span className="text-accent-text">Lv {level.level}</span>
            <span className="text-muted">{level.title}</span>
          </Link>
        )}
        <Link
          href="/settings"
          className="grid size-8 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg"
          aria-label="Account settings"
        >
          {initials(profile.display_name, user.email)}
        </Link>
      </div>
    </header>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Main"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                active ? 'text-foreground' : 'text-muted',
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className={cn('size-5', active && 'text-accent-text')} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="bg-aurora min-h-dvh">
      <Sidebar pathname={pathname} />
      <MobileTopBar />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12 lg:pl-[calc(16rem+1.5rem)] xl:max-w-6xl">
        {children}
      </main>
      <MobileNav pathname={pathname} />
    </div>
  )
}
