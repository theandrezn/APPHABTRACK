import type { CSSProperties } from 'react'
import type { Habit, MonthData } from '../types/habit'
import { calculateHabitProgress } from '../utils/calculations'
import { Card } from './Card'

type EachHabitProgressProps = {
  data: MonthData
  habitCounts: Array<{ habit: Habit; count: number }>
}

export function EachHabitProgress({ data, habitCounts }: EachHabitProgressProps) {
  return (
    <Card className="each-habit-card" title="Each Habit">
      <div className="habit-progress-head">
        <span>Count</span>
        <span>Progress</span>
      </div>
      <div className="habit-progress-list">
        {habitCounts.map(({ habit, count }) => {
          const progress = calculateHabitProgress(data, habit.id)
          return (
            <div className="habit-progress-row" key={habit.id}>
              <strong>{count}</strong>
              <div
                className="mini-progress"
                aria-label={`${habit.name} progress ${progress.toFixed(0)}%`}
                style={
                  {
                    '--habit-progress': `${progress}%`,
                    '--habit-color': habit.color ?? '#77D51D',
                  } as CSSProperties & Record<'--habit-progress' | '--habit-color', string>
                }
              >
                <span style={{ width: `${progress}%` }}>
                  <i />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
