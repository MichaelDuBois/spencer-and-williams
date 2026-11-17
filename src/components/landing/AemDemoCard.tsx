'use client'

import { ExternalLink } from 'lucide-react'

import { LandingCard } from '@/components/landing/LandingCard'
import { LandingCardBody } from '@/components/landing/LandingCardBody'
import { LandingCardFeatures } from '@/components/landing/LandingCardFeatures'
import { AEM_DEMOS_OWNERSHIP, type AemDemo } from '@/verticals/aem-demos'

interface AemDemoCardProps {
  demo: AemDemo
  index: number
}

export const AemDemoCard = ({ demo, index }: AemDemoCardProps) => {
  const { name, href, description, icon, accentColor, features } = demo

  return (
    <LandingCard index={index} accentColor={accentColor}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
        <LandingCardBody
          name={name}
          description={description}
          icon={icon}
          accentColor={accentColor}
          ctaIcon={<ExternalLink className="ml-2 h-4 w-4" aria-hidden />}
        />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <LandingCardFeatures
        name={name}
        features={features}
        ownership={AEM_DEMOS_OWNERSHIP}
      />
    </LandingCard>
  )
}
