'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useInstantSearch } from 'react-instantsearch'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { runMultifeedComposition } from '@/lib/multifeed-composition'
import { compositionEnabledAtom, demoOptionsStore } from '@/stores/demoOptions'

export interface UseMultifeedCompositionOptions {
  includeMainFeeds?: boolean
  forwardFacets?: string[]
  /** Keep the previous feeds on screen while the next query loads. */
  keepPreviousData?: boolean
}

type FacetRefinements = Record<string, string[] | undefined>

interface RefinementState {
  filters?: string
  facetsRefinements?: FacetRefinements
  disjunctiveFacetsRefinements?: FacetRefinements
}

export const useMultifeedComposition = ({
  includeMainFeeds,
  forwardFacets,
  keepPreviousData = false,
}: UseMultifeedCompositionOptions = {}) => {
  const { results } = useInstantSearch()
  const config = useActiveConfig()
  const compositionEnabled = useAtomValue(compositionEnabledAtom, {
    store: demoOptionsStore,
  })

  const multiFeedId = config?.features.composition?.multiFeedCompositionId
  const mainCompositionId = config?.features.composition?.compositionId
  const appId = config?.algolia.appId
  const apiKey = config?.algolia.apiKey

  const typedResults = results as unknown as {
    query?: string
    _state?: RefinementState
  }
  const query = typedResults?.query ?? ''
  const filters = typedResults?._state?.filters || undefined
  const facetFilters = buildFacetFilters(typedResults?._state, forwardFacets)

  const enabled = !!appId && !!apiKey && !!multiFeedId && compositionEnabled

  return useQuery({
    // The toggle belongs in the key, not just in `enabled`: disabling a query
    // stops it fetching but keeps its cached data, so a shared key would keep
    // serving the last composition feeds after composition is switched off.
    // Off is its own key, which has never fetched and so carries no data.
    // The options are appended only when set, so callers without options keep
    // the exact key they had before.
    queryKey: [
      'multifeed-composition',
      config?.slug,
      multiFeedId,
      mainCompositionId,
      query,
      filters,
      compositionEnabled,
      ...(includeMainFeeds ? ['main-feeds'] : []),
      ...(facetFilters ? [facetFilters] : []),
    ],
    queryFn: () =>
      runMultifeedComposition({
        credentials: { appId: appId!, apiKey: apiKey! },
        compositionId: multiFeedId!,
        mainCompositionId,
        ...(includeMainFeeds && { includeMainFeeds }),
        params: {
          query,
          ...(filters && { filters }),
          ...(facetFilters && { facetFilters }),
        },
      }),
    enabled,
    // Never carried across the toggle: switching composition off must clear
    // the rails, which is the whole point of keeping the toggle in the key.
    placeholderData: keepPreviousData
      ? (previous) => (compositionEnabled ? previous : undefined)
      : undefined,
    staleTime: (q) => (q.state.data?.length ? 1000 * 60 * 5 : 0),
    gcTime: 1000 * 60 * 30,
  })
}

/**
 * One OR group per refined facet, e.g. `[["genres:Horror", "genres:Comedy"]]`.
 * Forwarded facets are assumed disjunctive (Genre is a multi-select refinement
 * list), so a conjunctive refinement on the same attribute becomes an OR group.
 */
const buildFacetFilters = (
  state: RefinementState | undefined,
  facets: string[] | undefined,
): string[][] | undefined => {
  if (!state || !facets?.length) return undefined

  const groups = facets
    .map((facet) => {
      const values = new Set([
        ...(state.disjunctiveFacetsRefinements?.[facet] ?? []),
        ...(state.facetsRefinements?.[facet] ?? []),
      ])
      return [...values].map((value) => `${facet}:${value}`)
    })
    .filter((group) => group.length > 0)

  return groups.length ? groups : undefined
}
