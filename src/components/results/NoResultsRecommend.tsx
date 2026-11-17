'use client'

import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useProductHitDefinition } from '@/hooks/useProductHitDefinition'
import type { HitTemplate } from '@/types/hitTemplate.types'

export const NoResultsRecommend = () => {
  const config = useActiveConfig()
  const { definition, queryOptions } = useProductHitDefinition(config?.slug)
  if (!config?.features.recommend?.noResults?.length || !definition) return null

  return (
    <ProductRecommend
      section="noResults"
      queryOptions={queryOptions}
      className="border-border mt-8 border-t pt-6"
      variant={definition.carouselVariant}
      renderItem={(hit) =>
        definition.renderHit({
          hit,
          slug: config.slug,
          template: config.algolia.primaryIndex.template as HitTemplate<{
            name: string
          }>,
        })
      }
    />
  )
}
