'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { RAIL_TRACK_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { useRailScrollEdges } from '@/app/media-entertainment/_hooks/useRailScrollEdges'
import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

/**
 * Full-height, gutter-width gradient bars rather than floating circles. The
 * gradient *is* the dark-theme edge fade, so there is no separate gradient
 * element to keep in sync, and nothing is clipped by the full-bleed rail the way
 * the shared `Carousel`'s `-left-3` circles would be.
 *
 * `hidden md:flex` — no arrows on touch, where swiping is the affordance.
 */
const ARROW_BASE =
  'absolute inset-y-0 z-10 hidden w-8 items-center justify-center transition-opacity duration-300 md:flex md:w-12 xl:w-16'

/** Revealed by hovering the row, or by focusing the arrow itself via keyboard. */
const ARROW_ACTIVE =
  'cursor-pointer opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100'

/** At an extreme the arrow would do nothing, so it neither shows nor takes clicks. */
const ARROW_INERT = 'pointer-events-none opacity-0'

interface MediaEntertainmentRailScrollerProps {
  /** Accessible name for the scrollport region and the arrow labels. */
  label: string
  children: ReactNode
  /** Extra classes for the flex track, e.g. cross-axis alignment. */
  className?: string
}

export const MediaEntertainmentRailScroller = ({
  label,
  children,
  className,
}: MediaEntertainmentRailScrollerProps) => {
  const { ref, canScrollLeft, canScrollRight, handleScroll, scrollByPage } =
    useRailScrollEdges()

  return (
    <div className="group/rail relative">
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        disabled={!canScrollLeft}
        onClick={() => scrollByPage(-1)}
        className={cn(
          ARROW_BASE,
          'from-background via-background/70 left-0 bg-linear-to-r to-transparent',
          canScrollLeft ? ARROW_ACTIVE : ARROW_INERT,
        )}>
        <ChevronLeft className="text-foreground h-6 w-6" />
      </button>

      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={handleScroll}
        className={cn(
          'scrollbar-none flex snap-x snap-mandatory scroll-px-8 overflow-x-auto overscroll-x-contain scroll-smooth md:scroll-px-12 xl:scroll-px-16',
          RAIL_TRACK_CLASS,
          className,
        )}>
        {children}
      </div>

      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        disabled={!canScrollRight}
        onClick={() => scrollByPage(1)}
        className={cn(
          ARROW_BASE,
          'from-background via-background/70 right-0 bg-linear-to-l to-transparent',
          canScrollRight ? ARROW_ACTIVE : ARROW_INERT,
        )}>
        <ChevronRight className="text-foreground h-6 w-6" />
      </button>
    </div>
  )
}
