import { useState, type PointerEvent } from 'react'
import type { MonthData } from '../types/habit'
import { calculateAverageSleep } from '../utils/calculations'
import { getDateKey, getDaysInMonth } from '../utils/date'
import { Card } from './Card'

type SleepTrackerChartProps = {
  data: MonthData
  onUpdateSleep: (day: number, value: number) => void
}

type ActivePoint = {
  day: number
  hours: number
  x: number
  y: number
} | null

export function SleepTrackerChart({ data, onUpdateSleep }: SleepTrackerChartProps) {
  const [activePoint, setActivePoint] = useState<ActivePoint>(null)
  const [isDragging, setIsDragging] = useState(false)
  const daysInMonth = getDaysInMonth(data.year, data.month)
  const values = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    return {
      day,
      hours: data.sleep[getDateKey(data.year, data.month, day)] ?? 0,
    }
  })

  const width = 1200
  const height = 140
  const padding = { top: 10, right: 18, bottom: 24, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const xForDay = (day: number) => padding.left + ((day - 1) / Math.max(1, daysInMonth - 1)) * plotWidth
  const yForHours = (hours: number) => padding.top + plotHeight - (Math.min(10, Math.max(0, hours)) / 10) * plotHeight
  const points = values.map((item) => `${xForDay(item.day)},${yForHours(item.hours)}`).join(' ')
  const areaPoints = `${padding.left},${padding.top + plotHeight} ${points} ${padding.left + plotWidth},${padding.top + plotHeight}`
  const yTicks = [10, 6, 3, 0]
  const animationKey = values.map((item) => item.hours).join('-')
  const averageSleep = calculateAverageSleep(data)

  const getPointFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - bounds.left) / bounds.width) * width
    const svgY = ((event.clientY - bounds.top) / bounds.height) * height
    const day = Math.min(daysInMonth, Math.max(1, Math.round(((svgX - padding.left) / plotWidth) * Math.max(1, daysInMonth - 1) + 1)))
    const rawHours = ((padding.top + plotHeight - svgY) / plotHeight) * 10
    const hours = Math.min(12, Math.max(0, Math.round(rawHours * 2) / 2))
    return { day, hours, x: xForDay(day), y: yForHours(hours) }
  }

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getPointFromPointer(event)
    setIsDragging(true)
    setActivePoint(point)
    onUpdateSleep(point.day, point.hours)
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = getPointFromPointer(event)
    if (isDragging) {
      onUpdateSleep(point.day, point.hours)
      setActivePoint(point)
      return
    }
    const currentHours = values[point.day - 1]?.hours ?? 0
    setActivePoint({ day: point.day, hours: currentHours, x: xForDay(point.day), y: yForHours(currentHours) })
  }

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  return (
    <Card className="sleep-chart-card">
      <div className="sleep-chart-header">
        <h2>Sleep Tracker</h2>
        <strong>Average Sleep <span>{averageSleep.toFixed(1)}h</span></strong>
      </div>
      <svg
        className="sleep-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Interactive Sleep Tracker area chart"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (!isDragging) setActivePoint(null)
        }}
      >
        <defs>
          <linearGradient id="sleepSvgGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8BEA25" stopOpacity="0.86" />
            <stop offset="60%" stopColor="#4F9821" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#193915" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick}>
            <text className="sleep-axis-text" x={padding.left - 10} y={yForHours(tick) + 4} textAnchor="end">
              {tick}
            </text>
            <line className="sleep-grid-line" x1={padding.left} x2={padding.left + plotWidth} y1={yForHours(tick)} y2={yForHours(tick)} />
          </g>
        ))}

        <line className="sleep-axis-line" x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} />
        <line className="sleep-axis-line" x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} />
        <g key={animationKey} className="sleep-series">
          <polygon className="sleep-area" points={areaPoints} />
          <polyline className="sleep-line-glow" points={points} />
          <polyline className="sleep-line" points={points} />
        </g>

        {values.map((item) => (
          <circle
            key={`point-${item.day}`}
            className={`sleep-point ${activePoint?.day === item.day ? 'is-active' : ''}`}
            cx={xForDay(item.day)}
            cy={yForHours(item.hours)}
            r={activePoint?.day === item.day ? 4.4 : 2.4}
          />
        ))}

        {activePoint && (
          <g className="sleep-tooltip" transform={`translate(${Math.min(width - 86, Math.max(8, activePoint.x - 38))} ${Math.max(4, activePoint.y - 38)})`}>
            <rect width="76" height="28" rx="4" />
            <text x="38" y="12" textAnchor="middle">Day {activePoint.day}</text>
            <text x="38" y="23" textAnchor="middle">{activePoint.hours.toFixed(1)} hours</text>
          </g>
        )}

        {values.map((item) => (
          <text key={item.day} className="sleep-axis-text" x={xForDay(item.day)} y={height - 5} textAnchor="middle">
            {item.day}
          </text>
        ))}
      </svg>
    </Card>
  )
}
