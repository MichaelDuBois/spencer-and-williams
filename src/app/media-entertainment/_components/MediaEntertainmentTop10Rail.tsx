'use client'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { MediaEntertainmentRailSection } from '@/app/media-entertainment/_components/MediaEntertainmentRailSection'
import { RAIL_VARIANTS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import type { MediaRail } from '@/app/media-entertainment/types'
import { cn } from '@/lib/utils'

const TOP_10_LIMIT = 10

/**
 * `font-secondary` is Archivo Black in this theme, which nothing else in the
 * vertical uses yet — the numerals are the one place it earns its keep.
 *
 * Outlined rather than filled (`text-transparent` + a stroke in the border
 * token) so the numeral reads as a graphic behind the artwork instead of
 * competing with it. `leading-[0.78]` puts the digits' baseline on the line-box
 * bottom, so `items-end` sits them flush with the poster's bottom edge.
 */
const NUMERAL_CLASS =
  'font-secondary pointer-events-none leading-[0.78] text-transparent select-none [-webkit-text-stroke:2px_var(--color-border)] text-[7rem] md:text-[10rem] lg:text-[12rem]'

interface MediaEntertainmentTop10RailProps {
  rail: MediaRail
  /** Row position on the page, used only for the entrance stagger. */
  index?: number
}

export const MediaEntertainmentTop10Rail = ({
  rail,
  index = 0,
}: MediaEntertainmentTop10RailProps) => {
  const items = rail.items.slice(0, TOP_10_LIMIT)
  if (!items.length) return null

  const variant = RAIL_VARIANTS.top10

  return (
    <MediaEntertainmentRailSection
      title={rail.title}
      index={index}
      trackClassName="items-end">
      {items.map((item, itemIndex) => {
        // `rank` is stamped by the rails hook; the positional fallback keeps
        // the glyphs contiguous if a caller hands over unranked items.
        const rank = item.rank || itemIndex + 1

        return (
          <div
            key={item.objectID}
            className="flex shrink-0 snap-start items-end">
            <span aria-hidden="true" className={NUMERAL_CLASS}>
              {rank}
            </span>
            <div
              className={cn(
                variant.item,
                // A two-digit numeral is ~1.8x wider, so a deep overlap would
                // swallow its second digit. Pull the poster back less.
                rank >= TOP_10_LIMIT && '-ml-2 md:-ml-4',
              )}>
              <MediaEntertainmentPosterCard title={item} shape="top10" />
            </div>
          </div>
        )
      })}
    </MediaEntertainmentRailSection>
  )
}
