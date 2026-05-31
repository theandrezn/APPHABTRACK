import type { CSSProperties } from 'react'

type ProgressBarProps = {
  value: number
  label?: string
}

export function ProgressBar({ value, label = 'Progress' }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      style={{ '--progress': `${safeValue}%` } as CSSProperties & Record<'--progress', string>}
    >
      <div className="progress-bar-fill" style={{ transform: `scaleX(${safeValue / 100})` }} />
      <div className="progress-bar-spark" aria-hidden="true" />
    </div>
  )
}
