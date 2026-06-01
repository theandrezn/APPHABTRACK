import type { ReactNode } from 'react'

type DashboardLayoutProps = {
  menu: ReactNode
  header?: ReactNode
  main: ReactNode
  sidebar?: ReactNode
  workspace?: boolean
}

export function DashboardLayout({ menu, header, main, sidebar, workspace = false }: DashboardLayoutProps) {
  if (workspace) {
    return (
      <div className="app-shell">
        {menu}
        {main}
      </div>
    )
  }

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
