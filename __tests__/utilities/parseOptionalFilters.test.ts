import { describe, expect, it } from 'vitest'

import { parseOptionalFilters } from '@/utilities/parseOptionalFilters'

describe('parseOptionalFilters', () => {
  it('parses filters with scores', () => {
    const filters = [
      'brand:Nike<score=5>',
      'brand:adidas<score=5>',
      'hierarchicalCategories.level3:Electronics > Laptops<score=20>',
    ]

    expect(parseOptionalFilters(filters)).toEqual({
      brand: { Nike: 5, adidas: 5 },
      'hierarchicalCategories.level3': { 'Electronics > Laptops': 20 },
    })
  })

  it('defaults to score 1 when no score syntax', () => {
    const filters = ['brand:Nike']

    expect(parseOptionalFilters(filters)).toEqual({
      brand: { Nike: 1 },
    })
  })

  it('handles empty array', () => {
    expect(parseOptionalFilters([])).toEqual({})
  })

  it('skips malformed filters without colon', () => {
    const filters = ['invalid-filter', 'brand:Valid<score=5>']

    expect(parseOptionalFilters(filters)).toEqual({
      brand: { Valid: 5 },
    })
  })

  it('handles values containing colons', () => {
    const filters = ['category:Home > Kitchen: Gadgets<score=10>']

    expect(parseOptionalFilters(filters)).toEqual({
      category: { 'Home > Kitchen: Gadgets': 10 },
    })
  })
})
