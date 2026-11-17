'use client'

import { Marker, Popup } from 'react-map-gl/mapbox'

import { MapShell } from '@/components/map/MapShell'
import { LocationMarker } from '@/components/storeLocator/LocationMarker'
import { LocationPopup } from '@/components/storeLocator/LocationPopup'
import { useMapboxMap } from '@/hooks/useMapboxMap'
import type {
  BoundingBox,
  GenericLocation,
  LatLng,
} from '@/types/location.types'

interface MapboxMapProps {
  locations: GenericLocation[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string | null) => void
  userCoords: LatLng | null
  initialCenter: LatLng
  onViewportChange: (bbox: BoundingBox) => void
  verticalSlug: string
}

const DEFAULT_ZOOM = 11

export const MapboxMap = ({
  locations,
  selectedId,
  hoveredId,
  onSelect,
  userCoords,
  initialCenter,
  onViewportChange,
  verticalSlug,
}: MapboxMapProps) => {
  const { mapStyle, flyTo, selectedLocation } = useMapboxMap({
    locations,
    selectedId,
    userCoords,
    verticalSlug,
  })

  return (
    <MapShell
      initialCenter={initialCenter}
      initialZoom={DEFAULT_ZOOM}
      mapStyle={mapStyle}
      flyTo={flyTo}
      onViewportChange={onViewportChange}>
      {userCoords && (
        <Marker longitude={userCoords.lng} latitude={userCoords.lat}>
          <div className="h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />
        </Marker>
      )}
      {locations.map((loc) => (
        <Marker
          key={loc.objectID}
          longitude={loc._geoloc.lng}
          latitude={loc._geoloc.lat}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            onSelect(loc.objectID)
          }}>
          <LocationMarker
            isHovered={hoveredId === loc.objectID}
            isSelected={selectedId === loc.objectID}
          />
        </Marker>
      ))}
      {selectedLocation && (
        <Popup
          longitude={selectedLocation._geoloc.lng}
          latitude={selectedLocation._geoloc.lat}
          anchor="bottom"
          closeOnClick={false}
          onClose={() => onSelect(null)}
          offset={28}
          className="[&_.mapboxgl-popup-close-button]:px-2 [&_.mapboxgl-popup-close-button]:py-1 [&_.mapboxgl-popup-close-button]:text-lg [&_.mapboxgl-popup-close-button]:leading-none">
          <LocationPopup
            location={selectedLocation}
            verticalSlug={verticalSlug}
          />
        </Popup>
      )}
    </MapShell>
  )
}
