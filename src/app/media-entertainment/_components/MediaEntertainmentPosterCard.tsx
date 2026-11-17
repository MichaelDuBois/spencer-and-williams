'use client'

import { X } from 'lucide-react'
import Link from 'next/link'

import { MediaEntertainmentListToggleButton } from '@/app/media-entertainment/_components/MediaEntertainmentListToggleButton'
import {
  DEFAULT_RAIL_SHAPE,
  RAIL_VARIANTS,
} from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { useOpenMediaTitle } from '@/app/media-entertainment/_hooks/useMediaTitleModal'
import { getTitleLengthLabel } from '@/app/media-entertainment/_utils/getTitleLengthLabel'
import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import type { MediaRailShape } from '@/app/media-entertainment/types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

const MAX_GENRES = 2

interface MediaEntertainmentPosterCardProps {
  /** Typed as the plain hit values, not `MediaRailItem`, so the card stays pure
   *  and testable. `MediaRailItem` extends it and passes without a cast. */
  title: MediaTitleHit
  shape?: MediaRailShape
  /** Overrides the shape's rail-derived `sizes` where the card sits in a grid. */
  sizes?: string
  /** 0-1. Draws the Continue Watching progress bar; omitted elsewhere. */
  progress?: number
  /** Adds a dismiss control — only Continue Watching has a row to drop out of. */
  onRemove?: () => void
  /**
   * The label a composition injection carries — 'Promoted', 'Sponsored', and so
   * on. Set only for an injected title, and it flags the card and borders it.
   */
  promotedLabel?: string
  /** Runs after a plain click opened the detail sheet, not on a modified click. */
  onOpen?: () => void
  className?: string
}

export const MediaEntertainmentPosterCard = ({
  title,
  shape = DEFAULT_RAIL_SHAPE,
  sizes,
  progress,
  onRemove,
  promotedLabel,
  onOpen,
  className,
}: MediaEntertainmentPosterCardProps) => {
  const openTitle = useOpenMediaTitle()
  const variant = RAIL_VARIANTS[shape]

  // A backdrop-shape tile falls back to the poster when TMDB has no backdrop —
  // `object-cover` crops it, which still beats a placeholder. Poster shapes do
  // not fall back to the backdrop: a 16:9 still in a 2:3 box reads as broken.
  const rawImage =
    variant.imageField === 'backdrop'
      ? (title.backdrop ?? title.poster)
      : title.poster

  const lengthLabel = getTitleLengthLabel(title)
  const genres =
    variant.meta === 'full' ? title.genres?.slice(0, MAX_GENRES) : []
  const showRating = variant.meta === 'full' && Boolean(title.maturityRating)

  const revealClass =
    'md:opacity-0 md:group-hover/card:opacity-100 md:group-focus-within/card:opacity-100'

  return (
    // The wrapper owns the group and the lift, so the overlay controls are
    // siblings of the link rather than nested inside it — a button inside an
    // anchor is invalid, and the whole card is an anchor.
    //
    // `focus-within` rather than `focus-visible`: focus can land on the link or on
    // either control, and all three should lift the card.
    <div
      className={cn(
        'group/card relative w-full transition-transform duration-300 ease-out',
        'md:focus-within:z-20 md:focus-within:scale-[1.06] md:hover:z-20 md:hover:scale-[1.06]',
        className,
      )}>
      <Link
        href={title.productUrl}
        // A plain click opens the detail sheet in place; the href stays real so
        // cmd-click, middle-click and crawlers still reach the title's own route.
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return
          }

          event.preventDefault()
          openTitle(title)
          onOpen?.()
        }}
        // Without this the computed name is every string inside the link — the
        // image alt, the heading and the whole metadata row — which announces as
        // "Blade Runner 2049 Blade Runner 2049 2017 2h 44m". An explicit label
        // makes the name the title alone; the metadata stays readable in browse
        // mode, where it belongs.
        aria-label={title.title}
        className="group/link block w-full outline-none">
        <div
          className={cn(
            'bg-muted rounded-image ring-ring ring-offset-background relative overflow-hidden ring-offset-2 group-focus-visible/link:ring-2',
            variant.aspect,
            promotedLabel && 'border-accent border',
          )}>
          <Image
            src={getTmdbImageUrl(rawImage, variant.imageSize)}
            alt={title.title}
            fill
            sizes={sizes ?? variant.sizes}
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          />

          {/* The scrim and the metadata are one element, so there is no separate
              gradient div that can fall out of sync with the reveal. */}
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-2 pt-8 pb-2 text-white transition-opacity duration-300',
              revealClass,
              // Clears the progress bar, which is pinned to the same edge.
              progress !== undefined && 'pb-3.5',
            )}>
            <h3 className="line-clamp-2 text-xs leading-snug font-semibold md:text-sm">
              {title.title}
            </h3>
            <div className="text-micro mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-white/75 md:text-xs">
              {showRating && (
                <span className="rounded-badge border border-white/40 px-1 leading-tight">
                  {title.maturityRating}
                </span>
              )}
              {title.releaseYear && <span>{title.releaseYear}</span>}
              {lengthLabel && <span>{lengthLabel}</span>}
              {genres?.map((genre) => (
                <span
                  key={genre}
                  className="before:mr-1.5 before:content-['•']">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {progress !== undefined && (
            <div
              // Always visible, unlike the metadata: the bar is the whole reason
              // a Continue Watching tile reads differently from a poster.
              className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
              <div
                role="progressbar"
                aria-label={`${title.title} watch progress`}
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${Math.round(progress * 100)}%` }}
                className="bg-accent h-full"
              />
            </div>
          )}
        </div>
      </Link>

      {/* Outside the link: its aria-label is the title, so nested text is mute. */}
      {promotedLabel && (
        <span className="rounded-badge bg-accent/30 text-accent-foreground text-micro absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 leading-tight font-semibold backdrop-blur-sm">
          {promotedLabel}
        </span>
      )}

      <div
        className={cn(
          'absolute top-1.5 right-1.5 flex gap-1.5 transition-opacity duration-300',
          revealClass,
        )}>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${title.title} from Continue Watching`}
            title="Remove from Continue Watching"
            // Round, matching the list toggle it sits beside.
            className="focus-visible:outline-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
        <MediaEntertainmentListToggleButton title={title} size="sm" />
      </div>
    </div>
  )
}
