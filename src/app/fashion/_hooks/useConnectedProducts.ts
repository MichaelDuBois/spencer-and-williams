'use client'

import { useQuery } from '@tanstack/react-query'

import { fashionConfig } from '@/app/fashion/config'
import { useSearchClient } from '@/hooks/useSearchClient'
import { getObjectIdFilter } from '@/utilities/algoliaFilters'

type ProductHit = Record<string, unknown>

// Leave room for a product a composition pins above the objectID-filtered hit.
const CONNECTED_PRODUCT_HITS_PER_PAGE = 5

interface UseConnectedProductsOptions {
  staleTime?: number
}

/**
 * Resolves the products an article links to, one query per objectID so the
 * editorial order in `related_products` is preserved. Ids that no longer
 * resolve drop out rather than rendering a broken card.
 */
export const useConnectedProducts = (
  productIds: string[],
  options: UseConnectedProductsOptions = {},
) => {
  const { staleTime = 1000 * 60 * 5 } = options
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const { algolia, slug } = fashionConfig
  const productsIndex = algolia.primaryIndex.name

  const { data, isLoading, isError } = useQuery<ProductHit[]>({
    // The client's identity belongs in the key: it decides which pipeline
    // answers, and without it products fetched through the composition stay
    // cached under the same key after the toggle is switched off.
    queryKey: [
      'connected-products',
      slug,
      productsIndex,
      productIds,
      searchClientKey,
    ],
    queryFn: async () => {
      if (!searchClient) throw new Error('Search client not available')

      const { results } = await searchClient.search<ProductHit>(
        productIds.map((productId) => {
          return {
            indexName: productsIndex,
            params: {
              filters: getObjectIdFilter(productId),
              hitsPerPage: CONNECTED_PRODUCT_HITS_PER_PAGE,
            },
          }
        }),
      )

      return results.flatMap((result, index) => {
        // Composition injections do not have to match this request's filter,
        // so the requested product is not necessarily the first result.
        const hit =
          'hits' in result
            ? result.hits.find(
                (candidate) => candidate.objectID === productIds[index],
              )
            : undefined
        return hit ? [hit] : []
      })
    },
    enabled: !!searchClient && productIds.length > 0,
    staleTime,
  })

  return { products: data ?? [], isLoading, isError }
}
