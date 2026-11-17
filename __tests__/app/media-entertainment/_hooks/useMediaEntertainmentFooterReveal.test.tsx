import { act, renderHook } from '@testing-library/react'
import { motionValue } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaEntertainmentFooterReveal } from '@/app/media-entertainment/_hooks/useMediaEntertainmentFooterReveal'

import type { MotionValue } from 'motion/react'
import type { MockInstance } from 'vitest'

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

const VIEWPORT_HEIGHT = 800
const DOCUMENT_HEIGHT = 3000

/** The scroll offset at which the document bottom meets the viewport bottom. */
const BOTTOM_OFFSET = DOCUMENT_HEIGHT - VIEWPORT_HEIGHT

/** Kept around so a test can assert *when* the layout read happens. */
let scrollHeightSpy: MockInstance<() => number>

const setDocumentHeight = (height: number) => {
  scrollHeightSpy = vi
    .spyOn(document.documentElement, 'scrollHeight', 'get')
    .mockReturnValue(height)
}

beforeEach(() => {
  scrollHolder.current = motionValue(0)
  window.innerHeight = VIEWPORT_HEIGHT
  setDocumentHeight(DOCUMENT_HEIGHT)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMediaEntertainmentFooterReveal', () => {
  it('is hidden on landing, before any scrolling', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    expect(result.current.isRevealed).toBe(false)
  })

  it('stays hidden while scrolling through the middle of the page', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET / 2)
    })

    expect(result.current.isRevealed).toBe(false)
  })

  it('reveals once scrolled to the bottom of the document', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET)
    })

    expect(result.current.isRevealed).toBe(true)
  })

  it('reveals within the threshold slack, just short of the bottom', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET - 20)
    })

    expect(result.current.isRevealed).toBe(true)
  })

  it('stays hidden just outside the threshold slack', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET - 200)
    })

    expect(result.current.isRevealed).toBe(false)
  })

  it('hides again when scrolled back up away from the bottom', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET)
    })
    act(() => {
      getScrollY().set(0)
    })

    expect(result.current.isRevealed).toBe(false)
  })

  it('accounts for a document that grows after mount', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET)
    })
    expect(result.current.isRevealed).toBe(true)

    // Rails resolve and the page gets taller — the same offset is no longer the
    // bottom. The height is cached, so it is the layout change that re-measures,
    // not the scroll: in the browser that is the ResizeObserver on the document,
    // and the `resize` listener is the half jsdom can drive.
    setDocumentHeight(DOCUMENT_HEIGHT * 2)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isRevealed).toBe(false)
  })

  it('re-evaluates on a resize alone, with no scrolling', () => {
    const { result } = renderHook(() => useMediaEntertainmentFooterReveal())

    act(() => {
      getScrollY().set(BOTTOM_OFFSET / 2)
    })
    expect(result.current.isRevealed).toBe(false)

    // The window grows until the current offset *is* the bottom.
    window.innerHeight = VIEWPORT_HEIGHT + BOTTOM_OFFSET / 2
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isRevealed).toBe(true)
  })

  it('does not read layout while scrolling', () => {
    renderHook(() => useMediaEntertainmentFooterReveal())

    scrollHeightSpy.mockClear()
    act(() => {
      getScrollY().set(100)
      getScrollY().set(200)
      getScrollY().set(300)
    })

    expect(scrollHeightSpy).not.toHaveBeenCalled()
  })
})
