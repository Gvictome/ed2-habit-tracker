/**
 * Tailwind class names cannot be built at runtime (the compiler scans source
 * text), so each colour option lists its classes in full.
 */
export const HABIT_COLORS = [
  { id: 'emerald', label: 'Emerald', dot: 'bg-emerald-500', filled: 'bg-emerald-500 border-emerald-500', accent: 'text-emerald-400' },
  { id: 'sky', label: 'Sky', dot: 'bg-sky-500', filled: 'bg-sky-500 border-sky-500', accent: 'text-sky-400' },
  { id: 'violet', label: 'Violet', dot: 'bg-violet-500', filled: 'bg-violet-500 border-violet-500', accent: 'text-violet-400' },
  { id: 'amber', label: 'Amber', dot: 'bg-amber-500', filled: 'bg-amber-500 border-amber-500', accent: 'text-amber-400' },
  { id: 'rose', label: 'Rose', dot: 'bg-rose-500', filled: 'bg-rose-500 border-rose-500', accent: 'text-rose-400' },
]

export const DEFAULT_COLOR = HABIT_COLORS[0].id

export function getColor(id) {
  return HABIT_COLORS.find((color) => color.id === id) ?? HABIT_COLORS[0]
}
