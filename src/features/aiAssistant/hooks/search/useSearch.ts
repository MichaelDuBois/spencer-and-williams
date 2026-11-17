'use client'

import { useCallback, useMemo } from 'react'

import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import { useB2BContentSearch } from '@/features/aiAssistant/hooks/search/useB2BContentSearch'
import { useMediaEntertainmentSearch } from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import { useSingleIndexSearch } from '@/features/aiAssistant/hooks/search/useSingleIndexSearch'
import { useTravelSearch } from '@/features/aiAssistant/hooks/search/useTravelSearch'
import type {
  B2BContentSearchQuery,
  MediaSearchQuery,
  SearchQuery,
  TravelSearchQuery,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'

type AnySearchQuery =
  | SearchQuery
  | TravelSearchQuery
  | B2BContentSearchQuery
  | MediaSearchQuery

type SearchFn = (queries: AnySearchQuery[]) => Promise<UnifiedSearchResult>

export const useSearch = () => {
  const catalog = useAssistantCatalog()
  // One subscription to the active profile, shared by every vertical's search.
  const personalizationParams = usePersonalizationSearchParams()
  const ecommerceSearch = useSingleIndexSearch({
    extractor: getEcommerceProductHitValues,
    personalizationParams,
  }) as SearchFn
  const electronicsSearch = useSingleIndexSearch({
    extractor: getElectronicsProductHitValues,
    personalizationParams,
  }) as SearchFn
  const fashionSearch = useSingleIndexSearch({
    extractor: getFashionProductHitValues,
    personalizationParams,
  }) as SearchFn
  const furnishingSearch = useSingleIndexSearch({
    extractor: getFurnishingProductHitValues,
    personalizationParams,
  }) as SearchFn
  const grocerySearch = useSingleIndexSearch({
    extractor: getGroceryProductHitValues,
    personalizationParams,
  }) as SearchFn
  const b2bWarehouseSearch = useSingleIndexSearch({
    extractor: getB2BWarehouseProductHitValues,
    getPrice: catalog?.getPrice,
    queryOptions: catalog?.queryOptions,
    productCacheKey: catalog?.productCacheKey,
    signal: catalog?.signal,
    personalizationParams,
  }) as SearchFn
  const travelSearch = useTravelSearch({ personalizationParams }) as SearchFn
  const b2bContentSearch = useB2BContentSearch({
    personalizationParams,
  }) as SearchFn
  const mediaEntertainmentSearch = useMediaEntertainmentSearch({
    personalizationParams,
  }) as SearchFn
  const config = useActiveConfig()
  const slug = config?.slug

  const searchByVertical = useMemo<Record<string, SearchFn>>(() => {
    return {
      ecommerce: ecommerceSearch,
      electronics: electronicsSearch,
      fashion: fashionSearch,
      furnishing: furnishingSearch,
      grocery: grocerySearch,
      travel: travelSearch,
      'b2b-content': b2bContentSearch,
      'b2b-warehouse': b2bWarehouseSearch,
      'media-entertainment': mediaEntertainmentSearch,
    }
  }, [
    ecommerceSearch,
    electronicsSearch,
    fashionSearch,
    furnishingSearch,
    grocerySearch,
    travelSearch,
    b2bContentSearch,
    b2bWarehouseSearch,
    mediaEntertainmentSearch,
  ])

  return useCallback(
    (queries: AnySearchQuery[]): Promise<UnifiedSearchResult> => {
      const search = (slug && searchByVertical[slug]) || ecommerceSearch
      return search(queries)
    },
    [slug, searchByVertical, ecommerceSearch],
  )
}
