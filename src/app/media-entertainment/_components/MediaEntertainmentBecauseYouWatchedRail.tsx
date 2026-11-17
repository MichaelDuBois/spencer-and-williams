'use client'

import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'
import { MediaEntertainmentRailSkeleton } from '@/app/media-entertainment/_components/MediaEntertainmentRailSkeleton'
import { useMediaBecauseYouWatched } from '@/app/media-entertainment/_hooks/useMediaBecauseYouWatched'

interface MediaEntertainmentBecauseYouWatchedRailProps {
  /** Row position on the page, used only for the entrance stagger. */
  index?: number
}

/**
 * Recommend's row on the homepage. It is configured in `homepageRails` alongside
 * every other row, so config still owns where it sits, but it fetches from
 * Recommend rather than the page's batched search — which is the only reason it
 * needs a component of its own. The rail itself is reused untouched.
 *
 * Three ways this renders nothing: no profile has part-watched anything, the seed
 * has no title, or the model came back empty. Only the skeleton needs the row to
 * exist, and by then the heading is already known.
 */
export const MediaEntertainmentBecauseYouWatchedRail = ({
  index = 0,
}: MediaEntertainmentBecauseYouWatchedRailProps) => {
  const { rail, isPending } = useMediaBecauseYouWatched()

  if (!rail) return null

  if (isPending) {
    return (
      <MediaEntertainmentRailSkeleton title={rail.title} shape={rail.shape} />
    )
  }

  return <MediaEntertainmentRail rail={rail} index={index} />
}
