import { describe, expect, it } from 'vitest'

import { getRelatedProductsFilter } from '@/app/fashion/_utils/getRelatedProductsFilter'

describe('getRelatedProductsFilter', () => {
  it('builds the filter from the configured related products attribute', () => {
    expect(getRelatedProductsFilter('M0E20000000DU05')).toBe(
      'related_products:"M0E20000000DU05"',
    )
  })

  it('escapes quotes in the objectID so the filter stays valid', () => {
    expect(getRelatedProductsFilter('M0E"DU05')).toBe(
      'related_products:"M0E\\"DU05"',
    )
  })

  it('escapes backslashes in the objectID', () => {
    expect(getRelatedProductsFilter('M0E\\DU05')).toBe(
      'related_products:"M0E\\\\DU05"',
    )
  })

  it('returns undefined without a product objectID', () => {
    expect(getRelatedProductsFilter('')).toBeUndefined()
  })
})
