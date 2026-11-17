'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { buildIndexContext } from '@/features/aiAssistant/utils/buildIndexContext'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { FacetConfig } from '@/types'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'

import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

// Keeps the mounted useQuery from refetching the facets on window focus or
// remount: one facet request per index/filter scope is all this needs.
const STALE_TIME = Infinity

const MAX_FACET_VALUES = 20

const fetchIndexContext = async (
  searchClient: AlgoliaLiteClient,
  indexName: string,
  facets: FacetConfig[],
  filters?: string,
  signal?: AbortSignal,
): Promise<string | null> => {
  signal?.throwIfAborted()
  const searchRequests = [
    {
      indexName,
      query: '',
      params: {
        hitsPerPage: 0,
        ...(filters ? { filters } : {}),
        facets: facets.map(getFacetAttribute),
        maxValuesPerFacet: MAX_FACET_VALUES,
      },
    },
  ]

  const { results } =
    await searchClient.search<Record<string, unknown>>(searchRequests)

  signal?.throwIfAborted()
  const [result] = results

  if (!result || !('hits' in result)) return null

  return buildIndexContext(facets, result.facets, result.facets_stats)
}

/**
 * Loads the active index's facet values once per vertical and exposes them as
 * the agent's filtering context. `ensureIndexContext` awaits the in-flight
 * request, so the first message can never be sent before the facets land.
 */
export const useIndexContext = (
  { filters, enabled = true }: HitQueryOptions = {},
  scopeSignal?: AbortSignal,
) => {
  const searchClient = useAtomValue(baseSearchClientAtom)
  const config = useActiveConfig()
  const queryClient = useQueryClient()

  const appId = config?.algolia.appId
  const indexName = config?.algolia.primaryIndex?.name
  const configuredFacets = config?.algolia.primaryIndex?.facets
  const facets = useMemo(
    () =>
      configuredFacets?.filter(
        (facet) => facet.includeInAgentContext !== false,
      ),
    [configuredFacets],
  )
  const isEnabled = Boolean(
    enabled &&
    searchClient &&
    indexName &&
    facets?.length &&
    config?.features.agentStudio.searchFilters,
  )

  const options = useMemo(() => {
    return {
      queryKey: ['indexContext', appId, indexName, filters, facets],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchIndexContext(
          searchClient!,
          indexName!,
          facets!,
          filters,
          scopeSignal ? AbortSignal.any([signal, scopeSignal]) : signal,
        ),
      staleTime: STALE_TIME,
      retry: (failureCount: number, error: Error) =>
        error.name !== 'AbortError' && failureCount < 1,
    }
  }, [appId, indexName, facets, searchClient, filters, scopeSignal])

  useQuery({ ...options, enabled: isEnabled })

  const ensureIndexContext = useCallback((): Promise<string | null> => {
    if (!isEnabled) return Promise.resolve(null)

    // A failed facet lookup costs the agent its filters, not the whole turn.
    return queryClient
      .ensureQueryData(options)
      .then((context) => {
        scopeSignal?.throwIfAborted()
        return context
      })
      .catch((error) => {
        scopeSignal?.throwIfAborted()
        if (error?.name === 'AbortError') throw error
        return null
      })
  }, [isEnabled, options, queryClient, scopeSignal])

  return { ensureIndexContext }
}
