import type { ProductCardSkeletonVariant } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import type { DisplayProduct } from '@/features/aiAssistant/types'

import type { ComponentType } from 'react'

/**
 * Per-vertical knobs shared by the completed and streaming result groups.
 * Defined once in each vertical config and spread into both components so the
 * two render paths can never drift apart.
 */
export interface ProductCarouselPresentation {
  /** The vertical's product card. */
  card: ComponentType<{ product: DisplayProduct }>
  /** Carousel overrides, e.g. `items-stretch` or a non-default gap. */
  carouselClassName?: string
  /** Group container override, e.g. `space-y-4`. */
  containerClassName?: string
  /** Title typography override (weight, family, tracking). */
  titleClassName?: string
  /** Loading skeleton shape matching the card. */
  skeletonVariant?: ProductCardSkeletonVariant
}
