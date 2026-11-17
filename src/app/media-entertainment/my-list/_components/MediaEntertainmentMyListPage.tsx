'use client'

import Link from 'next/link'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import {
  RAIL_GUTTER_CLASS,
  RAIL_HEADING_CLASS,
} from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { useMediaProfile } from '@/app/media-entertainment/_hooks/useMediaProfile'
import { useMediaWatchRails } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { MediaEntertainmentMyListSuggestions } from '@/app/media-entertainment/my-list/_components/MediaEntertainmentMyListSuggestions'
import { POSTER_GRID_CLASS } from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchChipVariants'
import { cn } from '@/lib/utils'

/** Matches `POSTER_GRID_CLASS`' column counts, largest breakpoint first. */
const GRID_SIZES =
  '(min-width: 1536px) 12vw, (min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw'

const SKELETON_TILES = 12

const basePath = `/${config.slug}`

export const MediaEntertainmentMyListPage = () => {
  const { myListTitles, isPending } = useMediaWatchRails()
  const { persona } = useMediaProfile()

  const heading = persona ? `${persona.label}'s List` : 'My List'
  const isEmpty = !isPending && myListTitles.length === 0

  return (
    <div className="py-10">
      <div className={RAIL_GUTTER_CLASS}>
        <h1 className={cn(RAIL_HEADING_CLASS, 'text-2xl md:text-3xl')}>
          {heading}
        </h1>

        {isPending ? (
          <ul className={cn(POSTER_GRID_CLASS, 'mt-8')} aria-hidden="true">
            {Array.from({ length: SKELETON_TILES }, (_, index) => (
              <li
                key={index}
                className="bg-muted rounded-image aspect-[2/3] animate-pulse"
              />
            ))}
          </ul>
        ) : isEmpty ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="text-foreground text-lg font-medium">
              Nothing saved yet.
            </p>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Hover any title and press the plus to add it here. The list
              belongs to the profile you are watching as.
            </p>
            <Link
              href={basePath}
              className="rounded-button bg-accent hover:bg-accent/85 focus-visible:outline-ring mt-8 px-6 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
              Browse titles
            </Link>
          </div>
        ) : (
          <ul className={cn(POSTER_GRID_CLASS, 'mt-8')}>
            {myListTitles.map((title) => (
              <li key={title.objectID}>
                <MediaEntertainmentPosterCard
                  title={title}
                  sizes={GRID_SIZES}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Outside the gutter wrapper: a rail bleeds edge to edge and carries its
          own gutters, so nesting it here would double them. */}
      {isEmpty && (
        <div className="mt-16">
          <MediaEntertainmentMyListSuggestions />
        </div>
      )}
    </div>
  )
}
