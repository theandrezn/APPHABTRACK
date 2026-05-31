import { getMonthName } from '../utils/date'

type MonthSelectorProps = {
  year: number
  month: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
}

export function MonthSelector({ year, month, onYearChange, onMonthChange }: MonthSelectorProps) {
  return (
    <div className="month-selector" aria-label="Month and year selector">
      <label>
        <span className="sr-only">Month</span>
        <select value={month} onChange={(event) => onMonthChange(Number(event.target.value))}>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index} value={index}>
              {getMonthName(index)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Year</span>
        <input
          type="number"
          min={2000}
          max={2100}
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
        />
      </label>
    </div>
  )
}
