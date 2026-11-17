'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { usePersonalization } from '@/hooks/usePersonalization'
import { useSearchClient } from '@/hooks/useSearchClient'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import {
  getPersonalizationSearchParams,
  isPersonalizationActive,
} from '@/utilities/personalizationParams'

export interface UseEmptyQueryHitsOptions extends HitQueryOptions {
  indexName?: string
  hitsPerPage?: number
  ruleContexts?: string[]
  filterRuleContexts?: string[]
  /** Trims the payload to the fields the row renders. Omit to keep the index default. */
  attributesToRetrieve?: string[]
  /** Pass `[]` to suppress `_highlightResult`, which browse rows never render. */
  attributesToHighlight?: string[]
}

export const useEmptyQueryHits = ({
  indexName,
  hitsPerPage = 8,
  enabled = true,
  ruleContexts,
  filterRuleContexts,
  attributesToRetrieve,
  attributesToHighlight,
  filters,
  isHitValid,
  requiredAttributes,
}: UseEmptyQueryHitsOptions = {}) => {
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const config = useAtomValue(activeConfigAtom)
  const retrievedAttributes = attributesToRetrieve
    ? [...new Set([...attributesToRetrieve, ...(requiredAttributes ?? [])])]
    : undefined
  const { currentUserToken, currentOptionalFilters, mode } =
    usePersonalization()
  const currentIndex = indexName ?? config?.algolia.primaryIndex.name

  const personalization = {
    isActive: isPersonalizationActive({
      mode,
      isFeatureEnabled: config?.features?.personalization?.enabled,
    }),
    currentUserToken,
    currentOptionalFilters,
  }

  return useQuery({
    queryKey: [
      'empty-query-hits',
      config?.slug,
      config?.algolia.appId,
      searchClientKey,
      filters,
      currentIndex,
      hitsPerPage,
      currentUserToken,
      currentOptionalFilters,
      ruleContexts,
      filterRuleContexts,
      // Both change the shape of a hit, so a cached response for one attribute
      // set must never be served to a caller asking for another.
      retrievedAttributes,
      attributesToHighlight,
    ],
    queryFn: async ({ signal }) => {
      const { results } = await searchClient!.search([
        {
          indexName: currentIndex!,
          params: {
            query: '',
            hitsPerPage,
            // Opt-in, and spread conditionally: callers that omit them keep
            // sending exactly today's request. The composition client strips
            // both (BLOCKED_PARAMS), so a caller only saves on the base client.
            ...(retrievedAttributes
              ? { attributesToRetrieve: retrievedAttributes }
              : {}),
            ...(filters ? { filters } : {}),
            ...(attributesToHighlight ? { attributesToHighlight } : {}),
            ...getPersonalizationSearchParams({
              personalization,
              ruleContexts,
              filterRuleContexts,
            }),
          },
        },
      ])
      signal.throwIfAborted()
      const first = results[0]
      return first && 'hits' in first ? first.hits : []
    },
    select: (hits) => (isHitValid ? hits.filter(isHitValid) : hits),
    enabled: !!searchClient && !!currentIndex && enabled,
    staleTime: 1000 * 60 * 5,
  })
}
