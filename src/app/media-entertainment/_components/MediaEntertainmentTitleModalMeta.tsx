'use client'

import { Star } from 'lucide-react'

import {
  formatRating,
  formatVoteCount,
} from '@/app/media-entertainment/_utils/formatVotes'
import { getTitleLengthLabel } from '@/app/media-entertainment/_utils/getTitleLengthLabel'
import { pluralize } from '@/app/media-entertainment/_utils/pluralize'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'

interface MediaEntertainmentTitleModalMetaProps {
  title: MediaEntertainmentTitleHitValues
  /** The full record is still in flight, so the synopsis gets a placeholder. */
  isLoading?: boolean
}

export const MediaEntertainmentTitleModalMeta = ({
  title,
  isLoading,
}: MediaEntertainmentTitleModalMetaProps) => {
  const lengthLabel = getTitleLengthLabel(title)
  const rating = formatRating(title.rating)
  const voteCount = formatVoteCount(title.ratingCount)
  const directors = title.directors?.map((director) => director.name) ?? []
  const episodes =
    title.type === 'show' && title.episodeCount
      ? pluralize(title.episodeCount, 'episode')
      : null

  return (
    <div className="pt-5">
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
        {title.maturityRating && (
          <span className="rounded-badge border-border text-foreground border px-1.5 leading-tight">
            {title.maturityRating}
          </span>
        )}
        {title.releaseYear && <span>{title.releaseYear}</span>}
        {lengthLabel && <span>{lengthLabel}</span>}
        {episodes && <span>{episodes}</span>}

        {rating && (
          <span className="text-foreground flex items-center gap-1">
            <Star
              aria-hidden="true"
              className="text-accent h-3.5 w-3.5 fill-current"
            />
            <span className="tabular-nums">{rating}</span>
            {voteCount && (
              <span className="text-muted-foreground tabular-nums">
                ({voteCount})
              </span>
            )}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          {title.overview ? (
            <p className="text-foreground/85 text-sm leading-relaxed md:text-base">
              {title.overview}
            </p>
          ) : (
            isLoading && (
              <div aria-hidden="true" className="space-y-2">
                <div className="bg-muted rounded-input h-3.5 w-full animate-pulse" />
                <div className="bg-muted rounded-input h-3.5 w-11/12 animate-pulse" />
                <div className="bg-muted rounded-input h-3.5 w-2/3 animate-pulse" />
              </div>
            )
          )}
        </div>

        <dl className="space-y-3 text-sm">
          {!!title.genres?.length && (
            <div>
              <dt className="text-muted-foreground">Genres</dt>
              <dd className="text-foreground">{title.genres.join(', ')}</dd>
            </div>
          )}
          {!!directors.length && (
            <div>
              <dt className="text-muted-foreground">
                {directors.length > 1 ? 'Directors' : 'Director'}
              </dt>
              <dd className="text-foreground">{directors.join(', ')}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
