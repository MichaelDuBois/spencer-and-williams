import type { CarouselSectionVariant } from '@/components/CarouselSection'
import type { Variant } from '@/components/cart/CartItemCard'
import type { RecommendOptions } from '@/hooks/useRecommend'

import type { RecommendHit } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

export interface CartPageContentClasses {
  grid: string
  emptyWrapper: string
  emptyMessage: string
  continueShoppingLink: string
  orderHistoryLink: string
  itemsWrapper: string
  summaryCard: string
  summaryHeading: string
  summaryDetails: string
  shippingValue: string
  totalRow: string
  checkoutButton: string
}

export interface CartPageContentProps {
  variant: Variant
  basePath: string
  recommendRenderItem: (hit: RecommendHit) => ReactNode
  recommendVariant?: CarouselSectionVariant
  recommendQueryOptions?: RecommendOptions
}
