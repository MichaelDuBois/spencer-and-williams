'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'

const SCROLL_THRESHOLD_PX = 120

const homePath = `/${config.slug}`

export const useMediaEntertainmentHeaderScroll = (): { isOverlay: boolean } => {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const isHome = pathname === homePath

  const [isScrolled, setIsScrolled] = useState(false)
  const [trackedPath, setTrackedPath] = useState(pathname)

  // Re-seed on navigation so a stale `true` can't suppress the overlay.
  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    setIsScrolled(scrollY.get() > SCROLL_THRESHOLD_PX)
  }

  // `change` fires per scrolled pixel, but a `setState` with an unchanged value
  // is a no-op re-render, so this stays cheap without throttling.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Only the homepage has an overlay header.
    if (!isHome) return

    setIsScrolled(latest > SCROLL_THRESHOLD_PX)
  })

  return { isOverlay: isHome && !isScrolled }
}
