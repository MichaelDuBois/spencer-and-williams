'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { Map, NavigationControl } from 'react-map-gl/mapbox'

import { useMapShell } from '@/hooks/useMapShell'
import type { BoundingBox, LatLng } from '@/types/location.types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/light-v11'
const DEFAULT_INITIAL_ZOOM = 2

interface MapShellProps {
  initialCenter: LatLng
  initialZoom?: number
  mapStyle?: string
  fitBoundsTo?: LatLng[]
  flyTo?: LatLng | null
  locked?: boolean
  animate?: boolean
  onViewportChange?: (bbox: BoundingBox) => void
  children: React.ReactNode
}

export const MapShell = ({
  initialCenter,
  initialZoom = DEFAULT_INITIAL_ZOOM,
  mapStyle = DEFAULT_MAP_STYLE,
  fitBoundsTo,
  flyTo,
  locked = false,
  animate = true,
  onViewportChange,
  children,
}: MapShellProps) => {
  const { mapRef, handleMoveEnd, handleLoad } = useMapShell({
    fitBoundsTo,
    flyTo,
    animate,
    onViewportChange,
  })

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm">
        Map unavailable
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={mapStyle}
      initialViewState={{
        longitude: initialCenter.lng,
        latitude: initialCenter.lat,
        zoom: initialZoom,
      }}
      onLoad={handleLoad}
      onMoveEnd={handleMoveEnd}
      cursor={locked ? 'default' : undefined}
      dragPan={!locked}
      dragRotate={!locked}
      scrollZoom={!locked}
      doubleClickZoom={!locked}
      touchZoomRotate={!locked}
      keyboard={!locked}
      style={{ width: '100%', height: '100%' }}>
      {!locked && <NavigationControl position="top-right" />}
      {children}
    </Map>
  )
}
