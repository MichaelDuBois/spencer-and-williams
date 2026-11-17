'use client'

import { useMemo, useState } from 'react'
import { Marker } from 'react-map-gl/mapbox'

import { useFindDestinationBounds } from '@/app/travel/_hooks/useFindDestinationBounds'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { ActivityConnections } from '@/app/travel/map/_components/ActivityConnections'
import { TravelActivityMarker } from '@/app/travel/map/_components/TravelActivityMarker'
import { TravelArticleMarker } from '@/app/travel/map/_components/TravelArticleMarker'
import { MapShell } from '@/components/map/MapShell'
import { isValidGeoloc } from '@/types/location.types'
import type { LatLng } from '@/types/location.types'

interface TravelArticleMapProps {
  article: ArticleHitValues
  activities: ActivityHitValues[]
  isLoading: boolean
}

const FIGURE_CLASSES =
  'bg-card border-border rounded-image mb-6 aspect-square w-full overflow-hidden border lg:float-right lg:mb-4 lg:ml-6 lg:w-[280px]'

export const TravelArticleMap = ({
  article,
  activities,
  isLoading,
}: TravelArticleMapProps) => {
  const placeableActivities = useMemo(
    () => activities.filter((a) => isValidGeoloc(a._geoloc)),
    [activities],
  )
  const bounds = useFindDestinationBounds(article, placeableActivities)
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(
    null,
  )

  if (isLoading) {
    return (
      <figure className={FIGURE_CLASSES}>
        <div className="bg-muted h-full w-full animate-pulse" />
      </figure>
    )
  }

  if (!isValidGeoloc(article._geoloc) || placeableActivities.length === 0) {
    return null
  }

  const articleGeoloc = article._geoloc as LatLng

  return (
    <figure className={FIGURE_CLASSES}>
      <MapShell
        initialCenter={articleGeoloc}
        fitBoundsTo={bounds}
        locked
        animate={false}>
        <Marker
          longitude={articleGeoloc.lng}
          latitude={articleGeoloc.lat}
          anchor="bottom">
          <TravelArticleMarker isHovered={false} isSelected={false} />
        </Marker>

        <ActivityConnections
          articleGeoloc={articleGeoloc}
          activities={placeableActivities}
        />

        {placeableActivities.map((activity) => (
          <Marker
            key={activity.objectID}
            longitude={(activity._geoloc as LatLng).lng}
            latitude={(activity._geoloc as LatLng).lat}>
            <TravelActivityMarker
              activity={activity}
              isHovered={hoveredActivityId === activity.objectID}
              onHover={setHoveredActivityId}
              portalPopup
            />
          </Marker>
        ))}
      </MapShell>
    </figure>
  )
}
