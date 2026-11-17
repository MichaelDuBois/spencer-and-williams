import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRangeSlider } from '@/hooks/useRangeSlider'

const refine = vi.fn()
const useRangeMock = vi.fn()

vi.mock('react-instantsearch', () => {return {
  useRange: () => useRangeMock(),
}})

const setRange = (overrides: Record<string, unknown> = {}) => {
  useRangeMock.mockReturnValue({
    start: [20, 80],
    range: { min: 0, max: 100 },
    canRefine: true,
    refine,
    ...overrides,
  })
}

const changeEvent = (value: number) =>
  ({ target: { value: String(value) } }) as React.ChangeEvent<HTMLInputElement>

describe('useRangeSlider', () => {
  beforeEach(() => {
    refine.mockReset()
    setRange()
  })

  it('uses the finite Algolia start values', () => {
    const { result } = renderHook(() => useRangeSlider())
    expect(result.current.currentMin).toBe(20)
    expect(result.current.currentMax).toBe(80)
  })

  it('falls back to the range bounds when start is +/-Infinity', () => {
    setRange({ start: [-Infinity, Infinity] })
    const { result } = renderHook(() => useRangeSlider())
    expect(result.current.currentMin).toBe(0)
    expect(result.current.currentMax).toBe(100)
  })

  it('defaults the range to 0–1000 when Algolia provides no bounds', () => {
    setRange({ start: [undefined, undefined], range: {} })
    const { result } = renderHook(() => useRangeSlider())
    expect(result.current.rangeMin).toBe(0)
    expect(result.current.rangeMax).toBe(1000)
  })

  it('prevents the min handle from crossing the max', () => {
    const { result } = renderHook(() => useRangeSlider())
    act(() => result.current.handleMinChange(changeEvent(90)))
    expect(result.current.currentMin).toBe(79) // clamped to currentMax - 1
  })

  it('prevents the max handle from crossing the min', () => {
    const { result } = renderHook(() => useRangeSlider())
    act(() => result.current.handleMaxChange(changeEvent(10)))
    expect(result.current.currentMax).toBe(21) // clamped to currentMin + 1
  })

  it('refines with the dragged values on commit and resets the drag', () => {
    const { result } = renderHook(() => useRangeSlider())
    act(() => result.current.handleMinChange(changeEvent(30)))
    act(() => result.current.handleCommit())
    expect(refine).toHaveBeenCalledWith([30, 80])
  })

  it('does not refine on commit when nothing was dragged', () => {
    const { result } = renderHook(() => useRangeSlider())
    act(() => result.current.handleCommit())
    expect(refine).not.toHaveBeenCalled()
  })

  it('computes the fill positions as percentages of the range', () => {
    setRange({ start: [25, 75] })
    const { result } = renderHook(() => useRangeSlider())
    expect(result.current.minPercent).toBe(25)
    expect(result.current.maxPercent).toBe(75)
  })

  it('passes canRefine through', () => {
    setRange({ canRefine: false })
    const { result } = renderHook(() => useRangeSlider())
    expect(result.current.canRefine).toBe(false)
  })
})
