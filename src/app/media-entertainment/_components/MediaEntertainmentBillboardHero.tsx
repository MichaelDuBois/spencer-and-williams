'use client'

import { Info, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import {
  ACTION_BASE_CLASS,
  ACTION_GLASS_CLASS,
  ACTION_PRIMARY_CLASS,
  ACTION_WIDE_CLASS,
} from '@/app/media-entertainment/_components/MediaEntertainmentActionVariants'
import { MediaEntertainmentListToggleButton } from '@/app/media-entertainment/_components/MediaEntertainmentListToggleButton'
import { RAIL_GUTTER_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { useBillboardRotation } from '@/app/media-entertainment/_hooks/useBillboardRotation'
import { useOpenMediaTitle } from '@/app/media-entertainment/_hooks/useMediaTitleModal'
import { useMediaWatchState } from '@/app/media-entertainment/_hooks/useMediaWatchState'
import { getTitleLengthLabel } from '@/app/media-entertainment/_utils/getTitleLengthLabel'
import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { Image } from '@/components/image/Image'
import { enterFadeIn, transitionSlow } from '@/lib/animations'
import { cn } from '@/lib/utils'

/** The metadata row has room for three before it wraps on a phone. */
const MAX_GENRES = 3

interface MediaEntertainmentBillboardHeroProps {
  /**
   * Typed as the plain hit values, not `MediaRailItem`, so the hero stays pure
   * and testable. `MediaRailItem` extends it and passes without a cast.
   */
  titles: MediaTitleHit[]
}
export const MediaEntertainmentBillboardHero = ({
  titles,
}: MediaEntertainmentBillboardHeroProps) => {
  // Called before the empty guard: the count can change between renders, so an
  // early return above the hook would reorder hooks.
  //
  // The cadence is `useBillboardRotation`'s own `DEFAULT_ROTATION_INTERVAL_MS`,
  // not a config value: it is animation timing, so it belongs next to the
  // reduced-motion and tab-visibility rules that also suppress it.
  const { index, mountedSlides, goTo, pause, resume } = useBillboardRotation(
    titles.length,
  )
  const openTitle = useOpenMediaTitle()
  const { markInProgress } = useMediaWatchState()

  if (!titles.length) return null

  const active = titles[index]
  const lengthLabel = getTitleLengthLabel(active)
  const genres = active.genres?.slice(0, MAX_GENRES) ?? []
  const synopsis = active.tagline || active.overview

  return (
    <section
      aria-label="Featured titles"
      // Pause on hover *and* focus: a keyboard user who has tabbed to Play must
      // not have the hero swap out from under them. The two are reported
      // separately so blurring an indicator does not resume rotation under a
      // pointer that is still inside the hero.
      onMouseEnter={() => pause('hover')}
      onMouseLeave={() => resume('hover')}
      onFocusCapture={() => pause('focus')}
      onBlurCapture={(event) => {
        // Blur bubbles, so ignore focus moves between the hero's own controls.
        if (event.currentTarget.contains(event.relatedTarget)) return

        resume('focus')
      }}
      className="relative -mt-[var(--header-height)] flex h-[68svh] min-h-[480px] flex-col justify-end overflow-hidden md:h-[90svh] md:min-h-[560px]">
      <div aria-hidden="true" className="absolute inset-0">
        {titles.map((title, slideIndex) =>
          // `|| slideIndex === index` is the safety net: if the title list ever
          // grows past what the mount window has seen, the active slide still
          // renders rather than leaving the hero blank.
          mountedSlides.has(slideIndex) || slideIndex === index ? (
            <motion.div
              key={title.objectID}
              initial={false}
              animate={{ opacity: slideIndex === index ? 1 : 0 }}
              transition={transitionSlow}
              className="absolute inset-0">
              <Image
                src={getTmdbImageUrl(title.backdrop, 'w1280')}
                alt=""
                fill
                sizes="100vw"
                priority={slideIndex === 0}
                className="object-cover object-center"
              />
            </motion.div>
          ) : null,
        )}
      </div>

      {/* Scrim stack, in order. Four layers is not belt-and-braces: each one
          solves a different failure mode over arbitrary artwork. */}
      {/* 1. Flat floor — the only thing that saves a blown-out white backdrop. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/15" />
      {/* 2. The header band, so the nav stays legible over any image. Thinned the
             least of the four: the nav has no drop-shadow to fall back on. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[calc(var(--header-height)*2)] bg-linear-to-b from-black/65 via-black/20 to-transparent"
      />
      {/* 3. The copy column. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent"
      />
      {/* 4. Melts into the page. `background`, never black — the first rail
             floats over this band on a negative margin. */}
      <div
        aria-hidden="true"
        className="from-background via-background/70 absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t to-transparent"
      />

      <div className={cn('relative z-10 w-full', RAIL_GUTTER_CLASS)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.objectID}
            {...enterFadeIn(16)}
            exit={{ opacity: 0 }}
            transition={transitionSlow}
            className="max-w-xl lg:max-w-2xl">
            {/* `font-secondary` is Archivo Black in this theme — the display
                face that makes the hero read as cinematic. Deliberately no
                `font-bold`: the face is already black, so a bold on top of it
                is synthesised and smears the glyph edges. */}
            <h1 className="font-secondary text-3xl leading-[1.05] tracking-tight text-white uppercase drop-shadow-[0_2px_12px_rgb(0_0_0/0.65)] md:text-5xl lg:text-6xl">
              {active.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/85 md:mt-4 md:text-sm">
              {active.maturityRating && (
                <span className="rounded-badge border border-white/40 px-1.5 leading-tight">
                  {active.maturityRating}
                </span>
              )}
              {active.releaseYear && <span>{active.releaseYear}</span>}
              {lengthLabel && <span>{lengthLabel}</span>}
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="before:mr-2.5 before:content-['•']">
                  {genre}
                </span>
              ))}
            </div>

            {synopsis && (
              <p className="mt-3 line-clamp-3 hidden text-sm text-white/80 sm:block md:mt-4 md:text-base">
                {synopsis}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-7">
              {/* Play still opens the sheet — `config.ts` maps no `videos`
                  attribute, so there is no trailer key to play — but it now also
                  puts the title into Continue Watching on the way, which is the
                  visible consequence the button was missing. */}
              <button
                type="button"
                onClick={() => {
                  markInProgress(active)
                  openTitle(active)
                }}
                className={cn(
                  ACTION_BASE_CLASS,
                  ACTION_PRIMARY_CLASS,
                  ACTION_WIDE_CLASS,
                )}>
                <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                Play
              </button>

              <button
                type="button"
                onClick={() => openTitle(active)}
                className={cn(ACTION_BASE_CLASS, ACTION_GLASS_CLASS)}>
                <Info aria-hidden="true" className="h-4 w-4" />
                More info
              </button>

              <MediaEntertainmentListToggleButton title={active} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom padding clears the first rail, which rides up over this band on
          `-mt-24 md:-mt-32`. Without it the indicator sits under the heading. */}
      <div
        className={cn(
          'relative z-10 mt-6 flex justify-end gap-1 pb-28 md:mt-8 md:pb-36',
          RAIL_GUTTER_CLASS,
        )}>
        {titles.map((title, slideIndex) => {
          const isActive = slideIndex === index

          return (
            <button
              key={title.objectID}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Show ${title.title}`}
              aria-current={isActive}
              className="group/dot focus-visible:outline-ring flex h-6 items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-2">
              <span
                aria-hidden="true"
                className={cn(
                  'block h-1 rounded-full transition-all duration-300',
                  isActive
                    ? 'w-8 bg-white'
                    : 'w-4 bg-white/40 group-hover/dot:bg-white/70',
                )}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
