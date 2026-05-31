import type { LucideIcon } from 'lucide-react'

export type AddOnCategory = 'Planners' | 'Productivity' | 'Wellness' | 'Finance'

export type AddOn = {
  id: string
  name: string
  description: string
  category: AddOnCategory
  price: number
  paymentLink: string
  icon: LucideIcon
  features: string[]
  featured?: boolean
}
