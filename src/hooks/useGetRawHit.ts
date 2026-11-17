'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useSearchClient } from '@/hooks/useSearchClient'
import type { RecordHit } from '@/types/recordHit.types'
import {
  combineAlgoliaFilters,
  getObjectIdFilter,
} from '@/utilities/algoliaFilters'

export interface UseGetRawHitOptions {
  staleTime?: number
  indexName?: string
  filters?: string
  enabled?: boolean
  isHitValid?: (hit: RecordHit) => boolean
}

// Leave room for a record a composition pins above the objectID-filtered hit.
const RAW_HIT_HITS_PER_PAGE = 5

export const useGetRawHit = <T extends RecordHit = RecordHit>(
  objectID: string,
  options: UseGetRawHitOptions = {},
) => {
  const {
    staleTime = 1000 * 60 * 5,
    indexName,
    filters = '',
    enabled = true,
    isHitValid,
  } = options
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const config = useActiveConfig()

  const currentIndex = indexName ?? config?.algolia.primaryIndex.name

  return useQuery<T | null>({
    queryKey: [
      'rawHit',
      config?.slug,
      currentIndex,
      objectID,
      config?.algolia.appId,
      searchClientKey,
      filters,
    ],
    queryFn: async ({ signal }) => {
      if (!searchClient || !currentIndex) {
        throw new Error('Search client or index not available')
      }

      const results = await searchClient.search<T>([
        {
          indexName: currentIndex,
          params: {
            filters: combineAlgoliaFilters(
              getObjectIdFilter(objectID),
              filters,
            ),
            hitsPerPage: RAW_HIT_HITS_PER_PAGE,
          },
        },
      ])
      signal.throwIfAborted()

      const firstResult = results.results[0]
      // Composition injections do not have to match this request's filter.
      const hit =
        firstResult && 'hits' in firstResult
          ? firstResult.hits.find(
              (candidate) => candidate.objectID === objectID,
            )
          : null

      return hit?.objectID === objectID ? hit : null
    },
    select: (hit) => (hit && isHitValid && !isHitValid(hit) ? null : hit),
    enabled: enabled && !!searchClient && !!currentIndex && !!objectID,
    staleTime,
  })
}
