import { useCallback, useEffect, useState } from 'react'
import {
  addCheckIn,
  createHabit,
  deleteHabit,
  fetchHabits,
  removeCheckIn,
  updateHabit,
} from '../lib/habitsApi'
import { describeError } from '../lib/supabaseClient'

/**
 * Owns the habit list and every mutation the dashboard can perform.
 *
 * All updates build a new array rather than mutating state in place, so React
 * always sees a changed reference and re-renders.
 */
export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // isLoading starts true and is cleared after the first fetch. Deliberately
  // not re-raised on a later reload, so recovering from a failed write does not
  // flash the whole list away.
  const reload = useCallback(async () => {
    if (!userId) return
    const { data, error: loadError } = await fetchHabits(userId)
    if (loadError) {
      setError(describeError(loadError, 'Could not load your habits.'))
      setHabits([])
    } else {
      setError(null)
      setHabits(data ?? [])
    }
    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    // reload() awaits the network round trip before it touches state, so
    // nothing is set synchronously here. The rule cannot see past the await.
    // oxlint-disable-next-line react/set-state-in-effect
    reload()
  }, [reload])

  const addHabit = useCallback(
    async (habit) => {
      const { data, error: writeError } = await createHabit(userId, habit)
      if (writeError) return describeError(writeError, 'Could not save that habit.')
      setHabits((current) => [{ ...data, check_ins: data.check_ins ?? [] }, ...current])
      return null
    },
    [userId],
  )

  const editHabit = useCallback(async (habitId, habit) => {
    const { data, error: writeError } = await updateHabit(habitId, habit)
    if (writeError) return describeError(writeError, 'Could not update that habit.')
    setHabits((current) =>
      current.map((item) =>
        item.id === habitId ? { ...data, check_ins: data.check_ins ?? item.check_ins } : item,
      ),
    )
    return null
  }, [])

  const removeHabit = useCallback(async (habitId) => {
    const { error: writeError } = await deleteHabit(habitId)
    if (writeError) return describeError(writeError, 'Could not delete that habit.')
    setHabits((current) => current.filter((item) => item.id !== habitId))
    return null
  }, [])

  /** Checks a day on if it is off, and off if it is on. */
  const toggleDay = useCallback(
    async (habitId, day) => {
      const habit = habits.find((item) => item.id === habitId)
      if (!habit) return null
      const existing = habit.check_ins.find((checkIn) => checkIn.day === day)

      if (existing) {
        setHabits((current) =>
          current.map((item) =>
            item.id === habitId
              ? { ...item, check_ins: item.check_ins.filter((entry) => entry.day !== day) }
              : item,
          ),
        )
        const { error: writeError } = await removeCheckIn(habitId, day)
        if (writeError) {
          await reload()
          return describeError(writeError, 'Could not update that day.')
        }
        return null
      }

      const { data, error: writeError } = await addCheckIn(userId, habitId, day)
      if (writeError) {
        await reload()
        return describeError(writeError, 'Could not update that day.')
      }
      setHabits((current) =>
        current.map((item) =>
          item.id === habitId ? { ...item, check_ins: [...item.check_ins, data] } : item,
        ),
      )
      return null
    },
    [habits, reload, userId],
  )

  return { habits, isLoading, error, addHabit, editHabit, removeHabit, toggleDay, reload }
}
