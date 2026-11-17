import { useMemo } from 'react'

import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { isValidGeoloc } from '@/types/location.types'
import type { LatLng } from '@/types/location.types'

export const BUFFER_RATIO = 0.25
const LAT_CLAMP = 85
const LNG_CLAMP = 180

const collectPoints = (
  article: ArticleHitValues | null | undefined,
  activities: ActivityHitValues[],
): LatLng[] => {
  const points: LatLng[] = []
  if (article && isValidGeoloc(article._geoloc)) points.push(article._geoloc)
  for (const a of activities) {
    if (isValidGeoloc(a._geoloc)) points.push(a._geoloc)
  }
  return points
}

export const useFindDestinationBounds = (
  article: ArticleHitValues | null | undefined,
  activities: ActivityHitValues[],
): LatLng[] | undefined =>
  useMemo(() => {
    const points = collectPoints(article, activities)
    if (points.length < 2) return undefined

    const lats = points.map((p) => p.lat)
    const lngs = points.map((p) => p.lng)
    let latMin = Math.min(...lats)
    let latMax = Math.max(...lats)
    let lngMin = Math.min(...lngs)
    let lngMax = Math.max(...lngs)

    const meanLat = (latMin + latMax) / 2
    const cosLat = Math.cos((meanLat * Math.PI) / 180) || 1
    const latSpan = latMax - latMin
    const lngSpan = (lngMax - lngMin) * cosLat

    if (latSpan > lngSpan) {
      const extra = (latSpan - lngSpan) / 2 / cosLat
      lngMin -= extra
      lngMax += extra
    } else if (lngSpan > latSpan) {
      const extra = (lngSpan - latSpan) / 2
      latMin -= extra
      latMax += extra
    }

    const latHalf = (latMax - latMin) / 2
    const lngHalf = (lngMax - lngMin) / 2
    latMin -= latHalf * BUFFER_RATIO
    latMax += latHalf * BUFFER_RATIO
    lngMin -= lngHalf * BUFFER_RATIO
    lngMax += lngHalf * BUFFER_RATIO

    latMin = Math.max(-LAT_CLAMP, latMin)
    latMax = Math.min(LAT_CLAMP, latMax)
    lngMin = Math.max(-LNG_CLAMP, lngMin)
    lngMax = Math.min(LNG_CLAMP, lngMax)

    const sw = { lat: latMin, lng: lngMin }
    const ne = { lat: latMax, lng: lngMax }

    return [sw, ne]
  }, [article, activities])
