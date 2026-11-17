'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useRailScrollEdges } from '@/app/media-entertainment/_hooks/useRailScrollEdges'
import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import { pluralize } from '@/app/media-entertainment/_utils/pluralize'
import type { MediaEntertainmentSeason } from '@/app/media-entertainment/hitValues.types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

/** 144px CSS at DPR2 is 288 device pixels, so w342 is the right TMDB rung. */
const POSTER_SIZES = '(min-width: 768px) 144px, 128px'

/** Circles rather than the rails' gradient bars: this surface is `--card`. */
const ARROW_BASE =
  'border-border bg-card/90 absolute top-24 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg shadow-black/40 transition-opacity duration-300 md:top-27 md:flex'

const ARROW_ACTIVE =
  'cursor-pointer opacity-0 group-hover/seasons:opacity-100 focus-visible:opacity-100'

const ARROW_INERT = 'pointer-events-none opacity-0'

interface MediaEntertainmentTitleModalSeasonsProps {
  seasons?: MediaEntertainmentSeason[]
}

export const MediaEntertainmentTitleModalSeasons = ({
  seasons,
}: MediaEntertainmentTitleModalSeasonsProps) => {
  const { ref, canScrollLeft, canScrollRight, handleScroll, scrollByPage } =
    useRailScrollEdges({ pageInset: 0 })

  if (!seasons?.length) return null

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-foreground text-base font-semibold">Seasons</h3>
        <span className="text-muted-foreground text-sm">
          {pluralize(seasons.length, 'season')}
        </span>
      </div>

      <div className="group/seasons relative mt-3">
        <button
          type="button"
          aria-label="Scroll seasons left"
          disabled={!canScrollLeft}
          onClick={() => scrollByPage(-1)}
          className={cn(
            ARROW_BASE,
            'left-0',
            canScrollLeft ? ARROW_ACTIVE : ARROW_INERT,
          )}>
          <ChevronLeft className="text-foreground h-5 w-5" />
        </button>

        <div
          ref={ref}
          role="region"
          aria-label="Seasons"
          tabIndex={0}
          onScroll={handleScroll}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth">
          {seasons.map((season) => (
            <div
              key={season.seasonNumber}
              className="w-32 shrink-0 snap-start md:w-36">
              <div className="bg-muted rounded-image relative aspect-[2/3] overflow-hidden">
                <Image
                  src={getTmdbImageUrl(season.poster, 'w342')}
                  // Decorative: the season name sits directly underneath.
                  alt=""
                  fill
                  sizes={POSTER_SIZES}
                  loading="lazy"
                  className="object-cover"
                />
              </div>

              <span className="text-foreground mt-2 block truncate text-sm font-medium">
                {season.name}
              </span>

              {!!season.episodeCount && (
                <span className="text-muted-foreground block text-xs">
                  {pluralize(season.episodeCount, 'episode')}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Scroll seasons right"
          disabled={!canScrollRight}
          onClick={() => scrollByPage(1)}
          className={cn(
            ARROW_BASE,
            'right-0',
            canScrollRight ? ARROW_ACTIVE : ARROW_INERT,
          )}>
          <ChevronRight className="text-foreground h-5 w-5" />
        </button>
      </div>
    </section>
  )
}
