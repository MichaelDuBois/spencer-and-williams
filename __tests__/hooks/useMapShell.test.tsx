import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMapShell } from '@/hooks/useMapShell'

const makeMoveEvent = (originalEvent: object | undefined) =>
  ({
    type: 'moveend',
    target: {},
    originalEvent,
  }) as unknown as Parameters<
    ReturnType<typeof useMapShell>['handleMoveEnd']
  >[0]

describe('useMapShell', () => {
  it('does not call onViewportChange for programmatic moves (no originalEvent)', async () => {
    vi.useFakeTimers()
    const onViewportChange = vi.fn()
    const { result } = renderHook(() =>
      useMapShell({ onViewportChange }),
    )

    act(() => result.current.handleMoveEnd(makeMoveEvent(undefined)))
    act(() => vi.advanceTimersByTime(500))

    expect(onViewportChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('debounces user-initiated move-end and emits bbox once', async () => {
    vi.useFakeTimers()
    const onViewportChange = vi.fn()
    const { result } = renderHook(() =>
      useMapShell({ onViewportChange }),
    )

    // Wire a fake bounds getter through mapRef
    ;(result.current.mapRef as unknown as { current: object }).current = {
      getBounds: () => {return {
        getNorth: () => 41,
        getEast: () => -73,
        getSouth: () => 40,
        getWest: () => -75,
      }},
    }

    act(() => result.current.handleMoveEnd(makeMoveEvent({})))
    act(() => result.current.handleMoveEnd(makeMoveEvent({})))
    act(() => vi.advanceTimersByTime(500))

    expect(onViewportChange).toHaveBeenCalledTimes(1)
    expect(onViewportChange).toHaveBeenCalledWith({
      ne: { lat: 41, lng: -73 },
      sw: { lat: 40, lng: -75 },
    })
    vi.useRealTimers()
  })

  it('clamps out-of-range bbox longitudes to [-180, 180] before emitting', () => {
    vi.useFakeTimers()
    const onViewportChange = vi.fn()
    const { result } = renderHook(() => useMapShell({ onViewportChange }))

    ;(result.current.mapRef as unknown as { current: object }).current = {
      getBounds: () => {return {
        getNorth: () => 80,
        getEast: () => 220,
        getSouth: () => -80,
        getWest: () => -240,
      }},
    }

    act(() => result.current.handleMoveEnd(makeMoveEvent({})))
    act(() => vi.advanceTimersByTime(500))

    expect(onViewportChange).toHaveBeenCalledWith({
      ne: { lat: 80, lng: 180 },
      sw: { lat: -80, lng: -180 },
    })
    vi.useRealTimers()
  })

  it('skips emit when bounds contain non-finite values', () => {
    vi.useFakeTimers()
    const onViewportChange = vi.fn()
    const { result } = renderHook(() => useMapShell({ onViewportChange }))

    ;(result.current.mapRef as unknown as { current: object }).current = {
      getBounds: () => {return {
        getNorth: () => Number.NaN,
        getEast: () => 10,
        getSouth: () => -10,
        getWest: () => -10,
      }},
    }

    act(() => result.current.handleMoveEnd(makeMoveEvent({})))
    act(() => vi.advanceTimersByTime(500))

    expect(onViewportChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('re-fits bounds when fitBoundsTo identity changes (>1 point)', () => {
    const fitBounds = vi.fn()
    const flyTo = vi.fn()
    const fakeMap = { fitBounds, flyTo }

    const { rerender, result } = renderHook(
      ({ points }: { points: { lat: number; lng: number }[] }) =>
        useMapShell({ fitBoundsTo: points }),
      { initialProps: { points: [{ lat: 10, lng: 20 }] } },
    )
    ;(result.current.mapRef as unknown as { current: object }).current = fakeMap
    act(() => result.current.handleLoad())

    rerender({
      points: [
        { lat: 10, lng: 20 },
        { lat: 30, lng: 40 },
      ],
    })

    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('flies to single point when fitBoundsTo has exactly one point', () => {
    const fitBounds = vi.fn()
    const flyTo = vi.fn()
    const fakeMap = { fitBounds, flyTo }

    const { rerender, result } = renderHook(
      ({ points }: { points: { lat: number; lng: number }[] }) =>
        useMapShell({ fitBoundsTo: points }),
      { initialProps: { points: [] as { lat: number; lng: number }[] } },
    )
    ;(result.current.mapRef as unknown as { current: object }).current = fakeMap
    act(() => result.current.handleLoad())

    rerender({ points: [{ lat: 10, lng: 20 }] })

    expect(flyTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [20, 10] }),
    )
    expect(fitBounds).not.toHaveBeenCalled()
  })

  it('queues fitBounds until the map load event fires', () => {
    const fitBounds = vi.fn()
    const flyTo = vi.fn()
    const fakeMap = { fitBounds, flyTo }

    const { rerender, result } = renderHook(
      ({ points }: { points: { lat: number; lng: number }[] | undefined }) =>
        useMapShell({ fitBoundsTo: points }),
      {
        initialProps: { points: undefined } as {
          points: { lat: number; lng: number }[] | undefined
        },
      },
    )
    ;(result.current.mapRef as unknown as { current: object }).current = fakeMap
    rerender({
      points: [
        { lat: 10, lng: 20 },
        { lat: 30, lng: 40 },
      ],
    })

    expect(fitBounds).not.toHaveBeenCalled()

    act(() => result.current.handleLoad())

    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('applies fitBounds with animate:false when animate option is false', () => {
    const fitBounds = vi.fn()
    const flyTo = vi.fn()
    const fakeMap = { fitBounds, flyTo }

    const { rerender, result } = renderHook(
      ({ points }: { points: { lat: number; lng: number }[] | undefined }) =>
        useMapShell({ animate: false, fitBoundsTo: points }),
      {
        initialProps: { points: undefined } as {
          points: { lat: number; lng: number }[] | undefined
        },
      },
    )
    ;(result.current.mapRef as unknown as { current: object }).current = fakeMap
    rerender({
      points: [
        { lat: 10, lng: 20 },
        { lat: 30, lng: 40 },
      ],
    })
    act(() => result.current.handleLoad())

    expect(fitBounds).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ animate: false, duration: 0 }),
    )
  })
})
