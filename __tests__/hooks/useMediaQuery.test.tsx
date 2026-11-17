import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import { installMatchMedia } from '../helpers/matchMedia'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('returns the current match state', () => {
    installMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))
    expect(result.current).toBe(true)
  })

  it('updates when the media query change event fires', () => {
    const mq = installMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))
    expect(result.current).toBe(false)

    act(() => mq.emit(true))
    expect(result.current).toBe(true)
  })

  it('removes its listener on unmount', () => {
    const mq = installMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 1023px)'))
    expect(mq.listeners.size).toBe(1)
    unmount()
    expect(mq.listeners.size).toBe(0)
  })
})
