'use client'

import { LANDING_CARD_ATTRIBUTES } from '@/components/landing/landing-card-attributes'
import { AccordionItem } from '@/components/ui/AccordionItem'

interface LandingCardFeaturesProps {
  name: string
  features: readonly string[]
  ownership?: string
}

export const LandingCardFeatures = ({
  name,
  features,
  ownership,
}: LandingCardFeaturesProps) => {
  if (features.length === 0 && !ownership) return null

  return (
    <AccordionItem
      title="Features & info"
      variant="landing"
      triggerProps={{
        'aria-label': `Features & info for ${name}`,
        [LANDING_CARD_ATTRIBUTES.toggle]: true,
      }}
      contentProps={{ [LANDING_CARD_ATTRIBUTES.content]: true }}>
      {features.length > 0 && (
        <ul className="list-disc space-y-2 pl-5">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      {ownership && <p className="mt-4 text-xs">{ownership}</p>}
    </AccordionItem>
  )
}
