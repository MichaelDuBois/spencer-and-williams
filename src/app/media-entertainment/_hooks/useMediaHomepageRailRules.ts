'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { BILLBOARD_QUERY } from '@/app/media-entertainment/_utils/billboardSource'
import { mergeHomepageRails } from '@/app/media-entertainment/_utils/homepageRailRules'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaHomepageRailConfig } from '@/app/media-entertainment/types'
import { fetchIndexRules } from '@/lib/algoliaRules'

interface UseMediaHomepageRailRulesArgs {
  /** Injectable so tests don't have to `vi.mock` the config module. */
  rails?: MediaHomepageRailConfig[]
}

export interface UseMediaHomepageRailRulesResult {
  rails: MediaHomepageRailConfig[]
  isPending: boolean
}

const { algolia, homepageRailDiscovery } = mediaEntertainmentConfig
const { appId, apiKey, primaryIndex } = algolia

/**
 * The homepage's row list, with the index's Rules deciding which rows exist and
 * what they are called. Config still owns their order and shape, and stands on
 * its own whenever the rules can't be read.
 */
export const useMediaHomepageRailRules = ({
  rails = mediaEntertainmentConfig.homepageRails ?? [],
}: UseMediaHomepageRailRulesArgs = {}): UseMediaHomepageRailRulesResult => {
  const { data, isPending } = useQuery({
    queryKey: ['mediaEntertainmentRailRules', appId, primaryIndex.name],
    queryFn: () =>
      fetchIndexRules({
        credentials: { appId, apiKey },
        indexName: primaryIndex.name,
      }),
    // Both override the provider defaults (5min stale, no focus refetch). The
    // demo beat is "add the rule in the dashboard, tab back, the rail is there",
    // so the list has to be stale by the time the tab regains focus.
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  const mergedRails = useMemo(
    () =>
      mergeHomepageRails({
        configured: rails,
        // `undefined` while the query is in flight reads the same as a failed
        // read here, and both mean "config stands".
        rules: data ?? null,
        prefix: homepageRailDiscovery.contextPrefix,
        maxDiscovered: homepageRailDiscovery.maxDiscovered,
        // The billboard's own rule context — not a rail, so it must never be
        // pulled into the discovered list.
        reservedContexts: BILLBOARD_QUERY.ruleContexts,
      }),
    [rails, data],
  )

  return { rails: mergedRails, isPending }
}
