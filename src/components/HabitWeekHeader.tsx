import { Pencil } from 'lucide-react'
import type { WeekGroup } from '../types/habit'
import { getDayOfWeekLabel } from '../utils/date'

type HabitWeekHeaderProps = {
  year: number
  month: number
  groups: WeekGroup[]
  onManageHabits: () => void
}

export function HabitWeekHeader({ year, month, groups, onManageHabits }: HabitWeekHeaderProps) {
  return (
    <>
      <div className="habit-head habits-title" style={{ gridRow: '1 / span 3' }}>
        <span>Habits</span>
        <button className="habit-edit-trigger" type="button" aria-label="Edit habits" onClick={onManageHabits}>
          <Pencil size={14} />
        </button>
      </div>
      {groups.map((group) => (
        <div
          key={group.label}
          className="habit-head week-label"
          style={{ gridColumn: `span ${group.days.length}` }}
        >
          {group.label}
        </div>
      ))}
      {groups.flatMap((group) =>
        group.days.map((day) => (
          <div key={`dow-${day}`} className="habit-head day-label">
            {getDayOfWeekLabel(new Date(year, month, day))}
          </div>
        )),
      )}
      {groups.flatMap((group) =>
        group.days.map((day) => (
          <div key={`day-${day}`} className="habit-head day-number">
            {day}
          </div>
        )),
      )}
    </>
  )
}
