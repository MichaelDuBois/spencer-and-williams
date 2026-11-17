import { describe, expect, it } from 'vitest'

import { buildIndexContext } from '@/features/aiAssistant/utils/buildIndexContext'
import type { FacetConfig } from '@/types'

const facets: FacetConfig[] = [
  {
    attribute: [
      'hierarchical_categories.lvl0',
      'hierarchical_categories.lvl1',
      'hierarchical_categories.lvl2',
    ],
    label: 'Category',
    type: 'hierarchical',
  },
  { attribute: 'brand', label: 'Brand', type: 'refinement' },
  { attribute: 'color.filter_group', label: 'Color', type: 'color' },
  { attribute: 'available_sizes', label: 'Size', type: 'size' },
  { attribute: 'price.value', label: 'Price', type: 'slider' },
]

const facetValues = {
  'hierarchical_categories.lvl0': { Women: 400, Men: 300 },
  'hierarchical_categories.lvl1': { 'Women > Dresses': 120 },
  brand: { Nike: 10, Adidas: 50 },
  'color.filter_group': { 'Blue;#0000ff': 30, 'Black;#000000': 90 },
  available_sizes: { '10': 5, '8': 40 },
}

const facetStats = { 'price.value': { min: 9.99, max: 1899 } }

describe('buildIndexContext', () => {
  it('quotes string facet values and orders them by descending count', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain('brand: "Adidas", "Nike"')
  })

  it('uses only the lvl0 attribute for hierarchical facets', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain('hierarchical_categories.lvl0: "Women", "Men"')
    expect(context).not.toContain('hierarchical_categories.lvl1')
    expect(context).not.toContain('hierarchical_categories.lvl2')
  })

  it('renders slider facets as a numeric min/max range', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain('price.value (numeric): min 9.99, max 1899')
    expect(context).not.toContain('price.value: "')
  })

  it('keeps colour values verbatim, including the hex suffix', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain(
      'color.filter_group: "Black;#000000", "Blue;#0000ff"',
    )
  })

  it('orders numeric-looking string values by count, not numerically', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain('available_sizes: "8", "10"')
  })

  it('skips facets that are configured but absent from the response', () => {
    const context = buildIndexContext(facets, { brand: { Nike: 1 } })
    expect(context).toContain('brand: "Nike"')
    expect(context).not.toContain('available_sizes')
    expect(context).not.toContain('price.value')
  })

  it('skips slider facets whose stats are missing a bound', () => {
    const context = buildIndexContext(
      [{ attribute: 'price.value', label: 'Price', type: 'slider' }],
      {},
      { 'price.value': { min: 5 } },
    )
    expect(context).toBeNull()
  })

  it('returns null when no facet produces a line', () => {
    expect(buildIndexContext(facets, {}, {})).toBeNull()
    expect(buildIndexContext([], facetValues, facetStats)).toBeNull()
  })

  it('instructs the agent to use the listed values verbatim', () => {
    const context = buildIndexContext(facets, facetValues, facetStats)
    expect(context).toContain('[Index context:')
    expect(context).toContain('`filters`')
    expect(context?.endsWith(']')).toBe(true)
  })

  it('quotes attribute names containing whitespace on value lines', () => {
    const context = buildIndexContext(
      [
        { attribute: 'attrs.Room Type', label: 'Room', type: 'refinement' },
        { attribute: 'brand', label: 'Brand', type: 'refinement' },
      ],
      {
        'attrs.Room Type': { 'Living Room': 400, Bedroom: 100 },
        brand: { Nike: 10 },
      },
    )

    expect(context).toContain('"attrs.Room Type": "Living Room", "Bedroom"')
    expect(context).not.toContain('attrs.Room Type: "')
    expect(context).toContain('brand: "Nike"')
  })

  it('quotes attribute names containing whitespace on numeric range lines', () => {
    const context = buildIndexContext(
      [{ attribute: 'attrs.Seat Height', label: 'Seat height', type: 'slider' }],
      {},
      { 'attrs.Seat Height': { min: 40, max: 90 } },
    )

    expect(context).toContain('"attrs.Seat Height" (numeric): min 40, max 90')
    expect(context).not.toContain('attrs.Seat Height (numeric)')
  })
})
