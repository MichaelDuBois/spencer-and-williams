'use client'

import { motion } from 'motion/react'

import { useMediaEntertainmentFooterReveal } from '@/app/media-entertainment/_hooks/useMediaEntertainmentFooterReveal'
import { transitionSlow } from '@/lib/animations'

const TMDB_URL = 'https://www.themoviedb.org'

/**
 * TMDB attribution, revealed only at the bottom of the page.
 *
 * Fixed and transparent rather than a block in flow: the vertical is
 * browse-first, so nothing should interrupt the rails, and the attribution is a
 * footnote that surfaces once the reader has run out of rows. `pointer-events`
 * are off on the bar and back on for the link, and the whole thing is `inert`
 * while hidden so a faded-out link never takes keyboard focus.
 */
export const MediaEntertainmentFooter = () => {
  const { isRevealed } = useMediaEntertainmentFooterReveal()

  return (
    <motion.footer
      // z-30 sits under the header (z-40) and everything above it.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-8 pb-6 md:px-16"
      initial={{ opacity: 0, y: 12 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={transitionSlow}
      inert={!isRevealed}>
      <p className="text-muted-foreground text-xs md:text-sm">
        Data provided courtesy of TMDB, learn more at{' '}
        <a
          href={TMDB_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground/80 hover:text-foreground pointer-events-auto underline underline-offset-2 transition-colors">
          themoviedb.org
        </a>
      </p>
    </motion.footer>
  )
}
