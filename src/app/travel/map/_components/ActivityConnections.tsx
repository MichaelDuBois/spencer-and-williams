'use client'

import { Layer, Source } from 'react-map-gl/mapbox'

import type { ActivityHitValues } from '@/app/travel/hitValues.types'
import { isValidGeoloc } from '@/types/location.types'
import type { LatLng } from '@/types/location.types'

import type { FeatureCollection, LineString } from 'geojson'

const SOURCE_ID = 'travel-activity-connections'

export const buildConnectionGeoJSON = (
  articleGeoloc: LatLng | null,
  activities: ActivityHitValues[],
): FeatureCollection<LineString> => {
  if (!isValidGeoloc(articleGeoloc)) {
    return { type: 'FeatureCollection', features: [] }
  }
  const features = activities
    .filter((a): a is ActivityHitValues & { _geoloc: LatLng } =>
      isValidGeoloc(a._geoloc),
    )
    .map((a) => {
      return {
        type: 'Feature' as const,
        properties: { activityId: a.objectID },
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [articleGeoloc.lng, articleGeoloc.lat],
            [a._geoloc.lng, a._geoloc.lat],
          ],
        },
      }
    })
  return { type: 'FeatureCollection', features }
}

interface ActivityConnectionsProps {
  articleGeoloc: LatLng | null
  activities: ActivityHitValues[]
}

export const ActivityConnections = ({
  articleGeoloc,
  activities,
}: ActivityConnectionsProps) => {
  const data = buildConnectionGeoJSON(articleGeoloc, activities)
  if (data.features.length === 0) return null
  return (
    <Source id={SOURCE_ID} type="geojson" data={data}>
      <Layer
        id={`${SOURCE_ID}-line`}
        type="line"
        paint={{
          'line-color': '#9ca3af',
          'line-width': 1.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.9,
        }}
      />
    </Source>
  )
}
