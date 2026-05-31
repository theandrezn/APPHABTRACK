export type Habit = {
  id: string
  name: string
  emoji: string
  active: boolean
  color?: string
}

export type CompletionMap = {
  [date: string]: {
    [habitId: string]: boolean
  }
}

export type SleepMap = {
  [date: string]: number
}

export type MonthData = {
  year: number
  month: number
  habits: Habit[]
  completions: CompletionMap
  sleep: SleepMap
}

export type WeekGroup = {
  label: string
  days: number[]
}
