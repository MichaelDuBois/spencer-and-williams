import { describe, expect, it } from 'vitest'

import { getLocationName } from '@/types/location.types'
import type { GenericLocation } from '@/types/location.types'

const loc: GenericLocation = {
  objectID: '1',
  address: '123 Main St',
  name: { ecommerce: 'Ecom Store', fashion: 'Fashion Store' },
  country: 'US',
  city: 'Atlanta',
  _geoloc: { lat: 33.6, lng: -84.4 },
  openingTime: 9,
  closingTime: 21,
}

describe('getLocationName', () => {
  it('returns the name for the ecommerce slug', () => {
    expect(getLocationName(loc, 'ecommerce')).toBe('Ecom Store')
  })

  it('returns the name for the fashion slug', () => {
    expect(getLocationName(loc, 'fashion')).toBe('Fashion Store')
  })
})
