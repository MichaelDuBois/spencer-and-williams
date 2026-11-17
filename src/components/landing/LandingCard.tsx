'use client'

import { motion } from 'motion/react'

import { LANDING_CARD_ATTRIBUTES } from '@/components/landing/landing-card-attributes'
import { enterFadeIn, transitionFluid } from '@/lib/animations'

import type { ReactNode } from 'react'

interface LandingCardProps {
  index: number
  accentColor: string
  children: ReactNode
}

export const LandingCard = ({
  index,
  accentColor,
  children,
}: LandingCardProps) => (
  <motion.article
    {...{ [LANDING_CARD_ATTRIBUTES.card]: true }}
    {...enterFadeIn(24)}
    transition={{ ...transitionFluid, delay: index * 0.06 }}
    style={{ borderColor: accentColor }}
    className="flex flex-col rounded-lg border border-slate-200 bg-white p-8 shadow transition-[translate,scale,box-shadow] duration-200 focus-within:-translate-y-1 focus-within:scale-[1.02] focus-within:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
    {children}
  </motion.article>
)
