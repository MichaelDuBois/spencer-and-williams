'use client'

import { useClearRefinements } from 'react-instantsearch'

import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'
import { RAIL_GUTTER_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { CHIP_CLASS } from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchChipVariants'
import { useMediaEntertainmentPopularTitles } from '@/app/media-entertainment/search/_hooks/useMediaEntertainmentPopularTitles'
import { NoResults } from '@/components/results/NoResults'
import { cn } from '@/lib/utils'

const FALLBACK_RAIL_TITLE = 'Popular right now'

/**
 * Zero results is a dead end without somewhere to go, so the empty state offers
 * the one refinement escape hatch plus a browse row to fall back into.
 */
export const MediaEntertainmentNoResults = () => {
  const { refine, canRefine } = useClearRefinements()
  const popularTitles = useMediaEntertainmentPopularTitles()

  return (
    <div>
      <div className={cn(RAIL_GUTTER_CLASS, 'flex flex-col items-center')}>
        <NoResults message="No titles match your search." />
        {canRefine && (
          <button type="button" onClick={refine} className={CHIP_CLASS}>
            Clear filters
          </button>
        )}
      </div>

      {popularTitles.length > 0 && (
        <MediaEntertainmentRail
          rail={{
            id: 'popular-right-now',
            title: FALLBACK_RAIL_TITLE,
            items: popularTitles,
          }}
        />
      )}
    </div>
  )
}
