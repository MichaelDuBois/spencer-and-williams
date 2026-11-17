'use client'

import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'
import { MediaEntertainmentRailSkeleton } from '@/app/media-entertainment/_components/MediaEntertainmentRailSkeleton'
import { useMediaEntertainmentRails } from '@/app/media-entertainment/_hooks/useMediaEntertainmentRails'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'

const SUGGESTIONS_RAIL = config.myListSuggestionsRail

// Module-level so the array identity is stable — it feeds the hook's query key.
const SUGGESTION_RAILS = SUGGESTIONS_RAIL ? [SUGGESTIONS_RAIL] : []

/**
 * What to watch when My List is empty.
 *
 * Goes through the same rails hook as the homepage, so the row is personalized to
 * whichever profile is watching and every tile carries the plus control — the
 * suggestion and the way to act on it are the same element.
 */
export const MediaEntertainmentMyListSuggestions = () => {
  const { rails, isPending, isError } = useMediaEntertainmentRails({
    rails: SUGGESTION_RAILS,
    // No hero on this page, so the billboard queries must not be sent with it.
    billboard: null,
  })

  if (!SUGGESTIONS_RAIL || isError) return null

  if (isPending) {
    return <MediaEntertainmentRailSkeleton title={SUGGESTIONS_RAIL.title} />
  }

  const [rail] = rails

  return rail ? <MediaEntertainmentRail rail={rail} /> : null
}
