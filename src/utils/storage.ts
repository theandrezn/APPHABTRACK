import type { Habit, MonthData } from '../types/habit'
import { getDateKey, getDaysInMonth } from './date'

const STORAGE_PREFIX = 'habit-game:v1'

export const defaultHabits: Habit[] = [
  { id: 'wake-up-0500', name: 'Wake up at 05:00', emoji: '⏰', active: true, color: '#8BEA25' },
  { id: 'gym', name: 'Gym', emoji: '💪', active: true, color: '#A3FF36' },
  { id: 'reading-learning', name: 'Reading / Learning', emoji: '📖', active: true, color: '#74D9FF' },
  { id: 'day-planning', name: 'Day Planning', emoji: '🧾', active: true, color: '#FFD166' },
  { id: 'no-gooning', name: 'No Gooning', emoji: '💦', active: true, color: '#62D0FF' },
  { id: 'project-work', name: 'Project Work', emoji: '🎯', active: true, color: '#FF6B6B' },
  { id: 'no-alcohol', name: 'No Alcohol', emoji: '🍾', active: true, color: '#D6FF45' },
  { id: 'social-media-detox', name: 'Social Media Detox', emoji: '🌿', active: true, color: '#7BEA5B' },
  { id: 'goal-journaling', name: 'Goal Journaling', emoji: '📝', active: true, color: '#FFB35C' },
  { id: 'coal-shower', name: 'Coal Shower', emoji: '🚿', active: true, color: '#8FD3FF' },
]

const februarySleep = [5, 7, 8, 3, 7.5, 6, 8, 6, 7, 8, 5, 6, 7, 7.5, 8, 5, 6, 7, 8, 7, 6, 7, 7, 6, 7, 7, 8, 6]
const exampleHabitCounts = [18, 19, 20, 22, 21, 19, 18, 22, 23, 22]

function getStorageKey(year: number, month: number, ownerId?: string | null) {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  return ownerId ? `${STORAGE_PREFIX}:${ownerId}:${monthKey}` : `${STORAGE_PREFIX}:${monthKey}`
}

export function createMonthData(year: number, month: number, habits: Habit[] = defaultHabits): MonthData {
  const sleep: MonthData['sleep'] = {}
  const daysInMonth = getDaysInMonth(year, month)

  for (let day = 1; day <= daysInMonth; day += 1) {
    sleep[getDateKey(year, month, day)] = 0
  }

  return {
    year,
    month,
    habits: habits.map((habit) => ({ ...habit })),
    completions: {},
    sleep,
  }
}

export function seedExampleData(): MonthData {
  const year = 2026
  const month = 1
  const data = createMonthData(year, month)

  data.habits.forEach((habit, habitIndex) => {
    const count = exampleHabitCounts[habitIndex] ?? 18
    for (let day = 1; day <= count; day += 1) {
      const dateKey = getDateKey(year, month, day)
      data.completions[dateKey] = {
        ...(data.completions[dateKey] ?? {}),
        [habit.id]: true,
      }
    }
  })

  februarySleep.forEach((value, index) => {
    data.sleep[getDateKey(year, month, index + 1)] = value
  })

  return data
}

export function saveToLocalStorage(data: MonthData, ownerId?: string | null) {
  window.localStorage.setItem(getStorageKey(data.year, data.month, ownerId), JSON.stringify(data))
}

export function loadFromLocalStorage(year: number, month: number, ownerId?: string | null): MonthData | null {
  const raw = window.localStorage.getItem(getStorageKey(year, month, ownerId))
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as MonthData
    return validateMonthData(parsed)
  } catch {
    return null
  }
}

export function resetMonth(data: MonthData): MonthData {
  return createMonthData(data.year, data.month, data.habits)
}

export function exportMonthData(data: MonthData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `habit-game-${data.year}-${String(data.month + 1).padStart(2, '0')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function importMonthData(raw: string): MonthData {
  return validateMonthData(JSON.parse(raw))
}

function validateMonthData(value: unknown): MonthData {
  if (!value || typeof value !== 'object') throw new Error('Invalid JSON: expected an object.')
  const data = value as MonthData

  if (!Number.isInteger(data.year) || !Number.isInteger(data.month) || data.month < 0 || data.month > 11) {
    throw new Error('Invalid JSON: year or month is invalid.')
  }

  if (!Array.isArray(data.habits) || data.habits.some((habit) => !isHabit(habit))) {
    throw new Error('Invalid JSON: habits are invalid.')
  }

  if (!data.completions || typeof data.completions !== 'object') {
    throw new Error('Invalid JSON: completions map is invalid.')
  }

  if (!data.sleep || typeof data.sleep !== 'object') {
    throw new Error('Invalid JSON: sleep map is invalid.')
  }

  Object.entries(data.sleep).forEach(([key, value]) => {
    if (typeof key !== 'string' || typeof value !== 'number' || value < 0 || value > 12) {
      throw new Error('Invalid JSON: sleep values must be between 0 and 12.')
    }
  })

  return data
}

function isHabit(value: unknown): value is Habit {
  if (!value || typeof value !== 'object') return false
  const habit = value as Habit
  return (
    typeof habit.id === 'string' &&
    typeof habit.name === 'string' &&
    habit.name.trim().length > 0 &&
    typeof habit.emoji === 'string' &&
    typeof habit.active === 'boolean' &&
    (habit.color === undefined || typeof habit.color === 'string')
  )
}
