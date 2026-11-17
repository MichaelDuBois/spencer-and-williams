'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { RAIL_GUTTER_PX } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'

/** Sub-pixel scroll positions and fractional layout mean an exact `0` or exact
 *  `scrollWidth - clientWidth` never arrives. Tolerate a few pixels. */
const EDGE_TOLERANCE = 4

export interface RailScrollEdges {
  /** Attach to the scrollport element. */
  ref: RefObject<HTMLDivElement | null>
  canScrollLeft: boolean
  canScrollRight: boolean
  /** Pass to the scrollport's `onScroll`. rAF-coalesced internally. */
  handleScroll: () => void
  /** Scroll one page (viewport minus both insets). `-1` left, `1` right. */
  scrollByPage: (direction: -1 | 1) => void
}

export interface RailScrollEdgesOptions {
  /** Pixels trimmed from each side of a page step. `0` for a gutterless rail. */
  pageInset?: number
}

export const useRailScrollEdges = ({
  pageInset = RAIL_GUTTER_PX,
}: RailScrollEdgesOptions = {}): RailScrollEdges => {
  const ref = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const [edges, setEdges] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  })

  const measure = useCallback(() => {
    const element = ref.current
    if (!element) return

    const { scrollLeft, clientWidth, scrollWidth } = element
    const maxScroll = scrollWidth - clientWidth
    const canScrollLeft = scrollLeft > EDGE_TOLERANCE
    const canScrollRight =
      maxScroll > EDGE_TOLERANCE && scrollLeft < maxScroll - EDGE_TOLERANCE

    // Bail out of the state update when nothing changed: `onScroll` fires per
    // frame of a smooth scroll and most frames do not cross an edge.
    setEdges((previous) => {
      if (
        previous.canScrollLeft === canScrollLeft &&
        previous.canScrollRight === canScrollRight
      ) {
        return previous
      }
      return { canScrollLeft, canScrollRight }
    })
  }, [])

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      measure()
    })
  }, [measure])

  // Deliberately no dependency array. A commit is exactly the moment the track's
  // contents can have changed: a persona switch refetches the homepage and swaps
  // `items` while the rail stays mounted, so `scrollWidth` moves with no scroll
  // and no resize, and the arrows would stay stale until the next of either.
  // `measure` is three property reads and bails out of the state update when the
  // edges are unchanged, so the extra pass is free and cannot loop.
  useEffect(() => {
    measure()
  })

  useEffect(() => {
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [measure])

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const element = ref.current
      if (!element) return

      element.scrollBy({
        left: direction * (element.clientWidth - 2 * pageInset),
        behavior: 'smooth',
      })
    },
    [pageInset],
  )

  return { ref, ...edges, handleScroll, scrollByPage }
}
