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
import type { BoundingBox, LatLng } from '@/types/location.types'

const INITIAL_CENTER: LatLng = { lat: 20, lng: 0 }
const INITIAL_ZOOM = 2

interface TravelMapProps {
  articles: ArticleHitValues[]
  activities: ActivityHitValues[]
  selectedArticleId: string | null
  hoveredArticleId: string | null
  hoveredActivityId: string | null
  onSelectArticle: (id: string | null) => void
  onHoverArticle: (id: string | null) => void
  onHoverActivity: (id: string | null) => void
  onViewportChange: (bbox: BoundingBox) => void
}

export const TravelMap = ({
  articles,
  activities,
  selectedArticleId,
  hoveredArticleId,
  hoveredActivityId,
  onSelectArticle,
  onHoverArticle,
  onHoverActivity,
  onViewportChange,
}: TravelMapProps) => {
  const placeableArticles = useMemo(
    () => articles.filter((a) => isValidGeoloc(a._geoloc)),
    [articles],
  )
  const placeableActivities = useMemo(
    () => activities.filter((a) => isValidGeoloc(a._geoloc)),
    [activities],
  )

  const [initialFitBounds, setInitialFitBounds] = useState<
    LatLng[] | undefined
  >(undefined)
  if (initialFitBounds === undefined && placeableArticles.length > 0) {
    setInitialFitBounds(placeableArticles.map((a) => a._geoloc as LatLng))
  }

  const selectedArticle = articles.find((a) => a.objectID === selectedArticleId)
  const selectedGeoloc = isValidGeoloc(selectedArticle?._geoloc)
    ? selectedArticle._geoloc
    : null

  const computedSelectionBounds = useFindDestinationBounds(
    selectedArticle,
    placeableActivities,
  )

  const [latchedSelection, setLatchedSelection] = useState<{
    id: string
    bounds: LatLng[]
  } | null>(null)

  let nextLatched = latchedSelection
  if (!selectedArticleId) {
    nextLatched = null
  } else if (
    computedSelectionBounds &&
    latchedSelection?.id !== selectedArticleId
  ) {
    nextLatched = { id: selectedArticleId, bounds: computedSelectionBounds }
  }
  if (nextLatched !== latchedSelection) {
    setLatchedSelection(nextLatched)
  }

  const selectionBounds = nextLatched?.bounds

  return (
    <MapShell
      initialCenter={INITIAL_CENTER}
      initialZoom={INITIAL_ZOOM}
      fitBoundsTo={selectionBounds ?? initialFitBounds}
      onViewportChange={onViewportChange}>
      {placeableArticles.map((article) => (
        <Marker
          key={article.objectID}
          longitude={(article._geoloc as LatLng).lng}
          latitude={(article._geoloc as LatLng).lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            onSelectArticle(article.objectID)
          }}>
          <div
            onMouseEnter={() => onHoverArticle(article.objectID)}
            onMouseLeave={() => onHoverArticle(null)}>
            <TravelArticleMarker
              isHovered={hoveredArticleId === article.objectID}
              isSelected={selectedArticleId === article.objectID}
            />
          </div>
        </Marker>
      ))}

      {selectedGeoloc && placeableActivities.length > 0 && (
        <ActivityConnections
          articleGeoloc={selectedGeoloc}
          activities={placeableActivities}
        />
      )}

      {placeableActivities.map((activity) => (
        <Marker
          key={activity.objectID}
          longitude={(activity._geoloc as LatLng).lng}
          latitude={(activity._geoloc as LatLng).lat}
          style={{
            zIndex: hoveredActivityId === activity.objectID ? 10 : undefined,
          }}>
          <TravelActivityMarker
            activity={activity}
            isHovered={hoveredActivityId === activity.objectID}
            onHover={onHoverActivity}
          />
        </Marker>
      ))}
    </MapShell>
  )
}
