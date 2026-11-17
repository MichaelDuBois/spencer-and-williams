import { describe, expect, it } from 'vitest'

import { getB2BWarehouseSpecs } from '@/app/b2b-warehouse/_utils/getB2BWarehouseSpecs'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'

const makeProduct = (
  overrides: Partial<B2BWarehouseProductHitValues> = {},
): B2BWarehouseProductHitValues =>
  ({
    objectID: '1',
    productUrl: '/b2b-warehouse/product/1',
    name: 'Test Product',
    ...overrides,
  }) as B2BWarehouseProductHitValues

describe('getB2BWarehouseSpecs', () => {
  it('maps info entries to label/value rows preserving key order', () => {
    const rows = getB2BWarehouseSpecs(
      makeProduct({
        info: { Length: '12 in', Shape: 'Flat', Width: '1-3/16 in' },
      }),
    )
    expect(rows).toEqual([
      { label: 'Length', value: '12 in' },
      { label: 'Shape', value: 'Flat' },
      { label: 'Width', value: '1-3/16 in' },
    ])
  })

  it('drops entries with empty or whitespace values', () => {
    const rows = getB2BWarehouseSpecs(
      makeProduct({ info: { Length: '12 in', Shape: '', Width: '   ' } }),
    )
    expect(rows).toEqual([{ label: 'Length', value: '12 in' }])
  })

  it('returns an empty array when info is absent', () => {
    expect(getB2BWarehouseSpecs(makeProduct())).toEqual([])
  })
})
