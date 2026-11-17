'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { geoSearchStateAtom, geoSearchStore } from '@/stores/geoSearch'
import type { BoundingBox, GeoMode, LatLng } from '@/types/location.types'

export interface UseGeoSearchReturn {
  mode: GeoMode
  center: LatLng | null
  boundingBox: BoundingBox | null
  setRadiusSearch: (center: LatLng) => void
  setBoundingBoxSearch: (bbox: BoundingBox) => void
  clearGeoSearch: () => void
}

export const useGeoSearch = (): UseGeoSearchReturn => {
  const [state, setState] = useAtom(geoSearchStateAtom, {
    store: geoSearchStore,
  })

  const setRadiusSearch = useCallback(
    (center: LatLng) =>
      setState({
        mode: 'radius',
        center,
        boundingBox: null,
      }),
    [setState],
  )

  const setBoundingBoxSearch = useCallback(
    (boundingBox: BoundingBox) =>
      setState((prev) => {
        return { ...prev, mode: 'boundingBox', boundingBox }
      }),
    [setState],
  )

  const clearGeoSearch = useCallback(
    () => setState({ mode: 'radius', center: null, boundingBox: null }),
    [setState],
  )

  return {
    mode: state.mode,
    center: state.center,
    boundingBox: state.boundingBox,
    setRadiusSearch,
    setBoundingBoxSearch,
    clearGeoSearch,
  }
}
