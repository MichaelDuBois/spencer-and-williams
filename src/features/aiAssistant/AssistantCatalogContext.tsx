'use client'

import { createContext, useContext, type ComponentType } from 'react'

import type { ProductHitValues } from '@/features/aiAssistant/stores/aiAssistant'
import type { PrepareCartProduct } from '@/hooks/useAddToCart'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import type {
  ProductPriceQuote,
  ProductPriceResolver,
  ProductPriceProps,
} from '@/types/productPricing.types'

import type { QueryKey } from '@tanstack/react-query'

export interface AssistantCatalog {
  prepareCartProduct?: PrepareCartProduct
  getPrice?: ProductPriceResolver
  priceComponent?: ComponentType<ProductPriceProps>
  queryOptions: HitQueryOptions
  productCacheKey: QueryKey
  signal?: AbortSignal
  isReady: boolean
  sessionKey: string
  context: string
  productContext:
    | (ProductHitValues & { pricing?: ProductPriceQuote | null })
    | null
  resetSession: () => void
}

export const AssistantCatalogContext = createContext<AssistantCatalog | null>(
  null,
)

export const useAssistantCatalog = () => useContext(AssistantCatalogContext)
