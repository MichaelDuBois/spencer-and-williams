import { atom, getDefaultStore } from 'jotai'

import type {
  GeoSearchState,
  LatLng,
  UserLocationState,
} from '@/types/location.types'

export const NYC_FALLBACK: LatLng = { lat: 40.7128, lng: -74.006 }

// Pinned to jotai's global store so these survive the Algolia environment remount.
export const geoSearchStore = getDefaultStore()

export const userLocationAtom = atom<UserLocationState>({
  status: 'loading',
  coords: null,
})

export const geoSearchStateAtom = atom<GeoSearchState>({
  mode: 'radius',
  center: null,
  boundingBox: null,
})

// userLocationAtom is deliberately left alone: browser geolocation is vertical-agnostic.
export const resetGeoSearchStateAtom = atom(null, (_get, set) => {
  set(geoSearchStateAtom, { mode: 'radius', center: null, boundingBox: null })
})
