import { Check, Flame, Plus, Trophy } from 'lucide-react'

/** A static, hand-built picture of the Today screen for the landing page. */

const ROWS = [
  { icon: '💧', name: 'Drink water', meta: '6 / 8 glasses', color: '#0ea5e9', progress: 0.75, streak: 12 },
  { icon: '📚', name: 'Read', meta: '20 / 20 pages', color: '#8b5cf6', progress: 1, streak: 31 },
  { icon: '🏃', name: 'Morning run', meta: '3/4 this week', color: '#10b981', progress: 1, streak: 5 },
  { icon: '🧘', name: 'Meditate', meta: '0 / 10 min', color: '#f59e0b', progress: 0, streak: 0 },
]

function MiniRing({ value, color }: { value: number; color: string }) {
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-surface-3" />
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
    </svg>
  )
}

export function HeroPreview() {
  const heat = Array.from({ length: 16 * 7 }, (_, index) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453
    const noise = seed - Math.floor(seed)
    const trend = index / (16 * 7)
    // Mostly quiet early on, denser toward today: the shape of a habit forming.
    const score = (noise * 0.5 + trend * 0.55) ** 1.6
    return noise < 0.18 ? 0 : Math.min(4, Math.floor(score * 5))
  })
  const heatClass = ['bg-surface-3', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent']

  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden>
      <div className="absolute -inset-10 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative rounded-[28px] border border-border-strong bg-surface/90 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="relative grid size-24 place-items-center">
            <svg width="96" height="96" viewBox="0 0 96 96" className="absolute -rotate-90">
              <circle cx="48" cy="48" r="41" fill="none" strokeWidth="9" className="stroke-surface-3" />
              <circle cx="48" cy="48" r="41" fill="none" strokeWidth="9" stroke="var(--accent)" strokeLinecap="round" strokeDasharray={257.6} strokeDashoffset={257.6 * 0.25} />
            </svg>
            <span className="tabular font-display text-2xl font-bold">75%</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">Thursday, September 24</p>
            <p className="font-display text-xl font-semibold">3 of 4 done</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Flame className="size-3.5 text-orange-500" /> 31-day streak on Read
            </p>
          </div>
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {ROWS.map((row) => (
            <li key={row.name} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
              {row.progress >= 1 ? (
                <span className="grid size-10 place-items-center rounded-full text-white" style={{ background: row.color }}>
                  <Check className="size-5" strokeWidth={3} />
                </span>
              ) : row.progress > 0 ? (
                <span className="relative grid size-10 place-items-center">
                  <MiniRing value={row.progress} color={row.color} />
                  <Plus className="absolute size-4" style={{ color: row.color }} strokeWidth={3} />
                </span>
              ) : (
                <span className="size-10 rounded-full border-2 border-border-strong" />
              )}
              <span className="grid size-9 place-items-center rounded-xl text-lg" style={{ background: `${row.color}1f` }}>
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{row.name}</span>
                <span className="block text-xs text-muted">{row.meta}</span>
              </span>
              {row.streak > 0 && (
                <span className="tabular flex items-center gap-1 rounded-full bg-orange-500/12 px-2 py-0.5 text-xs font-bold text-orange-500">
                  <Flame className="size-3" /> {row.streak}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-16 gap-[3px]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
          {heat.map((level, index) => (
            <span key={index} className={`aspect-square rounded-[3px] ${heatClass[level]}`} />
          ))}
        </div>
      </div>

      <div className="animate-float absolute -top-6 -right-4 flex items-center gap-3 rounded-2xl border border-border-strong bg-surface p-3 pr-4 shadow-2xl sm:-right-10">
        <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
          <Trophy className="size-4" />
        </span>
        <span>
          <span className="block text-xs font-bold">Milestone unlocked</span>
          <span className="block text-[11px] text-muted">30-day streak · Read</span>
        </span>
      </div>

      <div className="animate-float absolute -bottom-8 -left-4 w-52 rounded-2xl border border-border-strong bg-surface p-3 shadow-2xl [animation-delay:-3s] sm:-left-12">
        <p className="text-xs font-bold">Read 500 pages</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-[68%] rounded-full bg-violet-500" />
        </div>
        <p className="mt-1.5 text-[11px] text-muted">On pace for Nov 12 · On track</p>
      </div>
    </div>
  )
}
