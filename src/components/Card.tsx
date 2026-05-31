import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
  title?: string
}>

export function Card({ children, className = '', title }: CardProps) {
  return (
    <section className={`panel ${className}`}>
      {title && <h2 className="panel-title">{title}</h2>}
      {children}
    </section>
  )
}
