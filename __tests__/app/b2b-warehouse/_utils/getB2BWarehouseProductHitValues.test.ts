import { describe, expect, it } from 'vitest'

import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'

const template = b2bWarehouseConfig.algolia.primaryIndex.template!
const slug = 'b2b-warehouse'

const baseHit = {
  objectID: 'SKU1',
  sku: 'BH-1360G-062',
  name: 'Bahco Hand File',
  brand: 'BAHCO',
  price: 16.01,
  description: 'A flat hand file for metalwork',
  category: 'Files',
  image: 'https://flagship-b2b-images.s3.amazonaws.com/Bahco_1.jpg',
  reviews: { count: 12, rating: 4 },
  info: {
    Series: '1360G',
    'Overall Length': '62 mm',
    Shank: '0.1935 in',
  },
}

describe('getB2BWarehouseProductHitValues', () => {
  it('builds the product URL from the slug and objectID', () => {
    const result = getB2BWarehouseProductHitValues(baseHit, template, slug)
    expect(result.productUrl).toBe('/b2b-warehouse/product/SKU1')
  })

  it('extracts the core string and numeric attributes', () => {
    const result = getB2BWarehouseProductHitValues(baseHit, template, slug)
    expect(result.name).toBe('Bahco Hand File')
    expect(result.sku).toBe('BH-1360G-062')
    expect(result.brand).toBe('BAHCO')
    expect(result.price).toBe(16.01)
    expect(result.description).toBe('A flat hand file for metalwork')
    expect(result.category).toBe('Files')
  })

  it('joins array-valued SKUs from the configured attribute for display', () => {
    const nestedTemplate = {
      ...template,
      attributes: { ...template.attributes, sku: 'product.sku' },
    }
    const result = getB2BWarehouseProductHitValues(
      {
        ...baseHit,
        product: { sku: ['1412', 'PRO75680', 'PRO75682'] },
      },
      nestedTemplate,
      slug,
    )

    expect(result.sku).toBe('1412, PRO75680, PRO75682')
  })

  it('passes through the full image URL (empty prefix)', () => {
    const result = getB2BWarehouseProductHitValues(baseHit, template, slug)
    expect(result.image).toBe(
      'https://flagship-b2b-images.s3.amazonaws.com/Bahco_1.jpg',
    )
  })

  it('leaves optional attributes undefined when absent from the hit', () => {
    const result = getB2BWarehouseProductHitValues(
      { objectID: 'SKU2', name: 'Bare Product' },
      template,
      slug,
    )
    expect(result.brand).toBeUndefined()
    expect(result.price).toBeUndefined()
    expect(result.category).toBeUndefined()
    expect(result.image).toBeUndefined()
    expect(result.sku).toBeUndefined()
  })

  it('coerces a string price to a number', () => {
    const result = getB2BWarehouseProductHitValues(
      { ...baseHit, price: '14.74' },
      template,
      slug,
    )
    expect(result.price).toBe(14.74)
    expect(typeof result.price).toBe('number')
  })

  it('returns undefined for a non-numeric price', () => {
    const result = getB2BWarehouseProductHitValues(
      { ...baseHit, price: 'N/A' },
      template,
      slug,
    )
    expect(result.price).toBeUndefined()
  })

  describe('price string parsing', () => {
    const extractPrice = (price: unknown) =>
      getB2BWarehouseProductHitValues({ ...baseHit, price }, template, slug)
        .price

    it.each([
      ['1299', 1299],
      ['1299.00', 1299],
      [' 42.5 ', 42.5],
      ['0', 0],
      ['0.00', 0],
      ['-5.25', -5.25],
      ['+7.5', 7.5],
    ])('accepts the fully numeric string %j as %j', (price, expected) => {
      expect(extractPrice(price)).toBe(expected)
    })

    it.each([
      ['1,299.00'],
      ['1,299'],
      [''],
      ['   '],
      ['abc'],
      ['12.34.56'],
      ['12abc'],
      ['$1299'],
      ['1e3'],
      ['1299 USD'],
      ['.5'],
      ['5.'],
      ['NaN'],
      ['Infinity'],
    ])('rejects the non-decimal string %j', (price) => {
      expect(extractPrice(price)).toBeUndefined()
    })

    // Regression: Number.parseFloat('1,299.00') === 1, which silently priced a
    // $1,299 product at $1.00 and still passed every finite-number guard.
    it('does not turn a thousands-separated price into 1', () => {
      const result = getB2BWarehouseProductHitValues(
        { ...baseHit, price: '1,299.00' },
        template,
        slug,
      )
      expect(result.price).not.toBe(1)
      expect(result.price).toBeUndefined()
    })

    it.each([
      [0, 0],
      [16.01, 16.01],
      [-3, -3],
    ])('passes the existing number %j through unchanged', (price, expected) => {
      expect(extractPrice(price)).toBe(expected)
    })

    it.each([
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['-Infinity', Number.NEGATIVE_INFINITY],
    ])('rejects the non-finite number %s', (_label, price) => {
      expect(extractPrice(price)).toBeUndefined()
    })

    it.each([[null], [undefined], [{}], [[]], [true]])(
      'rejects the non-string, non-number price %j',
      (price) => {
        expect(extractPrice(price)).toBeUndefined()
      },
    )
  })

  it('collects hierarchical category levels into an array', () => {
    const hit = {
      ...baseHit,
      hierarchicalCategories: {
        level0: 'Hand Tools',
        level1: 'Hand Tools > Files',
      },
    }
    const result = getB2BWarehouseProductHitValues(hit, template, slug)
    expect(result.hierarchicalCategories).toEqual([
      'Hand Tools',
      'Hand Tools > Files',
    ])
  })

  it('passes through the info map of spec key/value pairs', () => {
    const result = getB2BWarehouseProductHitValues(baseHit, template, slug)
    expect(result.info).toEqual({
      Series: '1360G',
      'Overall Length': '62 mm',
      Shank: '0.1935 in',
    })
  })

  it('keeps only string-valued info entries', () => {
    const result = getB2BWarehouseProductHitValues(
      { ...baseHit, info: { Series: '1360G', Extra: { nested: true }, Count: 5 } },
      template,
      slug,
    )
    expect(result.info).toEqual({ Series: '1360G' })
  })

  it('returns undefined info when the hit has no info object', () => {
    const result = getB2BWarehouseProductHitValues(
      { objectID: '1', name: 'No specs' },
      template,
      slug,
    )
    expect(result.info).toBeUndefined()
  })

  it('derives rating and review count from the reviews object', () => {
    const result = getB2BWarehouseProductHitValues(baseHit, template, slug)
    expect(result.rating).toBe(4)
    expect(result.reviewsCount).toBe(12)
  })

  it('leaves rating and review count undefined when reviews are absent', () => {
    const result = getB2BWarehouseProductHitValues(
      { objectID: '1', name: 'No reviews' },
      template,
      slug,
    )
    expect(result.rating).toBeUndefined()
    expect(result.reviewsCount).toBeUndefined()
  })

  it('keeps only well-formed store availability entries', () => {
    const result = getB2BWarehouseProductHitValues(
      {
        ...baseHit,
        availableInStores: [
          { objectID: 'w1', inStock: true },
          { objectID: 'w2', inStock: false },
          { objectID: '', inStock: true },
          { objectID: 'w3', inStock: 'yes' },
          null,
          'w4',
        ],
      },
      template,
      slug,
    )
    expect(result.availableInStores).toEqual([
      { objectID: 'w1', inStock: true },
      { objectID: 'w2', inStock: false },
    ])
  })

  it('leaves store availability undefined when missing or malformed', () => {
    expect(
      getB2BWarehouseProductHitValues(baseHit, template, slug)
        .availableInStores,
    ).toBeUndefined()
    expect(
      getB2BWarehouseProductHitValues(
        { ...baseHit, availableInStores: { objectID: 'w1' } },
        template,
        slug,
      ).availableInStores,
    ).toBeUndefined()
    expect(
      getB2BWarehouseProductHitValues(
        { ...baseHit, availableInStores: [{ objectID: 'w1' }] },
        template,
        slug,
      ).availableInStores,
    ).toBeUndefined()
  })
})
