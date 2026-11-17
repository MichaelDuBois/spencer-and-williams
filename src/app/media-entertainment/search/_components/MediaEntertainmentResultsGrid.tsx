'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useInfiniteHits } from 'react-instantsearch'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { MediaEntertainmentResultCard } from '@/app/media-entertainment/search/_components/MediaEntertainmentResultCard'
import { POSTER_GRID_CLASS } from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchChipVariants'
import { enterFadeIn, transitionSlow } from '@/lib/animations'

const { slug, algolia } = mediaEntertainmentConfig
const { template } = algolia.primaryIndex

const ENTRANCE_Y_PX = 10
const ENTRANCE_STAGGER_STEP = 0.03
// Roughly the first two rows of the widest grid; past that the cascade would
// only hold back results the user is already waiting for.
const ENTRANCE_STAGGER_LAST_INDEX = 14

/**
 * The poster grid. Paging is a button rather than a scroll sentinel so it stays
 * keyboard-reachable and directly assertable.
 */
export const MediaEntertainmentResultsGrid = () => {
  const { items, isLastPage, showMore } = useInfiniteHits()
  const prefersReducedMotion = useReducedMotion()

  // The grid cascades in once, when results first reach the route. Hits are
  // re-keyed on every keystroke and on "Load more", so an ungated `initial`
  // would replay the entrance on each refinement. The first card's completion
  // marks the cascade as spent; later mounts start at their settled values.
  const [hasCascaded, setHasCascaded] = useState(false)

  if (!template || !items.length) return null

  const entrance = enterFadeIn(prefersReducedMotion ? 0 : ENTRANCE_Y_PX)

  return (
    <>
      <ul className={POSTER_GRID_CLASS}>
        {items.map((hit, index) => (
          <motion.li
            key={hit.objectID}
            initial={hasCascaded ? false : entrance.initial}
            animate={entrance.animate}
            transition={{ ...transitionSlow, delay: getEntranceDelay(index) }}
            onAnimationComplete={
              index === 0 ? () => setHasCascaded(true) : undefined
            }>
            <MediaEntertainmentResultCard
              hit={hit}
              template={template}
              slug={slug}
            />
          </motion.li>
        ))}
      </ul>

      {!isLastPage && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={showMore}
            className="rounded-button border-border text-foreground hover:bg-secondary focus-visible:outline-ring cursor-pointer border px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
            Load more
          </button>
        </div>
      )}
    </>
  )
}

const getEntranceDelay = (index: number): number =>
  Math.min(index, ENTRANCE_STAGGER_LAST_INDEX) * ENTRANCE_STAGGER_STEP
