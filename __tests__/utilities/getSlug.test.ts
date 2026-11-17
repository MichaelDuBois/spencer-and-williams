import { describe, it, expect } from 'vitest'

import { getSlug, getFilter } from '@/utilities/getSlug'

describe('getSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(getSlug('Best Sellers')).toBe('best-sellers')
  })

  it('strips ampersands and commas', () => {
    expect(getSlug('Clothing, Shoes & Jewelry')).toBe(
      'clothing-shoes-jewelry',
    )
  })

  it('collapses consecutive hyphens', () => {
    expect(getSlug('Sports & Outdoors')).toBe('sports-outdoors')
  })

  it('trims leading and trailing hyphens', () => {
    expect(getSlug('& Leading')).toBe('leading')
    expect(getSlug('Trailing &')).toBe('trailing')
  })

  it('handles single-word names', () => {
    expect(getSlug('Women')).toBe('women')
  })

  it('strips hierarchical separators', () => {
    expect(getSlug('Home & Kitchen > Furniture > Living Room Furniture')).toBe(
      'home-kitchen-furniture-living-room-furniture',
    )
    expect(getSlug('Electronics > Camera & Photo')).toBe(
      'electronics-camera-photo',
    )
    expect(getSlug('Cell Phones & Accessories > Cell Phones')).toBe(
      'cell-phones-accessories-cell-phones',
    )
  })

  it('strips forward slashes', () => {
    expect(getSlug('Construction Supply / Jobsite Ops')).toBe(
      'construction-supply-jobsite-ops',
    )
  })

  it('strips diacritics', () => {
    expect(getSlug('Home Décor Products')).toBe('home-decor-products')
  })
})

describe('getFilter', () => {
  it('resolves a slug back to the original name and builds a filter', () => {
    const result = getFilter('best-sellers', {
      items: ['Best Sellers', 'New Arrivals'],
      attribute: '_collections',
    })
    expect(result).toEqual({
      name: 'Best Sellers',
      filter: '_collections:"Best Sellers"',
    })
  })

  it('uses a different attribute for categories', () => {
    const result = getFilter('electronics', {
      items: ['Electronics', 'Home & Kitchen'],
      attribute: 'categoryPageId',
    })
    expect(result).toEqual({
      name: 'Electronics',
      filter: 'categoryPageId:"Electronics"',
    })
  })

  it('falls back to a humanized slug when no match is found', () => {
    const result = getFilter('gift-guide', {
      items: ['Best Sellers'],
      attribute: '_collections',
    })
    expect(result).toEqual({
      name: 'Gift Guide',
      filter: '_collections:"Gift Guide"',
    })
  })

  it('handles multi-word fallback with correct capitalization', () => {
    const result = getFilter('sports-outdoors', {
      items: [],
      attribute: 'categoryPageId',
    })
    expect(result).toEqual({
      name: 'Sports Outdoors',
      filter: 'categoryPageId:"Sports Outdoors"',
    })
  })

  it('resolves a slug back to a name containing a forward slash', () => {
    const result = getFilter('construction-supply-jobsite-ops', {
      items: ['Construction Supply / Jobsite Ops', 'Electronics'],
      attribute: 'categoryPageId',
    })
    expect(result).toEqual({
      name: 'Construction Supply / Jobsite Ops',
      filter: 'categoryPageId:"Construction Supply / Jobsite Ops"',
    })
  })

  it('resolves a nested category slug back to its full path', () => {
    const result = getFilter('electronics-camera-photo', {
      items: ['Electronics', 'Electronics > Camera & Photo'],
      attribute: 'categoryPageId',
    })
    expect(result).toEqual({
      name: 'Electronics > Camera & Photo',
      filter: 'categoryPageId:"Electronics > Camera & Photo"',
    })
  })
})
