import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'danger' | 'lime'
}>

export function Button({ children, className = '', tone = 'default', ...props }: ButtonProps) {
  return (
    <button className={`app-button app-button-${tone} ${className}`} {...props}>
      {children}
    </button>
  )
}
