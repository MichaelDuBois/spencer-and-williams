'use client'

import { useQuery } from '@tanstack/react-query'

import { groceryConfig } from '@/app/grocery/config'
import { useSearchClient } from '@/hooks/useSearchClient'

type ProductHit = Record<string, unknown>

export const useIngredientProducts = (ingredient: string) => {
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const primaryIndex = groceryConfig.algolia.primaryIndex
  const trimmed = ingredient.trim()

  const { data, isLoading, isError } = useQuery<ProductHit[]>({
    // The client's identity belongs in the key: it decides which pipeline
    // answers, and without it products fetched through the composition stay
    // cached under the same key after the toggle is switched off.
    queryKey: ['ingredientProducts', trimmed, searchClientKey],
    enabled: !!searchClient && trimmed.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    queryFn: async () => {
      if (!searchClient) throw new Error('Search client not available')

      const { results } = await searchClient.search<ProductHit>([
        {
          indexName: primaryIndex.name,
          params: { query: trimmed, hitsPerPage: 10, clickAnalytics: true },
        },
      ])

      const result = results[0]
      if (!result || !('hits' in result)) return []

      const queryID = 'queryID' in result ? result.queryID : undefined

      return result.hits.map((hit, index) => {
        return {
          ...hit,
          __queryID: queryID,
          __position: index + 1,
        }
      })
    },
  })

  return { products: data ?? [], isLoading, isError }
}
