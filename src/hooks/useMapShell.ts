'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { BoundingBox, LatLng } from '@/types/location.types'

import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox'

const MOVE_DEBOUNCE_MS = 400
const SINGLE_POINT_ZOOM = 11
const FIT_PADDING = 48
const FIT_DURATION_MS = 3200

const clampLng = (lng: number) => Math.min(180, Math.max(-180, lng))

interface UseMapShellOptions {
  fitBoundsTo?: LatLng[]
  flyTo?: LatLng | null
  animate?: boolean
  onViewportChange?: (bbox: BoundingBox) => void
}

interface UseMapShellReturn {
  mapRef: React.RefObject<MapRef | null>
  handleMoveEnd: (event: ViewStateChangeEvent) => void
  handleLoad: () => void
}

export const useMapShell = ({
  fitBoundsTo,
  flyTo,
  animate = true,
  onViewportChange,
}: UseMapShellOptions): UseMapShellReturn => {
  const mapRef = useRef<MapRef | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapLoadedRef = useRef(false)
  const pendingFitBoundsRef = useRef<LatLng[] | null>(null)
  const pendingFlyToRef = useRef<LatLng | null>(null)
  const animateRef = useRef(animate)

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const applyFit = useCallback((points: LatLng[]) => {
    const map = mapRef.current
    if (!map || points.length === 0) return
    const shouldAnimate = animateRef.current
    if (points.length === 1) {
      map.flyTo({
        center: [points[0].lng, points[0].lat],
        zoom: SINGLE_POINT_ZOOM,
        animate: shouldAnimate,
        duration: shouldAnimate ? undefined : 0,
      })
      return
    }
    const lats = points.map((p) => p.lat)
    const lngs = points.map((p) => p.lng)
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: FIT_PADDING,
        duration: shouldAnimate ? FIT_DURATION_MS : 0,
        animate: shouldAnimate,
      },
    )
  }, [])

  const applyFly = useCallback((point: LatLng) => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({
      center: [point.lng, point.lat],
      zoom: SINGLE_POINT_ZOOM,
    })
  }, [])

  useEffect(() => {
    if (!fitBoundsTo || fitBoundsTo.length === 0) return
    pendingFitBoundsRef.current = fitBoundsTo
    if (mapLoadedRef.current) applyFit(fitBoundsTo)
  }, [fitBoundsTo, applyFit])

  useEffect(() => {
    if (!flyTo) return
    pendingFlyToRef.current = flyTo
    if (mapLoadedRef.current) applyFly(flyTo)
  }, [flyTo, applyFly])

  const handleMoveEnd = (event: ViewStateChangeEvent) => {
    if (!('originalEvent' in event) || !event.originalEvent) return
    if (!onViewportChange) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const bounds = mapRef.current?.getBounds()
      if (!bounds) return
      const north = bounds.getNorth()
      const south = bounds.getSouth()
      const east = bounds.getEast()
      const west = bounds.getWest()
      if (
        !Number.isFinite(north) ||
        !Number.isFinite(south) ||
        !Number.isFinite(east) ||
        !Number.isFinite(west)
      ) {
        return
      }
      onViewportChange({
        ne: { lat: north, lng: clampLng(east) },
        sw: { lat: south, lng: clampLng(west) },
      })
    }, MOVE_DEBOUNCE_MS)
  }

  const handleLoad = () => {
    mapLoadedRef.current = true
    if (pendingFitBoundsRef.current) {
      applyFit(pendingFitBoundsRef.current)
      pendingFitBoundsRef.current = null
    } else if (pendingFlyToRef.current) {
      applyFly(pendingFlyToRef.current)
      pendingFlyToRef.current = null
    }
  }

  return { mapRef, handleMoveEnd, handleLoad }
}
