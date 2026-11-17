'use client'

import { HitActionContext } from '@/components/hit/HitActionContext'
import { CompareToggle } from '@/features/chatWidget/components/CompareToggle'
import { useComparisonCapability } from '@/features/chatWidget/hooks/useComparisonCapability'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'
import type { ReactNode } from 'react'

interface ComparableSearchHitProps {
  hit: AlgoliaHit<BaseHit>
  children: ReactNode
}

export const ComparableSearchHit = ({
  hit,
  children,
}: ComparableSearchHitProps) => {
  const capability = useComparisonCapability()
  return (
    <HitActionContext.Provider
      value={
        capability ? <CompareToggle hit={hit} capability={capability} /> : null
      }>
      {children}
    </HitActionContext.Provider>
  )
}
