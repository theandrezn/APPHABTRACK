import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string | number
  subLabel?: string
  icon?: ReactNode
}

export function StatCard({ label, value, subLabel, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      {icon ? <div className="stat-icon" aria-hidden="true">{icon}</div> : null}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {subLabel ? <small>{subLabel}</small> : null}
      </div>
    </div>
  )
}
