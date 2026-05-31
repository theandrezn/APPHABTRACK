import type { MonthData } from '../types/habit'
import { getWeekGroups } from '../utils/date'
import { HabitRow } from './HabitRow'
import { HabitWeekHeader } from './HabitWeekHeader'

type HabitCalendarProps = {
  data: MonthData
  onToggleCompletion: (day: number, habitId: string) => void
  onManageHabits: () => void
}

export function HabitCalendar({ data, onToggleCompletion, onManageHabits }: HabitCalendarProps) {
  const groups = getWeekGroups(data.year, data.month)
  const days = groups.flatMap((group) => group.days)
  const activeHabits = data.habits.filter((habit) => habit.active)

  return (
    <section className="calendar-panel" aria-label="Habit calendar">
      <div
        className="habit-grid"
        style={{
          gridTemplateColumns: `170px repeat(${days.length}, minmax(31px, 1fr))`,
        }}
      >
        <HabitWeekHeader year={data.year} month={data.month} groups={groups} onManageHabits={onManageHabits} />
        {activeHabits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            data={data}
            days={days}
            onToggleCompletion={onToggleCompletion}
          />
        ))}
      </div>
    </section>
  )
}
