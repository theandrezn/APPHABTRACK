import { Crown } from 'lucide-react'

export function HabitGameLogo() {
  return (
    <div className="habit-game-logo" aria-label="Habit Game">
      <Crown size={54} strokeWidth={3.5} fill="#fff" />
      <div>
        <span>HABIT</span>
        <span>GAME</span>
      </div>
    </div>
  )
}
