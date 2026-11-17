'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { useSearchClient } from '@/hooks/useSearchClient'
import { activeConfigAtom } from '@/stores/activeConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import {
  getKnownCategoryValues,
  getRootCategoryAttribute,
} from '@/utilities/noResultsRecovery'

interface RecoveryOptions {
  query: string
  suggestionsLimit?: number
  categoriesLimit?: number
  enabled: boolean
  enableSuggestions: boolean
  enableCategories: boolean
  categoryFilters?: string
}

export const useNoResultsRecovery = ({
  query,
  suggestionsLimit = 3,
  categoriesLimit = 4,
  enabled,
  enableSuggestions,
  enableCategories,
  categoryFilters,
}: RecoveryOptions) => {
  const { client, key } = useSearchClient()
  // Facet-value and Query Suggestions requests target real indices. Keep them
  // off the composition proxy, which only supports product-result searches.
  const baseClient = useAtomValue(baseSearchClientAtom)
  const searchClient = baseClient ?? client
  const config = useAtomValue(activeConfigAtom)
  const normalizedQuery = query.trim()
  const suggestionIndex = config?.algolia.indices.querySuggestions?.name
  const categoryAttribute = getRootCategoryAttribute(
    config?.algolia.primaryIndex.facets,
  )
  const primaryIndex = config?.algolia.primaryIndex.name
  const knownCategories = getKnownCategoryValues({
    navigation: config?.navigation,
    carouselCategories: config?.carouselCategories,
  })
  const categorySearchLimit = categoriesLimit * 4

  return useQuery({
    queryKey: [
      'no-results-recovery',
      config?.slug,
      key,
      normalizedQuery,
      suggestionIndex,
      categoryAttribute,
      primaryIndex,
      categoryFilters,
      [...knownCategories],
      suggestionsLimit,
      categoriesLimit,
      enableSuggestions,
      enableCategories,
    ],
    queryFn: async ({ signal }) => {
      if (!searchClient || !primaryIndex) {
        return { suggestions: [], categories: [] }
      }

      const [suggestionResponse, categoryResponse] = await Promise.all([
        enableSuggestions && suggestionIndex
          ? searchClient
              .search([
                {
                  indexName: suggestionIndex,
                  params: {
                    query: normalizedQuery,
                    hitsPerPage: suggestionsLimit,
                    removeWordsIfNoResults: 'allOptional',
                  },
                },
              ])
              .catch(() => undefined)
          : Promise.resolve(undefined),
        enableCategories && categoryAttribute
          ? searchClient
              .searchForFacets([
                {
                  indexName: primaryIndex,
                  type: 'facet',
                  facet: categoryAttribute,
                  facetQuery: normalizedQuery,
                  maxFacetHits: categorySearchLimit,
                  ...(categoryFilters && { filters: categoryFilters }),
                },
              ])
              .catch(() => undefined)
          : Promise.resolve(undefined),
      ])
      signal.throwIfAborted()
      const suggestionResult = suggestionResponse?.results[0]
      const suggestions =
        suggestionResult && 'hits' in suggestionResult
          ? suggestionResult.hits
              .map((hit) => (hit as Record<string, unknown>).query)
              .filter((value): value is string => typeof value === 'string')
              .filter(
                (value) =>
                  value.trim().toLowerCase() !== normalizedQuery.toLowerCase(),
              )
          : []
      const filterKnownCategories = (values: string[]) =>
        values
          .filter((value) => knownCategories.has(value))
          .slice(0, categoriesLimit)
      let categories = filterKnownCategories(
        categoryResponse?.results[0]?.facetHits.map((hit) => hit.value) ?? [],
      )
      if (!categories.length && enableCategories && categoryAttribute) {
        const fallback = await searchClient
          .searchForFacets([
            {
              indexName: primaryIndex,
              type: 'facet',
              facet: categoryAttribute,
              facetQuery: '',
              maxFacetHits: categorySearchLimit,
              ...(categoryFilters && { filters: categoryFilters }),
            },
          ])
          .catch(() => undefined)
        categories = filterKnownCategories(
          fallback?.results[0]?.facetHits.map((hit) => hit.value) ?? [],
        )
      }
      return { suggestions, categories }
    },
    enabled: enabled && !!searchClient && !!primaryIndex && !!normalizedQuery,
    staleTime: 1000 * 60 * 5,
  })
}
