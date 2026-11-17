import { describe, expect, it } from 'vitest'

import { getDietaryTags } from '@/app/grocery/_utils/getDietaryTags'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'

const makeProduct = (
  overrides: Partial<GroceryProductHitValues> = {},
): GroceryProductHitValues =>
  ({
    objectID: '1',
    productUrl: '/grocery/product/1',
    name: 'Test Product',
    ...overrides,
  }) as GroceryProductHitValues

describe('getDietaryTags', () => {
  it('maps known dietary considerations to display labels', () => {
    const product = makeProduct({
      semanticAttributes: {
        dietaryConsiderations: ['vegan', 'gluten_free'],
      },
    })

    expect(getDietaryTags(product)).toEqual(['Vegan', 'Gluten-Free'])
  })

  it('title-cases unknown dietary considerations', () => {
    const product = makeProduct({
      semanticAttributes: {
        dietaryConsiderations: ['low_sodium'],
      },
    })

    expect(getDietaryTags(product)).toEqual(['Low Sodium'])
  })

  it('picks up known tags from keywords', () => {
    const product = makeProduct({
      keywords: ['organic', 'fresh'],
    })

    expect(getDietaryTags(product)).toEqual(['Organic'])
  })

  it('deduplicates tags from both sources', () => {
    const product = makeProduct({
      semanticAttributes: {
        dietaryConsiderations: ['organic'],
      },
      keywords: ['organic'],
    })

    expect(getDietaryTags(product)).toEqual(['Organic'])
  })

  it('returns empty array when product has no dietary data', () => {
    expect(getDietaryTags(makeProduct())).toEqual([])
  })

  it('handles case-insensitive matching', () => {
    const product = makeProduct({
      semanticAttributes: {
        dietaryConsiderations: ['VEGAN', 'Keto'],
      },
    })

    expect(getDietaryTags(product)).toEqual(['Vegan', 'Keto'])
  })
})
