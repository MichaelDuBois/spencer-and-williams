import { describe, expect, it } from 'vitest'

import type { HitTemplate } from '@/types/hitTemplate.types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

interface TestValues {
  objectID: string
  productUrl: string
  title: string
  subtitle?: string
  image?: string
  price?: number
  categories?: readonly string[]
}

const template: HitTemplate<TestValues> = {
  attributes: {
    title: 'name',
    subtitle: 'meta.subtitle',
    image: 'photo',
    price: 'pricing.amount',
    categories: ['hierarchy.lvl0', 'hierarchy.lvl1', 'hierarchy.lvl2'],
  },
}

const productUrl = (slug: string, objectID: string) =>
  `/${slug}/product/${objectID}`

describe('createHitExtractor', () => {
  it('extracts fields via attribute paths', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract(
      {
        objectID: 'abc',
        name: 'Widget',
        meta: { subtitle: 'Best one' },
        pricing: { amount: 9.99 },
      },
      template,
      'shop',
    )

    expect(result.title).toBe('Widget')
    expect(result.subtitle).toBe('Best one')
    expect(result.price).toBe(9.99)
  })

  it('sets objectID and productUrl from options', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract({ objectID: 'xyz', name: 'Widget' }, template, 'shop')

    expect(result.objectID).toBe('xyz')
    expect(result.productUrl).toBe('/shop/product/xyz')
  })

  it('keeps the raw objectID while encoding its URL path segment', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract({ objectID: 'sku/123', name: 'Widget' }, template, 'shop')

    expect(result.objectID).toBe('sku/123')
    expect(result.productUrl).toBe('/shop/product/sku%2F123')
  })

  it("backfills missing, null, and empty fields with undefined", () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract(
      { objectID: 'abc', name: 'Widget', meta: { subtitle: null } },
      template,
      'shop',
    )

    expect(result.subtitle).toBeUndefined()
    expect(result.image).toBeUndefined()
    expect(result.price).toBeUndefined()
  })

  it('applies imageHrefPrefix to fields in imageFields', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
      imageFields: ['image'],
    })

    const result = extract(
      { objectID: 'abc', name: 'Widget', photo: 'widget.jpg' },
      { ...template, imageHrefPrefix: 'https://cdn.example.com/' },
      'shop',
    )

    expect(result.image).toBe('https://cdn.example.com/widget.jpg')
  })

  it('derive callbacks override attribute-path extraction', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
      derive: {
        title: () => 'Derived Title',
      },
    })

    const result = extract(
      { objectID: 'abc', name: 'Raw Title' },
      template,
      'shop',
    )

    expect(result.title).toBe('Derived Title')
  })

  it('runs derive callbacks even when the attribute path is missing', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
      derive: {
        subtitle: (hit) => `from-${String(hit.objectID)}`,
      },
    })

    const result = extract({ objectID: 'abc', name: 'Widget' }, template, 'shop')

    expect(result.subtitle).toBe('from-abc')
  })

  it('collects array-of-paths into a string array of resolved values', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract(
      {
        objectID: 'abc',
        name: 'Widget',
        hierarchy: {
          lvl0: 'shoes',
          lvl1: 'running',
          lvl2: 'trail-running',
        },
      },
      template,
      'shop',
    )

    expect(result.categories).toEqual(['shoes', 'running', 'trail-running'])
  })

  it('filters out missing and empty levels when extracting an array path', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract(
      {
        objectID: 'abc',
        name: 'Widget',
        hierarchy: { lvl0: 'shoes', lvl1: '', lvl2: 'trail-running' },
      },
      template,
      'shop',
    )

    expect(result.categories).toEqual(['shoes', 'trail-running'])
  })

  it('leaves the array field undefined when no levels resolve to non-empty strings', () => {
    const extract = createHitExtractor<TestValues, typeof template>({
      productUrl,
    })

    const result = extract(
      { objectID: 'abc', name: 'Widget' },
      template,
      'shop',
    )

    expect(result.categories).toBeUndefined()
  })
})
