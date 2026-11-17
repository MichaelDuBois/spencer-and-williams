'use client'

import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { geoSearchStore, userLocationAtom } from '@/stores/geoSearch'
import type { LatLng, LocationStatus } from '@/types/location.types'

export interface UseUserLocationOptions {
  autoRequest?: boolean
}

export interface UseUserLocationReturn {
  status: LocationStatus
  coords: LatLng | null
  requestLocation: () => void
}

export const useUserLocation = ({
  autoRequest = false,
}: UseUserLocationOptions = {}): UseUserLocationReturn => {
  const [state, setState] = useAtom(userLocationAtom, { store: geoSearchStore })

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'denied', coords: null })
      return
    }
    setState((prev) => {
      return { ...prev, status: 'loading' }
    })
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          status: 'granted',
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }),
      () => setState({ status: 'denied', coords: null }),
    )
  }, [setState])

  useEffect(() => {
    if (autoRequest && state.status === 'loading' && state.coords === null) {
      requestLocation()
    }
    // intentionally only triggered on mount + autoRequest change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRequest])

  return {
    status: state.status,
    coords: state.coords,
    requestLocation,
  }
}
