'use client'

import { motion } from 'motion/react'

import { DURATION_SLOW, EASE_SMOOTH } from '@/lib/animations'

interface PageTransitionTemplateProps {
  children: React.ReactNode
  isFromHomePage?: boolean
  onAnimationComplete?: () => void
}

export const PageTransitionTemplate = ({
  children,
  isFromHomePage = false,
  onAnimationComplete,
}: PageTransitionTemplateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: isFromHomePage ? DURATION_SLOW : 0.1,
      duration: isFromHomePage ? 0.4 : 0.25,
      ease: EASE_SMOOTH,
    }}
    onAnimationComplete={onAnimationComplete}>
    {children}
  </motion.div>
)
