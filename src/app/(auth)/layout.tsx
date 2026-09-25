import { Flame, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/misc'

const POINTS = [
  { icon: Flame, text: 'Streaks that survive until the day is actually over' },
  { icon: Target, text: 'Goals with deadlines and a projected finish date' },
  { icon: Trophy, text: 'Milestones you earn automatically as you go' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute -bottom-40 -left-32 size-[32rem] rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="absolute -top-24 right-0 size-80 rounded-full bg-violet-500/15 blur-3xl" aria-hidden />
        <Link href="/" className="relative">
          <Logo />
        </Link>
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl leading-tight font-bold tracking-tight">
            Small things, done daily, <span className="text-accent-text">add up.</span>
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-muted">
                <span className="grid size-9 place-items-center rounded-xl border border-border bg-surface-2 text-accent-text">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-faint">Your data is private to your account, enforced in the database.</p>
      </aside>
      <main className="bg-aurora flex flex-col px-6 py-10 sm:px-10">
        <Link href="/" className="mb-10 lg:hidden">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">{children}</div>
      </main>
    </div>
  )
}
