'use client'

import { Play, X } from 'lucide-react'

import {
  ACTION_BASE_CLASS,
  ACTION_PRIMARY_CLASS,
  ACTION_WIDE_CLASS,
} from '@/app/media-entertainment/_components/MediaEntertainmentActionVariants'
import { MediaEntertainmentListToggleButton } from '@/app/media-entertainment/_components/MediaEntertainmentListToggleButton'
import { useMediaWatchState } from '@/app/media-entertainment/_hooks/useMediaWatchState'
import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

interface MediaEntertainmentTitleModalHeroProps {
  title: MediaTitleHit
  /** Ties the heading to the dialog's `aria-labelledby`. */
  headingId: string
  onClose: () => void
}

export const MediaEntertainmentTitleModalHero = ({
  title,
  headingId,
  onClose,
}: MediaEntertainmentTitleModalHeroProps) => {
  const { markInProgress } = useMediaWatchState()

  return (
    // Capped on desktop: a 16:9 backdrop across the full sheet width would push the
    // synopsis and the grid below the fold.
    <div className="relative aspect-video w-full md:max-h-[64svh]">
      <Image
        src={getTmdbImageUrl(title.backdrop ?? title.poster, 'w1280')}
        alt=""
        fill
        sizes="(min-width: 1024px) 1152px, 100vw"
        priority
        className="object-cover object-center"
      />

      {/* Two scrims: a flat floor for blown-out artwork, then the copy column.
          Kept thin so the artwork carries the panel — the heading leans on its own
          drop-shadow rather than on a heavy wash. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
      <div
        aria-hidden="true"
        className="from-card via-card/35 absolute inset-0 bg-linear-to-t to-transparent"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="focus-visible:outline-ring absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2">
        <X aria-hidden="true" className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
        {/* `font-secondary` is Archivo Black here — no `font-bold` on top of it. */}
        <h2
          id={headingId}
          className="font-secondary text-2xl leading-[1.05] tracking-tight text-white uppercase drop-shadow-[0_2px_12px_rgb(0_0_0/0.65)] md:text-4xl">
          {title.title}
        </h2>

        {title.tagline && (
          <p className="mt-2 line-clamp-2 text-sm text-white/75 md:text-base">
            {title.tagline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Nothing streams — `config.ts` maps no video source — so Play stands in
              for playback by marking the title in progress and closing the sheet,
              which drops the viewer onto a Continue Watching row that now has it. */}
          <button
            type="button"
            onClick={() => {
              markInProgress(title)
              onClose()
            }}
            className={cn(
              ACTION_BASE_CLASS,
              ACTION_PRIMARY_CLASS,
              ACTION_WIDE_CLASS,
            )}>
            <Play aria-hidden="true" className="h-4 w-4 fill-current" />
            Play
          </button>

          <MediaEntertainmentListToggleButton title={title} />
        </div>
      </div>
    </div>
  )
}
