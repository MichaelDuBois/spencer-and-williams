'use client'

import { ArrowRight, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { LandingCard } from '@/components/landing/LandingCard'
import { LandingCardBody } from '@/components/landing/LandingCardBody'
import { LandingCardFeatures } from '@/components/landing/LandingCardFeatures'
import { enterFadeIn, transitionFluid } from '@/lib/animations'
import { FALLBACK_VERTICAL_ICON, VERTICAL_ICONS } from '@/lib/vertical-icons'
import type { Vertical } from '@/types'
import { getVerticalDemoFeatures } from '@/verticals/getVerticalDemoFeatures'

export { AemDemoCard } from '@/components/landing/AemDemoCard'

export const LandingHero = () => (
  <div className="mb-12 text-center">
    <motion.h2
      {...enterFadeIn(24)}
      transition={{ ...transitionFluid, delay: 0.05 }}
      className="mb-4 text-4xl font-bold text-slate-900">
      Choose Your Demo Experience
    </motion.h2>
    <motion.p
      {...enterFadeIn(24)}
      transition={{ ...transitionFluid, delay: 0.15 }}
      className="text-lg text-slate-600">
      Select a vertical to explore its unique design and features
    </motion.p>
  </div>
)

interface VerticalCardProps extends Vertical {
  index: number
}

export const VerticalCard = ({ config, index }: VerticalCardProps) => {
  const accentColor = `var(--theme-accent-${config.theme})`
  const icon = VERTICAL_ICONS[config.slug] ?? FALLBACK_VERTICAL_ICON
  const isDark = config.darkMode ?? false

  return (
    <LandingCard index={index} accentColor={accentColor}>
      <Link
        href={`/${config.slug}`}
        className="group block flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
        <LandingCardBody
          name={config.name}
          description={config.description}
          icon={icon}
          accentColor={accentColor}
          badge={
            isDark && (
              <Moon
                role="img"
                className="ml-auto h-5 w-5 shrink-0 text-slate-400"
                aria-label="Dark theme"
              />
            )
          }
          ctaIcon={
            <ArrowRight
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          }
        />
      </Link>
      <LandingCardFeatures
        name={config.name}
        features={getVerticalDemoFeatures(config)}
      />
    </LandingCard>
  )
}
