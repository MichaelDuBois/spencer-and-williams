import { describe, expect, it } from 'vitest'

import { buildConnectionGeoJSON } from '@/app/travel/map/_components/ActivityConnections'

describe('buildConnectionGeoJSON', () => {
  it('produces empty FeatureCollection when no article geoloc', () => {
    const result = buildConnectionGeoJSON(null, [
      { objectID: 'a', productUrl: '', title: 'A', _geoloc: { lat: 1, lng: 2 } },
    ])
    expect(result.features).toEqual([])
  })

  it('produces one LineString per activity with _geoloc', () => {
    const result = buildConnectionGeoJSON(
      { lat: 10, lng: 20 },
      [
        {
          objectID: 'a',
          productUrl: '',
          title: 'A',
          _geoloc: { lat: 11, lng: 21 },
        },
        { objectID: 'b', productUrl: '', title: 'B' },
        {
          objectID: 'c',
          productUrl: '',
          title: 'C',
          _geoloc: { lat: 12, lng: 22 },
        },
        {
          objectID: 'd',
          productUrl: '',
          title: 'D',
          _geoloc: { lat: Number.NaN, lng: 23 },
        },
      ],
    )
    expect(result.features).toHaveLength(2)
    expect(result.features[0].properties).toEqual({ activityId: 'a' })
    expect(result.features[0].geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [20, 10],
        [21, 11],
      ],
    })
    expect(result.features[1].properties).toEqual({ activityId: 'c' })
    expect(result.features[1].geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [20, 10],
        [22, 12],
      ],
    })
  })
})
