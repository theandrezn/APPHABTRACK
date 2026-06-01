import type { CSSProperties } from 'react'
import type { PremiumAddon } from '../../data/addonsConfig'
import { Button } from '../Button'

type AddonCardProps = {
  addon: PremiumAddon
  onOpen: () => void
}

export function AddonCard({ addon, onOpen }: AddonCardProps) {
  const Icon = addon.icon

  return (
    <article className="premium-addon-card" style={{ '--addon-accent': addon.accent } as CSSProperties}>
      <div className="premium-addon-icon">
        <Icon size={30} />
      </div>
      <div className="premium-addon-copy">
        <span>{addon.status === 'active' ? 'Active' : 'Locked'}</span>
        <h3>{addon.name}</h3>
        <p>{addon.description}</p>
      </div>
      <Button tone={addon.status === 'active' ? 'lime' : 'default'} onClick={onOpen}>
        {addon.status === 'active' ? 'Open' : 'View details'}
      </Button>
    </article>
  )
}
