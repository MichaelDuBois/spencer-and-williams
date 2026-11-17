'use client'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { MediaEntertainmentRailSection } from '@/app/media-entertainment/_components/MediaEntertainmentRailSection'
import { MediaEntertainmentRailSkeleton } from '@/app/media-entertainment/_components/MediaEntertainmentRailSkeleton'
import { RAIL_VARIANTS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { useMediaWatchRails } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { useMediaWatchState } from '@/app/media-entertainment/_hooks/useMediaWatchState'
import { cn } from '@/lib/utils'

export const CONTINUE_WATCHING_TITLE = 'Continue Watching'

/**
 * The one profile-owned row on the homepage, above the algorithmic rails.
 *
 * My List deliberately has no row here — it has a page of its own at
 * `/my-list`, reachable from the nav, and a second copy of it on the homepage
 * only repeated what that page already shows.
 *
 * The row drops out entirely when nothing is part-watched, so a viewer who has
 * pressed no Play button sees the algorithmic rails start at the top.
 */
export const MediaEntertainmentContinueWatchingRail = () => {
  const { continueWatchingTitles, isPending } = useMediaWatchRails()
  const { removeFromContinueWatching } = useMediaWatchState()

  if (isPending) {
    return (
      <MediaEntertainmentRailSkeleton
        title={CONTINUE_WATCHING_TITLE}
        shape="backdrop"
      />
    )
  }

  if (!continueWatchingTitles.length) return null

  return (
    <MediaEntertainmentRailSection title={CONTINUE_WATCHING_TITLE} index={0}>
      {continueWatchingTitles.map((title) => (
        <div
          key={title.objectID}
          className={cn('shrink-0 snap-start', RAIL_VARIANTS.backdrop.item)}>
          {/* Landscape stills, not posters: it is what the real pattern does,
              and it reads as a different kind of row next to the poster rails
              rather than as one more of them. */}
          <MediaEntertainmentPosterCard
            title={title}
            shape="backdrop"
            progress={title.progress}
            onRemove={() => removeFromContinueWatching(title.objectID)}
          />
        </div>
      ))}
    </MediaEntertainmentRailSection>
  )
}
