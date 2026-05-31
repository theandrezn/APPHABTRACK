import { CircleCheck, Download, RefreshCw, Settings2, TrendingUp, Upload, WandSparkles } from 'lucide-react'
import { Button } from './Button'
import { MonthSelector } from './MonthSelector'
import { ProgressBar } from './ProgressBar'
import { StatCard } from './StatCard'
import { getMonthName } from '../utils/date'

type HeaderStatsProps = {
  year: number
  month: number
  progress: number
  completedHabits: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onManageHabits: () => void
  onSeedExample: () => void
  onResetMonth: () => void
  onExportJson: () => void
  onImportJson: () => void
}

export function HeaderStats({
  year,
  month,
  progress,
  completedHabits,
  onYearChange,
  onMonthChange,
  onManageHabits,
  onSeedExample,
  onResetMonth,
  onExportJson,
  onImportJson,
}: HeaderStatsProps) {
  return (
    <header className="top-header">
      <div className="month-block">
        <h1>{getMonthName(month)}</h1>
        <MonthSelector year={year} month={month} onYearChange={onYearChange} onMonthChange={onMonthChange} />
      </div>

      <StatCard
        label="Monthly Progress %"
        value={`${progress.toFixed(2)}%`}
        subLabel="vs last month 0%"
        icon={<TrendingUp size={27} />}
      />
      <StatCard
        label="Completed Habits"
        value={completedHabits}
        subLabel="vs last month 0"
        icon={<CircleCheck size={27} />}
      />

      <div className="header-progress">
        <div>
          <span>Progress</span>
          <strong>{progress.toFixed(2)}%</strong>
        </div>
        <ProgressBar value={progress} label="Monthly progress" />
      </div>

      <div className="header-actions" aria-label="Dashboard actions">
        <Button onClick={onManageHabits} aria-label="Manage Habits">
          <Settings2 size={15} />
          Manage Habits
        </Button>
        <Button onClick={onSeedExample} aria-label="Seed Example">
          <WandSparkles size={15} />
          Seed Example
        </Button>
        <Button onClick={onResetMonth} aria-label="Reset Month">
          <RefreshCw size={15} />
          Reset Month
        </Button>
        <Button onClick={onExportJson} aria-label="Export JSON">
          <Download size={15} />
          Export JSON
        </Button>
        <Button onClick={onImportJson} aria-label="Import JSON">
          <Upload size={15} />
          Import JSON
        </Button>
      </div>
    </header>
  )
}
