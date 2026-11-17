import { describe, expect, it } from 'vitest'

import { getFurnishingSpecs } from '@/app/furnishing/_utils/getFurnishingSpecs'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'

const makeProduct = (
  overrides: Partial<FurnishingProductHitValues> = {},
): FurnishingProductHitValues =>
  ({
    objectID: '1',
    productUrl: '/furnishing/product/1',
    name: 'Test Sofa',
    ...overrides,
  }) as FurnishingProductHitValues

describe('getFurnishingSpecs', () => {
  it('builds rows in a stable order and drops missing specs', () => {
    const rows = getFurnishingSpecs(
      makeProduct({
        dimensions: '34.65"D x 49.61"W x 38.78"H',
        material: 'Wood',
        frameMaterial: 'Metal',
        upholsteryFabric: 'Velvet',
        roomType: 'Living Room',
        assemblyRequired: 'Yes',
        color: 'Grey',
      }),
    )

    expect(rows).toEqual([
      { label: 'Dimensions', value: '34.65"D x 49.61"W x 38.78"H' },
      { label: 'Material', value: 'Wood' },
      { label: 'Frame Material', value: 'Metal' },
      { label: 'Upholstery Fabric', value: 'Velvet' },
      { label: 'Room Type', value: 'Living Room' },
      { label: 'Assembly Required', value: 'Yes' },
      { label: 'Color', value: 'Grey' },
    ])
  })

  it('drops rows whose value is missing', () => {
    const rows = getFurnishingSpecs(
      makeProduct({ material: 'Wood', color: 'Grey' }),
    )

    expect(rows).toEqual([
      { label: 'Material', value: 'Wood' },
      { label: 'Color', value: 'Grey' },
    ])
  })

  it('returns an empty array when no specs are present', () => {
    expect(getFurnishingSpecs(makeProduct())).toEqual([])
  })
})
