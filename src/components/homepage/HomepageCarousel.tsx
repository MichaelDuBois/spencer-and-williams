'use client'

import {
  CarouselSection,
  type CarouselSectionVariant,
} from '@/components/CarouselSection'
import { useEmptyQueryHits } from '@/hooks/useEmptyQueryHits'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

import type { Hit } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

interface HomepageCarouselProps {
  title: string
  queryOptions?: HitQueryOptions
  ruleContexts: string[]
  indexName?: string
  renderItem: (hit: Hit) => ReactNode
  variant?: CarouselSectionVariant
}

export const HomepageCarousel = ({
  title,
  queryOptions,
  ruleContexts,
  indexName,
  renderItem,
  variant,
}: HomepageCarouselProps) => {
  const { data: hits } = useEmptyQueryHits({
    ...queryOptions,
    ruleContexts,
    indexName,
  })

  return (
    <CarouselSection
      title={title}
      items={hits ?? []}
      renderItem={renderItem}
      variant={variant}
    />
  )
}
