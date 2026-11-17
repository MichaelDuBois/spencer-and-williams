'use client'

import {
  CarouselSection,
  type CarouselSectionVariant,
} from '@/components/CarouselSection'
import { RecommendModelContext } from '@/components/recommend/RecommendModelContext'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useRecommend, type RecommendOptions } from '@/hooks/useRecommend'
import type { VerticalConfig } from '@/types/verticalConfig.types'

import type { RecommendHit } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

type RecommendPlacement = keyof NonNullable<
  VerticalConfig['features']['recommend']
>

interface ProductRecommendProps {
  objectID?: string
  queryOptions?: RecommendOptions
  renderItem: (hit: RecommendHit) => ReactNode
  className?: string
  section?: RecommendPlacement
  variant?: CarouselSectionVariant
}

export const ProductRecommend = ({
  objectID,
  queryOptions,
  renderItem,
  className,
  section = 'pdp',
  variant,
}: ProductRecommendProps) => {
  const config = useActiveConfig()
  const sections = config?.features.recommend?.[section] ?? []

  const models = sections.map((s) => s.model)
  const { data: recommendData } = useRecommend(models, objectID, queryOptions)

  if (!sections.length) return null

  return (
    <div className={className}>
      {sections.map(({ model, title }, index) => (
        <RecommendModelContext.Provider key={`${model}-${index}`} value={model}>
          <CarouselSection
            title={title}
            items={recommendData?.[model] ?? []}
            renderItem={renderItem}
            variant={variant}
          />
        </RecommendModelContext.Provider>
      ))}
    </div>
  )
}
