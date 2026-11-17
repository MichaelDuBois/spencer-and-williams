'use client'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { MediaEntertainmentRailSection } from '@/app/media-entertainment/_components/MediaEntertainmentRailSection'
import {
  DEFAULT_RAIL_SHAPE,
  RAIL_VARIANTS,
} from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import type { MediaRail } from '@/app/media-entertainment/types'
import { cn } from '@/lib/utils'

interface MediaEntertainmentRailProps {
  rail: MediaRail
  /** Row position on the page, used only for the entrance stagger. */
  index?: number
}

export const MediaEntertainmentRail = ({
  rail,
  index = 0,
}: MediaEntertainmentRailProps) => {
  if (!rail.items.length) return null

  const shape = rail.shape ?? DEFAULT_RAIL_SHAPE
  const variant = RAIL_VARIANTS[shape]

  return (
    <MediaEntertainmentRailSection title={rail.title} index={index}>
      {rail.items.map((item) => (
        <div
          key={item.objectID}
          className={cn('shrink-0 snap-start', variant.item)}>
          <MediaEntertainmentPosterCard title={item} shape={shape} />
        </div>
      ))}
    </MediaEntertainmentRailSection>
  )
}
