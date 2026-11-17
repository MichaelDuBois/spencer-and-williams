import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStagingSyncCountdown } from '@/components/options/hooks/useStagingSyncCountdown'

describe('useStagingSyncCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 8, 12, 13, 15)))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports the wait to the next sync boundary', () => {
    const { result } = renderHook(() => useStagingSyncCountdown(true))

    expect(result.current).toBe('1h 45m')
  })

  it('ticks down as time passes', () => {
    const { result } = renderHook(() => useStagingSyncCountdown(true))

    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(result.current).toBe('1h 44m')
  })

  it('does not tick while inactive', () => {
    const { result } = renderHook(() => useStagingSyncCountdown(false))

    act(() => {
      vi.advanceTimersByTime(300_000)
    })

    expect(result.current).toBe('1h 45m')
  })

  it('resyncs immediately once it becomes active', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useStagingSyncCountdown(isActive),
      { initialProps: { isActive: false } },
    )

    act(() => {
      vi.advanceTimersByTime(120_000)
    })
    expect(result.current).toBe('1h 45m')

    rerender({ isActive: true })
    expect(result.current).toBe('1h 43m')
  })
})
