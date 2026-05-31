import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { DashboardLayout } from './components/DashboardLayout'
import { AuthGate } from './components/AuthGate'
import { AppMenuBar } from './components/AppMenuBar'
import { HeaderStats } from './components/HeaderStats'
import { HabitCalendar } from './components/HabitCalendar'
import { SleepHoursRow } from './components/SleepHoursRow'
import { DailyProgressPanel } from './components/DailyProgressPanel'
import { SleepTrackerChart } from './components/SleepTrackerChart'
import { Sidebar } from './components/Sidebar'
import { ManageHabitsModal } from './components/ManageHabitsModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import type { Habit, MonthData } from './types/habit'
import {
  calculateCompletedHabits,
  calculateDailyHabitCount,
  calculateHabitCount,
  calculateMonthlyProgress,
} from './utils/calculations'
import { getDaysInMonth } from './utils/date'
import {
  createMonthData,
  exportMonthData,
  importMonthData,
  loadFromLocalStorage,
  resetMonth,
  saveToLocalStorage,
  seedExampleData,
} from './utils/storage'

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
} | null

function App() {
  const [authSession, setAuthSession] = useState<Session | null>(null)
  const [dataOwnerId, setDataOwnerId] = useState<string | null>(null)
  const [data, setData] = useState<MonthData>(() => createMonthData(2026, 1))
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const ownerId = authSession?.user.id ?? null

  useEffect(() => {
    queueMicrotask(() => {
      if (!ownerId) {
        setData(createMonthData(2026, 1))
        setDataOwnerId(null)
        return
      }

      setData((current) => loadFromLocalStorage(current.year, current.month, ownerId) ?? createMonthData(current.year, current.month, current.habits))
      setDataOwnerId(ownerId)
    })
  }, [ownerId])

  useEffect(() => {
    if (ownerId && dataOwnerId === ownerId) {
      saveToLocalStorage(data, ownerId)
    }
  }, [data, dataOwnerId, ownerId])

  const activeHabits = useMemo(() => data.habits.filter((habit) => habit.active), [data.habits])
  const daysInMonth = getDaysInMonth(data.year, data.month)
  const completedHabits = calculateCompletedHabits(data)
  const monthlyProgress = calculateMonthlyProgress(data)

  const loadMonth = useCallback((nextYear: number, nextMonth: number) => {
    setData((current) => loadFromLocalStorage(nextYear, nextMonth, ownerId) ?? createMonthData(nextYear, nextMonth, current.habits))
  }, [ownerId])

  const toggleCompletion = useCallback((day: number, habitId: string) => {
    setData((current) => {
      const dateKey = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const currentDay = current.completions[dateKey] ?? {}
      return {
        ...current,
        completions: {
          ...current.completions,
          [dateKey]: {
            ...currentDay,
            [habitId]: !currentDay[habitId],
          },
        },
      }
    })
  }, [])

  const updateSleep = useCallback((day: number, value: number) => {
    setData((current) => {
      const dateKey = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const safeValue = Number.isFinite(value) ? Math.min(12, Math.max(0, value)) : 0
      return {
        ...current,
        sleep: {
          ...current.sleep,
          [dateKey]: safeValue,
        },
      }
    })
  }, [])

  const saveHabits = useCallback((habits: Habit[]) => {
    setData((current) => ({ ...current, habits }))
    setIsManageOpen(false)
  }, [])

  const handleSeed = useCallback(() => {
    setConfirmState({
      title: 'Seed Example Data',
      message: 'Replace this month with the February-style sample data?',
      confirmLabel: 'Seed Example',
      onConfirm: () => {
        setData(seedExampleData())
        setConfirmState(null)
      },
    })
  }, [])

  const handleReset = useCallback(() => {
    setConfirmState({
      title: 'Reset Month',
      message: 'Clear all completions and sleep entries for this month?',
      confirmLabel: 'Reset Month',
      onConfirm: () => {
        setData((current) => resetMonth(current))
        setConfirmState(null)
      },
    })
  }, [])

  const handleExport = useCallback(() => {
    exportMonthData(data)
  }, [data])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback((file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importMonthData(String(reader.result))
        setData(imported)
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Import failed.')
      }
    }
    reader.readAsText(file)
  }, [])

  const dailyCounts = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        count: calculateDailyHabitCount(data, index + 1),
      })),
    [data, daysInMonth],
  )

  const habitCounts = useMemo(
    () =>
      activeHabits.map((habit) => ({
        habit,
        count: calculateHabitCount(data, habit.id),
      })),
    [activeHabits, data],
  )

  return (
    <AuthGate onSessionChange={setAuthSession}>
      <DashboardLayout
        menu={<AppMenuBar />}
        header={
          <HeaderStats
            year={data.year}
            month={data.month}
            progress={monthlyProgress}
            completedHabits={completedHabits}
            onMonthChange={(nextMonth) => loadMonth(data.year, nextMonth)}
            onYearChange={(nextYear) => loadMonth(nextYear, data.month)}
            onManageHabits={() => setIsManageOpen(true)}
            onSeedExample={handleSeed}
            onResetMonth={handleReset}
            onExportJson={handleExport}
            onImportJson={handleImportClick}
          />
        }
        main={
          <>
            <HabitCalendar data={data} onToggleCompletion={toggleCompletion} onManageHabits={() => setIsManageOpen(true)} />
            <SleepHoursRow data={data} onUpdateSleep={updateSleep} />
            <DailyProgressPanel data={data} dailyCounts={dailyCounts} />
            <SleepTrackerChart data={data} onUpdateSleep={updateSleep} />
          </>
        }
        sidebar={
          <Sidebar
            data={data}
            progress={monthlyProgress}
            habitCounts={habitCounts}
          />
        }
      />

      <input
        ref={importInputRef}
        className="sr-only"
        type="file"
        accept="application/json"
        aria-label="Import JSON file"
        onChange={(event) => {
          handleImportFile(event.target.files?.[0])
          event.currentTarget.value = ''
        }}
      />

      {isManageOpen && (
        <ManageHabitsModal
          habits={data.habits}
          onCancel={() => setIsManageOpen(false)}
          onSave={saveHabits}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmState.onConfirm}
        />
      )}
    </AuthGate>
  )
}

export default App
