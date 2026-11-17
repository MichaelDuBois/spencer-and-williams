import { describe, expect, it } from 'vitest'

import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'

const template = ecommerceConfig.algolia.primaryIndex.template!
const slug = 'ecommerce'

const baseHit = {
  objectID: 'P1',
  name: 'Running Shoe',
  brand: 'Acme',
  price: 79.99,
  description: 'A lightweight running shoe',
  category: 'Footwear',
  image: 'shoe.jpg',
}

describe('getEcommerceProductHitValues', () => {
  it('builds the product URL from the slug and objectID', () => {
    const result = getEcommerceProductHitValues(baseHit, template, slug)
    expect(result.productUrl).toBe('/ecommerce/product/P1')
  })

  it('extracts the core string and numeric attributes', () => {
    const result = getEcommerceProductHitValues(baseHit, template, slug)
    expect(result.name).toBe('Running Shoe')
    expect(result.brand).toBe('Acme')
    expect(result.price).toBe(79.99)
    expect(result.description).toBe('A lightweight running shoe')
    expect(result.category).toBe('Footwear')
  })

  it('prefixes the image filename with the configured image host', () => {
    const result = getEcommerceProductHitValues(baseHit, template, slug)
    expect(result.image).toBe(`${template.imageHrefPrefix}shoe.jpg`)
  })

  it('leaves optional attributes undefined when absent from the hit', () => {
    const result = getEcommerceProductHitValues(
      { objectID: 'P2', name: 'Bare Product' },
      template,
      slug,
    )
    expect(result.brand).toBeUndefined()
    expect(result.price).toBeUndefined()
    expect(result.category).toBeUndefined()
    expect(result.image).toBeUndefined()
  })

  it('collects hierarchical category levels into an array', () => {
    const hit = {
      ...baseHit,
      hierarchicalCategories: {
        level0: 'Footwear',
        level1: 'Footwear > Running',
      },
    }
    const result = getEcommerceProductHitValues(hit, template, slug)
    expect(result.hierarchicalCategories).toEqual([
      'Footwear',
      'Footwear > Running',
    ])
  })
})
