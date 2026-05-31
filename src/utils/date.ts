import type { WeekGroup } from '../types/habit'

export const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthName(month: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, month, 1))
}

export function getDayOfWeekLabel(date: Date) {
  return dayLabels[date.getDay()]
}

export function getDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getWeekGroups(year: number, month: number): WeekGroup[] {
  const daysInMonth = getDaysInMonth(year, month)
  const groups: WeekGroup[] = []

  for (let start = 1; start <= daysInMonth; start += 7) {
    const days = Array.from({ length: Math.min(7, daysInMonth - start + 1) }, (_, index) => start + index)
    groups.push({ label: `Week ${groups.length + 1}`, days })
  }

  return groups
}

export function isToday(year: number, month: number, day: number) {
  const today = new Date()
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
}
