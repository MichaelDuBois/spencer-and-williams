import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useRailScrollEdges,
  type RailScrollEdgesOptions,
} from '@/app/media-entertainment/_hooks/useRailScrollEdges'

interface ScrollportStub {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
  scrollBy: ReturnType<typeof vi.fn>
}

/**
 * The hook only ever reads three scroll properties and calls `scrollBy`, so a
 * plain object is a complete stand-in for the element. No observer stubs are
 * needed — which is precisely why the listener approach was chosen over an
 * `IntersectionObserver` sentinel.
 */
const createScrollport = (
  values: Partial<Pick<ScrollportStub, 'scrollLeft' | 'clientWidth' | 'scrollWidth'>> = {},
): ScrollportStub => {
  return {
    scrollLeft: 0,
    clientWidth: 800,
    scrollWidth: 2000,
    scrollBy: vi.fn(),
    ...values,
  }
}

/** Mounts the hook, attaches the stub, and forces a measurement via resize. */
const renderWithScrollport = (
  element: ScrollportStub,
  options?: RailScrollEdgesOptions,
) => {
  const view = renderHook(() => useRailScrollEdges(options))

  act(() => {
    view.result.current.ref.current = element as unknown as HTMLDivElement
    window.dispatchEvent(new Event('resize'))
  })

  return view
}

describe('useRailScrollEdges', () => {
  it('reports no edges before an element is attached', () => {
    const { result } = renderHook(() => useRailScrollEdges())

    expect(result.current.canScrollLeft).toBe(false)
    expect(result.current.canScrollRight).toBe(false)
  })

  it('at the start, offers only a forward scroll', () => {
    const { result } = renderWithScrollport(createScrollport({ scrollLeft: 0 }))

    expect(result.current.canScrollLeft).toBe(false)
    expect(result.current.canScrollRight).toBe(true)
  })

  it('mid-scroll, offers both directions', () => {
    const { result } = renderWithScrollport(
      createScrollport({ scrollLeft: 600 }),
    )

    expect(result.current.canScrollLeft).toBe(true)
    expect(result.current.canScrollRight).toBe(true)
  })

  it('at the end, offers only a backward scroll', () => {
    // Max scroll is scrollWidth - clientWidth = 1200.
    const { result } = renderWithScrollport(
      createScrollport({ scrollLeft: 1200 }),
    )

    expect(result.current.canScrollLeft).toBe(true)
    expect(result.current.canScrollRight).toBe(false)
  })

  it('hides both arrows when the content fits', () => {
    const { result } = renderWithScrollport(
      createScrollport({ scrollLeft: 0, clientWidth: 800, scrollWidth: 800 }),
    )

    expect(result.current.canScrollLeft).toBe(false)
    expect(result.current.canScrollRight).toBe(false)
  })

  it('tolerates a sub-pixel offset at either extreme', () => {
    const { result } = renderWithScrollport(
      createScrollport({ scrollLeft: 1198.6 }),
    )

    expect(result.current.canScrollRight).toBe(false)
  })

  it('re-measures from the onScroll handler', async () => {
    const element = createScrollport({ scrollLeft: 0 })
    const { result } = renderWithScrollport(element)

    expect(result.current.canScrollLeft).toBe(false)

    element.scrollLeft = 600
    act(() => {
      result.current.handleScroll()
    })

    await waitFor(() => expect(result.current.canScrollLeft).toBe(true))
    expect(result.current.canScrollRight).toBe(true)
  })

  it('re-measures when the rail re-renders with different items', () => {
    const element = createScrollport({ clientWidth: 800, scrollWidth: 800 })
    const { result, rerender } = renderWithScrollport(element)

    expect(result.current.canScrollRight).toBe(false)

    // A persona switch refetches the homepage and swaps `items` while the rail
    // stays mounted: `scrollWidth` moves with no scroll and no resize.
    element.scrollWidth = 2000
    rerender()

    expect(result.current.canScrollRight).toBe(true)
  })

  it('scrolls forward by one page, inset by both gutters', () => {
    const element = createScrollport()
    const { result } = renderWithScrollport(element)

    act(() => {
      result.current.scrollByPage(1)
    })

    // clientWidth 800 - 2 * 32px gutter.
    expect(element.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 736 }),
    )
  })

  it('scrolls backward with a negative delta of the same magnitude', () => {
    const element = createScrollport({ scrollLeft: 1000 })
    const { result } = renderWithScrollport(element)

    act(() => {
      result.current.scrollByPage(-1)
    })

    expect(element.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: -736 }),
    )
  })

  it('steps the full viewport when the rail declares no inset', () => {
    const element = createScrollport()
    const { result } = renderWithScrollport(element, { pageInset: 0 })

    act(() => {
      result.current.scrollByPage(1)
    })

    expect(element.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 800 }),
    )
  })

  it('honours a custom page inset on both sides', () => {
    const element = createScrollport()
    const { result } = renderWithScrollport(element, { pageInset: 100 })

    act(() => {
      result.current.scrollByPage(-1)
    })

    expect(element.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: -600 }),
    )
  })

  it('does not throw when scrolled before an element is attached', () => {
    const { result } = renderHook(() => useRailScrollEdges())

    expect(() => result.current.scrollByPage(1)).not.toThrow()
    expect(() => result.current.handleScroll()).not.toThrow()
  })

  it('stops listening for resizes after unmount', () => {
    const element = createScrollport({ scrollLeft: 0 })
    const { result, unmount } = renderWithScrollport(element)

    unmount()
    element.scrollLeft = 600
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.canScrollLeft).toBe(false)
  })
})
