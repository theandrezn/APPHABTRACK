import { memo } from 'react'
import { Check } from 'lucide-react'

type HabitCheckboxProps = {
  checked: boolean
  label: string
  isCurrentDay?: boolean
  day: number
  habitId: string
  onToggle: (day: number, habitId: string) => void
}

export const HabitCheckbox = memo(function HabitCheckbox({ checked, label, isCurrentDay, day, habitId, onToggle }: HabitCheckboxProps) {
  return (
    <button
      type="button"
      className={`habit-checkbox ${checked ? 'is-checked' : ''} ${isCurrentDay ? 'is-today' : ''}`}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onToggle(day, habitId)}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  )
}, (previous, next) => (
  previous.checked === next.checked &&
  previous.isCurrentDay === next.isCurrentDay &&
  previous.label === next.label &&
  previous.day === next.day &&
  previous.habitId === next.habitId
))
