import type { MonthData } from '../types/habit'
import { getDateKey, getDaysInMonth } from './date'

export function calculateCompletedHabits(data: MonthData) {
  return Object.values(data.completions).reduce(
    (sum, dayMap) => sum + data.habits.filter((habit) => habit.active && dayMap[habit.id]).length,
    0,
  )
}

export function calculateMonthlyProgress(data: MonthData) {
  const activeHabits = data.habits.filter((habit) => habit.active).length
  const possible = activeHabits * getDaysInMonth(data.year, data.month)
  return possible === 0 ? 0 : (calculateCompletedHabits(data) / possible) * 100
}

export function calculateHabitCount(data: MonthData, habitId: string) {
  const daysInMonth = getDaysInMonth(data.year, data.month)
  let total = 0
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (data.completions[getDateKey(data.year, data.month, day)]?.[habitId]) {
      total += 1
    }
  }
  return total
}

export function calculateHabitProgress(data: MonthData, habitId: string) {
  const daysInMonth = getDaysInMonth(data.year, data.month)
  return daysInMonth === 0 ? 0 : (calculateHabitCount(data, habitId) / daysInMonth) * 100
}

export function calculateDailyHabitCount(data: MonthData, day: number) {
  const dateKey = getDateKey(data.year, data.month, day)
  const completions = data.completions[dateKey] ?? {}
  return data.habits.filter((habit) => habit.active && completions[habit.id]).length
}

export function calculateDailyProgress(data: MonthData, day: number) {
  const activeHabits = data.habits.filter((habit) => habit.active).length
  return activeHabits === 0 ? 0 : (calculateDailyHabitCount(data, day) / activeHabits) * 100
}

export function calculateAverageSleep(data: MonthData) {
  const values = Object.values(data.sleep).filter((value) => Number.isFinite(value))
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
