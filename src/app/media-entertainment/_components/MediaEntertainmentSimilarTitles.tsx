'use client'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import {
  SIMILAR_TITLES_LIMIT,
  useMediaSimilarTitles,
} from '@/app/media-entertainment/_hooks/useMediaSimilarTitles'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'

/**
 * Three across from `sm` up, two on a phone — capped at three so the cards stay
 * large enough to read at the sheet's full width. 355px is a third of what is
 * left of the 1152px cap after `px-8` either side and the two `gap-3`s.
 */
const CARD_SIZES = '(min-width: 1024px) 355px, (min-width: 640px) 31vw, 47vw'

const GRID_CLASS = 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3'

interface MediaEntertainmentSimilarTitlesProps {
  title: MediaEntertainmentTitleHitValues
}

export const MediaEntertainmentSimilarTitles = ({
  title,
}: MediaEntertainmentSimilarTitlesProps) => {
  const { items, isPending } = useMediaSimilarTitles(title)

  return (
    <section className="mt-6">
      <h3 className="text-foreground text-base font-semibold">
        Similar titles
      </h3>

      <SimilarTitlesBody items={items} isPending={isPending} />
    </section>
  )
}

interface SimilarTitlesBodyProps {
  items: MediaEntertainmentTitleHitValues[]
  isPending: boolean
}

const SimilarTitlesBody = ({ items, isPending }: SimilarTitlesBodyProps) => {
  if (isPending) {
    return (
      <div aria-hidden="true" className={GRID_CLASS}>
        {Array.from({ length: SIMILAR_TITLES_LIMIT }, (_, index) => (
          <div
            key={index}
            className="bg-muted rounded-image aspect-video animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Recommend has no related titles for this record. Said out loud rather than
  // hidden: the row is part of the sheet's shape, and a section that silently
  // disappears looks like a load that failed.
  if (!items.length) {
    return (
      <p className="text-muted-foreground mt-3 text-sm">
        No similar titles for this one yet.
      </p>
    )
  }

  return (
    <ul className={GRID_CLASS}>
      {items.map((item) => (
        <li key={item.objectID}>
          <MediaEntertainmentPosterCard
            title={item}
            shape="backdrop"
            sizes={CARD_SIZES}
          />
        </li>
      ))}
    </ul>
  )
}
