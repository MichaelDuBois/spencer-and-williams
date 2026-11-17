'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { MediaEntertainmentSimilarTitles } from '@/app/media-entertainment/_components/MediaEntertainmentSimilarTitles'
import { MediaEntertainmentTitleModalCast } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModalCast'
import { MediaEntertainmentTitleModalHero } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModalHero'
import { MediaEntertainmentTitleModalMeta } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModalMeta'
import { MediaEntertainmentTitleModalSeasons } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModalSeasons'
import { useMediaTitleDetail } from '@/app/media-entertainment/_hooks/useMediaTitleDetail'
import { useMediaTitleModal } from '@/app/media-entertainment/_hooks/useMediaTitleModal'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { transitionFluid, transitionSmooth } from '@/lib/animations'

const HEADING_ID = 'media-title-sheet-heading'

/** Sits over the header (z-40) and the assistant panel (z-50), under the demo bar. */
const OVERLAY_CLASS =
  'fixed inset-0 z-55 flex items-end justify-center overflow-hidden bg-black/50 md:items-center md:p-6'

const SHEET_VARIANTS = {
  hidden: { y: '100vh', transition: transitionFluid },
  visible: { y: '0vh', transition: transitionFluid },
}

/** The scrim leads the way in and holds until the sheet has cleared the frame. */
const SCRIM_VARIANTS = {
  hidden: { opacity: 0, transition: transitionFluid },
  visible: { opacity: 1, transition: transitionSmooth },
}

export const MediaEntertainmentTitleModal = () => {
  const { selectedTitle, closeTitle } = useMediaTitleModal()
  const { detail, isPending } = useMediaTitleDetail(selectedTitle?.objectID)
  const sheetRef = useRef<HTMLDivElement>(null)

  const objectID = selectedTitle?.objectID
  // The card's values paint immediately; the full record replaces them on arrival.
  const title = detail?.objectID === objectID ? detail : selectedTitle

  useBodyScrollLock(!!selectedTitle)

  useEffect(() => {
    if (!objectID) return

    // Picking a similar title swaps the content in place, so reset the scroll and
    // move focus into the sheet again rather than leaving both mid-page.
    //
    // `preventScroll` is what makes the entrance visible: the sheet mounts a
    // viewport below its resting place, and a plain `focus()` has the browser
    // scroll that offset away before the animation can play it.
    sheetRef.current?.scrollTo?.({ top: 0 })
    sheetRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTitle()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [objectID, closeTitle])

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          key="media-title-sheet"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={SCRIM_VARIANTS}
          onClick={closeTitle}
          className={OVERLAY_CLASS}>
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            tabIndex={-1}
            variants={SHEET_VARIANTS}
            onClick={(event) => event.stopPropagation()}
            className="rounded-t-card bg-card md:rounded-card scrollbar-none relative max-h-[92svh] w-full overflow-y-auto overscroll-contain shadow-2xl shadow-black/60 outline-none md:max-h-[90svh] md:max-w-6xl">
            <MediaEntertainmentTitleModalHero
              title={title}
              headingId={HEADING_ID}
              onClose={closeTitle}
            />

            <div className="px-5 pb-8 md:px-8">
              <MediaEntertainmentTitleModalMeta
                title={title}
                isLoading={isPending}
              />
              <MediaEntertainmentTitleModalSeasons seasons={title.seasons} />
              <MediaEntertainmentTitleModalCast cast={title.cast} />
              <MediaEntertainmentSimilarTitles title={title} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
