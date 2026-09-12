/**
 * Tailwind scans source text for class names, so none of these can be built at
 * runtime. Each option spells out every class it needs.
 */
export const HABIT_COLORS = [
  {
    id: 'emerald',
    label: 'Emerald',
    dot: 'bg-emerald-500',
    solid: 'bg-emerald-500',
    onSolid: 'text-emerald-950',
    stroke: 'stroke-emerald-500',
    text: 'text-emerald-400',
    tint: 'bg-emerald-500/10',
    softBorder: 'border-emerald-500/30',
  },
  {
    id: 'sky',
    label: 'Sky',
    dot: 'bg-sky-500',
    solid: 'bg-sky-500',
    onSolid: 'text-sky-950',
    stroke: 'stroke-sky-500',
    text: 'text-sky-400',
    tint: 'bg-sky-500/10',
    softBorder: 'border-sky-500/30',
  },
  {
    id: 'violet',
    label: 'Violet',
    dot: 'bg-violet-500',
    solid: 'bg-violet-500',
    onSolid: 'text-violet-950',
    stroke: 'stroke-violet-500',
    text: 'text-violet-400',
    tint: 'bg-violet-500/10',
    softBorder: 'border-violet-500/30',
  },
  {
    id: 'amber',
    label: 'Amber',
    dot: 'bg-amber-500',
    solid: 'bg-amber-500',
    onSolid: 'text-amber-950',
    stroke: 'stroke-amber-500',
    text: 'text-amber-400',
    tint: 'bg-amber-500/10',
    softBorder: 'border-amber-500/30',
  },
  {
    id: 'rose',
    label: 'Rose',
    dot: 'bg-rose-500',
    solid: 'bg-rose-500',
    onSolid: 'text-rose-950',
    stroke: 'stroke-rose-500',
    text: 'text-rose-400',
    tint: 'bg-rose-500/10',
    softBorder: 'border-rose-500/30',
  },
]

export const DEFAULT_COLOR = HABIT_COLORS[0].id

export function getColor(id) {
  return HABIT_COLORS.find((color) => color.id === id) ?? HABIT_COLORS[0]
}
