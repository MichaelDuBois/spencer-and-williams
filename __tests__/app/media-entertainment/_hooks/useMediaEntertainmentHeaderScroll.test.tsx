import { act, renderHook } from '@testing-library/react'
import { motionValue } from 'motion/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaEntertainmentHeaderScroll } from '@/app/media-entertainment/_hooks/useMediaEntertainmentHeaderScroll'

import type { MotionValue } from 'motion/react'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => {
  return {
    usePathname: () => usePathnameMock(),
  }
})

// A real MotionValue, so useMotionValueEvent subscribes for real and `.set()`
// drives the hook exactly as a browser scroll would.
const scrollHolder: { current: MotionValue<number> | null } = { current: null }

vi.mock('motion/react', async importOriginal => {
  const actual = await importOriginal<typeof import('motion/react')>()

  return {
    ...actual,
    useScroll: () => {
      return { scrollY: scrollHolder.current }
    },
  }
})

const getScrollY = (): MotionValue<number> => {
  if (!scrollHolder.current) throw new Error('scrollY was not initialised')

  return scrollHolder.current
}

beforeEach(() => {
  scrollHolder.current = motionValue(0)
  usePathnameMock.mockReturnValue('/media-entertainment')
})

describe('useMediaEntertainmentHeaderScroll', () => {
  it('is in overlay mode on the homepage before any scrolling', () => {
    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    expect(result.current.isOverlay).toBe(true)
  })

  it('leaves overlay mode once scrolled past the threshold', () => {
    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    act(() => {
      getScrollY().set(200)
    })

    expect(result.current.isOverlay).toBe(false)
  })

  it('stays in overlay mode while still short of the threshold', () => {
    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    act(() => {
      getScrollY().set(119)
    })

    expect(result.current.isOverlay).toBe(true)
  })

  it('returns to overlay mode when scrolled back to the top', () => {
    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    act(() => {
      getScrollY().set(200)
    })
    act(() => {
      getScrollY().set(0)
    })

    expect(result.current.isOverlay).toBe(true)
  })

  it('is never in overlay mode on the search page, at any scroll position', () => {
    usePathnameMock.mockReturnValue('/media-entertainment/search')

    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    expect(result.current.isOverlay).toBe(false)

    act(() => {
      getScrollY().set(200)
    })

    expect(result.current.isOverlay).toBe(false)

    act(() => {
      getScrollY().set(0)
    })

    expect(result.current.isOverlay).toBe(false)
  })

  it('returns to overlay mode when navigating back to a homepage left scrolled', () => {
    const { result, rerender } = renderHook(() =>
      useMediaEntertainmentHeaderScroll(),
    )

    act(() => {
      getScrollY().set(200)
    })
    expect(result.current.isOverlay).toBe(false)

    usePathnameMock.mockReturnValue('/media-entertainment/title/movie_1')
    rerender()

    usePathnameMock.mockReturnValue('/media-entertainment')
    act(() => {
      getScrollY().set(0)
    })
    rerender()

    expect(result.current.isOverlay).toBe(true)
  })

  it('re-seeds from the restored scroll position on navigation', () => {
    usePathnameMock.mockReturnValue('/media-entertainment/title/movie_1')

    const { result, rerender } = renderHook(() =>
      useMediaEntertainmentHeaderScroll(),
    )

    // Restored scroll position, with no event before the first render.
    getScrollY().set(400)
    usePathnameMock.mockReturnValue('/media-entertainment')
    rerender()

    expect(result.current.isOverlay).toBe(false)
  })

  it('ignores scroll events off the homepage', () => {
    usePathnameMock.mockReturnValue('/media-entertainment/search')

    let renderCount = 0
    renderHook(() => {
      renderCount += 1

      return useMediaEntertainmentHeaderScroll()
    })

    const rendersAfterMount = renderCount

    act(() => {
      getScrollY().set(200)
    })

    expect(renderCount).toBe(rendersAfterMount)
  })

  it('is never in overlay mode on a title detail page', () => {
    usePathnameMock.mockReturnValue('/media-entertainment/title/movie_1')

    const { result } = renderHook(() => useMediaEntertainmentHeaderScroll())

    expect(result.current.isOverlay).toBe(false)
  })
})
