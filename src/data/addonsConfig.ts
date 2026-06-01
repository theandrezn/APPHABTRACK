import {
  Brain,
  CloudSun,
  InfinityIcon,
  PiggyBank,
  type LucideIcon,
} from 'lucide-react'

export type PremiumAddonId = 'moneyPlanner' | 'adhdProductivity' | 'clearMind' | 'lifetimeUpdates'

export type PremiumAddon = {
  id: PremiumAddonId
  name: string
  shortName: string
  description: string
  status: 'active' | 'locked'
  icon: LucideIcon
  accent: string
}

export const ADDON_FLAGS: Record<PremiumAddonId, boolean> = {
  moneyPlanner: true,
  adhdProductivity: true,
  clearMind: true,
  lifetimeUpdates: true,
}

export const PREMIUM_ADDONS: PremiumAddon[] = [
  {
    id: 'moneyPlanner',
    name: 'Ultimate Money Planner Pack',
    shortName: 'Money Planner',
    description: 'All-in-one money system: annual budget and monthly tracker.',
    status: ADDON_FLAGS.moneyPlanner ? 'active' : 'locked',
    icon: PiggyBank,
    accent: '#8BEA25',
  },
  {
    id: 'adhdProductivity',
    name: 'ADHD Productivity Pack',
    shortName: 'ADHD Productivity',
    description: 'ADHD goal planner built for focus, structure, and consistent wins.',
    status: ADDON_FLAGS.adhdProductivity ? 'active' : 'locked',
    icon: Brain,
    accent: '#74D9FF',
  },
  {
    id: 'clearMind',
    name: 'Clear Mind PDF',
    shortName: 'Clear Mind',
    description: 'Brain dump system to capture, sort, and clear mental clutter fast.',
    status: ADDON_FLAGS.clearMind ? 'active' : 'locked',
    icon: CloudSun,
    accent: '#FFD166',
  },
  {
    id: 'lifetimeUpdates',
    name: 'Lifetime Updates',
    shortName: 'Lifetime Updates',
    description: 'Receive future improvements to the HabTrack system.',
    status: ADDON_FLAGS.lifetimeUpdates ? 'active' : 'locked',
    icon: InfinityIcon,
    accent: '#A3FF36',
  },
]

export function getPremiumAddon(id: PremiumAddonId) {
  return PREMIUM_ADDONS.find((addon) => addon.id === id) ?? PREMIUM_ADDONS[0]
}
