export interface LatLng {
  lat: number
  lng: number
}

export interface StoreAvailability {
  objectID: string
  inStock: boolean
}

export interface BoundingBox {
  ne: LatLng
  sw: LatLng
}

export interface GenericLocation {
  objectID: string
  address: string
  name: Record<string, string>
  country: string
  city: string
  _geoloc: LatLng
  openingTime: number
  closingTime: number
}

export const getLocationName = (loc: GenericLocation, slug: string): string =>
  loc.name[slug]

export const isValidGeoloc = (
  geoloc: LatLng | undefined | null,
): geoloc is LatLng =>
  !!geoloc && Number.isFinite(geoloc.lat) && Number.isFinite(geoloc.lng)

export type LocationStatus = 'loading' | 'granted' | 'denied'

export interface UserLocationState {
  status: LocationStatus
  coords: LatLng | null
}

export type GeoMode = 'radius' | 'boundingBox'

export interface GeoSearchState {
  mode: GeoMode
  center: LatLng | null
  boundingBox: BoundingBox | null
}
