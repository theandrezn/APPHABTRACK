import { useEffect, useRef, useState } from 'react'

type DonutProgressProps = {
  value: number
}

export function DonutProgress({ value }: DonutProgressProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const previousValueRef = useRef(value)
  const safeValue = Math.min(100, Math.max(0, value))
  const radius = 74
  const center = 95
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeValue / 100) * circumference
  const angle = (safeValue / 100) * Math.PI * 2 - Math.PI / 2
  const markerX = center + Math.cos(angle) * radius
  const markerY = center + Math.sin(angle) * radius

  useEffect(() => {
    if (previousValueRef.current === value) return

    previousValueRef.current = value
    setIsSpinning(false)

    const startFrame = window.requestAnimationFrame(() => {
      setIsSpinning(true)
    })
    const timer = window.setTimeout(() => {
      setIsSpinning(false)
    }, 920)

    return () => {
      window.cancelAnimationFrame(startFrame)
      window.clearTimeout(timer)
    }
  }, [value])

  return (
    <div className={`donut-wrap ${isSpinning ? 'is-spinning' : ''}`}>
      <svg viewBox="0 0 190 190" role="img" aria-label={`Completed ${safeValue.toFixed(2)} percent`}>
        <defs>
          <linearGradient id="donutGradient" x1="22" x2="166" y1="152" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#63d91a" />
            <stop offset="52%" stopColor="#8bea25" />
            <stop offset="100%" stopColor="#b7ff38" />
          </linearGradient>
        </defs>
        <circle className="donut-track" cx={center} cy={center} r={radius} />
        <circle
          className="donut-value-glow"
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <circle
          className="donut-value"
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        {safeValue > 0 ? <circle className="donut-marker" cx={markerX} cy={markerY} r="5.5" /> : null}
      </svg>
      <div className="donut-center">
        <span>COMPLETED</span>
        <strong>{safeValue.toFixed(2)}%</strong>
      </div>
    </div>
  )
}
