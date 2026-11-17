import {
  DEFAULT_RAIL_SHAPE,
  RAIL_GUTTER_CLASS,
  RAIL_HEADING_CLASS,
  RAIL_PLACEHOLDERS,
  RAIL_TRACK_CLASS,
  RAIL_VARIANTS,
} from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import type { MediaRailShape } from '@/app/media-entertainment/types'
import { cn } from '@/lib/utils'

interface MediaEntertainmentRailSkeletonProps {
  /** Real title from config — known before any request resolves, so a loading
   *  homepage shows the actual rows rather than anonymous grey bars. */
  title: string
  shape?: MediaRailShape
  itemCount?: number
}

export const MediaEntertainmentRailSkeleton = ({
  title,
  shape = DEFAULT_RAIL_SHAPE,
  itemCount,
}: MediaEntertainmentRailSkeletonProps) => {
  const variant = RAIL_VARIANTS[shape]
  const count = itemCount ?? RAIL_PLACEHOLDERS[shape]
  const isTop10 = shape === 'top10'

  return (
    <section>
      <h2 className={cn(RAIL_GUTTER_CLASS, RAIL_HEADING_CLASS)}>{title}</h2>

      <div
        aria-hidden="true"
        className={cn(
          'flex overflow-hidden',
          RAIL_TRACK_CLASS,
          isTop10 && 'items-end',
        )}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex shrink-0 items-end">
            {/* Stands in for the numeral so the Top 10 row keeps its rhythm. */}
            {isTop10 && (
              <div className="h-[87px] w-16 md:h-[125px] md:w-24 lg:h-[150px] lg:w-28" />
            )}
            <div className={variant.item}>
              <div
                className={cn(
                  'bg-muted rounded-image animate-pulse',
                  variant.aspect,
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
