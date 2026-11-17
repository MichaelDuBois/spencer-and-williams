import { act, renderHook } from '@testing-library/react'
import { installMatchMedia } from '@tests/helpers/matchMedia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBillboardRotation } from '@/app/media-entertainment/_hooks/useBillboardRotation'


const INTERVAL = 1000

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

const tick = (times = 1) =>
  act(() => {
    vi.advanceTimersByTime(INTERVAL * times)
  })

beforeEach(() => {
  vi.useFakeTimers()
  installMatchMedia(false)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useBillboardRotation', () => {
  it('starts at index 0 so SSR and the client agree on the first frame', () => {
    const { result } = renderHook(() => useBillboardRotation(5, INTERVAL))

    expect(result.current.index).toBe(0)
  })

  it('advances one slide per interval', () => {
    const { result } = renderHook(() => useBillboardRotation(3, INTERVAL))

    tick()
    expect(result.current.index).toBe(1)

    tick()
    expect(result.current.index).toBe(2)
  })

  it('wraps back to the first slide', () => {
    const { result } = renderHook(() => useBillboardRotation(3, INTERVAL))

    tick(3)
    expect(result.current.index).toBe(0)
  })

  it('does not rotate a single slide', () => {
    const { result } = renderHook(() => useBillboardRotation(1, INTERVAL))

    tick(3)
    expect(result.current.index).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reports index 0 for an empty billboard', () => {
    const { result } = renderHook(() => useBillboardRotation(0, INTERVAL))

    expect(result.current.index).toBe(0)
  })

  it('stops advancing while paused and resumes afterwards', () => {
    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    act(() => result.current.pause('hover'))
    tick(2)
    expect(result.current.index).toBe(0)

    act(() => result.current.resume('hover'))
    tick()
    expect(result.current.index).toBe(1)
  })

  it('keeps hover and focus pauses independent of each other', () => {
    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    // Pointer over the hero, then a tab into an indicator and straight back out.
    act(() => result.current.pause('hover'))
    act(() => result.current.pause('focus'))
    act(() => result.current.resume('focus'))

    // `mouseleave` never fires again, so the hover pause has to still hold.
    tick(2)
    expect(result.current.index).toBe(0)

    act(() => result.current.resume('hover'))
    tick()
    expect(result.current.index).toBe(1)
  })

  it('resumes only once every reason has cleared', () => {
    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    act(() => result.current.pause('hover'))
    act(() => result.current.pause('focus'))
    act(() => result.current.resume('hover'))

    tick(2)
    expect(result.current.index).toBe(0)

    act(() => result.current.resume('focus'))
    tick()
    expect(result.current.index).toBe(1)
  })

  it('goTo jumps to a slide and restarts the interval from zero', () => {
    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    act(() => {
      vi.advanceTimersByTime(INTERVAL * 0.8)
    })
    act(() => result.current.goTo(2))
    expect(result.current.index).toBe(2)

    // The 200ms left on the old interval must not advance the new one.
    act(() => {
      vi.advanceTimersByTime(INTERVAL * 0.5)
    })
    expect(result.current.index).toBe(2)

    tick()
    expect(result.current.index).toBe(3)
  })

  it('pauses while the tab is hidden and resumes when it comes back', () => {
    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    act(() => setDocumentHidden(true))
    tick(2)
    expect(result.current.index).toBe(0)

    act(() => setDocumentHidden(false))
    tick()
    expect(result.current.index).toBe(1)
  })

  it('never advances automatically under reduced motion, but goTo still works', () => {
    vi.unstubAllGlobals()
    installMatchMedia(true)

    const { result } = renderHook(() => useBillboardRotation(4, INTERVAL))

    tick(3)
    expect(result.current.index).toBe(0)
    expect(vi.getTimerCount()).toBe(0)

    act(() => result.current.goTo(2))
    expect(result.current.index).toBe(2)
  })

  it('self-corrects when the count shrinks below the current index', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useBillboardRotation(count, INTERVAL),
      { initialProps: { count: 5 } },
    )

    tick(3)
    expect(result.current.index).toBe(3)

    rerender({ count: 2 })
    expect(result.current.index).toBe(1)
  })

  it('mounts the first slide and one lookahead, not the whole billboard', () => {
    const { result } = renderHook(() => useBillboardRotation(5, INTERVAL))

    expect([...result.current.mountedSlides].sort()).toEqual([0, 1])
  })

  it('grows the mount window as it advances, keeping the outgoing slide', () => {
    const { result } = renderHook(() => useBillboardRotation(5, INTERVAL))

    tick()

    expect([...result.current.mountedSlides].sort()).toEqual([0, 1, 2])
  })

  it('mounts a jumped-to slide and its lookahead', () => {
    const { result } = renderHook(() => useBillboardRotation(5, INTERVAL))

    act(() => result.current.goTo(3))

    expect([...result.current.mountedSlides].sort()).toEqual([0, 1, 3, 4])
  })

  it('wraps the lookahead round to the first slide', () => {
    const { result } = renderHook(() => useBillboardRotation(3, INTERVAL))

    act(() => result.current.goTo(2))

    expect([...result.current.mountedSlides].sort()).toEqual([0, 1, 2])
  })

  it('never drops a slide it has already mounted', () => {
    const { result } = renderHook(() => useBillboardRotation(5, INTERVAL))

    act(() => result.current.goTo(3))
    act(() => result.current.goTo(0))

    expect([...result.current.mountedSlides].sort()).toEqual([0, 1, 3, 4])
  })

  it('clears the interval on unmount', () => {
    const { unmount } = renderHook(() => useBillboardRotation(4, INTERVAL))

    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
