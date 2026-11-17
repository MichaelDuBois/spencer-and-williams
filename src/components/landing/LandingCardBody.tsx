import { AccentIconTile } from '@/components/AccentIconTile'
import { LANDING_CARD_ATTRIBUTES } from '@/components/landing/landing-card-attributes'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface LandingCardBodyProps {
  name: string
  description: string
  icon: LucideIcon
  accentColor: string
  ctaIcon: ReactNode
  badge?: ReactNode
}

export const LandingCardBody = ({
  name,
  description,
  icon,
  accentColor,
  ctaIcon,
  badge,
}: LandingCardBodyProps) => (
  <div {...{ [LANDING_CARD_ATTRIBUTES.body]: true }} className="space-y-4">
    <div className="flex items-center gap-4">
      <AccentIconTile
        icon={icon}
        accentColor={accentColor}
        className="h-12 w-12 rounded-xl"
        iconClassName="h-6 w-6"
      />

      <h3 className="text-2xl font-semibold text-slate-900">{name}</h3>

      {badge}
    </div>

    <p className="text-sm text-slate-600">{description}</p>

    <div className="flex items-center text-sm font-medium text-slate-900 transition-colors group-hover:text-slate-700">
      <span>Explore {name}</span>
      {ctaIcon}
    </div>
  </div>
)
