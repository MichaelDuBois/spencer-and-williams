'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * How close to the document bottom counts as "all the way down". A little slack
 * so the reveal lands as the reader arrives at the end of the rails rather than
 * only once the scroll is pinned to the very last pixel.
 */
const REVEAL_THRESHOLD_PX = 80

export const useMediaEntertainmentFooterReveal = (): {
  isRevealed: boolean
} => {
  const { scrollY } = useScroll()
  const [isRevealed, setIsRevealed] = useState(false)
  // Cached rather than read per scroll frame: `scrollHeight` forces a layout
  // pass, and this page has the longest DOM in the app (up to eight rails of
  // twenty cards). The reads move into the resize/observer path, which fires on
  // layout changes instead of on every scrolled pixel.
  const metricsRef = useRef({ documentHeight: 0, viewportHeight: 0 })

  const evaluate = useCallback((scrollOffset: number) => {
    const { documentHeight, viewportHeight } = metricsRef.current
    // Before the first measurement there is no bottom to be near.
    if (!documentHeight) return

    const distanceFromBottom = documentHeight - (scrollOffset + viewportHeight)

    setIsRevealed(distanceFromBottom <= REVEAL_THRESHOLD_PX)
  }, [])

  useEffect(() => {
    const measure = () => {
      metricsRef.current = {
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
      }
      // Re-run against the current offset: the page grows when the rails land,
      // which moves the bottom without anybody scrolling.
      evaluate(scrollY.get())
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [evaluate, scrollY])

  // `change` fires per scrolled pixel, but this only subtracts cached numbers,
  // and a `setState` with an unchanged value is a no-op re-render.
  useMotionValueEvent(scrollY, 'change', evaluate)

  return { isRevealed }
}
