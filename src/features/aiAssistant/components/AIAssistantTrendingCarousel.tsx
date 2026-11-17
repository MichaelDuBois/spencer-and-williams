'use client'

import { CarouselSection } from '@/components/CarouselSection'
import type { CarouselSectionVariant } from '@/components/CarouselSection'
import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'
import type { TrendingCarouselConfig } from '@/features/aiAssistant/verticals/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useEmptyQueryHits } from '@/hooks/useEmptyQueryHits'

// Product-card-width variants overflow the panel and need scaling down; 'poster'
// is already narrow and would become illegible if zoomed too.
const ZOOMED_VARIANTS: CarouselSectionVariant[] = [
  'standard',
  'editorial',
  'grocery',
]

export const AIAssistantTrendingCarousel = () => {
  const catalog = useAssistantCatalog()
  const config = useActiveConfig()
  const verticalConfig = getVerticalConfig(config?.slug)
  // Assistant-level source wins; `HomepageCarouselConfig` is a narrower
  // `TrendingCarouselConfig`, so the fallback needs no reshaping.
  const carousel: TrendingCarouselConfig | undefined =
    verticalConfig.trendingCarousel ?? config?.homepageCarousels?.[0]

  const primaryIndex = config?.algolia.primaryIndex
  const isProductSource =
    !carousel?.indexName ||
    carousel.indexName === primaryIndex?.name ||
    primaryIndex?.replicas?.some(
      (replica) => replica.indexName === carousel.indexName,
    )
  const queryOptions = isProductSource ? catalog?.queryOptions : undefined

  const { data: hits } = useEmptyQueryHits({
    ...queryOptions,
    ruleContexts: carousel?.ruleContexts,
    filterRuleContexts: carousel?.filterRuleContexts,
    indexName: carousel?.indexName,
    hitsPerPage: carousel?.hitsPerPage,
    attributesToRetrieve: carousel?.attributesToRetrieve,
    attributesToHighlight: carousel?.attributesToHighlight,
    enabled: Boolean(carousel) && queryOptions?.enabled !== false,
  })

  const renderItem = verticalConfig.renderTrendingItem
  if (!carousel || !renderItem || !hits?.length) return null

  const variant = verticalConfig.trendingCarouselVariant ?? 'standard'

  return (
    <CarouselSection
      title={carousel.title}
      items={hits}
      renderItem={renderItem}
      variant={variant}
      className={ZOOMED_VARIANTS.includes(variant) ? '[zoom:0.7]' : undefined}
    />
  )
}
