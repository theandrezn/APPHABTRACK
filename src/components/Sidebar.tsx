import type { Habit, MonthData } from '../types/habit'
import { Card } from './Card'
import { DonutProgress } from './DonutProgress'
import { EachHabitProgress } from './EachHabitProgress'
import { HabitGameLogo } from './HabitGameLogo'

type SidebarProps = {
  data: MonthData
  progress: number
  habitCounts: Array<{ habit: Habit; count: number }>
}

export function Sidebar({ data, progress, habitCounts }: SidebarProps) {
  return (
    <>
      <EachHabitProgress data={data} habitCounts={habitCounts} />
      <HabitGameLogo />
      <Card className="donut-card" title="Progress">
        <DonutProgress value={progress} />
      </Card>
    </>
  )
}
