import type { TmdbImageSize } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import type { MediaRailShape } from '@/app/media-entertainment/types'
import { transitionFluid } from '@/lib/animations'

/** Which extracted image field a shape renders. Keyed off the hit-values type so
 *  a rename there breaks the build here rather than silently rendering nothing. */
export type MediaRailImageField = Extract<
  keyof MediaEntertainmentTitleHitValues,
  'poster' | 'backdrop'
>

/** How much metadata the hover panel has room for at this shape's widths. */
export type MediaRailMetaDensity = 'minimal' | 'full'

export interface MediaRailVariant {
  /** Width classes for the scroll item. The card itself is width-agnostic. */
  item: string
  /** Aspect-ratio class on the image box. */
  aspect: string
  /** `next/image` sizes, breakpoint-descending, derived from `item`. */
  sizes: string
  imageField: MediaRailImageField
  imageSize: TmdbImageSize
  meta: MediaRailMetaDensity
}

/**
 * Three of the four shapes share identical HTML and differ only in width, aspect,
 * `sizes`, image field and metadata density — the variant-map case of the styling
 * decision tree. `top10` shares the card but composes it with a numeral, so it
 * gets its own component while still sourcing its geometry from here.
 *
 * `sizes` is the CSS layout width of the container at each breakpoint, not a file
 * width — the browser multiplies by DPR itself. Every value below is the pixel
 * equivalent of the matching Tailwind width in `item`.
 */
export const RAIL_VARIANTS: Record<MediaRailShape, MediaRailVariant> = {
  // ~6-7 posters visible on a desktop viewport.
  poster: {
    item: 'w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 2xl:w-48',
    aspect: 'aspect-[2/3]',
    sizes:
      '(min-width: 1536px) 192px, (min-width: 1280px) 176px, (min-width: 1024px) 160px, (min-width: 768px) 144px, (min-width: 640px) 128px, 112px',
    imageField: 'poster',
    imageSize: 'w500',
    meta: 'minimal',
  },
  // 384px CSS x DPR2 = 768 device pixels, so w500 would visibly soften.
  backdrop: {
    item: 'w-64 sm:w-72 md:w-80 lg:w-88 xl:w-96',
    aspect: 'aspect-video',
    sizes:
      '(min-width: 1280px) 384px, (min-width: 1024px) 352px, (min-width: 768px) 320px, (min-width: 640px) 288px, 256px',
    imageField: 'backdrop',
    imageSize: 'w780',
    meta: 'full',
  },
  // Reads "premium" purely through scale, so the poster needs the larger derivative.
  spotlight: {
    item: 'w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72',
    aspect: 'aspect-[2/3]',
    sizes:
      '(min-width: 1280px) 288px, (min-width: 1024px) 256px, (min-width: 768px) 224px, (min-width: 640px) 192px, 160px',
    imageField: 'poster',
    imageSize: 'w780',
    meta: 'full',
  },
  // The negative margin pulls the poster back over its numeral. `first:` is not
  // needed: every item owns a numeral, so every poster overlaps one.
  top10: {
    item: 'w-28 -ml-6 md:w-32 md:-ml-10 lg:w-36',
    aspect: 'aspect-[2/3]',
    sizes: '(min-width: 1024px) 144px, (min-width: 768px) 128px, 112px',
    imageField: 'poster',
    imageSize: 'w500',
    meta: 'minimal',
  },
}

/**
 * How many placeholder tiles a loading rail renders — enough to overflow the
 * widest viewport for that shape so the skeleton and the real rail have the same
 * silhouette. Exported so the homepage can render exactly N titled skeletons
 * straight from `homepageRails` config, before any request resolves.
 */
export const RAIL_PLACEHOLDERS: Record<MediaRailShape, number> = {
  poster: 10,
  backdrop: 6,
  spotlight: 7,
  top10: 10,
}

/** The shape a rail config falls back to when it declares none. */
export const DEFAULT_RAIL_SHAPE: MediaRailShape = 'poster'

/**
 * Rails bleed edge to edge and own their gutters — there is no `container mx-auto`
 * on this page. Section headings carry the same gutter so they line up with the
 * first card's left edge.
 */
export const RAIL_GUTTER_CLASS = 'px-8 md:px-12 xl:px-16'

/**
 * The base gutter in pixels, matching `RAIL_GUTTER_CLASS`' `px-8`. Used as the
 * page-step inset in `useRailScrollEdges`, which needs a number rather than a
 * class. Slightly conservative on wide viewports, which is the safe direction —
 * a page step that lands short never skips a card.
 */
export const RAIL_GUTTER_PX = 32

/**
 * Gutter and gap geometry for a rail's flex track, shared by the live
 * scrollport and the loading skeleton so a change to the rhythm can't land in
 * one and miss the other. Composed from `RAIL_GUTTER_CLASS` so the gutter is
 * defined exactly once.
 *
 * Scroll behaviour (`snap-*`, `scroll-px-*`, `overflow-*`) is deliberately not
 * here: the skeleton has nothing to scroll, and a scrollable skeleton invites
 * interaction that does nothing.
 */
export const RAIL_TRACK_CLASS = `gap-2 py-6 md:gap-3 ${RAIL_GUTTER_CLASS}`

export const RAIL_HEADING_CLASS =
  'text-foreground text-lg font-semibold tracking-tight md:text-xl'

/** Cap on the entrance stagger — past the fourth row the delay stops growing so
 *  a long homepage never feels like it is loading in slow motion. */
const MAX_STAGGERED_ROWS = 3

const STAGGER_STEP_SECONDS = 0.08

/**
 * Rows fade in on scroll with the shared `transitionFluid` preset plus a
 * per-row delay. A delay, deliberately — not a new duration or easing, which
 * would violate the shared-animation-preset rule.
 */
export const getRailEntranceTransition = (index: number) => {
  return {
    ...transitionFluid,
    delay: Math.min(index, MAX_STAGGERED_ROWS) * STAGGER_STEP_SECONDS,
  }
}
