import type { MonthData } from '../types/habit'
import { calculateDailyProgress } from '../utils/calculations'

type DailyProgressPanelProps = {
  data: MonthData
  dailyCounts: Array<{ day: number; count: number }>
}

export function DailyProgressPanel({ data, dailyCounts }: DailyProgressPanelProps) {
  return (
    <section className="daily-panel" aria-label="Daily Progress">
      <div
        className="daily-grid"
        style={{ gridTemplateColumns: `170px repeat(${dailyCounts.length}, minmax(31px, 1fr))` }}
      >
        <div className="daily-label top">Habit Count</div>
        {dailyCounts.map((item) => (
          <div key={`count-${item.day}`} className="daily-count">
            {item.count}
          </div>
        ))}
        <div className="daily-label bottom">Daily Progress</div>
        {dailyCounts.map((item) => {
          const progress = calculateDailyProgress(data, item.day)
          return (
            <div key={`bar-${item.day}`} className="daily-bar-cell">
              <div
                key={`${item.day}-${progress}`}
                className="daily-bar"
                style={{ height: `${progress}%`, animationDelay: `${Math.min(item.day * 18, 360)}ms` }}
                aria-label={`Day ${item.day} progress ${progress.toFixed(0)}%`}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
