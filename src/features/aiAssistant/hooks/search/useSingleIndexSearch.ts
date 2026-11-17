import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import { searchWithFilterFallback } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type { AssistantSearchRequest } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type {
  AssistantSearchOptions,
  SearchQuery,
  ProductSummary,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import type { HitExtractor } from '@/types/hitTemplate.types'
import type { ProductPriceResolver } from '@/types/productPricing.types'
import { combineAlgoliaFilters } from '@/utilities/algoliaFilters'
import { isRecord } from '@/utilities/isRecord'

import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

const HITS_PER_PAGE = 10

interface AssistantProductSearchOptions extends AssistantSearchOptions {
  getPrice?: ProductPriceResolver
  queryOptions?: HitQueryOptions
  productCacheKey?: QueryKey
  signal?: AbortSignal
}

interface UseSingleIndexSearchParams<
  TValues,
  TTemplate,
> extends AssistantProductSearchOptions {
  extractor: HitExtractor<TValues, TTemplate>
}

const runSingleIndexSearch = async <
  TValues extends Pick<
    EcommerceProductHitValues,
    'objectID' | 'name' | 'price'
  >,
  TTemplate,
>(
  queries: SearchQuery[],
  searchClient: AlgoliaLiteClient,
  config: VerticalConfig,
  queryClient: QueryClient,
  extractor: HitExtractor<TValues, TTemplate>,
  {
    queryOptions,
    productCacheKey = ['product'],
    getPrice,
    signal,
    personalizationParams,
  }: AssistantProductSearchOptions,
): Promise<UnifiedSearchResult> => {
  signal?.throwIfAborted()
  if (
    queryOptions?.enabled === false ||
    !Array.isArray(queries) ||
    queries.length === 0 ||
    !queries.every(
      (query) =>
        isRecord(query) &&
        typeof query.query === 'string' &&
        (query.filters === undefined || typeof query.filters === 'string'),
    )
  ) {
    return { summaries: [] }
  }

  const { primaryIndex } = config.algolia
  const productsIndex = primaryIndex?.name
  const template = primaryIndex?.template as TTemplate | undefined

  if (!template || !productsIndex) {
    return { summaries: [] }
  }

  const buildRequest = (
    query: SearchQuery,
    withAgentFilters: boolean,
  ): AssistantSearchRequest => {
    const filters = combineAlgoliaFilters(
      withAgentFilters ? query.filters : undefined,
      queryOptions?.filters,
    )
    return {
      indexName: productsIndex,
      query: query.query,
      // Personalization rides alongside `filters`, so it re-ranks but never widens.
      params: {
        ...personalizationParams,
        clickAnalytics: true,
        hitsPerPage: HITS_PER_PAGE,
        ...(filters ? { filters } : {}),
      },
    }
  }

  const hits = await searchWithFilterFallback({
    queries,
    searchClient,
    buildRequest,
    signal,
  })

  signal?.throwIfAborted()
  const eligibleHits = queryOptions?.isHitValid
    ? hits.filter(queryOptions.isHitValid)
    : hits
  const summaries: ProductSummary[] = eligibleHits.map((hit) => {
    const productValues = extractor(hit, template, config.slug)

    queryClient.setQueryData(
      [...productCacheKey, productValues.objectID],
      productValues,
    )

    return {
      objectID: productValues.objectID,
      name: productValues.name,
      price: productValues.price ?? null,
      ...(getPrice ? { pricing: getPrice(productValues.price) ?? null } : {}),
      // Validated off the raw hit: the attribution rides the search response,
      // not the extracted template values.
      ...(typeof hit.__queryID === 'string' ? { queryID: hit.__queryID } : {}),
      position: hit.__position,
    }
  })

  return { summaries }
}

export const useSingleIndexSearch = <
  TValues extends Pick<
    EcommerceProductHitValues,
    'objectID' | 'name' | 'price'
  >,
  TTemplate,
>({
  extractor,
  getPrice,
  queryOptions,
  productCacheKey,
  signal,
  personalizationParams,
}: UseSingleIndexSearchParams<TValues, TTemplate>) => {
  const searchClient = useAtomValue(baseSearchClientAtom)
  const config = useActiveConfig()
  const queryClient = useQueryClient()

  return useCallback(
    (queries: SearchQuery[]): Promise<UnifiedSearchResult> => {
      if (!searchClient || !config) return Promise.resolve({ summaries: [] })
      return runSingleIndexSearch(
        queries,
        searchClient,
        config,
        queryClient,
        extractor,
        {
          queryOptions,
          productCacheKey,
          signal,
          getPrice,
          personalizationParams,
        },
      )
    },
    [
      personalizationParams,
      searchClient,
      config,
      queryClient,
      extractor,
      getPrice,
      queryOptions,
      productCacheKey,
      signal,
    ],
  )
}
