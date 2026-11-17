import type { ProductRecommendModel } from '@/hooks/useRecommend'
import { track, type ProductClickSurface } from '@/lib/analytics/track'

interface ProductClickHit {
  objectID: string
  __queryID?: string
  __position?: number
}

interface ProductClickOptions {
  surface: ProductClickSurface
  model?: ProductRecommendModel
  /** The index Insights would report against; omitted when none is configured. */
  index?: string
}

/** Amplitude half of a product click; pair it with the Insights emission where one applies. */
export const trackProductClick = (
  hit: ProductClickHit,
  { surface, model, index }: ProductClickOptions,
): void => {
  track('product_clicked', {
    objectID: hit.objectID,
    surface,
    ...(model ? { model } : {}),
    ...(hit.__position !== undefined ? { position: hit.__position } : {}),
    ...(hit.__queryID ? { queryID: hit.__queryID } : {}),
    ...(index ? { index } : {}),
  })
}
