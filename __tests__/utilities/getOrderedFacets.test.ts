import { describe, expect, it } from 'vitest'

import type { FacetConfig } from '@/types'
import { getOrderedFacets } from '@/utilities/getOrderedFacets'

const facets: FacetConfig[] = [
  { attribute: 'brand', label: 'Brand', type: 'refinement' },
  { attribute: 'color', label: 'Color', type: 'color' },
  {
    attribute: ['hierarchy.lvl0', 'hierarchy.lvl1'],
    label: 'Category',
    type: 'hierarchical',
  },
  { attribute: 'price', label: 'Price', type: 'slider' },
]

describe('getOrderedFacets', () => {
  it('returns the original facets when attributesToRender is empty', () => {
    expect(getOrderedFacets(facets, [])).toBe(facets)
  })

  it('reorders facets to match attributesToRender', () => {
    const result = getOrderedFacets(facets, ['price', 'brand'])
    expect(result.map((f) => f.label)).toEqual(['Price', 'Brand'])
  })

  it('matches hierarchical facets by their first-level attribute', () => {
    const result = getOrderedFacets(facets, ['hierarchy.lvl0'])
    expect(result).toEqual([
      {
        attribute: ['hierarchy.lvl0', 'hierarchy.lvl1'],
        label: 'Category',
        type: 'hierarchical',
      },
    ])
  })

  it('drops attributes that have no matching facet config', () => {
    const result = getOrderedFacets(facets, ['brand', 'unknown', 'color'])
    expect(result.map((f) => f.label)).toEqual(['Brand', 'Color'])
  })
})
