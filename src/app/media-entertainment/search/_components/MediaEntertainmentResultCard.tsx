'use client'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'
import { useRankingBadges } from '@/hooks/useRankingBadges'

interface MediaEntertainmentResultCardProps {
  /** The raw hit, not extracted values: the badge reads `_rankingInfo`. */
  hit: Record<string, unknown>
  template: MediaEntertainmentHitTemplate
  slug: string
}

/**
 * One poster in the results grid. It exists so the composition badge can be
 * read per hit — a hook cannot run inside the grid's map.
 */
export const MediaEntertainmentResultCard = ({
  hit,
  template,
  slug,
}: MediaEntertainmentResultCardProps) => {
  const { isComposed, composedLabel } = useRankingBadges(hit)

  return (
    <MediaEntertainmentPosterCard
      title={getMediaEntertainmentHitValues(hit, template, slug)}
      promotedLabel={isComposed ? composedLabel : undefined}
    />
  )
}
