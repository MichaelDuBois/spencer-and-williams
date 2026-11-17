'use client'

import Link from 'next/link'

import { MediaEntertainmentRailSection } from '@/app/media-entertainment/_components/MediaEntertainmentRailSection'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'

interface MediaEntertainmentGenreRailProps {
  /** Row position on the page, used only for the entrance stagger. */
  index?: number
}

const CHIP_CLASS =
  'rounded-button border-border bg-card text-foreground hover:border-foreground/30 hover:bg-secondary focus-visible:outline-ring block shrink-0 snap-start border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'

const GENRE_RAIL_TITLE = 'Browse by Genre'

/**
 * Algolia `genres` facet values, used **verbatim** as both the chip label and
 * the query value. Both taxonomies are listed side by side on purpose: movies
 * say `Science Fiction` where shows say `Sci-Fi & Fantasy`, and
 * `facetFilters: [["record_type:show"], ["genres:Science Fiction"]]` returns
 * zero hits. Normalising or deduping the two would produce a chip whose link
 * comes back empty.
 */
export const GENRE_CHIPS = [
  'Action',
  'Action & Adventure',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Kids',
  'Mystery',
  'Romance',
  'Sci-Fi & Fantasy',
  'Science Fiction',
  'Thriller',
  'Western',
]
export const MediaEntertainmentGenreRail = ({
  index = 0,
}: MediaEntertainmentGenreRailProps) => (
  <MediaEntertainmentRailSection
    title={GENRE_RAIL_TITLE}
    index={index}
    trackClassName="items-center">
    {GENRE_CHIPS.map((genre) => (
      <Link
        key={genre}
        href={`/${mediaEntertainmentConfig.slug}/search?genres=${encodeURIComponent(genre)}`}
        className={CHIP_CLASS}>
        {genre}
      </Link>
    ))}
  </MediaEntertainmentRailSection>
)
