'use client'

import { useLandingCardHeights } from '@/components/landing/hooks/useLandingCardHeights'

import type { ReactNode } from 'react'

interface LandingDemoGridProps {
  children: ReactNode
  as?: 'div' | 'ul'
}

export const LandingDemoGrid = ({
  children,
  as: Element = 'div',
}: LandingDemoGridProps) => {
  const gridRef = useLandingCardHeights()

  return (
    <Element
      ref={gridRef}
      className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </Element>
  )
}
