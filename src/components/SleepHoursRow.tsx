import type { MonthData } from '../types/habit'
import { getDateKey, getDaysInMonth } from '../utils/date'

type SleepHoursRowProps = {
  data: MonthData
  onUpdateSleep: (day: number, value: number) => void
}

export function SleepHoursRow({ data, onUpdateSleep }: SleepHoursRowProps) {
  const days = Array.from({ length: getDaysInMonth(data.year, data.month) }, (_, index) => index + 1)

  return (
    <section className="sleep-row-shell" aria-label="Hours of Sleep">
      <div
        className="sleep-row"
        style={{ gridTemplateColumns: `170px repeat(${days.length}, minmax(31px, 1fr))` }}
      >
        <div className="sleep-label">Hours of Sleep</div>
        {days.map((day) => {
          const value = data.sleep[getDateKey(data.year, data.month, day)] ?? 0
          return (
            <label key={day} className="sleep-cell">
              <span className="sr-only">Hours of sleep day {day}</span>
              <input
                id={`sleep-day-${day}`}
                inputMode="decimal"
                value={String(value)}
                onChange={(event) => {
                  const parsed = Number(event.target.value.replace(',', '.'))
                  onUpdateSleep(day, parsed)
                }}
              />
            </label>
          )
        })}
      </div>
    </section>
  )
}
