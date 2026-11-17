import { renderHook, act } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGeoSearch } from '@/hooks/useGeoSearch'
import { geoSearchStateAtom, geoSearchStore } from '@/stores/geoSearch'

import type { ReactNode } from 'react'

const buildWrapper = () => {
  const store = createStore()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

describe('useGeoSearch', () => {
  beforeEach(() => {
    // The pinned atom lives in jotai's global store, so reset it between tests.
    geoSearchStore.set(geoSearchStateAtom, {
      mode: 'radius',
      center: null,
      boundingBox: null,
    })
  })

  it('starts in radius mode with no center', () => {
    const { result } = renderHook(() => useGeoSearch(), {
      wrapper: buildWrapper(),
    })
    expect(result.current.mode).toBe('radius')
    expect(result.current.center).toBeNull()
    expect(result.current.boundingBox).toBeNull()
  })

  it('setRadiusSearch sets center and clears the bbox', () => {
    const { result } = renderHook(() => useGeoSearch(), {
      wrapper: buildWrapper(),
    })
    act(() => {
      result.current.setBoundingBoxSearch({
        ne: { lat: 41, lng: -73 },
        sw: { lat: 40, lng: -75 },
      })
    })
    act(() => result.current.setRadiusSearch({ lat: 40.7, lng: -74.0 }))
    expect(result.current.mode).toBe('radius')
    expect(result.current.center).toEqual({ lat: 40.7, lng: -74.0 })
    expect(result.current.boundingBox).toBeNull()
  })

  it('setBoundingBoxSearch flips mode to boundingBox and stores the bbox', () => {
    const { result } = renderHook(() => useGeoSearch(), {
      wrapper: buildWrapper(),
    })
    const bbox = {
      ne: { lat: 41, lng: -73 },
      sw: { lat: 40, lng: -75 },
    }
    act(() => result.current.setBoundingBoxSearch(bbox))
    expect(result.current.mode).toBe('boundingBox')
    expect(result.current.boundingBox).toEqual(bbox)
  })

  it('clearGeoSearch resets to initial radius mode with null center and bbox', () => {
    const { result } = renderHook(() => useGeoSearch(), {
      wrapper: buildWrapper(),
    })
    act(() => result.current.setBoundingBoxSearch({
      ne: { lat: 41, lng: -73 },
      sw: { lat: 40, lng: -75 },
    }))
    expect(result.current.boundingBox).not.toBeNull()
    act(() => result.current.clearGeoSearch())
    expect(result.current.mode).toBe('radius')
    expect(result.current.center).toBeNull()
    expect(result.current.boundingBox).toBeNull()
  })
})
