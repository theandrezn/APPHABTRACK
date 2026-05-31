import type { Habit, MonthData } from '../types/habit'
import { getDateKey, isToday } from '../utils/date'
import { HabitCheckbox } from './HabitCheckbox'

type HabitRowProps = {
  habit: Habit
  data: MonthData
  days: number[]
  onToggleCompletion: (day: number, habitId: string) => void
}

export function HabitRow({ habit, data, days, onToggleCompletion }: HabitRowProps) {
  return (
    <>
      <div className="habit-name" style={{ borderLeftColor: habit.color ?? '#8BEA25' }}>
        <span>{habit.name}</span>
        <span aria-hidden="true">{habit.emoji}</span>
      </div>
      {days.map((day) => {
        const checked = Boolean(data.completions[getDateKey(data.year, data.month, day)]?.[habit.id])
        return (
          <div className="habit-cell" key={`${habit.id}-${day}`}>
            <HabitCheckbox
              checked={checked}
              isCurrentDay={isToday(data.year, data.month, day)}
              label={`${habit.name} on day ${day}`}
              day={day}
              habitId={habit.id}
              onToggle={onToggleCompletion}
            />
          </div>
        )
      })}
    </>
  )
}
