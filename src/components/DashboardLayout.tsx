import type { ReactNode } from 'react'

type DashboardLayoutProps = {
  menu: ReactNode
  header: ReactNode
  main: ReactNode
  sidebar: ReactNode
}

export function DashboardLayout({ menu, header, main, sidebar }: DashboardLayoutProps) {
  return (
    <div className="app-shell">
      {menu}
      {header}
      <div className="dashboard-grid">
        <main className="dashboard-main" aria-label="Habit dashboard">
          {main}
        </main>
        <aside className="dashboard-sidebar" aria-label="Habit sidebar">
          {sidebar}
        </aside>
      </div>
    </div>
  )
}
