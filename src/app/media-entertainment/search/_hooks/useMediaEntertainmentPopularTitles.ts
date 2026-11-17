'use client'

import { useMediaEntertainmentRails } from '@/app/media-entertainment/_hooks/useMediaEntertainmentRails'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'

/** The homepage row this reuses as the zero-results fallback. */
const POPULAR_RAIL_ID = 'top-10'

const POPULAR_HITS_PER_PAGE = 12

/** Config, not a literal, is the source of the rule context behind this row. */
const popularSpec = mediaEntertainmentConfig.homepageRails?.find(
  (rail) => rail.id === POPULAR_RAIL_ID,
)

/** Module-level so the query key stays referentially stable across renders. */
const POPULAR_RAILS = popularSpec
  ? [{ ...popularSpec, hitsPerPage: POPULAR_HITS_PER_PAGE }]
  : []

/**
 * An empty-query row for the zero-results state, fetched outside InstantSearch
 * so the failed query stays on screen while the fallback loads.
 */
export const useMediaEntertainmentPopularTitles = (): MediaRailItem[] => {
  const { rails } = useMediaEntertainmentRails({
    rails: POPULAR_RAILS,
    billboard: null,
  })

  return rails[0]?.items ?? []
}
