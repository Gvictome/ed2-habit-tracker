import type { CSSProperties } from 'react'

/**
 * Habit accent colours.
 *
 * Each habit sets one CSS variable, --habit, and components style against it
 * (bg-(--habit), text-(--habit), bg-(--habit)/15). That avoids spelling out a
 * full class list per colour, and charts can read the same hex value.
 *
 * The first five ids match v1, so existing habits keep their colour.
 */
export const HABIT_COLORS = [
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'sky', label: 'Sky', hex: '#0ea5e9' },
  { id: 'violet', label: 'Violet', hex: '#8b5cf6' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b' },
  { id: 'rose', label: 'Rose', hex: '#f43f5e' },
  { id: 'lime', label: 'Lime', hex: '#84cc16' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
  { id: 'pink', label: 'Pink', hex: '#ec4899' },
] as const

export type HabitColorId = (typeof HABIT_COLORS)[number]['id']

export const DEFAULT_COLOR: HabitColorId = 'emerald'

export function getColor(id: string | undefined) {
  return HABIT_COLORS.find((color) => color.id === id) ?? HABIT_COLORS[0]
}

/** Inline style that exposes the habit's colour to Tailwind as var(--habit). */
export function habitStyle(colorId: string | undefined): CSSProperties {
  return { '--habit': getColor(colorId).hex } as CSSProperties
}

/** Emoji offered in the habit form. Any emoji can be typed, these are shortcuts. */
export const ICON_SUGGESTIONS = [
  '💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '✍️',
  '🎸', '💻', '🚶', '🧠', '☀️', '🦷', '💊', '🌱',
]
