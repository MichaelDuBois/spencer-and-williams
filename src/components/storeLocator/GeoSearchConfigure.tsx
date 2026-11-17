'use client'

import { Configure } from 'react-instantsearch'

import { useGeoSearch } from '@/hooks/useGeoSearch'

const HITS_PER_PAGE = 50

interface GeoSearchConfigureProps {
  extraFilters?: string
}

export const GeoSearchConfigure = ({
  extraFilters,
}: GeoSearchConfigureProps = {}) => {
  const { mode, center, boundingBox } = useGeoSearch()

  const common = {
    hitsPerPage: HITS_PER_PAGE,
    ...(extraFilters !== undefined ? { filters: extraFilters } : {}),
  }

  if (mode === 'radius' && center) {
    return (
      <Configure aroundLatLng={`${center.lat},${center.lng}`} {...common} />
    )
  }

  if (mode === 'boundingBox' && boundingBox) {
    const bboxString = [
      boundingBox.ne.lat,
      boundingBox.ne.lng,
      boundingBox.sw.lat,
      boundingBox.sw.lng,
    ].join(',')
    return <Configure insideBoundingBox={bboxString} {...common} />
  }

  return <Configure {...common} />
}
