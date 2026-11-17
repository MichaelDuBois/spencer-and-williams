'use client'

import { useMemo } from 'react'

import type { GenericLocation, LatLng } from '@/types/location.types'

const MAP_STYLE_VARIANTS: Record<string, string> = {
  ecommerce: 'mapbox://styles/mapbox/light-v11',
  fashion: 'mapbox://styles/mapbox/light-v11',
}
const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

interface UseMapboxMapOptions {
  locations: GenericLocation[]
  selectedId: string | null
  userCoords: LatLng | null
  verticalSlug: string
}

interface UseMapboxMapReturn {
  mapStyle: string
  flyTo: LatLng | null
  selectedLocation: GenericLocation | null
}

export const useMapboxMap = ({
  locations,
  selectedId,
  userCoords,
  verticalSlug,
}: UseMapboxMapOptions): UseMapboxMapReturn => {
  const selectedLocation = useMemo(
    () => locations.find((l) => l.objectID === selectedId) ?? null,
    [locations, selectedId],
  )

  const mapStyle = MAP_STYLE_VARIANTS[verticalSlug] ?? DEFAULT_MAP_STYLE

  const flyTo = useMemo<LatLng | null>(
    () => selectedLocation?._geoloc ?? userCoords ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity must only change on selection or user-coords change, not on location-list refresh from panning
    [selectedId, userCoords],
  )

  return { mapStyle, flyTo, selectedLocation }
}
