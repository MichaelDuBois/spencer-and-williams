import { describe, expect, it } from 'vitest'

import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'

const template = fashionConfig.algolia.primaryIndex.template!
const slug = 'fashion'

const baseHit = {
  objectID: 'CURRENT',
  name: 'Test Product',
  color: { filter_group: 'brown;#6c442c', original_name: 'mocha' },
}

// The colorVariants logic itself is covered in getColorVariants.test.ts.
// Here we only assert that the extractor wires it through correctly.
describe('getFashionProductHitValues — colorVariants wiring', () => {
  it('surfaces structured colorVariants from the extracted hit', () => {
    const hit = {
      ...baseHit,
      variants: [
        {
          objectID: 'CURRENT',
          color: { filter_group: 'brown;#6c442c', original_name: 'mocha' },
          image_urls: ['mocha-0.jpg'],
          price: 137.5,
        },
        {
          objectID: 'V_BLUE',
          color: { filter_group: 'blue;#0075BB', original_name: 'cobalt' },
          image_urls: ['cobalt-0.jpg'],
          price: 131.25,
        },
      ],
    }

    const result = getFashionProductHitValues(hit, template, slug)

    expect(result.colorVariants).toEqual([
      {
        objectID: 'CURRENT',
        hex: '#6c442c',
        name: 'mocha',
        href: '/fashion/product/CURRENT',
        image: 'mocha-0.jpg',
        price: 137.5,
      },
      {
        objectID: 'V_BLUE',
        hex: '#0075BB',
        name: 'cobalt',
        href: '/fashion/product/V_BLUE',
        image: 'cobalt-0.jpg',
        price: 131.25,
      },
    ])
  })

  it('leaves colorVariants undefined when the hit has no variants', () => {
    expect(
      getFashionProductHitValues(baseHit, template, slug).colorVariants,
    ).toBeUndefined()
  })
})

describe('getFashionProductHitValues — productInfo', () => {
  it('extracts product_info into productInfo with the nested shape', () => {
    const product_info = {
      care_instructions: ['Machine wash cold', 'Do not bleach'],
      composition: '90% Polyester, 10% Spandex',
      country_of_origin: 'Made in Portugal',
      features: ['Short sleeves', 'Lightweight fabric'],
      fit: 'Slim fit',
      season: 'Spring/Summer',
    }

    const result = getFashionProductHitValues(
      { ...baseHit, product_info },
      template,
      slug,
    )

    expect(result.productInfo).toEqual(product_info)
  })

  it('returns undefined when product_info is missing', () => {
    expect(
      getFashionProductHitValues(baseHit, template, slug).productInfo,
    ).toBeUndefined()
  })
})
