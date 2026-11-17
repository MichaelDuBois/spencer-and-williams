'use client'

import type { CarouselSectionVariant } from '@/components/CarouselSection'
import { HomepageCarousel } from '@/components/homepage/HomepageCarousel'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

import type { Hit } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

interface HomepageCarouselsProps {
  renderItem: (hit: Hit) => ReactNode
  className?: string
  queryOptions?: HitQueryOptions
  variant?: CarouselSectionVariant
}

export const HomepageCarousels = ({
  renderItem,
  className,
  queryOptions,
  variant,
}: HomepageCarouselsProps) => {
  const config = useActiveConfig()
  const carousels = config?.homepageCarousels ?? []

  if (!carousels.length) return null

  return (
    <div className={className}>
      {carousels.map((carousel, index) => (
        <HomepageCarousel
          key={`${carousel.title}-${index}`}
          queryOptions={queryOptions}
          title={carousel.title}
          ruleContexts={carousel.ruleContexts}
          indexName={carousel.indexName}
          renderItem={renderItem}
          variant={variant}
        />
      ))}
    </div>
  )
}
