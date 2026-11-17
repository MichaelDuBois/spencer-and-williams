'use client'

import { useRef, useEffect, type RefObject } from 'react'

const DEFAULT_HEADER_HEIGHT = 73

// A pinned header (`#site-header`) keeps its bottom edge in view, so measure it;
// a header that scrolls away frees the space it vacates.
const getHeaderOffset = (el: Element): number => {
  const header = document.getElementById('site-header')
  if (header) return Math.max(0, header.getBoundingClientRect().bottom)

  const value = getComputedStyle(el).getPropertyValue('--header-height')
  const headerHeight = parseInt(value, 10) || DEFAULT_HEADER_HEIGHT
  return Math.max(0, headerHeight - window.scrollY)
}

export const useStickyOffset = (
  isFullscreen: boolean,
): RefObject<HTMLDivElement | null> => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || isFullscreen) return

    const calculateLayout = () => {
      const viewportHeight = window.innerHeight
      const newOffset = getHeaderOffset(panel)

      panel.style.top = `${newOffset}px`

      const footer = document.getElementById('site-footer')
      if (footer) {
        const footerRect = footer.getBoundingClientRect()
        if (footerRect.top < viewportHeight) {
          const availableSpace = Math.max(0, footerRect.top - newOffset)
          panel.style.height = `${availableSpace}px`
        } else {
          panel.style.height = `calc(100dvh - ${newOffset}px)`
        }
      } else {
        panel.style.height = `calc(100dvh - ${newOffset}px)`
      }
    }

    window.addEventListener('scroll', calculateLayout, { passive: true })
    window.addEventListener('resize', calculateLayout, { passive: true })
    calculateLayout()

    return () => {
      window.removeEventListener('scroll', calculateLayout)
      window.removeEventListener('resize', calculateLayout)
    }
  }, [isFullscreen])

  return panelRef
}
